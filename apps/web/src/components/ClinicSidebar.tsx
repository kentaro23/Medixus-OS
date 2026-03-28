"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Brain,
  Video,
  Activity,
  Smartphone,
  Network,
  Settings,
  ChevronDown,
  Stethoscope,
  Lock,
  LogOut,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { useClinic } from "@/lib/clinic-context";
import { clinics } from "@/lib/data";
import type { ProductId } from "@/lib/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  productId?: ProductId;
}

const navItems: NavItem[] = [
  { label: "クリニックHome", href: "/clinic", icon: <LayoutDashboard size={20} /> },
  { label: "AI問診エンジン", href: "/clinic/ai-triage", icon: <Brain size={20} />, productId: "ai-triage" },
  { label: "オンライン診療", href: "/clinic/online-consultation", icon: <Video size={20} />, productId: "online-consultation" },
  { label: "遠隔モニタリング", href: "/clinic/remote-monitoring", icon: <Activity size={20} />, productId: "remote-monitoring" },
  { label: "患者アプリ管理", href: "/clinic/patient-app", icon: <Smartphone size={20} />, productId: "patient-app" },
  { label: "提携NW接続", href: "/clinic/partner-network", icon: <Network size={20} />, productId: "partner-network" },
];

export default function ClinicSidebar() {
  const pathname = usePathname();
  const { currentClinic, setCurrentClinic } = useClinic();
  const [showPicker, setShowPicker] = useState(false);

  const subscribable = clinics.filter(
    (c) => c.subscribedProducts.length > 0 && c.status !== "churned"
  );

  const isActive = (href: string) => {
    if (href === "/clinic") return pathname === "/clinic";
    return pathname.startsWith(href);
  };

  const hasProduct = (productId?: ProductId) => {
    if (!productId) return true;
    return currentClinic.subscribedProducts.includes(productId);
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar-bg flex flex-col fixed left-0 top-0 z-30">
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-cyan-500 rounded-xl flex items-center justify-center">
            <Stethoscope size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight">
              Medixus<span className="text-cyan-400">OS</span>
            </h1>
            <p className="text-sidebar-text text-[10px] tracking-widest uppercase">
              Clinic Console
            </p>
          </div>
        </div>
      </div>

      <div className="px-3 py-3 border-b border-white/10">
        <div className="relative">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-sidebar-hover text-white text-sm hover:bg-white/10 transition-colors"
          >
            <Building2 size={16} className="text-cyan-400 shrink-0" />
            <span className="flex-1 text-left truncate text-xs">
              {currentClinic.name}
            </span>
            <ChevronDown size={14} className="text-sidebar-text shrink-0" />
          </button>
          {showPicker && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto animate-fade-in">
              {subscribable.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCurrentClinic(c);
                    setShowPicker(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs transition-colors hover:bg-white/10 ${
                    c.id === currentClinic.id
                      ? "text-cyan-400 bg-white/5"
                      : "text-sidebar-text"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                      c.type === "owned" ? "bg-indigo-500" : "bg-gray-500"
                    }`}
                  >
                    {c.name.charAt(0)}
                  </span>
                  <span className="truncate">{c.name}</span>
                  <span className="text-[10px] text-sidebar-text ml-auto shrink-0">
                    {c.subscribedProducts.length}製品
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-sidebar-text text-[10px] uppercase tracking-widest px-3 mb-2 font-semibold">
          SaaSモジュール
        </p>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const available = hasProduct(item.productId);
            return (
              <li key={item.href}>
                {available ? (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      isActive(item.href)
                        ? "text-white bg-cyan-600"
                        : "text-sidebar-text hover:text-white hover:bg-sidebar-hover"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-text/40 cursor-not-allowed">
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
                    <Lock size={12} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-6">
          <p className="text-sidebar-text text-[10px] uppercase tracking-widest px-3 mb-2 font-semibold">
            アカウント
          </p>
          <Link
            href="/clinic/profile"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              isActive("/clinic/profile")
                ? "text-white bg-cyan-600"
                : "text-sidebar-text hover:text-white hover:bg-sidebar-hover"
            }`}
          >
            <Settings size={20} />
            <span>プロフィール</span>
          </Link>
          <button
            onClick={() => {
              document.cookie = "medixus_role=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
              window.location.href = "/";
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-sidebar-hover transition-all"
          >
            <LogOut size={20} />
            <span>ログアウト</span>
          </button>
        </div>
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
            <span className="text-cyan-400 text-xs font-bold">
              {currentClinic.doctorName.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {currentClinic.doctorName}
            </p>
            <p className="text-sidebar-text text-xs truncate">
              {currentClinic.specialty}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
