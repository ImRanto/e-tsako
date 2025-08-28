import { useState, useEffect } from "react";
import { Plus, Search, AlertTriangle, Package } from "lucide-react";
import Modal from "../components/Modal";
import StockForm, { StockData } from "../components/StockForm";

const baseUrl = import.meta.env.VITE_API_URL;

export default function StockPage() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<StockData | null>(null);

  const token = localStorage.getItem("token");

  // Fetch des stocks
  const fetchStocks = async () => {
    if (!token) return alert("Utilisateur non authentifié !");
    try {
      const res = await fetch(`${baseUrl}/api/stocks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Erreur API (${res.status})`);
      const data: StockData[] = await res.json();
      setStocks(data);
    } catch (err) {
      console.error("Erreur fetch stocks:", err);
      alert("Erreur lors de la récupération des stocks.");
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  // Sauvegarde (création ou modification)
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

      // ✅ Toujours recharger les stocks après une sauvegarde
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

  const filteredStocks = stocks.filter((s) =>
    s.nomMatiere.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = filteredStocks.filter(
    (s) => s.quantite <= s.seuilAlerte
  );
  const normalStockItems = filteredStocks.filter(
    (s) => s.quantite > s.seuilAlerte
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des Stocks
          </h1>
          <p className="text-gray-600">
            Suivi des matières premières et fournitures
          </p>
        </div>
        <button
          onClick={() => {
            setEditingStock(null);
            setIsModalOpen(true);
          }}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
        >
          <Plus size={20} className="mr-2" />
          Ajouter matière
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Rechercher une matière..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Low Stock */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="text-red-500 mr-2" size={24} />
            <h3 className="text-lg font-semibold text-red-800">
              Alertes Stock - {lowStockItems.length} article(s) en rupture
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockItems.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-red-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{s.nomMatiere}</h4>
                  <AlertTriangle size={16} className="text-red-500" />
                </div>
                <p className="text-sm text-gray-600">
                  Stock:{" "}
                  <span className="font-semibold text-red-600">
                    {s.quantite} {s.unite}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Seuil: {s.seuilAlerte} {s.unite}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {normalStockItems.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package size={20} className="text-green-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">
                    {s.nomMatiere}
                  </h3>
                  <p className="text-sm text-gray-500">En stock</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Quantité disponible</span>
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

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setEditingStock(s);
                  setIsModalOpen(false);
                  setTimeout(() => setIsModalOpen(true), 0); // réinitialisation
                }}
                className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(s.id)}
                className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded-lg hover:bg-red-200 transition-colors text-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStock ? "Modifier Matière" : "Nouvelle Matière"}
      >
        <StockForm
          stock={editingStock}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
