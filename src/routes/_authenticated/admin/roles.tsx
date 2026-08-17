import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { AppShell } from "@/components/portal/AppShell";
import { EmptyState, ErrorState, LoadingState } from "@/components/portal/States";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/roles")({
  head: () => ({
    meta: [
      { title: "Roles & permissions | Internal Company Portal" },
      { name: "description", content: "Define roles and assign granular module permissions across the portal." },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { property: "og:title", content: "Roles & permissions | Internal Company Portal" },
      { property: "og:description", content: "Define roles and assign granular module permissions." },
    ],
  }),
  component: RolesPage,
});

function RolesPage() {
  const { can } = useSession();
  const qc = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [newRole, setNewRole] = useState({ name: "", slug: "", description: "" });
  const [open, setOpen] = useState(false);

  const q = useQuery({
    queryKey: ["roles-matrix"],
    enabled: can("users.manage_permissions"),
    queryFn: async () => {
      const [roles, permissions, rolePermissions] = await Promise.all([
        supabase.from("roles").select("*").order("rank"),
        supabase.from("permissions").select("*").order("module"),
        supabase.from("role_permissions").select("role_id, permission_id"),
      ]);
      if (roles.error) throw roles.error;
      return { roles: roles.data ?? [], permissions: permissions.data ?? [], rolePermissions: rolePermissions.data ?? [] };
    },
  });

  const activeRole = selectedRole ?? q.data?.roles[0]?.id ?? null;

  const toggle = useMutation({
    mutationFn: async ({ permissionId, on }: { permissionId: string; on: boolean }) => {
      if (!activeRole) return;
      if (on) {
        const { error } = await supabase.from("role_permissions").insert({ role_id: activeRole, permission_id: permissionId });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("role_permissions").delete()
          .eq("role_id", activeRole).eq("permission_id", permissionId);
        if (error) throw error;
      }
      await logAudit({ action: on ? "permission.granted" : "permission.revoked", module: "Permissions", recordId: activeRole, newValue: { permissionId, on } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles-matrix"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const createRole = useMutation({
    mutationFn: async () => {
      const slug = (newRole.slug || newRole.name).toLowerCase().replace(/[^a-z0-9]+/g, "_");
      const { error } = await supabase.from("roles").insert({ slug, name: newRole.name, description: newRole.description });
      if (error) throw error;
      await logAudit({ action: "role.created", module: "Roles", newValue: { slug, name: newRole.name } });
    },
    onSuccess: () => {
      toast.success("Role created");
      setOpen(false);
      setNewRole({ name: "", slug: "", description: "" });
      qc.invalidateQueries({ queryKey: ["roles-matrix"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const grouped = useMemo(() => {
    const map = new Map<string, { id: string; code: string; module: string; description: string | null }[]>();
    for (const p of q.data?.permissions ?? []) {
      const list = map.get(p.module) ?? [];
      list.push(p);
      map.set(p.module, list);
    }
    return [...map.entries()];
  }, [q.data]);

  if (!can("users.manage_permissions")) {
    return <AppShell title="Roles & permissions"><EmptyState title="You don't have access to this section" /></AppShell>;
  }

  const granted = new Set(
    (q.data?.rolePermissions ?? []).filter((rp) => rp.role_id === activeRole).map((rp) => rp.permission_id),
  );

  return (
    <AppShell
      title="Roles & permissions"
      description="Roles are flexible — add new ones and grant only the permissions they need."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button>Add role</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New role</DialogTitle>
              <DialogDescription>Create an additional role and grant permissions afterwards.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rname">Name</Label>
                <Input id="rname" value={newRole.name} onChange={(e) => setNewRole({ ...newRole, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rdesc">Description</Label>
                <Input id="rdesc" value={newRole.description} onChange={(e) => setNewRole({ ...newRole, description: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => createRole.mutate()} disabled={!newRole.name || createRole.isPending}>Create role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {q.isLoading ? <LoadingState /> : q.error ? <ErrorState message={(q.error as Error).message} /> : (
        <div className="grid gap-4 lg:grid-cols-4">
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle className="text-base">Roles</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-1">
              {q.data!.roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  className={cn(
                    "rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-secondary",
                    activeRole === r.id && "bg-secondary font-medium",
                  )}
                >
                  {r.name}
                  <span className="block text-xs text-muted-foreground">{r.description ?? r.slug}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base">Permissions</CardTitle>
              <CardDescription>
                Super Admin always has every permission. Changes take effect immediately and are enforced by the database.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              {grouped.map(([module, perms]) => (
                <div key={module}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{module}</p>
                  <div className="space-y-2">
                    {perms.map((p) => (
                      <label key={p.id} className="flex items-start gap-2 text-sm">
                        <Checkbox
                          checked={granted.has(p.id)}
                          onCheckedChange={(v) => toggle.mutate({ permissionId: p.id, on: !!v })}
                        />
                        <span>
                          {p.description ?? p.code}
                          <span className="block text-xs text-muted-foreground">{p.code}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
