import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { AppShell } from "@/components/portal/AppShell";
import { EmptyState, ErrorState, LoadingState } from "@/components/portal/States";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  head: () => ({
    meta: [
      { title: "Audit log | Internal Company Portal" },
      { name: "description", content: "Immutable record of administrative actions across the portal." },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { property: "og:title", content: "Audit log | Internal Company Portal" },
      { property: "og:description", content: "Immutable record of administrative actions." },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  const { can } = useSession();
  const q = useQuery({
    queryKey: ["audit-logs"],
    enabled: can("audit.view"),
    queryFn: async () => {
      const { data, error } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data;
    },
  });

  if (!can("audit.view")) {
    return <AppShell title="Audit log"><EmptyState title="You don't have access to audit logs" /></AppShell>;
  }

  return (
    <AppShell title="Audit log" description="Who did what, when — records cannot be edited or deleted.">
      {q.isLoading ? <LoadingState /> : q.error ? <ErrorState message={(q.error as Error).message} /> :
        (q.data ?? []).length === 0 ? <EmptyState title="No audit entries yet" /> : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead><TableHead>User</TableHead><TableHead>Action</TableHead>
                  <TableHead>Module</TableHead><TableHead>Record</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(q.data ?? []).map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {new Date(l.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>{l.actor_email ?? "—"}</TableCell>
                    <TableCell className="font-medium">{l.action}</TableCell>
                    <TableCell>{l.module}</TableCell>
                    <TableCell className="text-muted-foreground">{l.record_id ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}
