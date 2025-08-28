import { useEffect, useState } from "react";
import {
  RefreshCw,
  Search,
  Filter,
  Calendar,
  User,
  Code,
  Clock,
  Download,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";

interface Historique {
  id: number;
  dateAction: string;
  endpoint: string;
  methode: string;
  payload: string;
  utilisateur: string;
  ipAddress?: string;
}

const baseUrl = import.meta.env.VITE_API_URL;

export default function HistoriquePage() {
  const [historiques, setHistoriques] = useState<Historique[]>([]);
  const [filteredHistoriques, setFilteredHistoriques] = useState<Historique[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "dateAction",
    direction: "desc",
  });

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Utilisateur non authentifié");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/historiques`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erreur lors du chargement des historiques");

      const data: Historique[] = await res.json();
      setHistoriques(data);
      setFilteredHistoriques(data);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrer et trier les données
  useEffect(() => {
    let result = historiques;

    // Appliquer le filtre de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (h) =>
          h.endpoint.toLowerCase().includes(term) ||
          h.utilisateur.toLowerCase().includes(term) ||
          h.payload.toLowerCase().includes(term) ||
          h.methode.toLowerCase().includes(term) ||
          h.id.toString().includes(term)
      );
    }

    // Appliquer le filtre de méthode
    if (methodFilter !== "all") {
      result = result.filter((h) => h.methode === methodFilter);
    }

    // Appliquer le tri
    result = [...result].sort((a, b) => {
      if (sortConfig.key === "dateAction") {
        return sortConfig.direction === "asc"
          ? new Date(a.dateAction).getTime() - new Date(b.dateAction).getTime()
          : new Date(b.dateAction).getTime() - new Date(a.dateAction).getTime();
      }
      if (sortConfig.key === "id") {
        return sortConfig.direction === "asc" ? a.id - b.id : b.id - a.id;
      }
      return 0;
    });

    setFilteredHistoriques(result);
  }, [historiques, searchTerm, methodFilter, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-blue-100 text-blue-700";
      case "POST":
        return "bg-green-100 text-green-700";
      case "PUT":
        return "bg-yellow-100 text-yellow-700";
      case "DELETE":
        return "bg-red-100 text-red-700";
      case "PATCH":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  };

  const exportToCSV = () => {
    const headers = "ID,Date,Endpoint,Méthode,Utilisateur,Statut,IP\n";
    const csvContent = historiques
      .map(
        (h) =>
          `${h.id},"${new Date(h.dateAction).toLocaleString("fr-FR")}",${
            h.endpoint
          },${h.methode},${h.utilisateur},${
            h.ipAddress || "N/A"
          }"`
      )
      .join("\n");

    const blob = new Blob([headers + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `historique_actions_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };

  const SortIndicator = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 text-amber-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Chargement de l'historique...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start">
            <AlertCircle className="h-6 w-6 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-medium text-red-800">
                Erreur de chargement
              </h3>
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchData}
                className="mt-3 inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Historique des actions
              </h1>
              <p className="text-gray-600">
                Suivi de toutes les actions effectuées sur le système
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <button
                onClick={fetchData}
                className="inline-flex items-center px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </button>
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">Toutes les méthodes</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">
                  Total: {filteredHistoriques.length} actions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center">
                      ID
                      <SortIndicator columnKey="id" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("dateAction")}
                  >
                    <div className="flex items-center">
                      Date & Heure
                      <SortIndicator columnKey="dateAction" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Endpoint
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Méthode
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHistoriques.map((h) => (
                  <>
                    <tr
                      key={h.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{h.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {new Date(h.dateAction).toLocaleString("fr-FR")}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800 max-w-xs truncate">
                        {h.endpoint}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(
                            h.methode
                          )}`}
                        >
                          {h.methode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          {h.utilisateur}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() =>
                            setExpandedRow(expandedRow === h.id ? null : h.id)
                          }
                          className="text-amber-600 hover:text-amber-800 inline-flex items-center"
                        >
                          {expandedRow === h.id ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-1" />
                              Réduire
                            </>
                          ) : (
                            <>
                              <Code className="h-4 w-4 mr-1" />
                              Détails
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedRow === h.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Payload
                              </h4>
                              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                                {formatJson(h.payload)}
                              </pre>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Informations supplémentaires
                              </h4>
                              <div className="space-y-2 text-sm">
                                {h.ipAddress && (
                                  <p>
                                    <span className="font-medium">IP:</span>{" "}
                                    {h.ipAddress}
                                  </p>
                                )}
                                <p>
                                  <span className="font-medium">
                                    Timestamp:
                                  </span>{" "}
                                  {new Date(h.dateAction).toISOString()}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    ID de l'action:
                                  </span>{" "}
                                  {h.id}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {filteredHistoriques.length === 0 && (
            <div className="p-12 text-center">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune action trouvée
              </h3>
              <p className="text-gray-600">
                {searchTerm || methodFilter !== "all"
                  ? "Aucune action ne correspond à vos critères de recherche"
                  : "Aucune action n'a été enregistrée pour le moment"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
