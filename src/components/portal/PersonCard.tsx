import type { ReactNode } from "react";
import { LayoutGrid, Rows3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, expiryStatus } from "@/components/portal/StatusBadge";
import { formatDate, initialsOf } from "@/lib/employees";

export type PeopleView = "grid" | "list";

export function ViewToggle({ value, onChange }: { value: PeopleView; onChange: (v: PeopleView) => void }) {
  return (
    <div className="inline-flex rounded-md border border-border bg-card p-0.5">
      {(
        [
          ["grid", LayoutGrid, "Card view"],
          ["list", Rows3, "List view"],
        ] as [PeopleView, typeof LayoutGrid, string][]
      ).map(([v, Icon, title]) => (
        <Button
          key={v}
          type="button"
          size="sm"
          variant={value === v ? "secondary" : "ghost"}
          className="h-8 px-2.5"
          title={title}
          aria-label={title}
          aria-pressed={value === v}
          onClick={() => onChange(v)}
        >
          <Icon className="size-4" />
        </Button>
      ))}
    </div>
  );
}

export type MetaItem = { icon: ReactNode; text: string };

export type PersonCardProps = {
  name: string;
  subtitle?: string | null;
  photo?: string;
  accent?: string | null;
  badges?: ReactNode;
  meta: MetaItem[];
  docs?: [string, string | null][];
  actions?: ReactNode;
  onOpen?: () => void;
  view?: PeopleView;
};

function Photo({ name, photo, size }: { name: string; photo?: string; size: string }) {
  return (
    <Avatar className={cn(size, "shrink-0 ring-2 ring-primary/15 ring-offset-2 ring-offset-card")}>
      {photo ? <AvatarImage src={photo} alt={name} className="object-cover" /> : null}
      <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
        {initialsOf(name)}
      </AvatarFallback>
    </Avatar>
  );
}

function Docs({ docs, className }: { docs: [string, string | null][]; className?: string }) {
  return (
    <div className={className}>
      <p className="mb-1.5 text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
        Document expiry
      </p>
      <div className="flex flex-wrap gap-1.5">
        {docs.map(([label, date]) => (
          <StatusBadge key={label} status={expiryStatus(date)} label={`${label}: ${date ? formatDate(date) : "Missing"}`} />
        ))}
      </div>
    </div>
  );
}

export function PersonCard({
  name, subtitle, photo, accent, badges, meta, docs, actions, onOpen, view = "grid",
}: PersonCardProps) {
  if (view === "list") {
    return (
      <Card className="group overflow-hidden transition-all hover:border-primary/40 hover:shadow-md">
        <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 p-4 lg:grid-cols-[minmax(240px,1.3fr)_minmax(0,1.4fr)_minmax(0,1.6fr)_auto]">
          <button type="button" onClick={onOpen} className="flex min-w-0 items-center gap-4 text-left">
            <Photo name={name} photo={photo} size="size-16" />
            <div className="min-w-0">
              <p className="truncate font-semibold group-hover:text-primary">{name}</p>
              <p className="truncate text-sm text-muted-foreground">{subtitle || "—"}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">{badges}</div>
            </div>
          </button>

          <div className="col-span-2 min-w-0 space-y-1 text-sm text-muted-foreground lg:col-span-1">
            {meta.map((m, i) => (
              <p key={i} className="flex items-center gap-2 truncate">
                <span className="shrink-0 text-primary/70">{m.icon}</span>
                <span className="truncate">{m.text}</span>
              </p>
            ))}
          </div>

          {docs?.length ? <Docs docs={docs} className="col-span-2 min-w-0 lg:col-span-1" /> : <div className="hidden lg:block" />}

          <div className="flex shrink-0 flex-col gap-2">{actions}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden pt-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
      <div className="h-16 bg-gradient-to-r from-primary/85 via-primary/60 to-primary/25" />
      <CardContent className="-mt-10 flex flex-1 flex-col gap-3 p-4">
        <button type="button" onClick={onOpen} className="flex flex-col items-start gap-3 text-left">
          <Photo name={name} photo={photo} size="size-24" />
          <div className="min-w-0 w-full">
            <p className="truncate text-base font-semibold group-hover:text-primary">{name}</p>
            <p className="truncate text-sm text-muted-foreground">{subtitle || "—"}</p>
            {accent ? <p className="truncate text-xs text-muted-foreground/80">{accent}</p> : null}
          </div>
        </button>

        <div className="flex flex-wrap items-center gap-1.5">{badges}</div>

        <div className="space-y-1 text-sm text-muted-foreground">
          {meta.map((m, i) => (
            <p key={i} className="flex items-center gap-2 truncate">
              <span className="shrink-0 text-primary/70">{m.icon}</span>
              <span className="truncate">{m.text}</span>
            </p>
          ))}
        </div>

        {docs?.length ? <Docs docs={docs} className="mt-auto border-t border-border pt-3" /> : null}

        {actions ? (
          <div className={cn("flex items-center gap-2", docs?.length ? "" : "mt-auto", "pt-1")}>{actions}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}
