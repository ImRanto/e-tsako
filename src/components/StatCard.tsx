import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  color: "green" | "blue" | "purple" | "amber" | "red" | "pink" | "teal";
  icon: React.ElementType;
}

const colorClasses = {
  green: "bg-green-50 text-green-700",
  blue: "bg-blue-50 text-blue-700",
  purple: "bg-purple-50 text-purple-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  pink: "bg-pink-50 text-pink-700",
  teal: "bg-teal-50 text-teal-700",
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend,
  color,
  icon: Icon,
}) => {
  return (
    <div
      className={`rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all ${colorClasses[color]}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <div className="flex items-center mt-2">
            {trend === "up" ? (
              <TrendingUp className="mr-1 text-green-500" size={16} />
            ) : (
              <TrendingDown className="mr-1 text-red-500" size={16} />
            )}
            <span
              className={`font-medium ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {change}
            </span>
            <span className="text-sm text-gray-500 ml-1">vs mois dernier</span>
          </div>
        </div>
        <div className="p-3 rounded-lg bg-white shadow flex items-center justify-center">
          <Icon size={24} className={`text-${color}-500`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
