import type { ClinicStatus } from "@/lib/types";

const statusConfig: Record<
  ClinicStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  active: {
    label: "稼働中",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  trial: {
    label: "トライアル",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  churned: {
    label: "解約済",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  onboarding: {
    label: "導入中",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
};

export default function StatusBadge({ status }: { status: ClinicStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.dot} ${
          status === "active" ? "animate-pulse-dot" : ""
        }`}
      />
      {config.label}
    </span>
  );
}
