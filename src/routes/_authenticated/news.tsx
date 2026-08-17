import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/portal/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/news")({
  head: () => ({
    meta: [
      { title: "Company News | Internal Company Portal" },
      { name: "description", content: "Internal announcements and published news." },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { property: "og:title", content: "Company News | Internal Company Portal" },
      { property: "og:description", content: "Internal announcements and published news." },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  return (
    <ModulePlaceholder
      title="Company News"
      description="Internal announcements and published news."
      permission="news.view"
      note="This module is scheduled in the next delivery phase and already has its permissions and access rules in place."
    />
  );
}
