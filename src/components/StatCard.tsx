import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  color: "green" | "blue" | "purple" | "amber" | "red" | "pink" | "teal";
  icon: React.ElementType;
  loading?: boolean;
}

const colorClasses = {
  green: {
    bg: "bg-green-50",
    text: "text-green-700",
    icon: "text-green-500",
    trendUp: "text-green-600",
    trendDown: "text-red-600",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    icon: "text-blue-500",
    trendUp: "text-green-600",
    trendDown: "text-red-600",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    icon: "text-purple-500",
    trendUp: "text-green-600",
    trendDown: "text-red-600",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: "text-amber-500",
    trendUp: "text-green-600",
    trendDown: "text-red-600",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-700",
    icon: "text-red-500",
    trendUp: "text-green-600",
    trendDown: "text-red-600",
  },
  pink: {
    bg: "bg-pink-50",
    text: "text-pink-700",
    icon: "text-pink-500",
    trendUp: "text-green-600",
    trendDown: "text-red-600",
  },
  teal: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    icon: "text-teal-500",
    trendUp: "text-green-600",
    trendDown: "text-red-600",
  },
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend,
  color,
  icon: Icon,
  loading = false,
}) => {
  const colors = colorClasses[color];

  if (loading) {
    return (
      <div className="rounded-xl shadow-sm border border-gray-200 p-6 bg-gray-50 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded w-20"></div>
            <div className="h-8 bg-gray-300 rounded w-16"></div>
            <div className="h-3 bg-gray-300 rounded w-24"></div>
          </div>
          <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 ${colors.bg}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-semibold mb-2 ${colors.text}`}>{title}</p>
          <p className={`text-2xl font-bold mb-3 ${colors.text}`}>{value}</p>
          <div className="flex items-center">
            {trend === "up" ? (
              <TrendingUp className="mr-1 text-green-500" size={16} />
            ) : (
              <TrendingDown className="mr-1 text-red-500" size={16} />
            )}
            <span
              className={`text-sm font-medium ${
                trend === "up" ? colors.trendUp : colors.trendDown
              }`}
            >
              {change}
            </span>
            <span className="text-xs text-gray-500 ml-1">vs mois dernier</span>
          </div>
        </div>
        <div className="p-3 rounded-lg bg-white shadow-sm flex items-center justify-center ml-4">
          <Icon size={24} className={colors.icon} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
