import { useState, useEffect } from "react";
import { Plus, Search, TrendingDown, Calendar } from "lucide-react";

interface Expense {
  id: number;
  typeDepense:
    | "MATIERE_PREMIERE"
    | "EMBALLAGE"
    | "TRANSPORT"
    | "MARKETING"
    | "AUTRE";
  montant: number;
  dateDepense: string;
  description: string;
}

const baseUrl = import.meta.env.VITE_API_URL;

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  // Récupération des dépenses depuis l’API
  useEffect(() => {
    fetch(`${baseUrl}/api/depenses`)
      .then((res) => res.json())
      .then((data: Expense[]) => setExpenses(data))
      .catch((err) => console.error("Erreur fetch dépenses:", err));
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "MATIERE_PREMIERE":
        return "bg-green-100 text-green-800";
      case "EMBALLAGE":
        return "bg-blue-100 text-blue-800";
      case "TRANSPORT":
        return "bg-purple-100 text-purple-800";
      case "MARKETING":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "MATIERE_PREMIERE":
        return "Matière première";
      case "EMBALLAGE":
        return "Emballage";
      case "TRANSPORT":
        return "Transport";
      case "MARKETING":
        return "Marketing";
      default:
        return "Autre";
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTypeLabel(expense.typeDepense)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "" || expense.typeDepense === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + expense.montant,
    0
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dépenses</h1>
          <p className="text-gray-600">Suivi des dépenses d'exploitation</p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm">
          <Plus size={20} className="mr-2" />
          Nouvelle dépense
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl shadow-sm p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100 mb-1">Total des dépenses filtrées</p>
            <p className="text-3xl font-bold">
              {totalExpenses.toLocaleString()} Ar
            </p>
          </div>
          <div className="p-3 bg-white bg-opacity-20 rounded-lg">
            <TrendingDown size={32} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Rechercher une dépense..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">Tous les types</option>
            <option value="MATIERE_PREMIERE">Matière première</option>
            <option value="EMBALLAGE">Emballage</option>
            <option value="TRANSPORT">Transport</option>
            <option value="MARKETING">Marketing</option>
            <option value="AUTRE">Autre</option>
          </select>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredExpenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-400 mr-2" />
                      {new Date(expense.dateDepense).toLocaleDateString(
                        "fr-FR"
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                        expense.typeDepense
                      )}`}
                    >
                      {getTypeLabel(expense.typeDepense)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-red-600">
                    -{expense.montant.toLocaleString()} Ar
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
