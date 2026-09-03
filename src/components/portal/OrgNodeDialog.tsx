import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";
import { bumpChartRevision, type DirectoryPerson, type OrgNode } from "@/lib/orgchart";
import { PersonPicker } from "@/components/portal/PersonPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export function OrgNodeDialog({
  chartId, node, parentId, parentName, people, trigger, onDraftSave,
}: {
  chartId: string;
  node?: OrgNode;
  parentId?: string | null;
  parentName?: string;
  people: DirectoryPerson[];
  trigger: ReactNode;
  onDraftSave?: (node: OrgNode) => void;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [person, setPerson] = useState<DirectoryPerson | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [nodeType, setNodeType] = useState<"person" | "group">("person");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) return;
    if (node) {
      const match = people.find((p) =>
        (node.employee_id && p.type === "employee" && p.id === node.employee_id) ||
        (node.worker_id && p.type === "worker" && p.id === node.worker_id)) ?? null;
      setPerson(match);
      setName(node.person_name);
      setRole(node.role_title ?? "");
      setNodeType(node.node_type ?? "person");
      setDescription(node.description ?? "");
    } else {
      setPerson(null); setName(""); setRole(""); setNodeType("person"); setDescription("");
    }
  }, [open, node, people]);

  const save = useMutation({
    mutationFn: async () => {
      const finalName = (nodeType === "group" ? name : (person?.name ?? name)).trim();
      if (!finalName) throw new Error(nodeType === "group" ? "Enter a group title." : "Choose a person or type a name.");
      const payload = {
        chart_id: chartId,
        parent_id: node ? node.parent_id : (parentId ?? null),
        employee_id: nodeType === "person" && person?.type === "employee" ? person.id : null,
        worker_id: nodeType === "person" && person?.type === "worker" ? person.id : null,
        person_name: finalName,
        role_title: nodeType === "person" ? (role.trim() || person?.subtitle || null) : null,
        node_type: nodeType,
        description: description.trim() || null,
      };
      if (onDraftSave) {
        onDraftSave({
          id: node?.id ?? crypto.randomUUID(),
          chart_id: chartId,
          parent_id: payload.parent_id,
          employee_id: payload.employee_id,
          worker_id: payload.worker_id,
          person_name: payload.person_name,
          role_title: payload.role_title,
          node_type: payload.node_type,
          description: payload.description,
          sort_order: node?.sort_order ?? Date.now() % 100000,
        });
        return;
      }
      if (node) {
        const { error } = await supabase.from("org_chart_nodes")
          .update(payload as never).eq("id", node.id);
        if (error) throw error;
        await logAudit({ action: "org_node.updated", module: "Org Chart", recordId: node.id, newValue: payload });
      } else {
        const { data, error } = await supabase.from("org_chart_nodes")
          .insert({ ...payload, sort_order: Date.now() % 100000 } as never)
          .select("id").single();
        if (error) throw error;
        await logAudit({ action: "org_node.created", module: "Org Chart", recordId: data?.id, newValue: payload });
      }
      await bumpChartRevision(chartId);
    },
    onSuccess: () => {
      toast.success(onDraftSave
        ? `${node ? "Change" : "Position"} added to the draft. Save the chart to keep it.`
        : node ? "Position updated" : "Position added");
      if (!onDraftSave) {
        qc.invalidateQueries({ queryKey: ["org-chart-nodes", chartId] });
        qc.invalidateQueries({ queryKey: ["org-charts"] });
      }
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{node ? "Edit chart item" : "Add chart item"}</DialogTitle>
          <DialogDescription>
            {node ? "Change the person or role shown on this box."
              : parentName ? `Reports to ${parentName}.` : "Top-level position on this chart."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Item type</Label>
            <Select value={nodeType} onValueChange={(value) => {
              setNodeType(value as "person" | "group");
              if (value === "group") setPerson(null);
            }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="person">Person / position</SelectItem>
                <SelectItem value="group">Group title</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {nodeType === "person" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Person</Label>
              <PersonPicker people={people} value={person}
                onSelect={(p) => { setPerson(p); setName(p.name); if (!role) setRole(p.subtitle); }} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              {nodeType === "group" ? "Group title" : "Or type a name"}
            </Label>
            <Input value={name} onChange={(e) => { setName(e.target.value); setPerson(null); }}
              placeholder={nodeType === "group" ? "e.g. Sales Team" : "Full name"} />
          </div>
          {nodeType === "person" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Role / title on the chart</Label>
              <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Operations Manager" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Description (optional)</Label>
            <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder={nodeType === "group" ? "Short note about this group" : "Responsibilities or additional information"} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving…" : node ? "Save changes" : "Add position"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
