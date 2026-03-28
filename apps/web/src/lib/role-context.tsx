"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type AppRole = "patient" | "doctor" | "clinic_admin" | "admin";

interface RoleContextType {
  role: AppRole | null;
  setRole: (role: AppRole) => void;
  clearRole: () => void;
}

const RoleContext = createContext<RoleContextType>({
  role: null,
  setRole: () => {},
  clearRole: () => {},
});

const ROLE_COOKIE = "medixus_role";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days = 30) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<AppRole | null>(null);

  useEffect(() => {
    const saved = getCookie(ROLE_COOKIE) as AppRole | null;
    if (saved && ["patient", "doctor", "clinic_admin", "admin"].includes(saved)) {
      setRoleState(saved);
    }
  }, []);

  function setRole(newRole: AppRole) {
    setRoleState(newRole);
    setCookie(ROLE_COOKIE, newRole);
  }

  function clearRole() {
    setRoleState(null);
    deleteCookie(ROLE_COOKIE);
  }

  return (
    <RoleContext.Provider value={{ role, setRole, clearRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
