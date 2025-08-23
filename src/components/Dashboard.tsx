import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import StatCard from "./StatCard";
import QuickActions from "./QuickActions";

const baseUrl = import.meta.env.VITE_API_URL;
const app_name = import.meta.env.VITE_APP_NAME;

export default function Dashboard() {
  const [stats, setStats] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token"); // récupère le token JWT

  useEffect(() => {
    if (!token) {
      setError("Utilisateur non authentifié");
      return;
    }

    // Fonction générique pour fetch avec JWT
    const fetchWithAuth = async (url: string, setter: Function) => {
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

    fetchWithAuth(`${baseUrl}/api/dashboard/stats`, setStats);
    fetchWithAuth(`${baseUrl}/api/orders/recent`, setRecentOrders);
    fetchWithAuth(`${baseUrl}/api/stocks/low`, setLowStockProducts);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

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
                  key={product.name}
                  className="p-3 bg-amber-50 rounded-lg border border-amber-200"
                >
                  <p className="font-medium text-amber-900">{product.name}</p>
                  <p className="text-sm text-amber-700">
                    Stock: {product.stock} (Seuil: {product.seuil})
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
