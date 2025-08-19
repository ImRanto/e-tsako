import React from "react";
import {
  TrendingUp,
  TrendingDown,
  DivideIcon as LucideIcon,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
  color: "green" | "blue" | "purple" | "amber" | "red";
}

const colorClasses = {
  green: "bg-green-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
};

export default function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center mt-2">
            {trend === "up" ? (
              <TrendingUp size={16} className="text-green-500 mr-1" />
            ) : (
              <TrendingDown size={16} className="text-red-500 mr-1" />
            )}
            <span
              className={`text-sm font-medium ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {change}
            </span>
            <span className="text-sm text-gray-500 ml-1">vs mois dernier</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
}
