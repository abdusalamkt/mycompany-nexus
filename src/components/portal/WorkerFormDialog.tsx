import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";
import { EMPLOYEE_STATUSES, EMPLOYMENT_TYPES, PHOTO_BUCKET, validatePhoto } from "@/lib/employees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export interface WorkerRecord {
  id: string;
  full_name: string;
  worker_code: string | null;
  photo_url: string | null;
  nationality: string | null;
  phone: string | null;
  trade: string | null;
  site: string | null;
  department_id: string | null;
  employment_type: string;
  joining_date: string | null;
  contract_end_date: string | null;
  status: string;
  passport_number: string | null;
  passport_expiry: string | null;
  visa_number: string | null;
  visa_expiry: string | null;
  emirates_id: string | null;
  emirates_id_expiry: string | null;
  labour_card_number: string | null;
  labour_card_expiry: string | null;
  insurance_expiry: string | null;
  notes: string | null;
  created_at: string;
}

type Draft = Record<string, string>;

const EMPTY: Draft = {
  full_name: "", worker_code: "", nationality: "", phone: "", trade: "", site: "",
  department_id: "", employment_type: "full_time", joining_date: "", contract_end_date: "",
  status: "active", passport_number: "", passport_expiry: "", visa_number: "", visa_expiry: "",
  emirates_id: "", emirates_id_expiry: "", labour_card_number: "", labour_card_expiry: "",
  insurance_expiry: "", notes: "",
};

const sel = (v: string | undefined) => (v ? { value: v } : {});

function toDraft(w: WorkerRecord): Draft {
  const draft: Draft = { ...EMPTY };
  for (const key of Object.keys(EMPTY)) {
    const value = (w as unknown as Record<string, unknown>)[key];
    draft[key] = value === null || value === undefined ? "" : String(value);
  }
  return draft;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function WorkerFormDialog({
  worker, departments, trigger,
}: {
  worker?: WorkerRecord;
  departments: { id: string; name: string }[];
  trigger: ReactNode;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(worker ? toDraft(worker) : EMPTY);
  const [photo, setPhoto] = useState<File | null>(null);

  useEffect(() => {
    if (open) { setDraft(worker ? toDraft(worker) : EMPTY); setPhoto(null); }
  }, [open, worker]);

  const set = (key: string) => (value: string) => setDraft((d) => ({ ...d, [key]: value }));
  const text = (key: string) => (
    <Input value={draft[key] ?? ""} onChange={(e) => set(key)(e.target.value)} />
  );
  const date = (key: string) => (
    <Input type="date" value={draft[key] ?? ""} onChange={(e) => set(key)(e.target.value)} />
  );

  const save = useMutation({
    mutationFn: async () => {
      if (!draft['full_name']?.trim()) throw new Error("Full name is required.");
      let photoPath = worker?.photo_url ?? null;
      if (photo) {
        const check = validatePhoto(photo);
        if (!check.ok) throw new Error(check.error);
        const upload = await supabase.storage.from(PHOTO_BUCKET).upload(check.path, photo, {
          contentType: photo.type, upsert: false,
        });
        if (upload.error) throw upload.error;
        photoPath = check.path;
      }

      const payload: Record<string, unknown> = { photo_url: photoPath };
      for (const key of Object.keys(EMPTY)) {
        const raw = draft[key]?.trim() ?? "";
        if (key === "employment_type") payload[key] = raw || "full_time";
        else if (key === "status") payload[key] = raw || "active";
        else payload[key] = raw === "" ? null : raw;
      }

      if (worker) {
        const { error } = await supabase.from("workers").update(payload as never).eq("id", worker.id);
        if (error) throw error;
        await logAudit({ action: "worker.updated", module: "Workers", recordId: worker.id, newValue: payload });
      } else {
        const { data: userRes } = await supabase.auth.getUser();
        const { data, error } = await supabase.from("workers")
          .insert({ ...payload, created_by: userRes.user?.id ?? null } as never)
          .select("id").single();
        if (error) throw error;
        await logAudit({ action: "worker.created", module: "Workers", recordId: data?.id, newValue: payload });
      }
    },
    onSuccess: () => {
      toast.success(worker ? "Worker updated" : "Worker added");
      qc.invalidateQueries({ queryKey: ["workers"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{worker ? "Edit worker" : "Add worker"}</DialogTitle>
          <DialogDescription>Site workforce record with trade, site and document expiry tracking.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name *">{text("full_name")}</Field>
          <Field label="Worker ID">{text("worker_code")}</Field>
          <Field label="Trade / role">{text("trade")}</Field>
          <Field label="Site / project">{text("site")}</Field>
          <Field label="Nationality">{text("nationality")}</Field>
          <Field label="Phone">{text("phone")}</Field>
          <Field label="Department">
            <Select {...sel(draft['department_id'])} onValueChange={set("department_id")}>
              <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
              <SelectContent>
                {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Employment type">
            <Select value={draft['employment_type'] || "full_time"} onValueChange={set("employment_type")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={draft['status'] || "active"} onValueChange={set("status")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EMPLOYEE_STATUSES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Joining date">{date("joining_date")}</Field>
          <Field label="Contract end date">{date("contract_end_date")}</Field>
          <Field label="Photo">
            <Input type="file" accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
          </Field>
          <Field label="Passport number">{text("passport_number")}</Field>
          <Field label="Passport expiry">{date("passport_expiry")}</Field>
          <Field label="Visa number">{text("visa_number")}</Field>
          <Field label="Visa expiry">{date("visa_expiry")}</Field>
          <Field label="Emirates ID">{text("emirates_id")}</Field>
          <Field label="Emirates ID expiry">{date("emirates_id_expiry")}</Field>
          <Field label="Labour card number">{text("labour_card_number")}</Field>
          <Field label="Labour card expiry">{date("labour_card_expiry")}</Field>
          <Field label="Insurance expiry">{date("insurance_expiry")}</Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <Textarea rows={3} value={draft['notes'] ?? ""} onChange={(e) => set("notes")(e.target.value)} />
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving…" : worker ? "Save changes" : "Add worker"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
