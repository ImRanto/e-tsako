import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  AlertTriangle,
  Package,
  Edit,
  Trash2,
  Filter,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import Modal from "../components/Modal";
import StockForm, { StockData } from "../components/StockForm";

const baseUrl = import.meta.env.VITE_API_URL;

export default function StockPage() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("TOUTES");

  const token = localStorage.getItem("token");

  // Fetch des stocks
  const fetchStocks = async () => {
    if (!token) return alert("Utilisateur non authentifié !");
    try {
      setIsLoading(true);
      const res = await fetch(`${baseUrl}/api/stocks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Erreur API (${res.status})`);
      const data: StockData[] = await res.json();
      setStocks(data);
    } catch (err) {
      console.error("Erreur fetch stocks:", err);
      alert("Erreur lors de la récupération des stocks.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  // Sauvegarde (création ou modification)
  const handleSave = async (stockData: Omit<StockData, "id">) => {
    if (!token) return alert("Utilisateur non authentifié !");
    try {
      let res: Response;

      if (editingStock?.id) {
        // Modification
        res = await fetch(`${baseUrl}/api/stocks/${editingStock.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(stockData),
        });

        if (!res.ok) throw new Error(`Erreur API (${res.status})`);
      } else {
        // Création
        res = await fetch(`${baseUrl}/api/stocks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(stockData),
        });

        if (!res.ok) throw new Error(`Erreur API (${res.status})`);
      }

      // Recharger les stocks après une sauvegarde
      await fetchStocks();

      // Fermer modal et reset
      setIsModalOpen(false);
      setEditingStock(null);
    } catch (err) {
      console.error("Erreur sauvegarde stock:", err);
      alert("Erreur lors de l'enregistrement du stock.");
    }
  };

  // Suppression
  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce stock ?")) return;
    if (!token) return alert("Utilisateur non authentifié !");
    try {
      const res = await fetch(`${baseUrl}/api/stocks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Erreur API (${res.status})`);
      setStocks((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Erreur suppression stock:", err);
      alert("Erreur lors de la suppression du stock.");
    }
  };

  // Filtrer les stocks
  const filteredStocks = stocks.filter(
    (s) =>
      s.nomMatiere.toLowerCase().includes(searchTerm.toLowerCase()) &&
      filterCategory === "TOUTES"
  );

  const lowStockItems = filteredStocks.filter(
    (s) => s.quantite <= s.seuilAlerte
  );
  const normalStockItems = filteredStocks.filter(
    (s) => s.quantite > s.seuilAlerte
  );

  // Calculer les statistiques
  const totalItems = stocks.length;
  const lowStockCount = lowStockItems.length;
  const stockValue = stocks.reduce((sum, item) => sum + item.quantite, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Gestion des Stocks
            </h1>
            <p className="text-gray-600">
              Suivi des matières premières et fournitures en temps réel
            </p>
          </div>
          <button
            onClick={() => {
              setEditingStock(null);
              setIsModalOpen(true);
            }}
            className="mt-4 lg:mt-0 inline-flex items-center justify-center px-5 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors shadow-sm hover:shadow-md font-medium"
          >
            <Plus size={20} className="mr-2" />
            Nouvelle matière
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl mr-4">
                <Package size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total des articles</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-xl mr-4">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Alertes stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {lowStockCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Rechercher une matière..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des stocks...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
                <div className="flex items-center mb-5">
                  <AlertTriangle className="text-red-500 mr-3" size={24} />
                  <h3 className="text-lg font-semibold text-red-800">
                    Alertes Stock - {lowStockItems.length} article(s) en rupture
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lowStockItems.map((s) => (
                    <div
                      key={s.id}
                      className="bg-white border border-red-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">
                          {s.nomMatiere}
                        </h4>
                        <AlertTriangle size={18} className="text-red-500" />
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                          Stock:{" "}
                          <span className="font-semibold text-red-600">
                            {s.quantite} {s.unite}
                          </span>
                        </p>
                        <p className="text-gray-600">
                          Seuil: {s.seuilAlerte} {s.unite}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => {
                            setEditingStock(s);
                            setIsModalOpen(true);
                          }}
                          className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center"
                        >
                          <Edit size={14} className="mr-1" />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="flex-1 bg-red-50 text-red-700 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Grid */}
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 size={20} className="mr-2 text-gray-400" />
                Stock normal ({normalStockItems.length})
              </h3>
            </div>

            {normalStockItems.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <Package size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun stock trouvé
                </h3>
                <p className="text-gray-600">
                  {searchTerm || filterCategory !== "TOUTES"
                    ? "Aucun stock ne correspond à vos critères de recherche."
                    : "Vous n'avez pas encore de stock normal."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {normalStockItems.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-xl mr-4">
                          <Package size={20} className="text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {s.nomMatiere}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-5">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          Quantité disponible
                        </span>
                        <span className="font-bold text-lg text-green-600">
                          {s.quantite} {s.unite}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Seuil d'alerte</span>
                        <span className="text-gray-900">
                          {s.seuilAlerte} {s.unite}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingStock(s);
                          setIsModalOpen(true);
                        }}
                        className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center"
                      >
                        <Edit size={14} className="mr-1" />
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="flex-1 bg-red-50 text-red-700 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center"
                      >
                        <Trash2 size={14} className="mr-1" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingStock(null);
          }}
          title={editingStock ? "Modifier la matière" : "Nouvelle matière"}
          size="lg"
        >
          <StockForm
            stock={editingStock}
            onSave={handleSave}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingStock(null);
            }}
          />
        </Modal>
      </div>
    </div>
  );
}
