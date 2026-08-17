import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in | Internal Company Portal" },
      { name: "description", content: "Secure sign-in for authorised employees of the internal company portal." },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { property: "og:title", content: "Sign in | Internal Company Portal" },
      { property: "og:description", content: "Secure sign-in for authorised employees only." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }
    // Account activation/deactivation is enforced in the database too (RLS).
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", data.user.id)
      .maybeSingle();
    if (profile && profile.status !== "active") {
      await supabase.auth.signOut();
      setLoading(false);
      toast.error("This account is not active. Please contact HR or an administrator.");
      return;
    }
    await supabase.from("profiles").update({ last_login_at: new Date().toISOString() }).eq("id", data.user.id);
    setLoading(false);
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-md bg-sidebar-primary font-bold text-sidebar-primary-foreground">IP</div>
          <span className="font-semibold">Internal Portal</span>
        </div>
        <div>
          <h2 className="max-w-sm text-3xl font-semibold leading-tight">
            One secure place for people, documents and company knowledge.
          </h2>
          <p className="mt-4 max-w-sm text-sm text-sidebar-foreground/70">
            Employee records, passports, visas, certificates, policies and department resources — protected by
            role-based access and database-level security.
          </p>
        </div>
        <p className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
          <ShieldCheck className="size-4" /> Confidential — authorised personnel only
        </p>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Use your company account to access the portal.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input id="email" type="email" autoComplete="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                </div>
                <Input id="password" type="password" autoComplete="current-password" required value={password}
                  onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 size-4 animate-spin" />} Sign in
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Accounts are created by HR or an administrator. Contact them if you need access.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
