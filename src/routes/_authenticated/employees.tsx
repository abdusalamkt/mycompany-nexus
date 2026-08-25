import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Mail, Phone, Pencil, Building2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import {
  EMPLOYEE_STATUSES, EMPLOYMENT_TYPES, formatDate, initialsOf, signPhotoUrls,
  type EmployeeRecord,
} from "@/lib/employees";
import { AppShell } from "@/components/portal/AppShell";
import { EmployeeFormDialog } from "@/components/portal/EmployeeFormDialog";
import { PersonCard, ViewToggle, type PeopleView } from "@/components/portal/PersonCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/portal/States";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge, expiryStatus } from "@/components/portal/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/employees")({
  head: () => ({
    meta: [
      { title: "Staff List | Internal Company Portal" },
      { name: "description", content: "Employee records, departments, photos, passports and visa status." },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { property: "og:title", content: "Staff List | Internal Company Portal" },
      { property: "og:description", content: "Employee records by department with photos and document details." },
    ],
  }),
  component: EmployeesPage,
});

const label = (list: { value: string; label: string }[], v: string) =>
  list.find((i) => i.value === v)?.label ?? v;

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "active" ? "bg-status-valid/15 text-status-valid"
      : status === "on_leave" ? "bg-status-soon/15 text-status-soon"
      : status === "terminated" ? "bg-status-expired/15 text-status-expired"
      : "bg-muted text-muted-foreground";
  return <span className={`rounded-full px-2 py-0.5 text-[0.68rem] font-medium ${tone}`}>{label(EMPLOYEE_STATUSES, status)}</span>;
}

