import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Expense {
  id: number;
  typeDepense: string;
  montant: number;
  dateDepense: string;
  description: string;
}

interface ExpenseChartsProps {
  expenses: Expense[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function ExpenseCharts({ expenses }: ExpenseChartsProps) {
  // Préparer les données pour le graphique circulaire
  const typeData = expenses.reduce((acc, expense) => {
    const existing = acc.find((item) => item.name === expense.typeDepense);
    if (existing) {
      existing.value += expense.montant;
    } else {
      acc.push({ name: expense.typeDepense, value: expense.montant });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Préparer les données pour le graphique à barres (par mois)
  const monthlyData = expenses.reduce((acc, expense) => {
    const date = new Date(expense.dateDepense);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

    const existing = acc.find((item) => item.name === monthYear);
    if (existing) {
      existing.total += expense.montant;
    } else {
      acc.push({ name: monthYear, total: expense.montant });
    }
    return acc;
  }, [] as { name: string; total: number }[]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Visualisation des dépenses
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique circulaire */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-center text-md font-medium mb-4">
            Répartition par type
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {typeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} Ar`, "Montant"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique à barres */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-center text-md font-medium mb-4">
            Dépenses par mois
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} Ar`, "Total"]} />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" name="Total des dépenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
