import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Filter,
  Calendar,
  ShoppingCart,
  DollarSign,
  X,
} from "lucide-react";
import OrderForm from "../components/OrderForm";
import Modal from "../components/Modal";

interface Client {
  id: number;
  nom: string;
  typeClient: "EPICERIE" | "PARTICULIER";
  telephone: string;
  email: string;
  adresse: string;
}

interface Produit {
  id: number;
  nom: string;
  prixUnitaire: number;
  categorie: "CHIPS" | "SNACK";
  stockDisponible: number;
}

interface DetailCommande {
  id: number;
  produit: Produit;
  quantite: number;
  prixTotal: number;
}

interface Commande {
  id: number;
  client: Client;
  dateCommande: string;
  statut: "EN_ATTENTE" | "PAYEE" | "LIVREE" | "ANNULEE";
  details: DetailCommande[];
}

const baseUrl = import.meta.env.VITE_API_URL;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Commande[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Commande | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const token = localStorage.getItem("token");

  // 🔹 Récupération initiale
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${baseUrl}/api/commandes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur de chargement");
        return res.json();
      })
      .then((data: Commande[]) => {
        setOrders(data);
      })
      .catch((err) => console.error("Erreur fetch commandes:", err))
      .finally(() => setLoading(false));
  }, [token]);

  const openCreateModal = () => {
    setEditingOrder(null);
    setIsModalOpen(true);
  };

  const openEditModal = (order: Commande) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  };

  // 🔹 Créer une commande
  const handleCreate = async (newOrder: Omit<Commande, "id">) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/commandes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newOrder),
      });
      const saved = await res.json();
      setOrders([...orders, saved]);
    } catch (err) {
      console.error("Erreur création commande:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Modifier une commande
  const handleUpdate = async (id: number, updatedOrder: Partial<Commande>) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/commandes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedOrder),
      });
      const saved = await res.json();
      setOrders(orders.map((o) => (o.id === id ? saved : o)));
    } catch (err) {
      console.error("Erreur modification commande:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Supprimer une commande
  const handleDelete = async (id: number) => {
    if (!token) return;
    if (confirm("Voulez-vous vraiment supprimer cette commande ?")) {
      try {
        await fetch(`${baseUrl}/api/commandes/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(orders.filter((o) => o.id !== id));
      } catch (err) {
        console.error("Erreur suppression commande:", err);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAYEE":
        return "bg-green-100 text-green-800 border-green-200";
      case "LIVREE":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "EN_ATTENTE":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "ANNULEE":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAYEE":
        return <DollarSign size={14} className="mr-1" />;
      case "LIVREE":
        return <Package size={14} className="mr-1" />;
      case "EN_ATTENTE":
        return <ShoppingCart size={14} className="mr-1" />;
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm) ||
      order.client.telephone.includes(searchTerm);
    const matchesStatus = statusFilter === "" || order.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Commandes
          </h1>
          <p className="text-gray-600">Gérez toutes les commandes clients</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors shadow-sm hover:shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          <Plus size={20} className="mr-2" />
          {loading ? "Chargement..." : "Nouvelle commande"}
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Rechercher par client, ID ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Desktop Filter */}
          <div className="hidden lg:flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors min-w-[160px]"
            >
              <option value="">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="PAYEE">Payée</option>
              <option value="LIVREE">Livrée</option>
              <option value="ANNULEE">Annulée</option>
            </select>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Filter size={20} className="mr-2 text-gray-400" />
            <span>Filtrer</span>
          </button>
        </div>

        {/* Mobile Filter Panel */}
        {isMobileFilterOpen && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filtrer les commandes</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setIsMobileFilterOpen(false);
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 mb-4"
              >
                <option value="">Tous les statuts</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="PAYEE">Payée</option>
                <option value="LIVREE">Livrée</option>
                <option value="ANNULEE">Annulée</option>
              </select>
              <button
                onClick={() => {
                  setStatusFilter("");
                  setIsMobileFilterOpen(false);
                }}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Liste des commandes */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Package size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune commande trouvée
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter
              ? "Aucune commande ne correspond à vos critères de recherche."
              : "Vous n'avez pas encore de commandes."}
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Créer votre première commande
          </button>
        </div>
      ) : (
        <div className="grid gap-4 lg:gap-6">
          {filteredOrders.map((order) => {
            const total =
              order.details?.reduce((sum, d) => sum + (d.prixTotal || 0), 0) ??
              0;
            const totalUnits =
              order.details?.reduce(
                (sum, d) => sum + (Number(d.quantite) || 0),
                0
              ) ?? 0;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 lg:mb-6">
                  <div className="flex items-center mb-3 lg:mb-0">
                    <div className="p-2 bg-amber-100 rounded-xl mr-3">
                      <Package size={20} className="text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        Commande #{order.id}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {order.client.nom}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end lg:gap-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        order.statut
                      )}`}
                    >
                      {getStatusIcon(order.statut)}
                      {order.statut.replace("_", " ")}
                    </span>

                    {/* Mobile Actions */}
                    <div className="lg:hidden flex gap-2">
                      <button
                        onClick={() => openEditModal(order)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Modifier"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 mb-4 lg:mb-6">
                  <div className="flex items-center">
                    <Calendar size={16} className="text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-medium text-sm">
                        {formatDate(order.dateCommande)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Package size={16} className="text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Articles</p>
                      <p className="font-medium text-sm">
                        {totalUnits} produit(s)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <DollarSign size={16} className="text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="font-bold text-gray-900 text-lg">
                        {total.toLocaleString()} Ar
                      </p>
                    </div>
                  </div>

                  {/* Desktop Actions */}
                  <div className="hidden lg:flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(order)}
                      className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                      disabled={loading}
                    >
                      <Edit size={14} className="mr-1" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      disabled={loading}
                    >
                      <Trash2 size={14} className="mr-1" />
                      Supprimer
                    </button>
                  </div>
                </div>

                {/* Items de la commande */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Articles commandés:
                  </p>
                  <div className="space-y-2">
                    {order.details.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {item.produit.nom}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.quantite} ×{" "}
                            {item.produit.prixUnitaire.toLocaleString()} Ar
                          </p>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {item.prixTotal.toLocaleString()} Ar
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal avec OrderForm */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingOrder(null);
        }}
        title={editingOrder ? "Modifier la commande" : "Nouvelle commande"}
        size="lg"
      >
        <OrderForm
          order={editingOrder}
          onSave={async (data) => {
            if (editingOrder) {
              await handleUpdate(editingOrder.id, data);
            } else {
              await handleCreate(data);
            }
            setIsModalOpen(false);
          }}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingOrder(null);
          }}
        />
      </Modal>
    </div>
  );
}
