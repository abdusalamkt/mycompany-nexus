import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";
import {
  EMPLOYEE_STATUSES, EMPLOYMENT_TYPES, PHOTO_BUCKET, validatePhoto,
  type EmployeeRecord,
} from "@/lib/employees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

type Draft = Record<string, string>;

/** Radix Select rejects an empty string value, so omit the prop when unset. */
const sel = (v: string | undefined) => (v ? { value: v } : {});

const EMPTY: Draft = {
  full_name: "", employee_code: "", email: "", phone: "", nationality: "", date_of_birth: "",
  gender: "", address: "", department_id: "", job_title: "", employment_type: "full_time",
  joining_date: "", contract_end_date: "", salary: "", status: "active",
  passport_number: "", passport_expiry: "", visa_number: "", visa_expiry: "",
  emirates_id: "", emirates_id_expiry: "", insurance_expiry: "",
  emergency_contact_name: "", emergency_contact_phone: "", emergency_contact_relation: "", notes: "",
};

function toDraft(e: EmployeeRecord): Draft {
  const draft: Draft = { ...EMPTY };
  for (const key of Object.keys(EMPTY)) {
    const value = (e as unknown as Record<string, unknown>)[key];
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

export function EmployeeFormDialog({
  employee,
  departments,
  trigger,
}: {
  employee?: EmployeeRecord;
  departments: { id: string; name: string }[];
  trigger: ReactNode;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(employee ? toDraft(employee) : EMPTY);
  const [photo, setPhoto] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(employee ? toDraft(employee) : EMPTY);
      setPhoto(null);
    }
  }, [open, employee]);

  const set = (key: string) => (value: string) => setDraft((d) => ({ ...d, [key]: value }));

  const save = useMutation({
    mutationFn: async () => {
      if (!draft['full_name']?.trim()) throw new Error("Full name is required.");

      let photoPath = employee?.photo_url ?? null;
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
        if (key === "salary") payload[key] = raw === "" ? null : Number(raw);
        else if (key === "employment_type" || key === "status") payload[key] = raw || (key === "status" ? "active" : "full_time");
        else payload[key] = raw === "" ? null : raw;
      }

      if (employee) {
        const { error } = await supabase.from("employees").update(payload as never).eq("id", employee.id);
        if (error) throw error;
        await logAudit({ action: "employee.updated", module: "Employees", recordId: employee.id, newValue: payload });
      } else {
        const { data: userRes } = await supabase.auth.getUser();
        const { data, error } = await supabase
          .from("employees")
          .insert({ ...payload, created_by: userRes.user?.id ?? null } as never)
          .select("id")
          .single();
        if (error) throw error;
        await logAudit({ action: "employee.created", module: "Employees", recordId: data?.id, newValue: payload });
      }
    },
    onSuccess: () => {
      toast.success(employee ? "Employee updated" : "Employee added");
      qc.invalidateQueries({ queryKey: ["employees"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{employee ? "Edit employee" : "Add employee"}</DialogTitle>
          <DialogDescription>
            Personal, job and document details. Records are archived, never deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Personal details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name *">
                <Input value={draft['full_name'] ?? ""} onChange={(e) => set("full_name")(e.target.value)} />
              </Field>
              <Field label="Employee ID">
                <Input value={draft['employee_code'] ?? ""} onChange={(e) => set("employee_code")(e.target.value)} />
              </Field>
              <Field label="Email">
                <Input type="email" value={draft['email'] ?? ""} onChange={(e) => set("email")(e.target.value)} />
              </Field>
              <Field label="Phone">
                <Input value={draft['phone'] ?? ""} onChange={(e) => set("phone")(e.target.value)} />
              </Field>
              <Field label="Nationality">
                <Input value={draft['nationality'] ?? ""} onChange={(e) => set("nationality")(e.target.value)} />
              </Field>
              <Field label="Date of birth">
                <Input type="date" value={draft['date_of_birth'] ?? ""} onChange={(e) => set("date_of_birth")(e.target.value)} />
              </Field>
              <Field label="Gender">
                <Select {...sel(draft['gender'])} onValueChange={set("gender")}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Photo">
                <Input type="file" accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Address">
                  <Textarea rows={2} value={draft['address'] ?? ""} onChange={(e) => set("address")(e.target.value)} />
                </Field>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Job details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Department">
                <Select {...sel(draft['department_id'])} onValueChange={set("department_id")}>
                  <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Job title">
                <Input value={draft['job_title'] ?? ""} onChange={(e) => set("job_title")(e.target.value)} />
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
              <Field label="Joining date">
                <Input type="date" value={draft['joining_date'] ?? ""} onChange={(e) => set("joining_date")(e.target.value)} />
              </Field>
              <Field label="Contract end date">
                <Input type="date" value={draft['contract_end_date'] ?? ""} onChange={(e) => set("contract_end_date")(e.target.value)} />
              </Field>
              <Field label="Salary">
                <Input type="number" value={draft['salary'] ?? ""} onChange={(e) => set("salary")(e.target.value)} />
              </Field>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Documents</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Passport number">
                <Input value={draft['passport_number'] ?? ""} onChange={(e) => set("passport_number")(e.target.value)} />
              </Field>
              <Field label="Passport expiry">
                <Input type="date" value={draft['passport_expiry'] ?? ""} onChange={(e) => set("passport_expiry")(e.target.value)} />
              </Field>
              <Field label="Visa number">
                <Input value={draft['visa_number'] ?? ""} onChange={(e) => set("visa_number")(e.target.value)} />
              </Field>
              <Field label="Visa expiry">
                <Input type="date" value={draft['visa_expiry'] ?? ""} onChange={(e) => set("visa_expiry")(e.target.value)} />
              </Field>
              <Field label="Emirates ID">
                <Input value={draft['emirates_id'] ?? ""} onChange={(e) => set("emirates_id")(e.target.value)} />
              </Field>
              <Field label="Emirates ID expiry">
                <Input type="date" value={draft['emirates_id_expiry'] ?? ""} onChange={(e) => set("emirates_id_expiry")(e.target.value)} />
              </Field>
              <Field label="Insurance expiry">
                <Input type="date" value={draft['insurance_expiry'] ?? ""} onChange={(e) => set("insurance_expiry")(e.target.value)} />
              </Field>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Emergency contact & notes</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact name">
                <Input value={draft['emergency_contact_name'] ?? ""} onChange={(e) => set("emergency_contact_name")(e.target.value)} />
              </Field>
              <Field label="Contact phone">
                <Input value={draft['emergency_contact_phone'] ?? ""} onChange={(e) => set("emergency_contact_phone")(e.target.value)} />
              </Field>
              <Field label="Relation">
                <Input value={draft['emergency_contact_relation'] ?? ""} onChange={(e) => set("emergency_contact_relation")(e.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Notes">
                  <Textarea rows={3} value={draft['notes'] ?? ""} onChange={(e) => set("notes")(e.target.value)} />
                </Field>
              </div>
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving…" : employee ? "Save changes" : "Add employee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
