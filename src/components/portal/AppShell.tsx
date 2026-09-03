import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard, Users, Building2, ShieldCheck, ScrollText, Newspaper,
  FileText, IdCard, CalendarDays, Network, Menu, LogOut, Bell, Search, Settings, UserCog, Briefcase,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  permission?: string;
  anyPermission?: string[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, permission: "dashboard.view" }],
  },
  {
    title: "People",
    items: [
      { label: "Staff List", to: "/employees", icon: Users, anyPermission: ["employees.view", "employees.view_directory"] },
      { label: "Workers", to: "/workers", icon: Briefcase, anyPermission: ["workers.view", "workers.view_directory"] },
      { label: "Leave", to: "/leaves", icon: CalendarDays, permission: "leaves.view" },
      { label: "Org Chart", to: "/org-chart", icon: Network, permission: "org_charts.view" },
      { label: "My Profile", to: "/profile", icon: IdCard },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "News", to: "/news", icon: Newspaper, permission: "news.view" },
      { label: "Policies", to: "/policies", icon: ScrollText, permission: "policies.view" },
      { label: "Documents", to: "/documents", icon: FileText, permission: "documents.view" },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Users", to: "/admin/users", icon: UserCog, permission: "users.view" },
      { label: "Roles & Permissions", to: "/admin/roles", icon: ShieldCheck, permission: "users.manage_permissions" },
      { label: "Departments", to: "/admin/departments", icon: Building2, permission: "settings.view" },
      { label: "Audit Log", to: "/admin/audit", icon: ScrollText, permission: "audit.view" },
      { label: "Settings", to: "/admin/settings", icon: Settings, permission: "settings.view" },
    ],
  },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { can } = useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-col gap-6 px-3 py-4">
      {NAV.map((group) => {
        const items = group.items.filter(
          (i) =>
            (!i.permission || can(i.permission)) &&
            (!i.anyPermission || i.anyPermission.some((c) => can(c))),
        );
        if (items.length === 0) return null;
        return (
          <div key={group.title}>
            <p className="px-3 pb-2 text-[0.68rem] font-semibold uppercase tracking-widest text-sidebar-foreground/50">
              {group.title}
            </p>
            <ul className="space-y-1">
              {items.map((item) => {
                const active = pathname === item.to || pathname.startsWith(item.to + "/");
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        active && "bg-sidebar-accent text-sidebar-accent-foreground",
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2 border-b border-sidebar-border px-5 py-4">
      <div className="grid size-8 place-items-center rounded-md bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
        IP
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-sidebar-foreground">Internal Portal</p>
        <p className="text-[0.68rem] text-sidebar-foreground/60">Confidential</p>
      </div>
    </div>
  );
}

export function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { profile, roles } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (profile?.full_name ?? profile?.email ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar lg:flex">
        <Brand />
        <div className="flex-1 overflow-y-auto">
          <SidebarNav />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card px-4 py-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Brand />
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search the portal…" className="pl-9" aria-label="Global search" />
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="size-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="size-7">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:inline">{profile?.full_name ?? profile?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">{profile?.full_name ?? "—"}</p>
                  <p className="text-xs font-normal text-muted-foreground">{profile?.email}</p>
                  <p className="mt-1 text-xs font-normal capitalize text-muted-foreground">
                    {roles.map((r) => r.replace("_", " ")).join(", ") || "No role"}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
                  <IdCard className="mr-2 size-4" /> My profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
              </div>
              {actions}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
