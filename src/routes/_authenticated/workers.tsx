import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/portal/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/workers")({
  head: () => ({
    meta: [
      { title: "Workers | Internal Company Portal" },
      { name: "description", content: "Worker records, labour cards, insurance and documents." },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { property: "og:title", content: "Workers | Internal Company Portal" },
      { property: "og:description", content: "Worker records, labour cards, insurance and documents." },
    ],
  }),
  component: WorkersPage,
});

function WorkersPage() {
  return (
    <ModulePlaceholder
      title="Workers"
      description="Worker records, labour cards, insurance and documents."
      permission="workers.view"
      note="This module is scheduled in the next delivery phase and already has its permissions and access rules in place."
    />
  );
}
