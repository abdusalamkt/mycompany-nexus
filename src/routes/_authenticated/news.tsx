import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { formatDate } from "@/lib/employees";
import { AppShell } from "@/components/portal/AppShell";
import { EmptyState, ErrorState, LoadingState } from "@/components/portal/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/news")({
  head: () => ({
    meta: [
      { title: "Company News | Internal Company Portal" },
      { name: "description", content: "Internal announcements, memos and company updates for staff." },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { property: "og:title", content: "Company News | Internal Company Portal" },
      { property: "og:description", content: "Internal announcements and company updates." },
    ],
  }),
  component: NewsPage,
});

interface NewsPost {
  id: string;
  title: string;
  summary: string | null;
  body: string;
  category: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

const CATEGORIES = ["announcement", "memo", "event", "policy update", "celebration"];

function NewsDialog({ post, trigger }: { post?: NewsPost; trigger: React.ReactNode }) {
  const qc = useQueryClient();
  const { can } = useSession();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(post?.title ?? "");
  const [summary, setSummary] = useState(post?.summary ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [category, setCategory] = useState(post?.category ?? "announcement");
  const [published, setPublished] = useState(post?.is_published ?? false);

  const save = useMutation({
    mutationFn: async () => {
      if (!title.trim() || !body.trim()) throw new Error("Title and content are required.");
      const payload = {
        title: title.trim(),
        summary: summary.trim() || null,
        body: body.trim(),
        category,
        is_published: published,
        published_at: published ? (post?.published_at ?? new Date().toISOString()) : null,
      };
      if (post) {
        const { error } = await supabase.from("news_posts").update(payload).eq("id", post.id);
        if (error) throw error;
        await logAudit({ action: "news.updated", module: "News", recordId: post.id, newValue: payload });
      } else {
        const { data: userRes } = await supabase.auth.getUser();
        const { data, error } = await supabase.from("news_posts")
          .insert({ ...payload, author_id: userRes.user?.id ?? null }).select("id").single();
        if (error) throw error;
        await logAudit({ action: "news.created", module: "News", recordId: data?.id, newValue: payload });
      }
    },
    onSuccess: () => {
      toast.success(post ? "Post updated" : "Post created");
      qc.invalidateQueries({ queryKey: ["news"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post ? "Edit post" : "New post"}</DialogTitle>
          <DialogDescription>Announcements are visible to every member of staff once published.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Summary</Label>
            <Input value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Content</Label>
            <Textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          {can("news.publish") && (
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-medium">Published</p>
                <p className="text-xs text-muted-foreground">Drafts are only visible to editors.</p>
              </div>
              <Switch checked={published} onCheckedChange={setPublished} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewsPage() {
  const { can } = useSession();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["news"],
    enabled: can("news.view"),
    queryFn: async () => {
      const { data, error } = await supabase.from("news_posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as NewsPost[];
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news_posts").delete().eq("id", id);
      if (error) throw error;
      await logAudit({ action: "news.deleted", module: "News", recordId: id });
    },
    onSuccess: () => { toast.success("Post deleted"); qc.invalidateQueries({ queryKey: ["news"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!can("news.view")) {
    return <AppShell title="News"><EmptyState title="You don't have access to company news" /></AppShell>;
  }

  return (
    <AppShell
      title="Company News"
      description="Announcements, memos and updates from management."
      actions={can("news.create") ? (
        <NewsDialog trigger={<Button><Plus className="size-4" />New post</Button>} />
      ) : null}
    >
      {query.isLoading ? <LoadingState />
        : query.error ? <ErrorState message={(query.error as Error).message} />
        : (query.data?.length ?? 0) === 0 ? <EmptyState title="No announcements yet" />
        : (
          <div className="space-y-4">
            {query.data!.map((post) => (
              <Card key={post.id}>
                <CardHeader className="gap-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <CardDescription>
                        {formatDate(post.published_at ?? post.created_at)}
                      </CardDescription>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="secondary" className="capitalize">{post.category}</Badge>
                      {!post.is_published && <Badge variant="outline">Draft</Badge>}
                      {can("news.edit") && (
                        <NewsDialog post={post} trigger={
                          <Button variant="ghost" size="icon" aria-label="Edit post"><Pencil className="size-4" /></Button>
                        } />
                      )}
                      {can("news.delete") && (
                        <Button variant="ghost" size="icon" aria-label="Delete post"
                          onClick={() => remove.mutate(post.id)}>
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {post.summary && <p className="mb-2 text-sm font-medium">{post.summary}</p>}
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{post.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </AppShell>
  );
}
