import { supabase } from "@/integrations/supabase/client";

export interface EmployeeRecord {
  id: string;
  full_name: string;
  employee_code: string | null;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  date_of_birth: string | null;
  gender: string | null;
  photo_url: string | null;
  address: string | null;
  department_id: string | null;
  job_title: string | null;
  employment_type: string;
  joining_date: string | null;
  contract_end_date: string | null;
  salary: number | null;
  status: string;
  passport_number: string | null;
  passport_expiry: string | null;
  visa_number: string | null;
  visa_expiry: string | null;
  emirates_id: string | null;
  emirates_id_expiry: string | null;
  insurance_expiry: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
  notes: string | null;
  created_at: string;
}

export const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full time" },
  { value: "part_time", label: "Part time" },
  { value: "contract", label: "Contract" },
  { value: "probation", label: "Probation" },
  { value: "intern", label: "Intern" },
];

export const EMPLOYEE_STATUSES = [
  { value: "active", label: "Active" },
  { value: "on_leave", label: "On leave" },
  { value: "inactive", label: "Inactive" },
  { value: "terminated", label: "Terminated" },
];

export const PHOTO_BUCKET = "employee-photos";
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validatePhoto(file: File): { ok: true; path: string } | { ok: false; error: string } {
  if (!PHOTO_TYPES.includes(file.type)) return { ok: false, error: "Photo must be a JPG, PNG or WebP image." };
  if (file.size > MAX_PHOTO_BYTES) return { ok: false, error: "Photo must be smaller than 5 MB." };
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  return { ok: true, path: `${crypto.randomUUID()}.${ext}` };
}

/** Resolves storage paths to short-lived signed URLs. */
export async function signPhotoUrls(paths: string[]): Promise<Record<string, string>> {
  const unique = Array.from(new Set(paths.filter(Boolean)));
  if (unique.length === 0) return {};
  const { data } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(unique, 3600);
  const map: Record<string, string> = {};
  (data ?? []).forEach((entry, index) => {
    const key = entry.path ?? unique[index]!;
    if (entry.signedUrl) map[key] = entry.signedUrl;
  });
  return map;
}

export function initialsOf(name: string) {
  return name.split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}
