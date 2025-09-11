import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface DashboardChartsProps {
  period: string;
}

// Données factices pour la démonstration - à remplacer par des données réelles
const monthlyRevenueData = [
  { month: "Jan", revenue: 4000000, orders: 24 },
  { month: "Fév", revenue: 3000000, orders: 18 },
  { month: "Mar", revenue: 6000000, orders: 32 },
  { month: "Avr", revenue: 4800000, orders: 26 },
  { month: "Mai", revenue: 5500000, orders: 29 },
  { month: "Juin", revenue: 7500000, orders: 38 },
];

const categoryData = [
  { name: "Matières premières", value: 35 },
  { name: "Emballages", value: 25 },
  { name: "Transport", value: 15 },
  { name: "Marketing", value: 20 },
  { name: "Autres", value: 5 },
];

export default function DashboardCharts({ period }: DashboardChartsProps) {
  return (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Analyses et tendances
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique de revenus mensuels */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-center text-md font-medium mb-4">
            Revenus mensuels
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "revenue")
                    return [`${Number(value).toLocaleString()} Ar`, "Revenu"];
                  return [value, "Commandes"];
                }}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" name="Revenu" />
              <Bar dataKey="orders" fill="#82ca9d" name="Commandes" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique circulaire des catégories */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-center text-md font-medium mb-4">
            Répartition des dépenses
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, "Pourcentage"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graphique de tendance */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-center text-md font-medium mb-4">
          Tendance des revenus
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyRevenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
            <Tooltip
              formatter={(value) => [
                `${Number(value).toLocaleString()} Ar`,
                "Revenu",
              ]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#8884d8"
              strokeWidth={2}
              name="Revenu"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
