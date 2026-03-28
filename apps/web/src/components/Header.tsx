"use client";

import { Bell, Search, HelpCircle } from "lucide-react";
import { useState } from "react";
import { alerts } from "@/lib/data";

export default function Header() {
  const [showNotif, setShowNotif] = useState(false);
  const unreadCount = alerts.length;

  return (
    <header className="h-16 bg-card-bg border-b border-card-border flex items-center justify-between px-8 sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="クリニック、製品、患者を検索..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <HelpCircle size={20} className="text-gray-500" />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
          >
            <Bell size={20} className="text-gray-500" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-12 w-80 bg-card-bg border border-card-border rounded-xl shadow-xl animate-fade-in z-50">
              <div className="px-4 py-3 border-b border-card-border">
                <h3 className="font-semibold text-sm">通知</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                          alert.type === "success"
                            ? "bg-success"
                            : alert.type === "warning"
                            ? "bg-warning"
                            : alert.type === "error"
                            ? "bg-danger"
                            : "bg-info"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="ml-2 pl-2 border-l border-gray-200">
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <span className="text-sm font-medium">Medixus株式会社</span>
          </div>
        </div>
      </div>
    </header>
  );
}
