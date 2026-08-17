import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { AppShell } from "@/components/portal/AppShell";
import { EmptyState, ErrorState, LoadingState } from "@/components/portal/States";
import { UserStatusBadge } from "@/components/portal/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({
    meta: [
      { title: "User management | Internal Company Portal" },
      { name: "description", content: "Manage portal accounts, roles, departments and account status." },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { property: "og:title", content: "User management | Internal Company Portal" },
      { property: "og:description", content: "Manage portal accounts, roles and account status." },
    ],
  }),
  component: UsersPage,
});

interface Row {
  id: string;
  email: string;
  full_name: string | null;
  employee_code: string | null;
  status: string;
  last_login_at: string | null;
  created_at: string;
  department_id: string | null;
}

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—";
}

function UsersPage() {
  const { can } = useSession();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pending, setPending] = useState<{ row: Row; next: string } | null>(null);

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    enabled: can("users.view"),
    queryFn: async () => {
      const [profiles, roles, userRoles, departments] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("roles").select("id, slug, name").order("rank"),
        supabase.from("user_roles").select("user_id, role_id"),
        supabase.from("departments").select("id, name"),
      ]);
      if (profiles.error) throw profiles.error;
      return {
        profiles: (profiles.data ?? []) as Row[],
        roles: roles.data ?? [],
        userRoles: userRoles.data ?? [],
        departments: departments.data ?? [],
      };
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ row, next }: { row: Row; next: string }) => {
      const { error } = await supabase.from("profiles").update({ status: next as never }).eq("id", row.id);
      if (error) throw error;
      await logAudit({
        action: `user.status.${next}`, module: "Users", recordId: row.id,
        oldValue: { status: row.status }, newValue: { status: next },
      });
    },
    onSuccess: () => { toast.success("Account status updated"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const setRole = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const del = await supabase.from("user_roles").delete().eq("user_id", userId);
      if (del.error) throw del.error;
      const ins = await supabase.from("user_roles").insert({ user_id: userId, role_id: roleId });
      if (ins.error) throw ins.error;
      await logAudit({ action: "user.role.changed", module: "Users", recordId: userId, newValue: { roleId } });
    },
    onSuccess: () => { toast.success("Role updated"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = useMemo(() => {
    const data = usersQuery.data;
    if (!data) return [];
    const term = search.trim().toLowerCase();
    return data.profiles.filter((p) => {
      const matches = !term ||
        [p.full_name, p.email, p.employee_code].some((v) => v?.toLowerCase().includes(term));
      const status = statusFilter === "all" || p.status === statusFilter;
      return matches && status;
    });
  }, [usersQuery.data, search, statusFilter]);

  if (!can("users.view")) {
    return (
      <AppShell title="Users">
        <EmptyState title="You don't have access to user management" />
      </AppShell>
    );
  }

  const roleOf = (userId: string) =>
    usersQuery.data?.userRoles.find((ur) => ur.user_id === userId)?.role_id ?? "";
  const deptOf = (id: string | null) =>
    usersQuery.data?.departments.find((d) => d.id === id)?.name ?? "—";

  return (
    <AppShell title="Users" description="Portal accounts, roles, departments and status.">
      <Card className="mb-4">
        <CardContent className="flex flex-wrap gap-3 pt-6">
          <Input className="max-w-xs" placeholder="Search name, email or ID" value={search}
            onChange={(e) => setSearch(e.target.value)} />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {usersQuery.isLoading ? (
        <LoadingState />
      ) : usersQuery.error ? (
        <ErrorState message={(usersQuery.error as Error).message} />
      ) : rows.length === 0 ? (
        <EmptyState title="No users match your filters" />
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>{u.employee_code ?? "—"}</TableCell>
                    <TableCell>{deptOf(u.department_id)}</TableCell>
                    <TableCell>
                      {can("users.manage_permissions") ? (
                        <Select value={roleOf(u.id)} onValueChange={(roleId) => setRole.mutate({ userId: u.id, roleId })}>
                          <SelectTrigger className="w-40"><SelectValue placeholder="No role" /></SelectTrigger>
                          <SelectContent>
                            {usersQuery.data!.roles.map((r) => (
                              <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        usersQuery.data!.roles.find((r) => r.id === roleOf(u.id))?.name ?? "—"
                      )}
                    </TableCell>
                    <TableCell><UserStatusBadge status={u.status} /></TableCell>
                    <TableCell className="text-muted-foreground">{fmt(u.last_login_at)}</TableCell>
                    <TableCell className="text-muted-foreground">{fmt(u.created_at)}</TableCell>
                    <TableCell className="text-right">
                      {can("users.deactivate") && (
                        <Button size="sm" variant="outline"
                          onClick={() => setPending({ row: u, next: u.status === "active" ? "inactive" : "active" })}>
                          {u.status === "active" ? "Deactivate" : "Reactivate"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.next === "active" ? "Reactivate account" : "Deactivate account"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.next === "active"
                ? "The user will be able to sign in again."
                : "The user will be signed out of the portal and blocked from signing in. Historical records and documents are kept."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (pending) setStatus.mutate(pending); setPending(null); }}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
