import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { AppShell } from "@/components/portal/AppShell";
import { EmptyState, ErrorState, LoadingState } from "@/components/portal/States";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin/departments")({
  head: () => ({
    meta: [
      { title: "Departments | Internal Company Portal" },
      { name: "description", content: "Maintain the company department list used across the portal." },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { property: "og:title", content: "Departments | Internal Company Portal" },
      { property: "og:description", content: "Maintain the company department list." },
    ],
  }),
  component: DepartmentsPage,
});

function DepartmentsPage() {
  const { can } = useSession();
  const qc = useQueryClient();
  const [name, setName] = useState("");

  const q = useQuery({
    queryKey: ["departments"],
    enabled: can("settings.view"),
    queryFn: async () => {
      const { data, error } = await supabase.from("departments").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      const { error } = await supabase.from("departments").insert({ name, slug });
      if (error) throw error;
      await logAudit({ action: "department.created", module: "Departments", newValue: { name, slug } });
    },
    onSuccess: () => { toast.success("Department added"); setName(""); qc.invalidateQueries({ queryKey: ["departments"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!can("settings.view")) {
    return <AppShell title="Departments"><EmptyState title="You don't have access to this section" /></AppShell>;
  }

  return (
    <AppShell title="Departments" description="Departments drive access scoping, org charts and reporting.">
      {can("settings.manage") && (
        <Card className="mb-4">
          <CardContent className="flex flex-wrap gap-3 pt-6">
            <Input className="max-w-xs" placeholder="New department name" value={name} onChange={(e) => setName(e.target.value)} />
            <Button onClick={() => create.mutate()} disabled={!name || create.isPending}>Add department</Button>
          </CardContent>
        </Card>
      )}
      {q.isLoading ? <LoadingState /> : q.error ? <ErrorState message={(q.error as Error).message} /> : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Name</TableHead><TableHead>Key</TableHead><TableHead>Status</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {(q.data ?? []).map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell className="text-muted-foreground">{d.slug}</TableCell>
                    <TableCell>{d.is_active ? "Active" : "Inactive"}</TableCell>
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
