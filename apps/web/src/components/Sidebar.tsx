"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Package,
  CreditCard,
  Brain,
  Video,
  Activity,
  Smartphone,
  Network,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Stethoscope,
  LogOut,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    label: "ダッシュボード",
    href: "/admin",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "クリニック管理",
    href: "/admin/clinics",
    icon: <Building2 size={20} />,
  },
  {
    label: "SaaS製品",
    href: "/admin/products",
    icon: <Package size={20} />,
  },
  {
    label: "サブスクリプション",
    href: "/admin/subscriptions",
    icon: <CreditCard size={20} />,
  },
  {
    label: "製品モジュール",
    href: "#",
    icon: <Stethoscope size={20} />,
    children: [
      { label: "AI問診エンジン", href: "/admin/modules/ai-triage", icon: <Brain size={18} /> },
      { label: "オンライン診療PF", href: "/admin/modules/online-consultation", icon: <Video size={18} /> },
      { label: "遠隔モニタリング", href: "/admin/modules/remote-monitoring", icon: <Activity size={18} /> },
      { label: "患者アプリ", href: "/admin/modules/patient-app", icon: <Smartphone size={18} /> },
      { label: "提携NW", href: "/admin/modules/partner-network", icon: <Network size={18} /> },
    ],
  },
  {
    label: "収益分析",
    href: "/admin/analytics",
    icon: <BarChart3 size={20} />,
  },
  {
    label: "設定",
    href: "/admin/settings",
    icon: <Settings size={20} />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(["製品モジュール"]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar-bg flex flex-col fixed left-0 top-0 z-30">
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center">
            <Stethoscope size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight">
              Medixus<span className="text-accent-light">OS</span>
            </h1>
            <p className="text-sidebar-text text-[10px] tracking-widest uppercase">
              運営管理コンソール
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.label}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      expandedItems.includes(item.label)
                        ? "text-white bg-sidebar-hover"
                        : "text-sidebar-text hover:text-white hover:bg-sidebar-hover"
                    }`}
                  >
                    {item.icon}
                    <span className="flex-1 text-left">{item.label}</span>
                    {expandedItems.includes(item.label) ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                  {expandedItems.includes(item.label) && (
                    <ul className="ml-4 mt-1 space-y-0.5 animate-fade-in">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                              isActive(child.href)
                                ? "text-white bg-accent"
                                : "text-sidebar-text hover:text-white hover:bg-sidebar-hover"
                            }`}
                          >
                            {child.icon}
                            <span>{child.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    isActive(item.href)
                      ? "text-white bg-accent"
                      : "text-sidebar-text hover:text-white hover:bg-sidebar-hover"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-3 py-3 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-text hover:text-white hover:bg-sidebar-hover transition-all"
        >
          <LogOut size={18} />
          <span>ポータルに戻る</span>
        </Link>
      </div>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
            <span className="text-accent-light text-xs font-bold">K</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">健太郎</p>
            <p className="text-sidebar-text text-xs truncate">Medixus管理者</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
