import { supabase } from "@/integrations/supabase/client";
import { validateUpload } from "@/lib/files";

export const COMPANY_BUCKET = "company-files";

/** Uploads a validated file into a folder of the private company bucket. */
export async function uploadCompanyFile(folder: string, file: File) {
  const check = validateUpload(file);
  if (!check.ok) throw new Error(check.error);
  const path = `${folder}/${check.safeName}`;
  const { error } = await supabase.storage.from(COMPANY_BUCKET).upload(path, file, {
    ...(file.type ? { contentType: file.type } : {}),
    upsert: false,
  });
  if (error) throw error;
  return { path, name: file.name, size: file.size, mimeType: file.type };
}

/** Opens a private file through a short-lived signed URL. */
export async function openCompanyFile(path: string) {
  const { data, error } = await supabase.storage.from(COMPANY_BUCKET).createSignedUrl(path, 120);
  if (error || !data?.signedUrl) throw error ?? new Error("Could not open the file.");
  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}

export function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) { value /= 1024; i += 1; }
  return `${value.toFixed(value < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}
