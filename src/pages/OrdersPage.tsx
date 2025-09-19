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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import OrderForm from "../components/OrderForm";
import Modal from "../components/Modal";
import { jwtDecode } from "jwt-decode";
import Loader from "../components/Loader";

interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
  iat: number;
}
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

interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  role: string;
  email: string;
}

interface Commande {
  id: number;
  client: Client;
  dateCommande: string;
  statut: "EN_ATTENTE" | "PAYEE" | "LIVREE" | "ANNULEE";
  details: DetailCommande[];
  createdBy: Utilisateur;
  updatedBy: Utilisateur | null;
}

interface ApiResponse {
  content: Commande[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

const baseUrl = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 10;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Commande[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Commande | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  // const [userInfo, setUserInfo] = useState<DecodedToken | null>(null);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!token) return;
    fetchOrders(currentPage);
  }, [token, role, currentPage]);

  const fetchOrders = async (page: number) => {
    if (!token) return;
    setLoading(true);
    // console.log(userInfo);
    const decoded: DecodedToken = jwtDecode(token);
    // console.log("Utilisateur connecté ato am order:", decoded);
    // setUserInfo(decoded);

    try {
      const endpoint =
        decoded.role === "ADMIN"
          ? `${baseUrl}/api/commandes/paged?page=${page}&size=${ITEMS_PER_PAGE}`
          : `${baseUrl}/api/commandes/mes-commandes2?page=${page}&size=${ITEMS_PER_PAGE}`;

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Erreur de chargement");

      const data: ApiResponse = await response.json();

      setOrders(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setCurrentPage(data.number);
    } catch (err) {
      console.error("Erreur fetch commandes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrage côté client (optionnel, selon les besoins)
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm) ||
      order.client.telephone.includes(searchTerm);
    const matchesStatus = statusFilter === "" || order.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

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
      // Recharger les données après création
      fetchOrders(currentPage);
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
      // Recharger les données après modification
      fetchOrders(currentPage);
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
        // Recharger les données après suppression
        fetchOrders(currentPage);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
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

      {/* Info de pagination */}
      {!loading && orders.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            Affichage de {currentPage * ITEMS_PER_PAGE + 1} à{" "}
            {Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalElements)} sur{" "}
            {totalElements} commande(s)
          </p>
        </div>
      )}

      {/* Liste des commandes */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : orders.length === 0 ? (
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
        <>
          <div className="grid gap-4 lg:gap-6">
            {orders.map((order) => {
              const total =
                order.details?.reduce(
                  (sum, d) => sum + (d.prixTotal || 0),
                  0
                ) ?? 0;
              const totalUnits =
                order.details?.reduce(
                  (sum, d) => sum + (Number(d.quantite) || 0),
                  0
                ) ?? 0;

              const isEditable =
                order.statut !== "LIVREE" && order.statut !== "ANNULEE";

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
                        {order.createdBy && (
                          <p className="text-xs text-gray-400 mt-1">
                            Créée par: {order.createdBy.prenom}{" "}
                            {order.createdBy.nom}
                          </p>
                        )}
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
                          className={`p-2 rounded-lg transition-colors ${
                            isEditable
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                          title="Modifier"
                          disabled={!isEditable}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            isEditable
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                          title="Supprimer"
                          disabled={!isEditable}
                        >
                          <Trash2 size={18} />
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
                        className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                          isEditable
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                        title="Modifier"
                        disabled={!isEditable}
                      >
                        <Edit size={16} className="mr-1" />
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                          isEditable
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                        title="Supprimer"
                        disabled={!isEditable}
                      >
                        <Trash2 size={16} className="mr-1" />
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
              <p className="text-sm text-gray-600">
                Page {currentPage + 1} sur {totalPages}
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="flex items-center px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Précédent
                </button>

                <div className="flex items-center gap-1 mx-2">
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${
                        currentPage === page
                          ? "bg-amber-500 text-white border-amber-500"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {page + 1}
                    </button>
                  ))}

                  {totalPages > getPageNumbers().length &&
                    getPageNumbers()[getPageNumbers().length - 1] <
                      totalPages - 1 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="flex items-center px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          )}
        </>
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
