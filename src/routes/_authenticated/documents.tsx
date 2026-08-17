import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/portal/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({
    meta: [
      { title: "Documents | Internal Company Portal" },
      { name: "description", content: "Company and personal documents you are authorised to view." },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { property: "og:title", content: "Documents | Internal Company Portal" },
      { property: "og:description", content: "Company and personal documents you are authorised to view." },
    ],
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  return (
    <ModulePlaceholder
      title="Documents"
      description="Company and personal documents you are authorised to view."
      permission="documents.view"
      note="This module is scheduled in the next delivery phase and already has its permissions and access rules in place."
    />
  );
}
