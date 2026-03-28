import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon: React.ReactNode;
  color?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon,
  color = "#6366f1",
}: StatCardProps) {
  return (
    <div className="bg-card-bg border border-card-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2 tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend > 0 ? (
                <TrendingUp size={14} className="text-success" />
              ) : trend < 0 ? (
                <TrendingDown size={14} className="text-danger" />
              ) : (
                <Minus size={14} className="text-gray-400" />
              )}
              <span
                className={`text-xs font-semibold ${
                  trend > 0
                    ? "text-success"
                    : trend < 0
                    ? "text-danger"
                    : "text-gray-400"
                }`}
              >
                {trend > 0 ? "+" : ""}
                {trend}%
              </span>
              {trendLabel && (
                <span className="text-xs text-gray-400 ml-1">
                  {trendLabel}
                </span>
              )}
            </div>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${color}15` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
    </div>
  );
}
