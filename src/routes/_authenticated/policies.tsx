import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/portal/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/policies")({
  head: () => ({
    meta: [
      { title: "Policies | Internal Company Portal" },
      { name: "description", content: "HR, company, safety, IT and department policies." },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { property: "og:title", content: "Policies | Internal Company Portal" },
      { property: "og:description", content: "HR, company, safety, IT and department policies." },
    ],
  }),
  component: PoliciesPage,
});

function PoliciesPage() {
  return (
    <ModulePlaceholder
      title="Policies"
      description="HR, company, safety, IT and department policies."
      permission="policies.view"
      note="This module is scheduled in the next delivery phase and already has its permissions and access rules in place."
    />
  );
}
