import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Network, GripVertical, UserPlus, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { initialsOf } from "@/lib/employees";
import {
  buildTree, fetchDirectory, isDescendant,
  type OrgChart, type OrgNode, type OrgTreeNode,
} from "@/lib/orgchart";
import { AppShell } from "@/components/portal/AppShell";
import { EmptyState, ErrorState, LoadingState } from "@/components/portal/States";
import { OrgChartDialog } from "@/components/portal/OrgChartDialog";
import { OrgNodeDialog } from "@/components/portal/OrgNodeDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/org-chart")({
  head: () => ({
    meta: [
      { title: "Organization Chart | Internal Company Portal" },
      { name: "description", content: "Company and department reporting structure with roles and reporting lines." },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { property: "og:title", content: "Organization Chart | Internal Company Portal" },
      { property: "og:description", content: "Who reports to whom, by department." },
    ],
  }),
  component: OrgChartPage,
});

function OrgChartPage() {
  const { can } = useSession();
  const qc = useQueryClient();
  const [chartId, setChartId] = useState<string>("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const canView = can("org_charts.view");
  const canManage = can("org_charts.manage");

  const chartsQuery = useQuery({
    queryKey: ["org-charts"],
    enabled: canView,
    queryFn: async () => {
      const [charts, depts] = await Promise.all([
        supabase.from("org_charts").select("*").order("name"),
        supabase.from("departments").select("id, name").eq("is_active", true).order("name"),
      ]);
      if (charts.error) throw charts.error;
      if (depts.error) throw depts.error;
      return {
        charts: (charts.data ?? []) as unknown as OrgChart[],
        departments: depts.data ?? [],
      };
    },
  });

  const peopleQuery = useQuery({
    queryKey: ["org-directory"],
    enabled: canManage,
    queryFn: fetchDirectory,
  });

  const charts = useMemo(() => chartsQuery.data?.charts ?? [], [chartsQuery.data]);
  const departments = chartsQuery.data?.departments ?? [];

  useEffect(() => {
    if (!chartId && charts.length > 0) setChartId(charts[0]!.id);
    if (chartId && charts.length > 0 && !charts.some((c) => c.id === chartId)) setChartId(charts[0]!.id);
  }, [charts, chartId]);

  const nodesQuery = useQuery({
    queryKey: ["org-chart-nodes", chartId],
    enabled: !!chartId,
    queryFn: async () => {
      const { data, error } = await supabase.from("org_chart_nodes")
        .select("*").eq("chart_id", chartId).order("sort_order");
      if (error) throw error;
      return (data ?? []) as unknown as OrgNode[];
    },
  });

  const nodes = useMemo(() => nodesQuery.data ?? [], [nodesQuery.data]);
  const tree = useMemo(() => buildTree(nodes), [nodes]);
  const activeChart = charts.find((c) => c.id === chartId);

  const reparent = useMutation({
    mutationFn: async ({ id, parentId }: { id: string; parentId: string | null }) => {
      const { error } = await supabase.from("org_chart_nodes")
        .update({ parent_id: parentId } as never).eq("id", id);
      if (error) throw error;
      await logAudit({ action: "org_node.moved", module: "Org Chart", recordId: id, newValue: { parent_id: parentId } });
    },
    onSuccess: () => {
      toast.success("Reporting line updated");
      qc.invalidateQueries({ queryKey: ["org-chart-nodes", chartId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeNode = useMutation({
    mutationFn: async (node: OrgNode) => {
      const { error } = await supabase.from("org_chart_nodes").delete().eq("id", node.id);
      if (error) throw error;
      await logAudit({ action: "org_node.deleted", module: "Org Chart", recordId: node.id, oldValue: node });
    },
    onSuccess: () => {
      toast.success("Position removed");
      qc.invalidateQueries({ queryKey: ["org-chart-nodes", chartId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeChart = useMutation({
    mutationFn: async (chart: OrgChart) => {
      const { error } = await supabase.from("org_charts").delete().eq("id", chart.id);
      if (error) throw error;
      await logAudit({ action: "org_chart.deleted", module: "Org Chart", recordId: chart.id, oldValue: chart });
    },
    onSuccess: () => {
      toast.success("Chart deleted");
      setChartId("");
      qc.invalidateQueries({ queryKey: ["org-charts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function handleDrop(targetId: string | null) {
    const id = dragId;
    setDragId(null); setOverId(null);
    if (!id) return;
    if (id === targetId) return;
    if (targetId && isDescendant(nodes, id, targetId)) {
      toast.error("A position cannot report to one of its own reports.");
      return;
    }
    const node = nodes.find((n) => n.id === id);
    if (node && (node.parent_id ?? null) === targetId) return;
    reparent.mutate({ id, parentId: targetId });
  }

  function NodeCard({ node }: { node: OrgTreeNode }) {
    const isOver = overId === node.id && dragId !== node.id;
    return (
      <div
        {...(canManage ? { draggable: true } : {})}
        onDragStart={(e) => { setDragId(node.id); e.dataTransfer.effectAllowed = "move"; }}
        onDragEnd={() => { setDragId(null); setOverId(null); }}
        onDragOver={(e) => { if (canManage && dragId) { e.preventDefault(); setOverId(node.id); } }}
        onDragLeave={() => setOverId((v) => (v === node.id ? null : v))}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleDrop(node.id); }}
        className={`group relative w-60 rounded-xl border bg-card p-3 text-left shadow-sm transition-all ${
          isOver ? "border-primary ring-2 ring-primary/30" : "border-border hover:shadow-md"
        } ${dragId === node.id ? "opacity-50" : ""} ${canManage ? "cursor-grab active:cursor-grabbing" : ""}`}
      >
        <div className="flex items-start gap-3">
          <Avatar className="size-10 shrink-0">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initialsOf(node.person_name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{node.person_name}</p>
            <p className="truncate text-xs text-muted-foreground">{node.role_title ?? "—"}</p>
          </div>
          {canManage && <GripVertical className="size-4 shrink-0 text-muted-foreground/50" />}
        </div>

        {canManage && (
          <div className="mt-2 flex flex-wrap gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <OrgNodeDialog
              chartId={chartId}
              parentId={node.id}
              parentName={node.person_name}
              people={peopleQuery.data ?? []}
              trigger={<Button variant="ghost" size="sm" className="h-7 px-2 text-xs"><UserPlus className="size-3.5" />Report</Button>}
            />
            <OrgNodeDialog
              chartId={chartId}
              node={node}
              people={peopleQuery.data ?? []}
              trigger={<Button variant="ghost" size="sm" className="h-7 px-2 text-xs"><Pencil className="size-3.5" />Edit</Button>}
            />
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive"
              onClick={() => removeNode.mutate(node)}>
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  function Branch({ node }: { node: OrgTreeNode }) {
    return (
      <li className="relative flex flex-col items-center px-3">
        <NodeCard node={node} />
        {node.children.length > 0 && (
          <>
            <span className="h-6 w-px bg-border" />
            <ul className="relative flex items-start justify-center pt-6">
              <span className="absolute left-1/2 top-0 hidden h-px -translate-x-1/2 bg-border sm:block"
                style={{ width: node.children.length > 1 ? `calc(100% - 6rem)` : "0" }} />
              {node.children.map((child) => (
                <div key={child.id} className="relative flex flex-col items-center">
                  <span className="absolute -top-6 h-6 w-px bg-border" />
                  <Branch node={child} />
                </div>
              ))}
            </ul>
          </>
        )}
      </li>
    );
  }

  if (!canView) {
    return (
      <AppShell title="Organization Chart">
        <EmptyState title="You don't have access to the organization chart" />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Organization Chart"
      description={canManage
        ? "Build department charts, drag a box onto another to change who it reports to."
        : "Company and department reporting structure."}
      actions={canManage ? (
        <OrgChartDialog
          departments={departments}
          people={peopleQuery.data ?? []}
          onCreated={(id) => setChartId(id)}
          trigger={<Button><Plus className="size-4" />New chart</Button>}
        />
      ) : null}
    >
      {chartsQuery.isLoading ? (
        <LoadingState />
      ) : chartsQuery.error ? (
        <ErrorState message={(chartsQuery.error as Error).message} />
      ) : charts.length === 0 ? (
        <EmptyState title="No organization charts yet"
          description={canManage ? "Create the first chart, pick a department and choose the person at the top."
            : "Charts will appear here once HR publishes them."} />
      ) : (
        <>
          <Card className="mb-4">
            <CardContent className="flex flex-wrap items-center gap-3 pt-6">
              <div className="min-w-[220px] flex-1">
                <Select {...(chartId ? { value: chartId } : {})} onValueChange={setChartId}>
                  <SelectTrigger><SelectValue placeholder="Select a chart" /></SelectTrigger>
                  <SelectContent>
                    {charts.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {activeChart?.department_id && (
                <Badge variant="secondary" className="gap-1">
                  <Building2 className="size-3" />
                  {departments.find((d) => d.id === activeChart.department_id)?.name ?? "Department"}
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">{nodes.length} positions</span>
              {canManage && activeChart && (
                <div className="ml-auto flex flex-wrap gap-2">
                  <OrgNodeDialog
                    chartId={chartId}
                    parentId={null}
                    people={peopleQuery.data ?? []}
                    trigger={<Button variant="outline" size="sm"><Plus className="size-3.5" />Add position</Button>}
                  />
                  <OrgChartDialog
                    chart={activeChart}
                    departments={departments}
                    people={peopleQuery.data ?? []}
                    trigger={<Button variant="outline" size="sm"><Pencil className="size-3.5" />Edit chart</Button>}
                  />
                  <Button variant="ghost" size="sm" className="text-destructive"
                    onClick={() => removeChart.mutate(activeChart)}>
                    <Trash2 className="size-3.5" />Delete chart
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {activeChart?.description && (
            <p className="mb-4 text-sm text-muted-foreground">{activeChart.description}</p>
          )}

          {nodesQuery.isLoading ? (
            <LoadingState />
          ) : nodesQuery.error ? (
            <ErrorState message={(nodesQuery.error as Error).message} />
          ) : tree.length === 0 ? (
            <EmptyState title="This chart has no positions yet"
              description={canManage ? "Use “Add position” to place the first box." : undefined} />
          ) : (
            <div
              onDragOver={(e) => { if (canManage && dragId) { e.preventDefault(); setOverId("root"); } }}
              onDrop={(e) => { e.preventDefault(); handleDrop(null); }}
              className={`overflow-x-auto rounded-xl border bg-muted/20 p-6 ${
                overId === "root" && dragId ? "border-primary/60" : "border-border"
              }`}
            >
              <ul className="flex min-w-max items-start justify-center gap-6">
                {tree.map((root) => <Branch key={root.id} node={root} />)}
              </ul>
              {canManage && (
                <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Network className="size-3.5" />
                  Drag a box onto another to make it report there, or drop it on empty space to make it top-level.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
