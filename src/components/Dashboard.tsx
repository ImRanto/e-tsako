import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
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

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("Utilisateur non authentifié");
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

    fetchWithAuth<Stats>(`${baseUrl}/api/commandes/stats`, setStats);
    fetchWithAuth<RecentOrder[]>(
      `${baseUrl}/api/commandes/recent`,
      setRecentOrders
    );
    fetchWithAuth<Stock[]>(`${baseUrl}/api/stocks/low`, setLowStockProducts);
  }, [token]);

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
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
            change="+"
            trend="up"
            icon={AlertTriangle}
            color="purple"
          />
          <StatCard
            title="Produits en stock"
            value={stats.produitsEnStock.toString()}
            change="-"
            trend="down"
            icon={AlertTriangle}
            color="amber"
          />
          <StatCard
            title="Chiffre d'affaires"
            value={stats.chiffreAffaires.toLocaleString()}
            change="+12%"
            trend="up"
            icon={AlertTriangle}
            color="green"
          />
          <StatCard
            title="Total commandes"
            value={stats.totalCommandes.toString()}
            change="+8%"
            trend="up"
            icon={AlertTriangle}
            color="blue"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commandes récentes */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Commandes récentes
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div>
                  <p className="font-medium text-gray-900">{order.client}</p>
                  <p className="text-sm text-gray-500">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{order.total}</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === "PAYEE"
                        ? "bg-green-100 text-green-800"
                        : order.status === "LIVREE"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertes stock + QuickActions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="mr-2 text-amber-500" size={20} />
                Alertes stock
              </h3>
            </div>
            <div className="p-6 space-y-3">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-3 bg-amber-50 rounded-lg border border-amber-200"
                >
                  <p className="font-medium text-amber-900">
                    {product.nomMatiere}
                  </p>
                  <p className="text-sm text-amber-700">
                    Stock: {product.quantite} {product.unite} (Seuil:{" "}
                    {product.seuilAlerte})
                  </p>
                </div>
              ))}
            </div>
          </div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
