import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Download, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { formatDate } from "@/lib/employees";
import { formatBytes, openCompanyFile, uploadCompanyFile } from "@/lib/storage";
import { AppShell } from "@/components/portal/AppShell";
import { EmptyState, ErrorState, LoadingState } from "@/components/portal/States";
import { StatusBadge, expiryStatus } from "@/components/portal/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({
    meta: [
      { title: "Documents | Internal Company Portal" },
      { name: "description", content: "Private document library for contracts, certificates and staff paperwork." },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { property: "og:title", content: "Documents | Internal Company Portal" },
      { property: "og:description", content: "Private document library for company and staff paperwork." },
    ],
  }),
  component: DocumentsPage,
});

interface DocRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_path: string;
  file_name: string;
  file_size: number | null;
  employee_id: string | null;
  visibility: string;
  expiry_date: string | null;
  created_at: string;
}

const CATEGORIES = ["general", "contract", "certificate", "passport", "visa", "insurance", "invoice", "other"];
const VISIBILITIES = [
  { value: "company", label: "Company-wide" },
  { value: "restricted", label: "Restricted (sensitive)" },
  { value: "private", label: "Only me" },
];

function UploadDialog({ employees }: { employees: { id: string; full_name: string }[] }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [visibility, setVisibility] = useState("company");
  const [employeeId, setEmployeeId] = useState("");
  const [expiry, setExpiry] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error("Title is required.");
      if (!file) throw new Error("Please choose a file to upload.");
      const uploaded = await uploadCompanyFile("documents", file);
      const { data: userRes } = await supabase.auth.getUser();
      const { data, error } = await supabase.from("documents").insert({
        title: title.trim(),
        description: description.trim() || null,
        category,
        visibility,
        employee_id: employeeId || null,
        expiry_date: expiry || null,
        file_path: uploaded.path,
        file_name: uploaded.name,
        file_size: uploaded.size,
        mime_type: uploaded.mimeType || null,
        uploaded_by: userRes.user?.id ?? null,
        owner_user_id: visibility === "private" ? userRes.user?.id ?? null : null,
      }).select("id").single();
      if (error) throw error;
      await logAudit({ action: "document.uploaded", module: "Documents", recordId: data?.id, newValue: { title, category, visibility } });
    },
    onSuccess: () => {
      toast.success("Document uploaded");
      qc.invalidateQueries({ queryKey: ["documents"] });
      setOpen(false);
      setTitle(""); setDescription(""); setExpiry(""); setFile(null); setEmployeeId("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="size-4" />Upload document</Button></DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
          <DialogDescription>PDF, Word, Excel or image files up to 10 MB. Files are stored privately.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Description</Label>
            <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                </SelectContent>
              </Select></div>
            <div className="space-y-1.5"><Label>Visibility</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {VISIBILITIES.map((v) => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select></div>
            <div className="space-y-1.5"><Label>Linked employee</Label>
              <Select {...(employeeId ? { value: employeeId } : {})} onValueChange={setEmployeeId}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
                </SelectContent>
              </Select></div>
            <div className="space-y-1.5"><Label>Expiry date</Label>
              <Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} /></div>
          </div>
          <div className="space-y-1.5"><Label>File</Label>
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Uploading…" : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DocumentsPage() {
  const { can } = useSession();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const query = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const docsRes = await supabase.from("documents").select("*").order("created_at", { ascending: false });
      if (docsRes.error) throw docsRes.error;
      const employeesRes = can("employees.view")
        ? await supabase.from("employees").select("id, full_name").order("full_name")
        : { data: [] as { id: string; full_name: string }[] };
      return {
        docs: (docsRes.data ?? []) as unknown as DocRow[],
        employees: (employeesRes.data ?? []) as { id: string; full_name: string }[],
      };
    },
  });

  const remove = useMutation({
    mutationFn: async (row: DocRow) => {
      const { error } = await supabase.from("documents").delete().eq("id", row.id);
      if (error) throw error;
      await supabase.storage.from("company-files").remove([row.file_path]);
      await logAudit({ action: "document.deleted", module: "Documents", recordId: row.id, oldValue: { title: row.title } });
    },
    onSuccess: () => { toast.success("Document deleted"); qc.invalidateQueries({ queryKey: ["documents"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (query.data?.docs ?? []).filter((d) =>
      (category === "all" || d.category === category) &&
      (!term || [d.title, d.description, d.file_name].some((v) => v?.toLowerCase().includes(term))),
    );
  }, [query.data, search, category]);

  const employeeName = (id: string | null) =>
    query.data?.employees.find((e) => e.id === id)?.full_name ?? "—";

  return (
    <AppShell
      title="Documents"
      description="Private library for contracts, certificates and staff paperwork."
      actions={can("documents.upload") ? <UploadDialog employees={query.data?.employees ?? []} /> : null}
    >
      <Card className="mb-4">
        <CardContent className="flex flex-wrap gap-3 pt-6">
          <Input className="max-w-xs" placeholder="Search documents"
            value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {query.isLoading ? <LoadingState />
        : query.error ? <ErrorState message={(query.error as Error).message} />
        : rows.length === 0 ? (
          <EmptyState title="No documents yet"
            description={can("documents.upload") ? "Upload the first document to get started." : "Documents shared with you will appear here."} />
        ) : (
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Linked to</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>
                        <p className="font-medium">{d.title}</p>
                        <p className="text-xs text-muted-foreground">{d.file_name}</p>
                        <Badge variant="outline" className="mt-1 capitalize">{d.visibility}</Badge>
                      </TableCell>
                      <TableCell className="capitalize text-muted-foreground">{d.category}</TableCell>
                      <TableCell className="text-muted-foreground">{employeeName(d.employee_id)}</TableCell>
                      <TableCell>
                        {d.expiry_date
                          ? <StatusBadge status={expiryStatus(d.expiry_date)} label={formatDate(d.expiry_date)} />
                          : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatBytes(d.file_size)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(d.created_at)}</TableCell>
                      <TableCell className="space-x-2 text-right">
                        {can("documents.download") && (
                          <Button variant="outline" size="sm"
                            onClick={() => openCompanyFile(d.file_path).catch((e: Error) => toast.error(e.message))}>
                            <Download className="size-3.5" />Open
                          </Button>
                        )}
                        {can("documents.delete") && (
                          <Button variant="ghost" size="icon" aria-label="Delete document" onClick={() => remove.mutate(d)}>
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
    </AppShell>
  );
}
