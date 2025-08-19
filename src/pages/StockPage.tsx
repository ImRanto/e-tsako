import { useState, useEffect } from "react";
import { Plus, Search, AlertTriangle, Package } from "lucide-react";

interface Stock {
  id: number;
  nomMatiere: string;
  quantite: number;
  unite: string;
  seuilAlerte: number;
}

const baseUrl = import.meta.env.VITE_API_URL;

export default function StockPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stocks, setStocks] = useState<Stock[]>([]);

  // Charger les stocks depuis l'API backend
  useEffect(() => {
    fetch(`${baseUrl}/api/stocks`)
      .then((res) => res.json())
      .then((data: Stock[]) => setStocks(data))
      .catch((err) => console.error("Erreur fetch stocks:", err));
  }, []);

  const filteredStocks = stocks.filter((stock) =>
    stock.nomMatiere.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = filteredStocks.filter(
    (stock) => stock.quantite <= stock.seuilAlerte
  );
  const normalStockItems = filteredStocks.filter(
    (stock) => stock.quantite > stock.seuilAlerte
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des Stocks
          </h1>
          <p className="text-gray-600">
            Suivi des matières premières et fournitures
          </p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm">
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

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="text-red-500 mr-2" size={24} />
            <h3 className="text-lg font-semibold text-red-800">
              Alertes Stock - {lowStockItems.length} article(s) en rupture
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockItems.map((stock) => (
              <div
                key={stock.id}
                className="bg-white border border-red-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {stock.nomMatiere}
                  </h4>
                  <AlertTriangle size={16} className="text-red-500" />
                </div>
                <div className="text-sm text-gray-600">
                  <p>
                    Stock:{" "}
                    <span className="font-semibold text-red-600">
                      {stock.quantite} {stock.unite}
                    </span>
                  </p>
                  <p>
                    Seuil: {stock.seuilAlerte} {stock.unite}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {normalStockItems.map((stock) => (
          <div
            key={stock.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package size={20} className="text-green-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">
                    {stock.nomMatiere}
                  </h3>
                  <p className="text-sm text-gray-500">En stock</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Quantité disponible</span>
                <span className="font-bold text-lg text-green-600">
                  {stock.quantite} {stock.unite}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Seuil d'alerte</span>
                <span className="text-gray-900">
                  {stock.seuilAlerte} {stock.unite}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>0</span>
                  <span>
                    {stock.seuilAlerte * 2} {stock.unite}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      stock.quantite > stock.seuilAlerte
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        (stock.quantite / (stock.seuilAlerte * 2)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                Réapprovisionner
              </button>
              <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                Modifier
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
