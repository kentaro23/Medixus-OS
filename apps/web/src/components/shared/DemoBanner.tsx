"use client";

import { DEMO_BANNER_ENABLED } from "@/lib/env";

export default function DemoBanner() {
  if (!DEMO_BANNER_ENABLED) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs text-center py-1 px-4 sticky top-0 z-[100]">
      <span className="font-medium">デモ環境</span> —
      表示されているデータは全て架空です
    </div>
  );
}
