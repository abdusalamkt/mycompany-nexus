import { supabase } from "@/integrations/supabase/client";

export interface OrgChart {
  id: string;
  name: string;
  description: string | null;
  department_id: string | null;
  is_published: boolean;
  created_at: string;
}

export interface OrgNode {
  id: string;
  chart_id: string;
  parent_id: string | null;
  employee_id: string | null;
  worker_id: string | null;
  person_name: string;
  role_title: string | null;
  sort_order: number;
}

export interface OrgTreeNode extends OrgNode {
  children: OrgTreeNode[];
}

export interface DirectoryPerson {
  id: string;
  name: string;
  type: "employee" | "worker";
  subtitle: string;
  photo_url: string | null;
  department_id: string | null;
}

/** Staff + workers from the security-definer directory views (no sensitive fields). */
export async function fetchDirectory(): Promise<DirectoryPerson[]> {
  const [staff, workers] = await Promise.all([
    supabase.rpc("staff_directory"),
    supabase.rpc("worker_directory"),
  ]);
  const people: DirectoryPerson[] = [];
  for (const s of (staff.data ?? []) as Record<string, string | null>[]) {
    people.push({
      id: s['id'] as string,
      name: (s['full_name'] as string) ?? "",
      type: "employee",
      subtitle: s['job_title'] ?? "Staff",
      photo_url: s['photo_url'] ?? null,
      department_id: s['department_id'] ?? null,
    });
  }
  for (const w of (workers.data ?? []) as Record<string, string | null>[]) {
    people.push({
      id: w['id'] as string,
      name: (w['full_name'] as string) ?? "",
      type: "worker",
      subtitle: w['trade'] ?? "Worker",
      photo_url: w['photo_url'] ?? null,
      department_id: w['department_id'] ?? null,
    });
  }
  return people.sort((a, b) => a.name.localeCompare(b.name));
}

/** Builds a forest from flat nodes; orphans are treated as roots. */
export function buildTree(nodes: OrgNode[]): OrgTreeNode[] {
  const map = new Map<string, OrgTreeNode>();
  for (const n of nodes) map.set(n.id, { ...n, children: [] });
  const roots: OrgTreeNode[] = [];
  for (const n of nodes) {
    const node = map.get(n.id)!;
    const parent = n.parent_id ? map.get(n.parent_id) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  const sort = (list: OrgTreeNode[]) => {
    list.sort((a, b) => a.sort_order - b.sort_order || a.person_name.localeCompare(b.person_name));
    list.forEach((c) => sort(c.children));
  };
  sort(roots);
  return roots;
}

/** True when `candidateParent` sits inside the subtree of `nodeId` (would create a loop). */
export function isDescendant(nodes: OrgNode[], nodeId: string, candidateParent: string): boolean {
  let current: string | null = candidateParent;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  while (current) {
    if (current === nodeId) return true;
    current = byId.get(current)?.parent_id ?? null;
  }
  return false;
}
