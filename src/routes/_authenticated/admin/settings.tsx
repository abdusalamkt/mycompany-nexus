import { createFileRoute, Link } from "@tanstack/react-router";
import { useSession } from "@/lib/session";
import { AppShell } from "@/components/portal/AppShell";
import { EmptyState } from "@/components/portal/States";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({
    meta: [
      { title: "System settings | Internal Company Portal" },
      { name: "description", content: "Company profile, departments, document types and notification rules." },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { property: "og:title", content: "System settings | Internal Company Portal" },
      { property: "og:description", content: "Company profile, departments and notification rules." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { can } = useSession();
  if (!can("settings.view")) {
    return <AppShell title="System settings"><EmptyState title="You don't have access to system settings" /></AppShell>;
  }
  return (
    <AppShell title="System settings" description="Configuration for the whole portal.">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Departments</CardTitle>
            <CardDescription>Add or review the department list.</CardDescription>
          </CardHeader>
          <CardContent><Button variant="outline" asChild><Link to="/admin/departments">Manage departments</Link></Button></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Roles & permissions</CardTitle>
            <CardDescription>Create roles and grant granular permissions.</CardDescription>
          </CardHeader>
          <CardContent><Button variant="outline" asChild><Link to="/admin/roles">Manage access</Link></Button></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Document types & expiry rules</CardTitle>
            <CardDescription>Configured with the document and expiry modules in the next phase.</CardDescription>
          </CardHeader>
          <CardContent><Button variant="outline" disabled>Coming next</Button></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notification rules</CardTitle>
            <CardDescription>90/60/30/15/7/1-day reminders and recipients.</CardDescription>
          </CardHeader>
          <CardContent><Button variant="outline" disabled>Coming next</Button></CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
