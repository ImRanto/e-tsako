import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: any;
  color: string;
  loading?: boolean;
  period?: string;
  isCurrency?: boolean;
}

const colorMap = {
  purple: "text-purple-600 bg-purple-100",
  amber: "text-amber-600 bg-amber-100",
  green: "text-green-600 bg-green-100",
  blue: "text-blue-600 bg-blue-100",
};

const periodLabels = {
  week: "7j",
  month: "30j",
  quarter: "90j",
  year: "1an",
};

export default function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
  loading = false,
  period = "month",
  isCurrency = false,
}: StatCardProps) {
  const colorClass = colorMap[color as keyof typeof colorMap] || colorMap.blue;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon size={20} />
        </div>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
          {periodLabels[period as keyof typeof periodLabels] || period}
        </span>
      </div>

      <div className="mb-2">
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">
          {isCurrency && value !== "N/A" ? value : value}
        </p>
      </div>

      <div
        className={`inline-flex items-center text-sm font-medium ${
          trend === "up" ? "text-green-600" : "text-red-600"
        }`}
      >
        {trend === "up" ? (
          <ArrowUp size={14} className="mr-1" />
        ) : (
          <ArrowDown size={14} className="mr-1" />
        )}
        {change}
      </div>
    </div>
  );
}
