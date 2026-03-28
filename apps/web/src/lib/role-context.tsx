"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/types/database";

export type AppRole = UserRole;

interface UserInfo {
  id: string;
  role: AppRole;
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
}

interface RoleContextType {
  role: AppRole | null;
  user: UserInfo | null;
  loading: boolean;
  setRole: (role: AppRole) => void;
  clearRole: () => void;
  refreshUser: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType>({
  role: null,
  user: null,
  loading: true,
  setRole: () => {},
  clearRole: () => {},
  refreshUser: async () => {},
});

const ROLE_COOKIE = "medixus_role";
const VALID_ROLES: AppRole[] = [
  "patient",
  "doctor",
  "nurse",
  "clerk",
  "clinic_admin",
  "medixus_admin",
];

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days = 30) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<AppRole | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUserFromSupabase() {
    try {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, display_name, avatar_url")
          .eq("id", authUser.id)
          .single();

        if (profile) {
          const userRole = profile.role as AppRole;
          setRoleState(userRole);
          setCookie(ROLE_COOKIE, userRole);
          setUser({
            id: authUser.id,
            role: userRole,
            displayName: profile.display_name,
            email: authUser.email ?? null,
            avatarUrl: profile.avatar_url,
          });
          setLoading(false);
          return;
        }
      }
    } catch {
      // Supabase not configured — fall through to cookie
    }

    const saved = getCookie(ROLE_COOKIE) as AppRole | null;
    if (saved && VALID_ROLES.includes(saved)) {
      setRoleState(saved);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadUserFromSupabase();
  }, []);

  function setRole(newRole: AppRole) {
    setRoleState(newRole);
    setCookie(ROLE_COOKIE, newRole);
  }

  function clearRole() {
    setRoleState(null);
    setUser(null);
    deleteCookie(ROLE_COOKIE);
  }

  async function refreshUser() {
    setLoading(true);
    await loadUserFromSupabase();
  }

  return (
    <RoleContext.Provider
      value={{ role, user, loading, setRole, clearRole, refreshUser }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
