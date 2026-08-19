import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Download, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { formatDate } from "@/lib/employees";
import { openCompanyFile, uploadCompanyFile } from "@/lib/storage";
import { AppShell } from "@/components/portal/AppShell";
import { EmptyState, ErrorState, LoadingState } from "@/components/portal/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/policies")({
  head: () => ({
    meta: [
      { title: "Policies | Internal Company Portal" },
      { name: "description", content: "Company policies, handbooks and procedures with versions and effective dates." },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { property: "og:title", content: "Policies | Internal Company Portal" },
      { property: "og:description", content: "Company policies, handbooks and procedures." },
    ],
  }),
  component: PoliciesPage,
});

interface PolicyRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  version: string;
  file_path: string | null;
  file_name: string | null;
  effective_date: string | null;
  is_published: boolean;
  created_at: string;
}

function PolicyDialog() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [version, setVersion] = useState("1.0");
  const [effective, setEffective] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error("Title is required.");
      let filePath: string | null = null;
      let fileName: string | null = null;
      if (file) {
        const uploaded = await uploadCompanyFile("policies", file);
        filePath = uploaded.path;
        fileName = uploaded.name;
      }
      const { data: userRes } = await supabase.auth.getUser();
      const { data, error } = await supabase.from("company_policies").insert({
        title: title.trim(),
        description: description.trim() || null,
        category: category.trim() || "general",
        version: version.trim() || "1.0",
        effective_date: effective || null,
        file_path: filePath,
        file_name: fileName,
        created_by: userRes.user?.id ?? null,
      }).select("id").single();
      if (error) throw error;
      await logAudit({ action: "policy.created", module: "Policies", recordId: data?.id, newValue: { title } });
    },
    onSuccess: () => {
      toast.success("Policy added");
      qc.invalidateQueries({ queryKey: ["policies"] });
      setOpen(false);
      setTitle(""); setDescription(""); setVersion("1.0"); setEffective(""); setFile(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="size-4" />Add policy</Button></DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add policy</DialogTitle>
          <DialogDescription>PDF, Word or image files up to 10 MB, stored privately.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Description</Label>
            <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5"><Label>Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Version</Label>
              <Input value={version} onChange={(e) => setVersion(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Effective date</Label>
              <Input type="date" value={effective} onChange={(e) => setEffective(e.target.value)} /></div>
          </div>
          <div className="space-y-1.5"><Label>File</Label>
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Add policy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PoliciesPage() {
  const { can } = useSession();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["policies"],
    enabled: can("policies.view"),
    queryFn: async () => {
      const { data, error } = await supabase.from("company_policies").select("*").order("title");
      if (error) throw error;
      return (data ?? []) as unknown as PolicyRow[];
    },
  });

  const remove = useMutation({
    mutationFn: async (row: PolicyRow) => {
      const { error } = await supabase.from("company_policies").delete().eq("id", row.id);
      if (error) throw error;
      await logAudit({ action: "policy.deleted", module: "Policies", recordId: row.id, oldValue: { title: row.title } });
    },
    onSuccess: () => { toast.success("Policy removed"); qc.invalidateQueries({ queryKey: ["policies"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!can("policies.view")) {
    return <AppShell title="Policies"><EmptyState title="You don't have access to company policies" /></AppShell>;
  }

  return (
    <AppShell
      title="Policies"
      description="Handbooks, procedures and company policies with versions and effective dates."
      actions={can("policies.create") ? <PolicyDialog /> : null}
    >
      {query.isLoading ? <LoadingState />
        : query.error ? <ErrorState message={(query.error as Error).message} />
        : (query.data?.length ?? 0) === 0 ? <EmptyState title="No policies published yet" />
        : (
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Effective</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {query.data!.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <p className="font-medium">{p.title}</p>
                        {p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}
                        {!p.is_published && <Badge variant="outline" className="mt-1">Draft</Badge>}
                      </TableCell>
                      <TableCell className="capitalize text-muted-foreground">{p.category}</TableCell>
                      <TableCell className="text-muted-foreground">v{p.version}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(p.effective_date)}</TableCell>
                      <TableCell className="space-x-2 text-right">
                        {p.file_path && (
                          <Button variant="outline" size="sm"
                            onClick={() => openCompanyFile(p.file_path!).catch((e: Error) => toast.error(e.message))}>
                            <Download className="size-3.5" />Open
                          </Button>
                        )}
                        {can("policies.delete") && (
                          <Button variant="ghost" size="icon" aria-label="Delete policy" onClick={() => remove.mutate(p)}>
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
