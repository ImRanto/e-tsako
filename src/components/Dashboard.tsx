import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Users,
  Package,
  TrendingUp,
  ShoppingCart,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import StatCard from "./StatCard";
import QuickActions from "./QuickActions";

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
}

const baseUrl = import.meta.env.VITE_API_URL;
const app_name = import.meta.env.VITE_APP_NAME;

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Stock[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
      await Promise.all([
        fetchWithAuth<Stats>(`${baseUrl}/api/commandes/stats`, setStats),
        fetchWithAuth<RecentOrder[]>(
          `${baseUrl}/api/commandes/recent`,
          setRecentOrders
        ),
        fetchWithAuth<Stock[]>(
          `${baseUrl}/api/stocks/low`,
          setLowStockProducts
        ),
      ]);
      setIsLoading(false);
    };

    fetchData();
  }, [token]);

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tableau de bord
        </h1>
        <p className="text-gray-600">
          Vue d'ensemble de votre activité {app_name}
        </p>
      </div>

      {/* Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Clients actifs"
            value={stats.clientsActifs.toString()}
            change="+12%"
            trend="up"
            icon={Users}
            color="purple"
            loading={isLoading}
          />
          <StatCard
            title="Produits en stock"
            value={stats.produitsEnStock.toString()}
            change="-3%"
            trend="down"
            icon={Package}
            color="amber"
            loading={isLoading}
          />
          <StatCard
            title="Chiffre d'affaires"
            value={`${stats.chiffreAffaires.toLocaleString()} Ar`}
            change="+18%"
            trend="up"
            icon={TrendingUp}
            color="green"
            loading={isLoading}
          />
          <StatCard
            title="Total commandes"
            value={stats.totalCommandes.toString()}
            change="+8%"
            trend="up"
            icon={ShoppingCart}
            color="blue"
            loading={isLoading}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commandes récentes */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ShoppingCart className="mr-2 text-blue-500" size={20} />
              Commandes récentes
            </h3>
          </div>
          <div className="p-6 space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 truncate">
                      {order.client}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{order.date}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-gray-900">{order.total}</p>
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
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p>Aucune commande récente</p>
              </div>
            )}
          </div>
        </div>

        {/* Alertes stock + QuickActions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-amber-50">
              <h3 className="text-lg font-semibold text-amber-900 flex items-center">
                <AlertTriangle className="mr-2 text-amber-500" size={20} />
                Alertes stock
              </h3>
            </div>
            <div className="p-6 space-y-3">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 bg-amber-50 rounded-xl border border-amber-200 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-amber-900 truncate">
                          {product.nomMatiere}
                        </p>
                        <div className="flex items-center mt-2">
                          <div className="w-full bg-amber-200 rounded-full h-2">
                            <div
                              className="bg-amber-500 h-2 rounded-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (product.quantite / product.seuilAlerte) * 100
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
                        className="text-amber-500 ml-2 flex-shrink-0"
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
            </div>
          </div>

          <QuickActions />
        </div>
      </div>
    </div>
  );
}
