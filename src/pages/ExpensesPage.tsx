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
  FileText,
  PieChart,
  CheckSquare,
  Square,
  FileDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Modal from "../components/Modal";
import ExpenseForm from "../components/ExpensesForm";
import { exportToCSV, exportToPDF } from "../utils/exportUtils";
import ExpenseCharts from "../components/chart/ExpenseChart";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "../utils/auth";

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

interface ExpenseDetail extends Expense {
  createdBy: {
    id: number;
    nom: string;
    prenom: string;
    role: string;
    email: string;
  } | null;
  updatedBy: {
    id: number;
    nom: string;
    prenom: string;
    role: string;
    email: string;
  } | null;
  updatedAt: string | null;
}

interface ApiResponse {
  content: Expense[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Dans votre composant Modal (si ce n'est pas déjà fait)
interface ModalProps {
  // ... autres props
  size?: 'sm' | 'md' | 'lg' | 'xl';
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
  const [showStats, setShowStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExpenses, setSelectedExpenses] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showCharts, setShowCharts] = useState(false);
  const [paginationInfo, setPaginationInfo] = useState({
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    number: 0,
  });

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedExpenseDetail, setSelectedExpenseDetail] =
    useState<ExpenseDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const itemsPerPageOptions = [5, 10, 25, 50];

  // Fetch des dépenses avec pagination
  const fetchExpenses = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("Token d'authentification manquant");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Décoder le token pour récupérer le rôle
      const decoded: DecodedToken = jwtDecode(token);

      // Construire les paramètres de requête
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: itemsPerPage.toString(),
      });

      // Ajouter les filtres s'ils sont définis
      if (searchTerm) params.append("search", searchTerm);
      if (typeFilter) params.append("type", typeFilter);
      if (dateRange.start) params.append("startDate", dateRange.start);
      if (dateRange.end) params.append("endDate", dateRange.end);

      // Choix de l'endpoint selon le rôle
      const endpoint =
        decoded.role === "ADMIN"
          ? `${baseUrl}/api/depenses/paged?${params}`
          : `${baseUrl}/api/depenses/mes-depenses?${params}`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401)
          throw new Error("Session expirée. Reconnectez-vous.");
        throw new Error("Erreur lors du chargement des dépenses");
      }

      const data: ApiResponse = await response.json();

      setExpenses(data.content);
      setPaginationInfo({
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        first: data.first,
        last: data.last,
        number: data.number,
      });

      setSelectedExpenses([]);
    } catch (err: any) {
      console.error("Erreur fetch dépenses:", err);
      setError(err.message || "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

const fetchExpenseDetail = async (id: number) => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    setError("Token d'authentification manquant");
    return;
  }

  setIsLoadingDetail(true);
  try {
    const response = await fetch(`${baseUrl}/api/depenses/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors du chargement des détails");
    }

    const data: ExpenseDetail = await response.json();
    setSelectedExpenseDetail(data);
    setDetailModalOpen(true);
  } catch (err: any) {
    console.error("Erreur fetch détails:", err);
    setError(err.message || "Erreur inconnue");
  } finally {
    setIsLoadingDetail(false);
  }
};

  useEffect(() => {
    fetchExpenses();
  }, [currentPage, itemsPerPage, searchTerm, typeFilter, dateRange]);

  // CRUD
  const handleSave = async (expenseData: Omit<Expense, "id">) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("Token d'authentification manquant");
      return;
    }

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
      setError("Erreur lors de la sauvegarde de la dépense");
    }
  };

  const handleDelete = async (id: number) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("Token d'authentification manquant");
      return;
    }

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
        setError("Erreur lors de la suppression de la dépense");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedExpenses.length === 0) return;

    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("Token d'authentification manquant");
      return;
    }

    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer ${selectedExpenses.length} dépense(s) ?`
      )
    ) {
      try {
        await Promise.all(
          selectedExpenses.map((id) =>
            fetch(`${baseUrl}/api/depenses/${id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
          )
        );
        fetchExpenses();
      } catch (error) {
        console.error("Erreur suppression des dépenses:", error);
        setError("Erreur lors de la suppression des dépenses");
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
      !dateRange.end ||
      expenseDate.getTime() <=
        new Date(dateRange.end).setHours(23, 59, 59, 999);

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

  // Pagination
  const totalPages = paginationInfo.totalPages;
  const currentPageIndex = paginationInfo.number;

  const paginate = (pageNumber: number) => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Gestion de la sélection
  const toggleSelectAll = () => {
    if (selectedExpenses.length === expenses.length) {
      setSelectedExpenses([]);
    } else {
      setSelectedExpenses(expenses.map((expense) => expense.id));
    }
  };

  const toggleSelectExpense = (id: number) => {
    if (selectedExpenses.includes(id)) {
      setSelectedExpenses(
        selectedExpenses.filter((expenseId) => expenseId !== id)
      );
    } else {
      setSelectedExpenses([...selectedExpenses, id]);
    }
  };

  // Exportation
  const handleExport = (format: "csv" | "pdf") => {
    const dataToExport = filteredExpenses.map((expense) => ({
      Date: new Date(expense.dateDepense).toLocaleDateString("fr-FR"),
      Type: getTypeLabel(expense.typeDepense),
      Description: expense.description,
      Montant: `${expense.montant.toLocaleString()} Ar`,
    }));

    if (format === "csv") {
      exportToCSV(
        dataToExport,
        `depenses-${new Date().toISOString().split("T")[0]}`
      );
    } else {
      exportToPDF(
        dataToExport,
        `Rapport des dépenses - ${new Date().toLocaleDateString("fr-FR")}`
      );
    }
  };

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
    setCurrentPage(0);
  };

  const hasActiveFilters =
    searchTerm || typeFilter || dateRange.start || dateRange.end;

  const StatsCard = ({
    title,
    value,
    icon: Icon,
    color,
    trend,
  }: {
    title: string;
    value: string;
    icon: any;
    color: string;
    trend?: string;
  }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition-all hover:shadow-md">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
          {trend && (
            <p
              className={`text-xs ${
                trend.startsWith("+") ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Pagination controls component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    const generatePageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;

      if (totalPages <= maxVisiblePages) {
        for (let i = 0; i < totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Always include first page
        pages.push(0);

        // Calculate start and end of visible pages
        let start = Math.max(
          1,
          currentPageIndex - Math.floor(maxVisiblePages / 2)
        );
        let end = Math.min(totalPages - 1, start + maxVisiblePages - 1);

        // Adjust if we're near the end
        if (end === totalPages - 1) {
          start = totalPages - maxVisiblePages;
        }

        // Add ellipsis if needed
        if (start > 1) {
          pages.push(-1); // -1 represents ellipsis
        }

        // Add middle pages
        for (let i = start; i < end; i++) {
          if (i > 0 && i < totalPages - 1) {
            pages.push(i);
          }
        }

        // Add ellipsis if needed
        if (end < totalPages - 1) {
          pages.push(-2); // -2 represents ellipsis
        }

        // Always include last page
        pages.push(totalPages - 1);
      }

      return pages;
    };

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 px-4 py-3 bg-white border-t border-gray-200 rounded-b-lg">
        <div className="text-sm text-gray-700 mb-4 sm:mb-0">
          Affichage de{" "}
          <span className="font-medium">
            {currentPageIndex * itemsPerPage + 1}
          </span>{" "}
          à{" "}
          <span className="font-medium">
            {Math.min(
              (currentPageIndex + 1) * itemsPerPage,
              paginationInfo.totalElements
            )}
          </span>{" "}
          sur{" "}
          <span className="font-medium">{paginationInfo.totalElements}</span>{" "}
          résultats
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(0);
            }}
            className="text-sm border border-gray-300 rounded-md px-2 py-1"
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option} / page
              </option>
            ))}
          </select>

          <nav className="flex space-x-1">
            <button
              onClick={() => paginate(currentPageIndex - 1)}
              disabled={paginationInfo.first}
              className="px-2 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronLeft size={16} className="mr-1" />
              Précédent
            </button>

            {generatePageNumbers().map((pageNum, index) => (
              <button
                key={index}
                onClick={() => pageNum >= 0 && paginate(pageNum)}
                disabled={pageNum < 0}
                className={`px-3 py-1 rounded-md text-sm min-w-[2.5rem] ${
                  currentPageIndex === pageNum
                    ? "bg-amber-500 text-white"
                    : pageNum < 0
                    ? "text-gray-400 cursor-default"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {pageNum < 0 ? "..." : pageNum + 1}
              </button>
            ))}

            <button
              onClick={() => paginate(currentPageIndex + 1)}
              disabled={paginationInfo.last}
              className="px-2 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Suivant
              <ChevronRight size={16} className="ml-1" />
            </button>
          </nav>
        </div>
      </div>
    );
  };

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
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <button
              onClick={() => setShowStats(!showStats)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              <BarChart3 size={18} className="mr-2" />
              {showStats ? "Masquer stats" : "Afficher stats"}
            </button>
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              <PieChart size={18} className="mr-2" />
              {showCharts ? "Masquer graphiques" : "Afficher graphiques"}
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

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex justify-between items-center">
            <div className="flex items-center">
              <span className="font-medium">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-800 hover:text-red-900"
            >
              <X size={18} />
            </button>
          </div>
        )}

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
                {hasActiveFilters && " (filtrées)"}
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
                trend={`${((data.total / totalExpenses) * 100).toFixed(1)}%`}
              />
            ))}
          </div>
        )}

        {/* Charts Section */}
        {showCharts && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <ExpenseCharts expenses={filteredExpenses} />
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
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(0);
                  }}
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
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setCurrentPage(0);
                  }}
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
                  onChange={(e) => {
                    setDateRange({ ...dateRange, start: e.target.value });
                    setCurrentPage(0);
                  }}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                  placeholder="Date de début"
                />

                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => {
                    setDateRange({ ...dateRange, end: e.target.value });
                    setCurrentPage(0);
                  }}
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
                  <div className="relative group">
                    <button
                      className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50"
                      title="Exporter"
                    >
                      <Download size={18} />
                    </button>
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <button
                        onClick={() => handleExport("csv")}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FileText size={16} className="inline mr-2" />
                        Exporter en CSV
                      </button>
                      <button
                        onClick={() => handleExport("pdf")}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FileDown size={16} className="inline mr-2" />
                        Exporter en PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedExpenses.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-amber-800 font-medium">
                {selectedExpenses.length} dépense(s) sélectionnée(s)
              </span>
            </div>
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
              disabled={isLoading}
            >
              <Trash2 size={16} className="mr-1.5" />
              Supprimer la sélection
            </button>
          </div>
        )}

        {/* Expenses Table - Mobile Optimized */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 text-amber-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-500">Chargement des dépenses...</p>
            </div>
          ) : expenses.length === 0 ? (
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                        <button
                          onClick={toggleSelectAll}
                          className="flex items-center focus:outline-none"
                          aria-label="Sélectionner toutes les dépenses"
                        >
                          {selectedExpenses.length === expenses.length ? (
                            <CheckSquare size={16} className="text-amber-500" />
                          ) : (
                            <Square size={16} className="text-gray-400" />
                          )}
                        </button>
                      </th>
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
                    {expenses.map((expense) => (
                      <tr
                        key={expense.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          selectedExpenses.includes(expense.id)
                            ? "bg-amber-50"
                            : ""
                        }`}
                        onClick={() => fetchExpenseDetail(expense.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleSelectExpense(expense.id)}
                            className="flex items-center focus:outline-none"
                            aria-label={`Sélectionner la dépense du ${new Date(
                              expense.dateDepense
                            ).toLocaleDateString("fr-FR")}`}
                          >
                            {selectedExpenses.includes(expense.id) ? (
                              <CheckSquare
                                size={16}
                                className="text-amber-500"
                              />
                            ) : (
                              <Square size={16} className="text-gray-400" />
                            )}
                          </button>
                        </td>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(expense);
                              }}
                              className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                              aria-label="Modifier"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(expense.id);
                              }}
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
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      selectedExpenses.includes(expense.id) ? "bg-amber-50" : ""
                    }`}
                    onClick={() => fetchExpenseDetail(expense.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleSelectExpense(expense.id)}
                          className="mr-2 focus:outline-none"
                          aria-label={`Sélectionner la dépense du ${new Date(
                            expense.dateDepense
                          ).toLocaleDateString("fr-FR")}`}
                        >
                          {selectedExpenses.includes(expense.id) ? (
                            <CheckSquare size={16} className="text-amber-500" />
                          ) : (
                            <Square size={16} className="text-gray-400" />
                          )}
                        </button>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(expense);
                          }}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          aria-label="Modifier"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(expense.id);
                          }}
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

              <PaginationControls />
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

        {/* Modal de détail */}
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title="Détails de la dépense"
          size="lg"
        >
          {isLoadingDetail ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
            </div>
          ) : selectedExpenseDetail ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Date
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(
                      selectedExpenseDetail.dateDepense
                    ).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Type
                  </label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(
                        selectedExpenseDetail.typeDepense
                      )}`}
                    >
                      {getTypeLabel(selectedExpenseDetail.typeDepense)}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Montant
                </label>
                <p className="mt-1 text-lg font-medium text-red-600">
                  -{selectedExpenseDetail.montant.toLocaleString()} Ar
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Description
                </label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {selectedExpenseDetail.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Créé par
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedExpenseDetail.createdBy
                      ? `${selectedExpenseDetail.createdBy.prenom} ${selectedExpenseDetail.createdBy.nom}`
                      : "Non spécifié"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Modifié par
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedExpenseDetail.updatedBy
                      ? `${selectedExpenseDetail.updatedBy.prenom} ${selectedExpenseDetail.updatedBy.nom}`
                      : "Non modifié"}
                  </p>
                </div>
              </div>

              {selectedExpenseDetail.updatedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Dernière modification
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedExpenseDetail.updatedAt).toLocaleString(
                      "fr-FR"
                    )}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Impossible de charger les détails
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
