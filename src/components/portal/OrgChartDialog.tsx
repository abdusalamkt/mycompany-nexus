import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";
import type { DirectoryPerson, OrgChart } from "@/lib/orgchart";
import { PersonPicker } from "@/components/portal/PersonPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

/** Create or rename a chart. On create it also seeds the root position. */
export function OrgChartDialog({
  chart, departments, people, trigger, onCreated, onDraftSave,
}: {
  chart?: OrgChart;
  departments: { id: string; name: string }[];
  people: DirectoryPerson[];
  trigger: ReactNode;
  onCreated?: (id: string) => void;
  onDraftSave?: (chart: OrgChart) => void;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [root, setRoot] = useState<DirectoryPerson | null>(null);
  const [rootName, setRootName] = useState("");
  const [rootRole, setRootRole] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(chart?.name ?? "");
    setDescription(chart?.description ?? "");
    setDepartmentId(chart?.department_id ?? "");
    setRoot(null); setRootName(""); setRootRole("");
  }, [open, chart]);

  const save = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Chart name is required.");
      if (chart) {
        const payload = {
          name: name.trim(),
          description: description.trim() || null,
          department_id: departmentId || null,
        };
        if (onDraftSave) {
          onDraftSave({ ...chart, ...payload });
          return chart.id;
        }
        const { error } = await supabase.from("org_charts").update(payload as never).eq("id", chart.id);
        if (error) throw error;
        await logAudit({ action: "org_chart.updated", module: "Org Chart", recordId: chart.id, newValue: payload });
        return chart.id;
      }

      const rootLabel = (root?.name ?? rootName).trim();
      if (!rootLabel) throw new Error("Select the top position (root) of the chart.");
      const { data: userRes } = await supabase.auth.getUser();
      const { data: creator } = userRes.user
        ? await supabase.from("profiles").select("full_name, email").eq("id", userRes.user.id).maybeSingle()
        : { data: null };
      const { data, error } = await supabase.from("org_charts").insert({
        name: name.trim(),
        description: description.trim() || null,
        department_id: departmentId || null,
        created_by: userRes.user?.id ?? null,
        created_by_name: creator?.full_name ?? creator?.email ?? userRes.user?.email ?? "Unknown user",
        revision_number: 1,
      } as never).select("id").single();
      if (error) throw error;
      const chartId = (data as { id: string }).id;

      const { error: nodeError } = await supabase.from("org_chart_nodes").insert({
        chart_id: chartId,
        parent_id: null,
        employee_id: root?.type === "employee" ? root.id : null,
        worker_id: root?.type === "worker" ? root.id : null,
        person_name: rootLabel,
        role_title: rootRole.trim() || root?.subtitle || null,
        node_type: "person",
        description: null,
        sort_order: 0,
      } as never);
      if (nodeError) throw nodeError;

      await logAudit({ action: "org_chart.created", module: "Org Chart", recordId: chartId, newValue: { name } });
      return chartId;
    },
    onSuccess: (id) => {
      toast.success(chart && onDraftSave ? "Chart details added to the draft. Click Save chart to keep them."
        : chart ? "Chart updated" : "Chart created");
      if (!onDraftSave) {
        qc.invalidateQueries({ queryKey: ["org-charts"] });
        qc.invalidateQueries({ queryKey: ["org-chart-nodes", id] });
      }
      setOpen(false);
      if (!chart && id) onCreated?.(id);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{chart ? "Edit chart" : "New organization chart"}</DialogTitle>
          <DialogDescription>
            {chart ? "Rename the chart or change its department."
              : "Name the chart, pick a department and choose the person at the top."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Chart name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Operations structure" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Department</Label>
            <Select {...(departmentId ? { value: departmentId } : {})} onValueChange={setDepartmentId}>
              <SelectTrigger><SelectValue placeholder="Company-wide" /></SelectTrigger>
              <SelectContent>
                {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Description</Label>
            <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {!chart && (
            <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Top position</p>
              <PersonPicker people={people} value={root}
                onSelect={(p) => { setRoot(p); setRootName(p.name); if (!rootRole) setRootRole(p.subtitle); }} />
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Or type a name</Label>
                <Input value={rootName} onChange={(e) => { setRootName(e.target.value); setRoot(null); }} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Role / title</Label>
                <Input value={rootRole} onChange={(e) => setRootRole(e.target.value)} placeholder="e.g. General Manager" />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving…" : chart ? "Save changes" : "Create chart"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
