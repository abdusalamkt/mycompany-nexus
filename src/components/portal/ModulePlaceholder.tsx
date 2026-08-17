import { AppShell } from "@/components/portal/AppShell";
import { EmptyState } from "@/components/portal/States";
import { useSession } from "@/lib/session";

export function ModulePlaceholder({
  title,
  description,
  permission,
  note,
}: {
  title: string;
  description: string;
  permission?: string;
  note: string;
}) {
  const { can } = useSession();
  const allowed = !permission || can(permission);
  return (
    <AppShell title={title} description={description}>
      {allowed ? (
        <EmptyState title={`${title} is not populated yet`} description={note} />
      ) : (
        <EmptyState
          title="You don't have access to this section"
          description="Ask an administrator if you believe you should have access."
        />
      )}
    </AppShell>
  );
}
