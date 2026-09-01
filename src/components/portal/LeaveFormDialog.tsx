import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export interface LeaveRecord {
  id: string;
  person_name: string;
  person_type: string;
  employee_id: string | null;
  worker_id: string | null;
  department_id: string | null;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: string;
  remarks: string | null;
  created_at: string;
}

export const LEAVE_TYPES = [
  { value: "annual", label: "Annual leave" },
  { value: "sick", label: "Sick leave" },
  { value: "unpaid", label: "Unpaid leave" },
  { value: "emergency", label: "Emergency leave" },
  { value: "maternity", label: "Maternity / paternity" },
  { value: "other", label: "Other" },
];

export const LEAVE_STATUSES = [
  { value: "planned", label: "Planned" },
  { value: "approved", label: "Approved" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export type PersonOption = {
  id: string;
  name: string;
  type: "employee" | "worker";
  department_id: string | null;
};

type Draft = {
  person_key: string;
  person_name: string;
  leave_type: string;
  status: string;
  start_date: string;
  end_date: string;
  remarks: string;
};

const EMPTY: Draft = {
  person_key: "", person_name: "", leave_type: "annual", status: "planned",
  start_date: "", end_date: "", remarks: "",
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function LeaveFormDialog({
  leave, people, trigger,
}: {
  leave?: LeaveRecord;
  people: PersonOption[];
  trigger: ReactNode;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);

  useEffect(() => {
    if (!open) return;
    if (leave) {
      const key = leave.employee_id
        ? `employee:${leave.employee_id}`
        : leave.worker_id ? `worker:${leave.worker_id}` : "";
      setDraft({
        person_key: key,
        person_name: leave.person_name,
        leave_type: leave.leave_type,
        status: leave.status,
        start_date: leave.start_date,
        end_date: leave.end_date,
        remarks: leave.remarks ?? "",
      });
    } else {
      setDraft(EMPTY);
    }
  }, [open, leave]);

  const set = (key: keyof Draft) => (value: string) => setDraft((d) => ({ ...d, [key]: value }));

  const save = useMutation({
    mutationFn: async () => {
      const person = people.find((p) => `${p.type}:${p.id}` === draft.person_key);
      const name = (person?.name ?? draft.person_name).trim();
      if (!name) throw new Error("Choose a person or type a name.");
      if (!draft.start_date || !draft.end_date) throw new Error("Start and end dates are required.");
      if (draft.end_date < draft.start_date) throw new Error("End date cannot be before the start date.");

      const payload = {
        person_name: name,
        person_type: person?.type ?? "employee",
        employee_id: person?.type === "employee" ? person.id : null,
        worker_id: person?.type === "worker" ? person.id : null,
        department_id: person?.department_id ?? null,
        leave_type: draft.leave_type,
        status: draft.status,
        start_date: draft.start_date,
        end_date: draft.end_date,
        remarks: draft.remarks.trim() || null,
      };

      if (leave) {
        const { error } = await supabase.from("leaves").update(payload as never).eq("id", leave.id);
        if (error) throw error;
        await logAudit({ action: "leave.updated", module: "Leave", recordId: leave.id, newValue: payload });
      } else {
        const { data: userRes } = await supabase.auth.getUser();
        const { data, error } = await supabase.from("leaves")
          .insert({ ...payload, created_by: userRes.user?.id ?? null } as never)
          .select("id").single();
        if (error) throw error;
        await logAudit({ action: "leave.created", module: "Leave", recordId: data?.id, newValue: payload });
      }
    },
    onSuccess: () => {
      toast.success(leave ? "Leave updated" : "Leave added");
      qc.invalidateQueries({ queryKey: ["leaves"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{leave ? "Edit leave record" : "Add leave record"}</DialogTitle>
          <DialogDescription>Visible to all signed-in staff.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Person">
              <Select {...(draft.person_key ? { value: draft.person_key } : {})} onValueChange={set("person_key")}>
                <SelectTrigger><SelectValue placeholder="Select staff or worker" /></SelectTrigger>
                <SelectContent>
                  {people.map((p) => (
                    <SelectItem key={`${p.type}:${p.id}`} value={`${p.type}:${p.id}`}>
                      {p.name} · {p.type === "worker" ? "Worker" : "Staff"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Or type a name (if not in the lists)">
              <Input value={draft.person_name} onChange={(e) => set("person_name")(e.target.value)}
                placeholder="Full name" />
            </Field>
          </div>

          <Field label="Leave type">
            <Select value={draft.leave_type} onValueChange={set("leave_type")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LEAVE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={draft.status} onValueChange={set("status")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LEAVE_STATUSES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Start date *">
            <Input type="date" value={draft.start_date} onChange={(e) => set("start_date")(e.target.value)} />
          </Field>
          <Field label="End date *">
            <Input type="date" value={draft.end_date} onChange={(e) => set("end_date")(e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Remarks / details">
              <Textarea rows={3} value={draft.remarks} onChange={(e) => set("remarks")(e.target.value)}
                placeholder="Reason, handover notes, contact while away…" />
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving…" : leave ? "Save changes" : "Add leave"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
