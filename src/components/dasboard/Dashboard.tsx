import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import StatCard from "./StatCard";
import QuickActions from "./QuickActions";
import OrderModal from "../form/OrderModalList";
import Loader from "../loading/Loader";

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
  updatedBy?: {
    id: number;
    nom: string;
    prenom: string;
    role: string;
    email: string;
  } | null;
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

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const token = sessionStorage.getItem("token");

  const fetchWithAuth = async <T,>(url: string, setter: (data: T) => void) => {
    try {
      // console.log("Fetching:", url);

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // console.log("Response status:", res.status);

      if (!res.ok) {
        let errorMessage = `Erreur ${res.status}: ${res.statusText}`;

        try {
          const errorData = await res.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          try {
            const errorText = await res.text();
            if (errorText) {
              errorMessage = errorText;
            }
          } catch {
            // Ignorer si on ne peut pas lire le texte d'erreur
          }
        }

        throw new Error(errorMessage);
      }

      const data = await res.json();
      // console.log("Data received:", data);
      setter(data);
      return data;
    } catch (err: any) {
      console.error("Fetch error for URL:", url, err);

      let errorMsg = err.message || "Erreur lors du chargement des données";

      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        errorMsg = "Session expirée. Veuillez vous reconnecter.";
        // window.location.href = "/login";
      } else if (
        err.message.includes("403") ||
        err.message.includes("Forbidden")
      ) {
        errorMsg = "Accès refusé. Vous n'avez pas les permissions nécessaires.";
      } else if (
        err.message.includes("404") ||
        err.message.includes("Not Found")
      ) {
        errorMsg = "Ressource non trouvée.";
      } else if (
        err.message.includes("500") ||
        err.message.includes("Internal Server Error")
      ) {
        errorMsg = "Erreur interne du serveur. Veuillez réessayer plus tard.";
      }

      setError(errorMsg);
      throw err;
    }
  };

  const fetchOrders = async (page: number) => {
    try {
      await fetchWithAuth<PagedResponse>(
        `${baseUrl}/api/commandes/paged?page=${page}&size=5`,
        (data) => {
          setOrders(data.content);
          setTotalPages(data.totalPages);
        }
      );
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    if (!token) {
      setError("Utilisateur non authentifié");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const results = await Promise.allSettled([
          fetchWithAuth<Stats>(`${baseUrl}/api/commandes/stats`, setStats),
          fetchOrders(page),
          fetchWithAuth<Stock[]>(
            `${baseUrl}/api/stocks/low`,
            setLowStockProducts
          ),
        ]);

        const errors = results.filter(
          (result) => result.status === "rejected"
        ) as PromiseRejectedResult[];

        if (errors.length > 0) {
          console.warn(`${errors.length} requêtes ont échoué:`, errors);

          if (errors.length === results.length) {
            setError("Impossible de charger les données du dashboard");
          }
        }
      } catch (err) {
        console.error("Error in fetchData:", err);
        setError("Erreur lors du chargement du dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, page]);

  // Réinitialiser la page quand le token change
  useEffect(() => {
    setPage(0);
  }, [token]);

  if (!token) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Non authentifié
          </h2>
          <p className="text-red-600 mb-4">
            Veuillez vous connecter pour accéder au dashboard.
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && !stats && orders.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 min-h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600">Vue d'ensemble de {app_name}</p>

        {/* Affichage conditionnel des erreurs */}
        {error && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm flex items-center">
              <AlertTriangle className="mr-2" size={16} />
              {error}
            </p>
          </div>
        )}
      </div>

      {/* Stats - Afficher même si certaines données sont manquantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Clients actifs"
          value={stats?.clientsActifs?.toString() || "0"}
          change="+12%"
          trend="up"
          icon={Users}
          color="purple"
          loading={isLoading && !stats}
        />
        <StatCard
          title="Produits en stock"
          value={stats?.produitsEnStock?.toString() || "0"}
          change="-3%"
          trend="down"
          icon={Package}
          color="amber"
          loading={isLoading && !stats}
        />
        <StatCard
          title="Chiffre d'affaires"
          value={`${stats?.chiffreAffaires?.toLocaleString() || "0"} Ar`}
          change="+18%"
          trend="up"
          icon={TrendingUp}
          color="green"
          loading={isLoading && !stats}
        />
        <StatCard
          title="Total commandes"
          value={stats?.totalCommandes?.toString() || "0"}
          change="+8%"
          trend="up"
          icon={ShoppingCart}
          color="blue"
          loading={isLoading && !stats}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ShoppingCart className="mr-2 text-blue-500" size={20} />
              Commandes récentes
            </h3>
          </div>
          <div className="p-6 space-y-3">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="cursor-pointer flex items-center justify-between p-4 bg-white rounded-xl border hover:shadow-md transition-shadow duration-200"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.client.nom}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.dateCommande).toLocaleString("fr-FR")}
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
                    {order.statut.replace("_", " ")}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-6">
                {isLoading ? "Chargement..." : "Aucune commande récente"}
              </p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                disabled={page === 0}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300 transition-colors"
              >
                Précédent
              </button>
              <span className="text-sm text-gray-600">
                Page {page + 1} sur {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300 transition-colors"
              >
                Suivant
              </button>
            </div>
          )}
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
                  <p>
                    {isLoading ? "Chargement..." : "Aucune alerte de stock"}
                  </p>
                </div>
              )}
            </div>
          </div>

          <QuickActions />
        </div>
      </div>

      {/* Modal commande */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
