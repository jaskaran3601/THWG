import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    direction: "up" | "down";
    percent: number;
    label?: string;
  };
  iconColor?: string;
  iconBg?: string;
}

export default function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
  iconColor = "text-blue-500",
  iconBg = "bg-blue-50",
}: MetricCardProps) {
  return (
    <div className="card flex items-start gap-4 hover:shadow-md transition-shadow duration-200">
      <div className={`${iconBg} p-3 rounded-xl flex-shrink-0`}>
        <Icon size={22} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-500 text-sm font-medium truncate">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-1.5">
            {trend.direction === "up" ? (
              <TrendingUp size={13} className="text-emerald-500" />
            ) : (
              <TrendingDown size={13} className="text-red-500" />
            )}
            <span
              className={`text-xs font-medium ${
                trend.direction === "up" ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {trend.percent}%
            </span>
            {trend.label && (
              <span className="text-xs text-slate-400">{trend.label}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
