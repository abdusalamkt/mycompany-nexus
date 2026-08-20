import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, UserCheck, Briefcase, CalendarOff, FileWarning, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/employees";
import { StatusBadge, expiryStatus } from "@/components/portal/StatusBadge";
import { useSession } from "@/lib/session";
import { AppShell } from "@/components/portal/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/portal/States";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | Internal Company Portal" },
      { name: "description", content: "Company-wide people, document expiry and announcement overview for authorised staff." },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { property: "og:title", content: "Dashboard | Internal Company Portal" },
      { property: "og:description", content: "People, document expiry and announcement overview." },
    ],
  }),
  component: DashboardPage,
});

function StatCard({ label, value, icon: Icon, hint }: { label: string; value: string | number; icon: typeof Users; hint?: string }) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 pt-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className="grid size-10 place-items-center rounded-md bg-secondary text-secondary-foreground">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardPage() {
  const { profile, roles, can } = useSession();
  const isStaffAdmin = can("users.view");

  const expiries = useQuery({
    queryKey: ["dashboard-expiries"],
    enabled: can("employees.view") || can("workers.view"),
    queryFn: async () => {
      const [emp, wrk] = await Promise.all([
        can("employees.view")
          ? supabase.from("employees").select("id, full_name, passport_expiry, visa_expiry, emirates_id_expiry, insurance_expiry")
          : Promise.resolve({ data: [] as never[] }),
        can("workers.view")
          ? supabase.from("workers").select("id, full_name, passport_expiry, visa_expiry, emirates_id_expiry, labour_card_expiry, insurance_expiry")
          : Promise.resolve({ data: [] as never[] }),
      ]);
      const items: { key: string; person: string; kind: string; date: string; group: string }[] = [];
      const push = (group: string, rows: Record<string, unknown>[]) => {
        for (const row of rows) {
          const person = String(row['full_name'] ?? "");
          for (const [field, kind] of [
            ["passport_expiry", "Passport"],
            ["visa_expiry", "Visa"],
            ["emirates_id_expiry", "Emirates ID"],
            ["labour_card_expiry", "Labour card"],
            ["insurance_expiry", "Insurance"],
          ] as [string, string][]) {
            const value = row[field];
            if (typeof value === "string" && value) {
              items.push({ key: `${row['id']}-${field}`, person, kind, date: value, group });
            }
          }
        }
      };
      push("Employee", (emp.data ?? []) as Record<string, unknown>[]);
      push("Worker", (wrk.data ?? []) as Record<string, unknown>[]);
      return items
        .filter((i) => expiryStatus(i.date) !== "valid")
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 12);
    },
  });

  const counts = useQuery({
    queryKey: ["dashboard-people-counts"],
    enabled: can("employees.view") || can("workers.view"),
    queryFn: async () => {
      const [emp, wrk] = await Promise.all([
        can("employees.view")
          ? supabase.from("employees").select("id", { count: "exact", head: true })
          : Promise.resolve({ count: null }),
        can("workers.view")
          ? supabase.from("workers").select("id", { count: "exact", head: true })
          : Promise.resolve({ count: null }),
      ]);
      return { employees: emp.count, workers: wrk.count };
    },
  });

  const stats = useQuery({
    queryKey: ["dashboard-stats"],
    enabled: isStaffAdmin,
    queryFn: async () => {
      const [total, active, inactive] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).neq("status", "active"),
      ]);
      if (total.error) throw total.error;
      return { total: total.count ?? 0, active: active.count ?? 0, inactive: inactive.count ?? 0 };
    },
  });

  return (
    <AppShell
      title={`Welcome back, ${profile?.full_name?.split(" ")[0] ?? "there"}`}
      description={roles.map((r) => r.replace("_", " ")).join(", ") || "Portal member"}
    >
      {isStaffAdmin ? (
        stats.isLoading ? (
          <LoadingState rows={2} />
        ) : stats.error ? (
          <ErrorState message={(stats.error as Error).message} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Portal Accounts" value={stats.data!.total} icon={Users} />
            <StatCard label="Active Accounts" value={stats.data!.active} icon={UserCheck} />
            <StatCard label="Inactive / Suspended" value={stats.data!.inactive} icon={ShieldAlert} />
            <StatCard label="Employees" value={counts.data?.employees ?? "—"} icon={Users} />
            <StatCard label="Workers" value={counts.data?.workers ?? "—"} icon={Briefcase} />
          </div>
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="My Documents" value="—" icon={FileWarning} hint="Coming with the documents module" />
          <StatCard label="My Leave" value="—" icon={CalendarOff} hint="Coming with the leave module" />
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Important dates</CardTitle>
            <CardDescription>Passport, visa, Emirates ID, licence and certificate expiries.</CardDescription>
          </CardHeader>
          <CardContent>
            {expiries.isLoading ? (
              <LoadingState rows={2} />
            ) : (expiries.data?.length ?? 0) === 0 ? (
              <EmptyState
                title="Nothing expiring soon"
                description="Passport, visa, Emirates ID, labour card and insurance dates are all valid."
              />
            ) : (
              <ul className="divide-y divide-border">
                {expiries.data!.map((item) => (
                  <li key={item.key} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.person}</p>
                      <p className="text-xs text-muted-foreground">{item.group} · {item.kind} · {formatDate(item.date)}</p>
                    </div>
                    <StatusBadge status={expiryStatus(item.date)} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {can("users.view") && (
              <Button variant="outline" asChild><Link to="/admin/users">Manage users</Link></Button>
            )}
            {can("users.manage_permissions") && (
              <Button variant="outline" asChild><Link to="/admin/roles">Roles & permissions</Link></Button>
            )}
            {can("audit.view") && (
              <Button variant="outline" asChild><Link to="/admin/audit">View audit log</Link></Button>
            )}
            {can("employees.view") && (
              <Button variant="outline" asChild><Link to="/employees">Staff list</Link></Button>
            )}
            {can("workers.view") && (
              <Button variant="outline" asChild><Link to="/workers">Workers</Link></Button>
            )}
            {can("documents.view") && (
              <Button variant="outline" asChild><Link to="/documents">Documents</Link></Button>
            )}
            <Button variant="outline" asChild><Link to="/profile">My profile</Link></Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
