import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, CalendarDays, Search, User, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { formatDate } from "@/lib/employees";
import { logAudit } from "@/lib/audit";
import { AppShell } from "@/components/portal/AppShell";
import { EmptyState, ErrorState, LoadingState } from "@/components/portal/States";
import {
  LeaveFormDialog, LEAVE_STATUSES, LEAVE_TYPES,
  type LeaveRecord, type PersonOption,
} from "@/components/portal/LeaveFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/leaves")({
  head: () => ({
    meta: [
      { title: "Leave Records | Internal Company Portal" },
      { name: "description", content: "Company leave calendar: who is away, when, and why." },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { property: "og:title", content: "Leave Records | Internal Company Portal" },
      { property: "og:description", content: "Staff and worker leave dates, types and remarks." },
    ],
  }),
  component: LeavesPage,
});

const label = (list: { value: string; label: string }[], v: string) =>
  list.find((i) => i.value === v)?.label ?? v;

const today = () => new Date().toISOString().slice(0, 10);

function statusTone(status: string) {
  switch (status) {
    case "approved": return "bg-status-valid/15 text-status-valid";
    case "ongoing": return "bg-primary/15 text-primary";
    case "cancelled": return "bg-status-expired/15 text-status-expired";
    case "completed": return "bg-muted text-muted-foreground";
    default: return "bg-status-warning/20 text-status-warning";
  }
}

function daysBetween(start: string, end: string) {
  const d = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1;
  return d > 0 ? d : 1;
}

function LeavesPage() {
  const { can } = useSession();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const canView = can("leaves.view");
  const canManage = can("leaves.manage");

  const query = useQuery({
    queryKey: ["leaves"],
    enabled: canView,
    queryFn: async () => {
      const [leavesRes, deptRes] = await Promise.all([
        supabase.from("leaves").select("*").order("start_date", { ascending: false }),
        supabase.from("departments").select("id, name").order("name"),
      ]);
      if (leavesRes.error) throw leavesRes.error;
      if (deptRes.error) throw deptRes.error;
      return {
        leaves: (leavesRes.data ?? []) as unknown as LeaveRecord[],
        departments: deptRes.data ?? [],
      };
    },
  });

  const peopleQuery = useQuery({
    queryKey: ["leave-people"],
    enabled: canManage,
    queryFn: async () => {
      const [emp, wrk] = await Promise.all([
        supabase.rpc("staff_directory"),
        supabase.rpc("worker_directory"),
      ]);
      const list: PersonOption[] = [];
      for (const e of (emp.data ?? []) as { id: string; full_name: string; department_id: string | null }[]) {
        list.push({ id: e.id, name: e.full_name, type: "employee", department_id: e.department_id });
      }
      for (const w of (wrk.data ?? []) as { id: string; full_name: string; department_id: string | null }[]) {
        list.push({ id: w.id, name: w.full_name, type: "worker", department_id: w.department_id });
      }
      return list;
    },
  });

  const remove = useMutation({
    mutationFn: async (leave: LeaveRecord) => {
      const { error } = await supabase.from("leaves").delete().eq("id", leave.id);
      if (error) throw error;
      await logAudit({ action: "leave.deleted", module: "Leave", recordId: leave.id, oldValue: leave });
    },
    onSuccess: () => {
      toast.success("Leave record removed");
      qc.invalidateQueries({ queryKey: ["leaves"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const departments = query.data?.departments ?? [];
  const deptName = (id: string | null) => departments.find((d) => d.id === id)?.name ?? "—";

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (query.data?.leaves ?? []).filter((l) =>
      !term || [l.person_name, l.remarks, l.leave_type].some((v) => v?.toLowerCase().includes(term)),
    );
  }, [query.data, search]);

  const now = today();
  const current = filtered.filter((l) => l.start_date <= now && l.end_date >= now && l.status !== "cancelled");
  const upcoming = filtered.filter((l) => l.start_date > now && l.status !== "cancelled");
  const past = filtered.filter((l) => l.end_date < now || l.status === "cancelled");

  if (!canView) {
    return (
      <AppShell title="Leave">
        <EmptyState title="You don't have access to leave records" />
      </AppShell>
    );
  }

  function List({ items }: { items: LeaveRecord[] }) {
    if (items.length === 0) return <EmptyState title="No leave records here" />;
    return (
      <div className="space-y-3">
        {items.map((l) => (
          <Card key={l.id} className="transition-shadow hover:shadow-md">
            <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 p-4 lg:grid-cols-[minmax(200px,1fr)_minmax(0,1fr)_minmax(0,1.4fr)_auto]">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <User className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{l.person_name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {l.person_type === "worker" ? "Worker" : "Staff"} · {deptName(l.department_id)}
                  </p>
                </div>
              </div>

              <div className="col-span-2 min-w-0 space-y-1 text-sm lg:col-span-1">
                <p className="flex items-center gap-2 font-medium">
                  <CalendarDays className="size-3.5 shrink-0 text-primary/70" />
                  {formatDate(l.start_date)} → {formatDate(l.end_date)}
                </p>
                <p className="text-muted-foreground">{daysBetween(l.start_date, l.end_date)} day(s)</p>
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <Badge variant="secondary">{label(LEAVE_TYPES, l.leave_type)}</Badge>
                  <span className={`rounded-full px-2 py-0.5 text-[0.68rem] font-medium ${statusTone(l.status)}`}>
                    {label(LEAVE_STATUSES, l.status)}
                  </span>
                </div>
              </div>

              <div className="col-span-2 min-w-0 lg:col-span-1">
                <p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                  Remarks
                </p>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{l.remarks || "—"}</p>
              </div>

              {canManage && (
                <div className="flex shrink-0 flex-col gap-2">
                  <LeaveFormDialog
                    leave={l}
                    people={peopleQuery.data ?? []}
                    trigger={<Button variant="outline" size="sm"><Pencil className="size-3.5" />Edit</Button>}
                  />
                  <Button variant="ghost" size="sm" onClick={() => remove.mutate(l)}>
                    <Trash2 className="size-3.5" />Delete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <AppShell
      title="Leave"
      description="Who is on leave, when they are away and why — visible to everyone in the company."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a href="https://www.google.com" target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" />Apply for leave
            </a>
          </Button>
          {canManage && (
            <LeaveFormDialog
              people={peopleQuery.data ?? []}
              trigger={<Button><Plus className="size-4" />Add leave</Button>}
            />
          )}
        </div>
      }
    >
      <Card className="mb-4">
        <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 pt-6">
          <div className="relative min-w-0 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search name, type or remarks"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <span className="hidden shrink-0 text-sm text-muted-foreground sm:inline">{filtered.length} records</span>
        </CardContent>
      </Card>

      {query.isLoading ? <LoadingState />
        : query.error ? <ErrorState message={(query.error as Error).message} />
        : (query.data?.leaves.length ?? 0) === 0 ? (
          <EmptyState title="No leave records yet"
            description={canManage ? "Use “Add leave” to record the first one." : "HR will add leave records here."} />
        ) : (
          <Tabs defaultValue="current">
            <TabsList className="mb-4 flex h-auto flex-wrap justify-start">
              <TabsTrigger value="current">On leave now ({current.length})</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
              <TabsTrigger value="all">All ({filtered.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="current"><List items={current} /></TabsContent>
            <TabsContent value="upcoming"><List items={upcoming} /></TabsContent>
            <TabsContent value="past"><List items={past} /></TabsContent>
            <TabsContent value="all"><List items={filtered} /></TabsContent>
          </Tabs>
        )}
    </AppShell>
  );
}
