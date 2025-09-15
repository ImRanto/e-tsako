import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import StatCard from "./StatCard";
import QuickActions from "./QuickActions";
import OrderModal from "./OrderModalList";

export interface Stock {
  id: number;
  nomMatiere: string;
  quantite: number;
  unite: string;
  seuilAlerte: number;
}

export interface CommandeDetail {
  id: number;
  produit: {
    id: number;
    nom: string;
    prixUnitaire: number;
    categorie: string;
    stockDisponible: number;
  };
  quantite: number;
  prixTotal: number;
}

export interface Commande {
  id: number;
  client: {
    id: number;
    nom: string;
    typeClient: string;
    telephone: string;
    email: string;
    adresse: string;
  };
  dateCommande: string;
  statut: "PAYEE" | "EN_ATTENTE" | "LIVREE";
  details: CommandeDetail[];
  createdBy: {
    id: number;
    nom: string;
    prenom: string;
    role: string;
    email: string;
  };
  updatedBy: {
    id: number;
    nom: string;
    prenom: string;
    role: string;
    email: string;
  };
}

export interface PagedResponse {
  content: Commande[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
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
  const [orders, setOrders] = useState<Commande[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Stock[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Commande | null>(null);
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
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text());
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
        fetchWithAuth<PagedResponse>(
          `${baseUrl}/api/commandes/paged?page=0&size=5`,
          (data) => setOrders(data.content)
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
    return <div className="p-6 text-red-600">{error}</div>;
  }

  if (isLoading) {
    return <div className="p-6 text-gray-500">Chargement...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600">Vue d'ensemble de {app_name}</p>
      </div>

      {/* Stats */}
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

      {/* Commandes récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ShoppingCart className="mr-2 text-blue-500" size={20} />{" "}
              Commandes récentes
            </h3>
          </div>
          <div className="p-6 space-y-3">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="cursor-pointer flex items-center justify-between p-4 bg-white rounded-xl border hover:shadow-md"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div>
                    <p className="font-medium">{order.client.nom}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.dateCommande).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.statut === "PAYEE"
                        ? "bg-green-100 text-green-800"
                        : order.statut === "LIVREE"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {order.statut}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-6">Aucune commande</p>
            )}
          </div>
        </div>

        {/* Alertes + QuickActions */}
        <div className="space-y-6">
          <QuickActions />
        </div>
      </div>

      {/* Modal commande */}
      <OrderModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
