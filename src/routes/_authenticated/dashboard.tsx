import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, UserCheck, Briefcase, CalendarOff, FileWarning, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
            <StatCard label="Workers" value="—" icon={Briefcase} hint="Available in the workers module" />
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
            <EmptyState
              title="No expiry records yet"
              description="Expiry tracking activates once employee documents are added in Phase 2/3."
            />
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
            <Button variant="outline" asChild><Link to="/profile">My profile</Link></Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
