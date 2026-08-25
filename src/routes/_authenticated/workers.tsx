import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Phone, Pencil, HardHat, MapPin, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { EMPLOYEE_STATUSES, EMPLOYMENT_TYPES, signPhotoUrls } from "@/lib/employees";
import { AppShell } from "@/components/portal/AppShell";
import { WorkerFormDialog, type WorkerRecord } from "@/components/portal/WorkerFormDialog";
import { PersonCard, ViewToggle, type PeopleView } from "@/components/portal/PersonCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/portal/States";
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
  const [view, setView] = useState<PeopleView>("grid");

  const fullAccess = can("workers.view");
  const directoryOnly = !fullAccess && can("workers.view_directory");

  const query = useQuery({
    queryKey: ["workers", fullAccess ? "full" : "directory"],
    enabled: fullAccess || directoryOnly,
    queryFn: async () => {
      const [workersRes, departmentsRes] = await Promise.all([
        fullAccess
          ? supabase.from("workers").select("*").order("full_name")
          : supabase.rpc("worker_directory"),
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
  const canEdit = fullAccess && can("workers.edit");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (query.data?.workers ?? []).filter((w) =>
      !term || [w.full_name, w.worker_code, w.trade, w.site].some((v) => v?.toLowerCase().includes(term)),
    );
  }, [query.data, search]);

  if (!fullAccess && !directoryOnly) {
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
      <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
        {items.map((w) => (
          <PersonCard
            key={w.id}
            view={view}
            name={w.full_name}
            subtitle={w.trade ?? "—"}
            {...(w.photo_url && query.data?.photos[w.photo_url]
              ? { photo: query.data.photos[w.photo_url] as string }
              : {})}
            badges={
              <>
                <Badge variant="secondary">{label(EMPLOYEE_STATUSES, w.status)}</Badge>
                <Badge variant="outline">{label(EMPLOYMENT_TYPES, w.employment_type)}</Badge>
              </>
            }
            meta={[
              { icon: <HardHat className="size-3.5" />, text: `ID ${w.worker_code ?? "—"} · ${deptName(w.department_id)}` },
              { icon: <MapPin className="size-3.5" />, text: w.site ?? "No site assigned" },
              { icon: <Phone className="size-3.5" />, text: w.phone ?? "—" },
            ]}
            {...(fullAccess
              ? {
                  docs: [
                    ["Passport", w.passport_expiry],
                    ["Visa", w.visa_expiry],
                    ["Emirates ID", w.emirates_id_expiry],
                    ["Labour card", w.labour_card_expiry],
                    ["Insurance", w.insurance_expiry],
                  ] as [string, string | null][],
                }
              : {})}
            actions={
              canEdit ? (
                <WorkerFormDialog worker={w} departments={departments}
                  trigger={<Button variant="outline" size="sm"><Pencil className="size-3.5" />Edit</Button>} />
              ) : null
            }
          />
        ))}
      </div>
    );
  }


  const sites = Array.from(new Set(filtered.map((w) => w.site).filter((s): s is string => !!s))).sort();

  return (
    <AppShell
      title="Workers"
      description={fullAccess
        ? "Site workforce with trades, sites and document expiry status."
        : "Site workforce directory with trades and sites."}
      actions={can("workers.create") ? (
        <WorkerFormDialog departments={departments}
          trigger={<Button><Plus className="size-4" />Add worker</Button>} />
      ) : null}
    >
      <Card className="mb-4">
        <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 pt-6">
          <div className="relative min-w-0 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search name, ID, trade or site"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{filtered.length} shown</span>
            <ViewToggle value={view} onChange={setView} />
          </div>
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
