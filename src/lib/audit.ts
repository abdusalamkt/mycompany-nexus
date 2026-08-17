import { supabase } from "@/integrations/supabase/client";

/**
 * Client-side audit trail helper. RLS forces actor_id = auth.uid() and audit
 * rows can never be updated or deleted from the app.
 */
export async function logAudit(entry: {
  action: string;
  module: string;
  recordId?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
}) {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return;
  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    actor_email: user.email ?? null,
    action: entry.action,
    module: entry.module,
    record_id: entry.recordId ?? null,
    old_value: (entry.oldValue ?? null) as never,
    new_value: (entry.newValue ?? null) as never,
  });
}
