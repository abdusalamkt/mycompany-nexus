import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { AppShell } from "@/components/portal/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserStatusBadge } from "@/components/portal/StatusBadge";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "My profile | Internal Company Portal" },
      { name: "description", content: "View and update your own portal profile details." },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { property: "og:title", content: "My profile | Internal Company Portal" },
      { property: "og:description", content: "View and update your own portal profile details." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, roles, permissions, refresh } = useSession();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
  }, [profile]);

  async function save() {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName, phone }).eq("id", profile.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    refresh();
  }

  return (
    <AppShell title="My profile" description="Your personal details and access level.">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Personal details</CardTitle>
            <CardDescription>Contact HR to change your employee ID, department or designation.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile?.email ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Employee ID</Label>
              <Input value={profile?.employee_code ?? "—"} disabled />
            </div>
            <div className="sm:col-span-2">
              <Button onClick={save} disabled={saving}>Save changes</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
              <div className="mt-1"><UserStatusBadge status={profile?.status ?? "inactive"} /></div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Roles</p>
              <p className="mt-1 capitalize">{roles.map((r) => r.replace("_", " ")).join(", ") || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Permissions</p>
              <p className="mt-1 text-muted-foreground">{permissions.length} granted</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
