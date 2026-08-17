import { cn } from "@/lib/utils";

export type ExpiryStatus = "valid" | "warning" | "soon" | "expired" | "missing";

const STYLES: Record<ExpiryStatus, { label: string; className: string }> = {
  valid: { label: "Valid", className: "bg-status-valid/15 text-status-valid border-status-valid/30" },
  warning: { label: "90 days", className: "bg-status-warning/20 text-status-warning border-status-warning/40" },
  soon: { label: "30 days", className: "bg-status-soon/15 text-status-soon border-status-soon/30" },
  expired: { label: "Expired", className: "bg-status-expired/15 text-status-expired border-status-expired/30" },
  missing: { label: "Missing", className: "bg-status-missing/15 text-status-missing border-status-missing/30" },
};

/** Green = valid, yellow = 90 days, orange = 30 days, red = expired, grey = missing. */
export function expiryStatus(expiry: string | null | undefined): ExpiryStatus {
  if (!expiry) return "missing";
  const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return "expired";
  if (days <= 30) return "soon";
  if (days <= 90) return "warning";
  return "valid";
}

export function StatusBadge({ status, label }: { status: ExpiryStatus; label?: string }) {
  const s = STYLES[status];
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", s.className)}>
      {label ?? s.label}
    </span>
  );
}

export function UserStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-status-valid/15 text-status-valid border-status-valid/30",
    inactive: "bg-status-missing/15 text-status-missing border-status-missing/30",
    suspended: "bg-status-expired/15 text-status-expired border-status-expired/30",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize", map[status] ?? map.inactive)}>
      {status}
    </span>
  );
}