function EmployeesPage() {
  const { can } = useSession();
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<EmployeeRecord | null>(null);
  const [view, setView] = useState<PeopleView>("grid");

  const fullAccess = can("employees.view");
  const directoryOnly = !fullAccess && can("employees.view_directory");

  const query = useQuery({
    queryKey: ["employees", fullAccess ? "full" : "directory"],
    enabled: fullAccess || directoryOnly,
    queryFn: async () => {
      const [employeesRes, departmentsRes] = await Promise.all([
        fullAccess
          ? supabase.from("employees").select("*").order("full_name")
          : supabase.rpc("staff_directory"),
        supabase.from("departments").select("id, name").eq("is_active", true).order("name"),
      ]);
      if (employeesRes.error) throw employeesRes.error;
      if (departmentsRes.error) throw departmentsRes.error;
      const employees = (employeesRes.data ?? []) as unknown as EmployeeRecord[];
      const photos = await signPhotoUrls(employees.map((e) => e.photo_url ?? ""));
      return { employees, departments: departmentsRes.data ?? [], photos };
    },
  });

  const departments = query.data?.departments ?? [];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (query.data?.employees ?? []).filter((e) =>
      !term || [e.full_name, e.employee_code, e.email, e.job_title].some((v) => v?.toLowerCase().includes(term)),
    );
  }, [query.data, search]);

  if (!fullAccess && !directoryOnly) {
    return (
      <AppShell title="Employees">
        <EmptyState title="You don't have access to the staff list"
          description="Ask an administrator if you believe you should have access." />
      </AppShell>
    );
  }

  const canEdit = can("employees.edit");
  const deptName = (id: string | null) => departments.find((d) => d.id === id)?.name ?? "Unassigned";

  const canSeeDocs = fullAccess && (can("employees.edit") || can("employees.create") || can("users.view"));

  function Grid({ items }: { items: EmployeeRecord[] }) {
    if (items.length === 0) return <EmptyState title="No employees in this department yet" />;
    return (
      <div className={view === "grid"
        ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        : "space-y-3"}>
        {items.map((e) => (
          <PersonCard
            key={e.id}
            view={view}
            name={e.full_name}
            subtitle={e.job_title ?? "—"}
            accent={`${deptName(e.department_id)} · ID ${e.employee_code ?? "—"}`}
            {...(e.photo_url && query.data?.photos[e.photo_url]
              ? { photo: query.data.photos[e.photo_url] as string }
              : {})}
            onOpen={() => setDetail(e)}
            badges={
              <>
                <StatusPill status={e.status} />
                <Badge variant="secondary">{label(EMPLOYMENT_TYPES, e.employment_type)}</Badge>
              </>
            }
            meta={[
              { icon: <Building2 className="size-3.5" />, text: `${deptName(e.department_id)} · ID ${e.employee_code ?? "—"}` },
              { icon: <Mail className="size-3.5" />, text: e.email ?? "—" },
              { icon: <Phone className="size-3.5" />, text: e.phone ?? "—" },
            ]}
            {...(canSeeDocs
              ? {
                  docs: [
                    ["Passport", e.passport_expiry],
                    ["Visa", e.visa_expiry],
                    ["Emirates ID", e.emirates_id_expiry],
                    ["Insurance", e.insurance_expiry],
                  ] as [string, string | null][],
                }
              : {})}
            actions={
              <>
                <Button variant="ghost" size="sm" onClick={() => setDetail(e)}>View</Button>
                {canEdit && (
                  <EmployeeFormDialog
                    employee={e}
                    departments={departments}
                    trigger={<Button variant="outline" size="sm"><Pencil className="size-3.5" />Edit</Button>}
                  />
                )}
              </>
            }
          />
        ))}
      </div>
    );
  }


  return (
    <AppShell
      title="Employees"
      description={fullAccess
        ? "Staff records grouped by department, with photos and document details."
        : "Company staff directory grouped by department."}
      actions={
        can("employees.create") ? (
          <EmployeeFormDialog
            departments={departments}
            trigger={<Button><Plus className="size-4" />Add employee</Button>}
          />
        ) : null
      }
    >
      <Card className="mb-4">
        <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 pt-6">
          <div className="relative min-w-0 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search name, ID, email or job title"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{filtered.length} shown</span>
            <ViewToggle value={view} onChange={setView} />
          </div>
        </CardContent>
      </Card>


      {query.isLoading ? (
        <LoadingState />
      ) : query.error ? (
        <ErrorState message={(query.error as Error).message} />
      ) : (query.data?.employees.length ?? 0) === 0 ? (
        <EmptyState title="No employees yet"
          description={can("employees.create") ? "Use “Add employee” to create the first staff record." : "Records will appear here once HR adds them."} />
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-4 flex h-auto flex-wrap justify-start">
            <TabsTrigger value="all">All ({filtered.length})</TabsTrigger>
            {departments.map((d) => (
              <TabsTrigger key={d.id} value={d.id}>
                {d.name} ({filtered.filter((e) => e.department_id === d.id).length})
              </TabsTrigger>
            ))}
            <TabsTrigger value="unassigned">
              Unassigned ({filtered.filter((e) => !e.department_id).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all"><Grid items={filtered} /></TabsContent>
          {departments.map((d) => (
            <TabsContent key={d.id} value={d.id}>
              <Grid items={filtered.filter((e) => e.department_id === d.id)} />
            </TabsContent>
          ))}
          <TabsContent value="unassigned">
            <Grid items={filtered.filter((e) => !e.department_id)} />
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{detail?.full_name}</DialogTitle></DialogHeader>
          {detail && (
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                ["Employee ID", detail.employee_code ?? "—"],
                ["Department", deptName(detail.department_id)],
                ["Job title", detail.job_title ?? "—"],
                ["Employment type", label(EMPLOYMENT_TYPES, detail.employment_type)],
                ["Status", label(EMPLOYEE_STATUSES, detail.status)],
                ["Email", detail.email ?? "—"],
                ["Phone", detail.phone ?? "—"],
                ...(fullAccess
                  ? ([
                      ["Nationality", detail.nationality ?? "—"],
                      ["Date of birth", formatDate(detail.date_of_birth)],
                      ["Joining date", formatDate(detail.joining_date)],
                      ["Contract end", formatDate(detail.contract_end_date)],
                      ["Passport no.", detail.passport_number ?? "—"],
                      ["Passport expiry", formatDate(detail.passport_expiry)],
                      ["Visa no.", detail.visa_number ?? "—"],
                      ["Visa expiry", formatDate(detail.visa_expiry)],
                      ["Emirates ID", detail.emirates_id ?? "—"],
                      ["Emirates ID expiry", formatDate(detail.emirates_id_expiry)],
                      ["Insurance expiry", formatDate(detail.insurance_expiry)],
                      ["Emergency contact", detail.emergency_contact_name ?? "—"],
                      ["Emergency phone", detail.emergency_contact_phone ?? "—"],
                      ["Relation", detail.emergency_contact_relation ?? "—"],
                      ["Address", detail.address ?? "—"],
                      ["Notes", detail.notes ?? "—"],
                    ] as [string, string][])
                  : []),
              ] as [string, string][]).map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-muted-foreground">{k}</p>
                  <p className="text-sm font-medium">{v}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
