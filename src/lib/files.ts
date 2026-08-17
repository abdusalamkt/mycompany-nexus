export const ALLOWED_UPLOAD_EXTENSIONS = [
  "pdf", "jpg", "jpeg", "png", "doc", "docx", "xls", "xlsx",
] as const;

export const ALLOWED_UPLOAD_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

/** Validates extension + mime + size and returns a safe, non-guessable storage name. */
export function validateUpload(file: File): { ok: true; safeName: string } | { ok: false; error: string } {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!(ALLOWED_UPLOAD_EXTENSIONS as readonly string[]).includes(ext)) {
    return { ok: false, error: `File type .${ext} is not allowed.` };
  }
  if (file.type && !ALLOWED_UPLOAD_MIME.includes(file.type)) {
    return { ok: false, error: "File content type is not allowed." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "File is larger than the 10 MB limit." };
  }
  return { ok: true, safeName: `${crypto.randomUUID()}.${ext}` };
}
