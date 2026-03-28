"use client";

import { useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { IS_DEMO } from "@/lib/env";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15分
const WARNING_BEFORE_MS = 2 * 60 * 1000; // 2分前に警告

interface AutoLogoutProps {
  enabled?: boolean;
}

export default function AutoLogout({ enabled = true }: AutoLogoutProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef(false);

  const logout = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    document.cookie =
      "medixus_role=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    window.location.href = "/auth/login?reason=idle";
  }, []);

  const showWarning = useCallback(() => {
    if (warningShownRef.current) return;
    warningShownRef.current = true;

    const existingBanner = document.getElementById("auto-logout-warning");
    if (existingBanner) return;

    const banner = document.createElement("div");
    banner.id = "auto-logout-warning";
    banner.style.cssText =
      "position:fixed;top:0;left:0;right:0;z-index:10000;background:#fef3c7;border-bottom:2px solid #f59e0b;padding:12px;text-align:center;font-size:14px;color:#92400e;";
    banner.innerHTML =
      "⏰ 無操作のため、まもなく自動ログアウトされます。操作を続けるには画面をクリックしてください。";
    document.body.prepend(banner);
  }, []);

  const resetTimer = useCallback(() => {
    warningShownRef.current = false;
    const banner = document.getElementById("auto-logout-warning");
    if (banner) banner.remove();

    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    warningRef.current = setTimeout(showWarning, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);
    timerRef.current = setTimeout(logout, IDLE_TIMEOUT_MS);
  }, [logout, showWarning]);

  useEffect(() => {
    if (!enabled || IS_DEMO) return;

    const events = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [enabled, resetTimer]);

  return null;
}
