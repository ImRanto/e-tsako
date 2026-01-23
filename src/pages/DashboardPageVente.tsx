import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Users,
  DollarSign,
  Package,
  Plus,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalVentes: number;
  clientsActifs: number;
  chiffreAffaires: number;
  produitsVendus: number;
}

interface RecentOrder {
  id: number;
  client: string;
  total: number;
  status: string;
  date: string;
}

const baseUrl = import.meta.env.VITE_API_URL;

export default function DashboardVentePage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVentes: 0,
    clientsActifs: 0,
    chiffreAffaires: 0,
    produitsVendus: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    setLoading(true);

    // Charger les statistiques
    Promise.all([
      fetch(`${baseUrl}/api/commandes/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${baseUrl}/api/commandes/recent`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(async ([statsRes, ordersRes]) => {
        if (!statsRes.ok || !ordersRes.ok)
          throw new Error("Erreur de chargement");

        const statsData = await statsRes.json();
        const ordersData = await ordersRes.json();

        setStats({
          totalVentes: statsData.totalCommandes,
          clientsActifs: statsData.clientsActifs,
          chiffreAffaires: statsData.chiffreAffaires,
          produitsVendus: 0,
        });

        setRecentOrders(ordersData);
      })
      .catch((err) => console.error("Erreur:", err))
      .finally(() => setLoading(false));
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-2">
          <ArrowUpRight size={14} className="text-green-500 mr-1" />
          <span className="text-sm text-green-600">{trend}</span>
        </div>
      )}
    </div>
  );

  const QuickAction = ({ icon: Icon, title, description, to, color }: any) => (
    <Link
      to={to}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow block"
    >
      <div className={`p-2 rounded-lg ${color} bg-opacity-10 w-fit mb-3`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tableau de Bord Vente
        </h1>
        <p className="text-gray-600">
          Vue d'ensemble de votre activité commerciale
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Ventes"
          value={stats.totalVentes}
          icon={ShoppingCart}
          color="text-blue-500"
          trend="+12% ce mois"
        />
        <StatCard
          title="Clients Actifs"
          value={stats.clientsActifs}
          icon={Users}
          color="text-green-500"
          trend="+5% ce mois"
        />
        <StatCard
          title="Chiffre d'Affaires"
          value={`${stats.chiffreAffaires.toLocaleString()} Ar`}
          icon={DollarSign}
          color="text-amber-500"
          trend="+18% ce mois"
        />
        <StatCard
          title="Produits Vendus"
          value={stats.produitsVendus}
          icon={Package}
          color="text-purple-500"
          trend="+8% ce mois"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <QuickAction
          icon={Plus}
          title="Nouvelle Commande"
          description="Créer une nouvelle commande client"
          to="/vente/commandes/nouveau"
          color="text-amber-500"
        />
        <QuickAction
          icon={Users}
          title="Ajouter Client"
          description="Ajouter un nouveau client"
          to="/vente/clients/nouveau"
          color="text-blue-500"
        />
        <QuickAction
          icon={DollarSign}
          title="Dépenses"
          description="Gérer les dépenses"
          to="/vente/depenses"
          color="text-green-500"
        />
        <QuickAction
          icon={Calendar}
          title="Planning"
          description="Voir le planning des livraisons"
          to="/vente/planning"
          color="text-purple-500"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Commandes Récentes
          </h2>
          <Link
            to="/vente/commandes"
            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
          >
            Voir toutes →
          </Link>
        </div>

        <div className="space-y-4">
          {recentOrders.slice(0, 5).map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <ShoppingCart size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Commande #{order.id}
                  </p>
                  <p className="text-sm text-gray-600">{order.client}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {order.total.toLocaleString()} Ar
                </p>
                <p className="text-sm text-gray-600">{order.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
