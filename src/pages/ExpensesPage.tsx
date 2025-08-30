import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  TrendingDown,
  Calendar,
  Edit,
  Trash2,
  Filter,
  X,
  Download,
  ChevronDown,
  ChevronUp,
  BarChart3,
  RefreshCw,
  DollarSign,
  Eye,
  EyeOff,
} from "lucide-react";
import Modal from "../components/Modal";
import ExpenseForm from "../components/ExpensesForm";

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
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  } | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Fetch des dépenses
  const fetchExpenses = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsLoading(true);
    fetch(`${baseUrl}/api/depenses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data: Expense[]) => setExpenses(data))
      .catch((err) => console.error("Erreur fetch dépenses:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // CRUD
  const handleSave = async (expenseData: Omit<Expense, "id">) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      if (editingExpense) {
        // Update via PUT
        await fetch(`${baseUrl}/api/depenses/${editingExpense.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(expenseData),
        });
      } else {
        // Create via POST
        await fetch(`${baseUrl}/api/depenses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(expenseData),
        });
      }
      setIsModalOpen(false);
      fetchExpenses();
    } catch (error) {
      console.error("Erreur sauvegarde dépense:", error);
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) {
      try {
        await fetch(`${baseUrl}/api/depenses/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchExpenses();
      } catch (error) {
        console.error("Erreur suppression dépense:", error);
      }
    }
  };

  // Couleur et label pour chaque type de dépense
  const getTypeColor = (type: string) => {
    switch (type) {
      case "MATIERE_PREMIERE":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "EMBALLAGE":
        return "bg-sky-100 text-sky-800 border-sky-200";
      case "TRANSPORT":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "MARKETING":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  // Tri des données
  const handleSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Filtrage et total
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTypeLabel(expense.typeDepense)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "" || expense.typeDepense === typeFilter;

    // Filtre par date
    const expenseDate = new Date(expense.dateDepense);
    const matchesStartDate =
      !dateRange.start || expenseDate >= new Date(dateRange.start);
    const matchesEndDate =
      !dateRange.end || expenseDate <= new Date(dateRange.end + "T23:59:59");

    return matchesSearch && matchesType && matchesStartDate && matchesEndDate;
  });

  // Total des dépenses
  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + expense.montant,
    0
  );

  // Statistiques par type
  const expensesByType = filteredExpenses.reduce((acc, expense) => {
    const type = expense.typeDepense;
    if (!acc[type]) {
      acc[type] = { total: 0, count: 0 };
    }
    acc[type].total += expense.montant;
    acc[type].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const sortedExpenses = [...filteredExpenses];
  if (sortConfig !== null) {
    sortedExpenses.sort((a, b) => {
      if (
        a[sortConfig.key as keyof Expense] < b[sortConfig.key as keyof Expense]
      ) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (
        a[sortConfig.key as keyof Expense] > b[sortConfig.key as keyof Expense]
      ) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }

  // Modal et actions CRUD
  const openCreateModal = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  // Icône de tri
  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ChevronDown size={14} className="opacity-50" />;
    }
    return sortConfig.direction === "ascending" ? (
      <ChevronUp size={14} />
    ) : (
      <ChevronDown size={14} />
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setDateRange({ start: "", end: "" });
  };

  const hasActiveFilters =
    searchTerm || typeFilter || dateRange.start || dateRange.end;

  const StatsCard = ({
    title,
    value,
    icon: Icon,
    color,
  }: {
    title: string;
    value: string;
    icon: any;
    color: string;
  }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Dépenses
            </h1>
            <p className="text-gray-600">Suivi des dépenses d'exploitation</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={() => setShowStats(!showStats)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              <BarChart3 size={18} className="mr-2" />
              {showStats ? "Masquer stats" : "Afficher stats"}
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
            >
              <Plus size={20} className="mr-2" />
              <span className="hidden sm:inline">Nouvelle dépense</span>
              <span className="sm:hidden">Nouvelle</span>
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-lg p-6 mb-6 text-white transform transition-transform hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 mb-1">Total des dépenses filtrées</p>
              <p className="text-2xl md:text-3xl font-bold">
                {totalExpenses.toLocaleString()} Ar
              </p>
              <p className="text-red-100 mt-2 text-sm">
                {filteredExpenses.length} dépense
                {filteredExpenses.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-xl">
              <TrendingDown size={32} />
            </div>
          </div>
        </div>

        {/* Statistics Cards - Responsive Grid */}
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total général"
              value={`${totalExpenses.toLocaleString()} Ar`}
              icon={DollarSign}
              color="text-red-500"
            />
            {Object.entries(expensesByType).map(([type, data]) => (
              <StatsCard
                key={type}
                title={getTypeLabel(type)}
                value={`${data.total.toLocaleString()} Ar`}
                icon={DollarSign}
                color="text-blue-500"
              />
            ))}
          </div>
        )}

        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col gap-4">
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                />
              </div>

              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="sm:hidden inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50"
              >
                <Filter size={18} className="mr-2" />
                Filtres
                {isFilterOpen ? (
                  <ChevronUp size={18} className="ml-2" />
                ) : (
                  <ChevronDown size={18} className="ml-2" />
                )}
              </button>
            </div>

            {/* Filtres avancés (responsive) */}
            <div className={`${isFilterOpen ? "block" : "hidden"} sm:block`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 sm:pt-0 border-t border-gray-200 sm:border-t-0">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                >
                  <option value="">Tous les types</option>
                  <option value="MATIERE_PREMIERE">Matière première</option>
                  <option value="EMBALLAGE">Emballage</option>
                  <option value="TRANSPORT">Transport</option>
                  <option value="MARKETING">Marketing</option>
                  <option value="AUTRE">Autre</option>
                </select>

                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                  placeholder="Date de début"
                />

                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                  placeholder="Date de fin"
                />

                <div className="flex gap-2">
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex-1 inline-flex items-center justify-center px-4 py-3 text-gray-700 hover:text-gray-900 transition-colors border border-gray-300 rounded-xl"
                    >
                      <X size={18} className="mr-2" />
                      Réinitialiser
                    </button>
                  )}
                  <button
                    onClick={fetchExpenses}
                    className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50"
                    title="Actualiser"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Table - Mobile Optimized */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 text-amber-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-500">Chargement des dépenses...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="p-6 text-center">
              <div className="mx-auto w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Search size={20} className="text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-1">
                Aucune dépense trouvée
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {hasActiveFilters
                  ? "Modifiez vos critères de recherche"
                  : "Ajoutez votre première dépense"}
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <X size={16} className="mr-1.5" />
                  Réinitialiser
                </button>
              ) : (
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm"
                >
                  <Plus size={18} className="mr-1.5" />
                  Nouvelle dépense
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table (hidden on mobile) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("dateDepense")}
                      >
                        <div className="flex items-center">
                          Date
                          <SortIcon columnKey="dateDepense" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("montant")}
                      >
                        <div className="flex items-center justify-end">
                          Montant
                          <SortIcon columnKey="montant" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedExpenses.map((expense) => (
                      <tr
                        key={expense.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Calendar
                              size={16}
                              className="text-gray-400 mr-2 flex-shrink-0"
                            />
                            {new Date(expense.dateDepense).toLocaleDateString(
                              "fr-FR"
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(
                              expense.typeDepense
                            )}`}
                          >
                            {getTypeLabel(expense.typeDepense)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                          {expense.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-red-600">
                          -{expense.montant.toLocaleString()} Ar
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => openEditModal(expense)}
                              className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                              aria-label="Modifier"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                              aria-label="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards (shown on mobile) */}
              <div className="md:hidden divide-y divide-gray-200">
                {sortedExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <Calendar
                          size={16}
                          className="text-gray-400 mr-2 mt-0.5 flex-shrink-0"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(expense.dateDepense).toLocaleDateString(
                            "fr-FR"
                          )}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                          expense.typeDepense
                        )}`}
                      >
                        {getTypeLabel(expense.typeDepense)}
                      </span>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {expense.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-600">
                        -{expense.montant.toLocaleString()} Ar
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditModal(expense)}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          aria-label="Modifier"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          aria-label="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingExpense ? "Modifier la dépense" : "Nouvelle dépense"}
        >
          <ExpenseForm
            expense={editingExpense}
            onSave={handleSave}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      </div>
    </div>
  );
}
