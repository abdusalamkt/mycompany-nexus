import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Phone, Pencil, HardHat, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { EMPLOYEE_STATUSES, EMPLOYMENT_TYPES, formatDate, initialsOf, signPhotoUrls } from "@/lib/employees";
import { AppShell } from "@/components/portal/AppShell";
import { WorkerFormDialog, type WorkerRecord } from "@/components/portal/WorkerFormDialog";
import { EmptyState, ErrorState, LoadingState } from "@/components/portal/States";
import { StatusBadge, expiryStatus } from "@/components/portal/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/workers")({
  head: () => ({
    meta: [
      { title: "Workers | Internal Company Portal" },
      { name: "description", content: "Site workforce records with trades, sites and document expiry tracking." },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { property: "og:title", content: "Workers | Internal Company Portal" },
      { property: "og:description", content: "Site workforce records with document expiry tracking." },
    ],
  }),
  component: WorkersPage,
});

const label = (list: { value: string; label: string }[], v: string) =>
  list.find((i) => i.value === v)?.label ?? v;

function WorkersPage() {
  const { can } = useSession();
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["workers"],
    enabled: can("workers.view"),
    queryFn: async () => {
      const [workersRes, departmentsRes] = await Promise.all([
        supabase.from("workers").select("*").order("full_name"),
        supabase.from("departments").select("id, name").eq("is_active", true).order("name"),
      ]);
      if (workersRes.error) throw workersRes.error;
      if (departmentsRes.error) throw departmentsRes.error;
      const workers = (workersRes.data ?? []) as unknown as WorkerRecord[];
      const photos = await signPhotoUrls(workers.map((w) => w.photo_url ?? ""));
      return { workers, departments: departmentsRes.data ?? [], photos };
    },
  });

  const departments = query.data?.departments ?? [];
  const canEdit = can("workers.edit");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (query.data?.workers ?? []).filter((w) =>
      !term || [w.full_name, w.worker_code, w.trade, w.site].some((v) => v?.toLowerCase().includes(term)),
    );
  }, [query.data, search]);

  if (!can("workers.view")) {
    return (
      <AppShell title="Workers">
        <EmptyState title="You don't have access to the workers module" />
      </AppShell>
    );
  }

  const deptName = (id: string | null) => departments.find((d) => d.id === id)?.name ?? "Unassigned";

  function Rows({ items }: { items: WorkerRecord[] }) {
    if (items.length === 0) return <EmptyState title="No workers in this group yet" />;
    return (
      <div className="space-y-3">
        {items.map((w) => {
          const photo = w.photo_url ? query.data?.photos[w.photo_url] : undefined;
          return (
            <Card key={w.id}>
              <CardContent className="p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 lg:grid-cols-[minmax(220px,1.4fr)_minmax(0,1.4fr)_minmax(0,1.6fr)_auto]">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-12 shrink-0">
                      {photo ? <AvatarImage src={photo} alt={w.full_name} /> : null}
                      <AvatarFallback>{initialsOf(w.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{w.full_name}</p>
                      <p className="truncate text-sm text-muted-foreground">{w.trade ?? "—"}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{label(EMPLOYEE_STATUSES, w.status)}</Badge>
                        <Badge variant="outline">{label(EMPLOYMENT_TYPES, w.employment_type)}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 min-w-0 space-y-1 text-sm text-muted-foreground lg:col-span-1">
                    <p className="flex items-center gap-2 truncate"><HardHat className="size-3.5 shrink-0" />ID {w.worker_code ?? "—"} · {deptName(w.department_id)}</p>
                    <p className="flex items-center gap-2 truncate"><MapPin className="size-3.5 shrink-0" />{w.site ?? "No site assigned"}</p>
                    <p className="flex items-center gap-2 truncate"><Phone className="size-3.5 shrink-0" />{w.phone ?? "—"}</p>
                  </div>

                  <div className="col-span-2 min-w-0 lg:col-span-1">
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Document expiry</p>
                    <div className="flex flex-wrap gap-1.5">
                      {([
                        ["Passport", w.passport_expiry],
                        ["Visa", w.visa_expiry],
                        ["Emirates ID", w.emirates_id_expiry],
                        ["Labour card", w.labour_card_expiry],
                        ["Insurance", w.insurance_expiry],
                      ] as [string, string | null][]).map(([name, d]) => (
                        <StatusBadge key={name} status={expiryStatus(d)} label={`${name}: ${d ? formatDate(d) : "Missing"}`} />
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {canEdit && (
                      <WorkerFormDialog worker={w} departments={departments}
                        trigger={<Button variant="outline" size="sm"><Pencil className="size-3.5" />Edit</Button>} />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  const sites = Array.from(new Set(filtered.map((w) => w.site).filter((s): s is string => !!s))).sort();

  return (
    <AppShell
      title="Workers"
      description="Site workforce with trades, sites and document expiry status."
      actions={can("workers.create") ? (
        <WorkerFormDialog departments={departments}
          trigger={<Button><Plus className="size-4" />Add worker</Button>} />
      ) : null}
    >
      <Card className="mb-4">
        <CardContent className="pt-6">
          <Input className="max-w-sm" placeholder="Search name, ID, trade or site"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </CardContent>
      </Card>

      {query.isLoading ? <LoadingState />
        : query.error ? <ErrorState message={(query.error as Error).message} />
        : (query.data?.workers.length ?? 0) === 0 ? (
          <EmptyState title="No workers yet"
            description={can("workers.create") ? "Use “Add worker” to create the first record." : "Records will appear once they are added."} />
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="mb-4 flex h-auto flex-wrap justify-start">
              <TabsTrigger value="all">All ({filtered.length})</TabsTrigger>
              {sites.map((s) => (
                <TabsTrigger key={s} value={s}>{s} ({filtered.filter((w) => w.site === s).length})</TabsTrigger>
              ))}
              <TabsTrigger value="unassigned">No site ({filtered.filter((w) => !w.site).length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all"><Rows items={filtered} /></TabsContent>
            {sites.map((s) => (
              <TabsContent key={s} value={s}><Rows items={filtered.filter((w) => w.site === s)} /></TabsContent>
            ))}
            <TabsContent value="unassigned"><Rows items={filtered.filter((w) => !w.site)} /></TabsContent>
          </Tabs>
        )}
    </AppShell>
  );
}
