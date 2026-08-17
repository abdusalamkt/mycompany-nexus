import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type UserStatus = "active" | "inactive" | "suspended";

export interface PortalProfile {
  id: string;
  email: string;
  full_name: string | null;
  employee_code: string | null;
  phone: string | null;
  job_title: string | null;
  department_id: string | null;
  avatar_url: string | null;
  status: UserStatus;
  last_login_at: string | null;
  created_at: string;
}

interface SessionContextValue {
  session: Session | null;
  userId: string | null;
  loading: boolean;
  profile: PortalProfile | null;
  roles: string[];
  permissions: string[];
  can: (code: string) => boolean;
  canAny: (codes: string[]) => boolean;
  refresh: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;

  const profileQuery = useQuery({
    queryKey: ["me", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [profileRes, rolesRes, permsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId!).maybeSingle(),
        supabase.from("user_roles").select("roles(slug, name)").eq("user_id", userId!),
        supabase.rpc("my_permissions"),
      ]);
      if (profileRes.error) throw profileRes.error;
      const roles = (rolesRes.data ?? [])
        .map((r) => (r as { roles: { slug: string } | null }).roles?.slug)
        .filter((s): s is string => !!s);
      const permissions = ((permsRes.data ?? []) as { code: string }[]).map((p) => p.code);
      return { profile: profileRes.data as PortalProfile | null, roles, permissions };
    },
  });

  const value = useMemo<SessionContextValue>(() => {
    const permissions = profileQuery.data?.permissions ?? [];
    return {
      session,
      userId,
      loading: loading || (!!userId && profileQuery.isLoading),
      profile: profileQuery.data?.profile ?? null,
      roles: profileQuery.data?.roles ?? [],
      permissions,
      can: (code) => permissions.includes(code),
      canAny: (codes) => codes.some((c) => permissions.includes(c)),
      refresh: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
    };
  }, [session, userId, loading, profileQuery.data, profileQuery.isLoading, queryClient]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
