import { useState } from "react";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DirectoryPerson } from "@/lib/orgchart";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";

/** Searchable staff / worker selector used when building org chart nodes. */
export function PersonPicker({
  people, value, onSelect, placeholder = "Search staff or worker…",
}: {
  people: DirectoryPerson[];
  value?: DirectoryPerson | null;
  onSelect: (person: DirectoryPerson) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open}
          className="w-full justify-between font-normal">
          <span className="flex min-w-0 items-center gap-2">
            <User className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{value ? value.name : placeholder}</span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="pointer-events-auto w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search by name or role…" />
          <CommandList>
            <CommandEmpty>No matching person.</CommandEmpty>
            <CommandGroup>
              {people.map((p) => (
                <CommandItem
                  key={`${p.type}:${p.id}`}
                  value={`${p.name} ${p.subtitle} ${p.type}`}
                  onSelect={() => { onSelect(p); setOpen(false); }}
                >
                  <Check className={cn("mr-2 size-4",
                    value && value.id === p.id ? "opacity-100" : "opacity-0")} />
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                  <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                    {p.subtitle} · {p.type === "worker" ? "Worker" : "Staff"}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
