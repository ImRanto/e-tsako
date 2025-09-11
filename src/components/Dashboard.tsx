import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Users,
  Package,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  Calendar,
  RefreshCw,
  Eye,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import StatCard from "./StatCard";
import QuickActions from "./QuickActions";
import DashboardCharts from "./chart/DashboardCharts";

export interface Stock {
  id: number;
  nomMatiere: string;
  quantite: number;
  unite: string;
  seuilAlerte: number;
}

export interface RecentOrder {
  id: number;
  client: string;
  total: string;
  status: "PAYEE" | "EN_ATTENTE" | "LIVREE";
  date: string;
}

export interface Stats {
  clientsActifs: number;
  produitsEnStock: number;
  chiffreAffaires: number;
  totalCommandes: number;
  chiffreAffairesMensuel: number;
  commandesMensuelles: number;
  evolutionCA: number;
  evolutionCommandes: number;
}

const baseUrl = import.meta.env.VITE_API_URL;
const app_name = import.meta.env.VITE_APP_NAME;

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Stock[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [showCharts, setShowCharts] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("Utilisateur non authentifié");
      setIsLoading(false);
      return;
    }

    const fetchWithAuth = async <T,>(
      url: string,
      setter: (data: T) => void
    ) => {
      try {
        const res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Erreur lors de la récupération des données");
        }
        const data = await res.json();
        setter(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Erreur inconnue");
      }
    };

    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        await Promise.all([
          fetchWithAuth<Stats>(
            `${baseUrl}/api/commandes/stats?period=${selectedPeriod}`,
            setStats
          ),
          fetchWithAuth<RecentOrder[]>(
            `${baseUrl}/api/commandes/recent`,
            setRecentOrders
          ),
          fetchWithAuth<Stock[]>(
            `${baseUrl}/api/stocks/low`,
            setLowStockProducts
          ),
        ]);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, selectedPeriod]);

  const refreshData = () => {
    const fetchWithAuth = async <T,>(
      url: string,
      setter: (data: T) => void
    ) => {
      try {
        const res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Erreur de rafraîchissement");
        const data = await res.json();
        setter(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchWithAuth<Stats>(
      `${baseUrl}/api/commandes/stats?period=${selectedPeriod}`,
      setStats
    );
    fetchWithAuth<RecentOrder[]>(
      `${baseUrl}/api/commandes/recent`,
      setRecentOrders
    );
    fetchWithAuth<Stock[]>(`${baseUrl}/api/stocks/low`, setLowStockProducts);
  };

  // Filtrer les commandes récentes
  const filteredOrders = recentOrders.filter((order) => {
    const matchesSearch = order.client
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
              <button
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-700"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header avec contrôles */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Tableau de bord
            </h1>
            <p className="text-gray-600">
              Vue d'ensemble de votre activité {app_name}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors appearance-none bg-white"
              >
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="quarter">Ce trimestre</option>
                <option value="year">Cette année</option>
              </select>
              <Calendar
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              <BarChart3 size={18} className="mr-2" />
              {showCharts ? "Masquer graphiques" : "Afficher graphiques"}
            </button>
            <button
              onClick={refreshData}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
              title="Rafraîchir les données"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* Cartes de statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Clients actifs"
              value={stats.clientsActifs.toString()}
              change={`${stats.evolutionCA > 0 ? "+" : ""}${
                stats.evolutionCA
              }%`}
              trend={stats.evolutionCA >= 0 ? "up" : "down"}
              icon={Users}
              color="purple"
              loading={isLoading}
              period={selectedPeriod}
            />
            <StatCard
              title="Produits en stock"
              value={stats.produitsEnStock.toString()}
              change="-3%"
              trend="down"
              icon={Package}
              color="amber"
              loading={isLoading}
              period={selectedPeriod}
            />
            <StatCard
              title="Chiffre d'affaires"
              value={`${stats.chiffreAffaires.toLocaleString()} Ar`}
              change={`${stats.evolutionCA > 0 ? "+" : ""}${
                stats.evolutionCA
              }%`}
              trend={stats.evolutionCA >= 0 ? "up" : "down"}
              icon={TrendingUp}
              color="green"
              loading={isLoading}
              period={selectedPeriod}
              isCurrency={true}
            />
            <StatCard
              title="Total commandes"
              value={stats.totalCommandes.toString()}
              change={`${stats.evolutionCommandes > 0 ? "+" : ""}${
                stats.evolutionCommandes
              }%`}
              trend={stats.evolutionCommandes >= 0 ? "up" : "down"}
              icon={ShoppingCart}
              color="blue"
              loading={isLoading}
              period={selectedPeriod}
            />
          </div>
        )}

        {/* Graphiques */}
        {showCharts && stats && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <DashboardCharts period={selectedPeriod} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Commandes récentes */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-3 sm:mb-0">
                <ShoppingCart className="mr-2 text-blue-500" size={20} />
                Commandes récentes
              </h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="PAYEE">Payées</option>
                  <option value="EN_ATTENTE">En attente</option>
                  <option value="LIVREE">Livrées</option>
                </select>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {filteredOrders.length > 0 ? (
                <>
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <div
                          className={`p-2 rounded-lg mr-4 ${
                            order.status === "PAYEE"
                              ? "bg-green-100 text-green-600"
                              : order.status === "LIVREE"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-amber-100 text-amber-600"
                          }`}
                        >
                          <ShoppingCart size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {order.client}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {order.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className="font-semibold text-gray-900">
                          {order.total}
                        </p>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                            order.status === "PAYEE"
                              ? "bg-green-100 text-green-800"
                              : order.status === "LIVREE"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {order.status.replace("_", " ")}
                        </span>
                      </div>
                      <button className="ml-2 p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      {filteredOrders.length} commande
                      {filteredOrders.length !== 1 ? "s" : ""}
                    </p>
                    <button className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center">
                      Voir toutes les commandes
                      <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p>Aucune commande récente</p>
                  {searchTerm || statusFilter !== "all" ? (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                      }}
                      className="text-amber-600 hover:text-amber-700 text-sm mt-2"
                    >
                      Réinitialiser les filtres
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Alertes stock + QuickActions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-amber-50">
                <h3 className="text-lg font-semibold text-amber-900 flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="mr-2 text-amber-500" size={20} />
                    Alertes stock
                    {lowStockProducts.length > 0 && (
                      <span className="ml-2 bg-amber-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        {lowStockProducts.length}
                      </span>
                    )}
                  </div>
                  <button className="text-amber-600 hover:text-amber-700">
                    <Eye size={18} />
                  </button>
                </h3>
              </div>
              <div className="p-6 space-y-3">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-4 bg-amber-50 rounded-xl border border-amber-200 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-amber-900 truncate">
                            {product.nomMatiere}
                          </p>
                          <div className="flex items-center mt-2">
                            <div className="w-full bg-amber-200 rounded-full h-2">
                              <div
                                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (product.quantite / product.seuilAlerte) *
                                      100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-amber-700 ml-2 whitespace-nowrap">
                              {product.quantite}/{product.seuilAlerte}{" "}
                              {product.unite}
                            </span>
                          </div>
                        </div>
                        <AlertTriangle
                          className="text-amber-500 ml-2 flex-shrink-0 mt-0.5"
                          size={16}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p>Aucune alerte de stock</p>
                  </div>
                )}
                {lowStockProducts.length > 0 && (
                  <button className="w-full text-center text-amber-600 hover:text-amber-700 text-sm font-medium pt-2 border-t border-amber-100">
                    Voir tout le stock
                  </button>
                )}
              </div>
            </div>

            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}
