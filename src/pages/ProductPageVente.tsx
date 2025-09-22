import { useState, useEffect } from "react";
import {
  Search,
  Package,
  Filter,
  BarChart3,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import Loader from "../components/Loader";

interface Product {
  id: number;
  nom: string;
  description?: string;
  categorie: "CHIPS" | "SNACK";
  prixUnitaire: number;
  stockDisponible: number;
}

const baseUrl = import.meta.env.VITE_API_URL;

export default function ProductsPageVente() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("TOUTES");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  } | null>(null);

  // Récupération initiale
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${baseUrl}/api/produits`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erreur API produits");
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Erreur lors du fetch des produits:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Tri des produits
  const handleSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Icône de tri
  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ChevronDown size={14} className="opacity-50" />;
    }
    return sortConfig.direction === "ascending" ? (
      <ChevronUp size={14} />
    ) : (
      <ChevronDown size={14} />
    );
  };

  // Filtrage
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false);

    const matchesCategory =
      filterCategory === "TOUTES" || product.categorie === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // Tri final
  const sortedProducts = [...filteredProducts];
  if (sortConfig !== null) {
    sortedProducts.sort((a, b) => {
      if (
        a[sortConfig.key as keyof Product] < b[sortConfig.key as keyof Product]
      ) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (
        a[sortConfig.key as keyof Product] > b[sortConfig.key as keyof Product]
      ) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }

  // Statistiques
  const totalProducts = products.length;
  const lowStockProducts = products.filter(
    (p) => p.stockDisponible <= 20
  ).length;
  const optimalStockProducts = totalProducts - lowStockProducts;

  const app_name = import.meta.env.VITE_APP_NAME;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Catalogue Produits
            </h1>
            <p className="text-gray-600 text-lg">
              Liste des produits disponibles {app_name}
            </p>
          </div>

          <button
            onClick={fetchProducts}
            className="group inline-flex items-center justify-center px-5 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg font-medium border border-gray-200"
          >
            <RefreshCw
              size={18}
              className="mr-2 transform transition-transform duration-300 group-hover:rotate-180"
            />
            Actualiser
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md hover:border-blue-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl mr-4 shadow-inner">
                <Package size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Total produits
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalProducts}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">Mise à jour récente</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md hover:border-red-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-xl mr-4 shadow-inner">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Stock faible
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {lowStockProducts}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">Nécessite attention</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md hover:border-green-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl mr-4 shadow-inner">
                <TrendingUp size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Stock optimal
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {optimalStockProducts}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">Bien approvisionné</p>
            </div>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 transition-all duration-300 hover:shadow-md">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Rechercher un produit par nom, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl">
              <Filter size={20} className="text-gray-500 ml-1" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 bg-transparent border-0 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors w-full"
              >
                <option value="TOUTES">Toutes les catégories</option>
                <option value="CHIPS">Chips</option>
                <option value="SNACK">Snacks</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-4 text-gray-600">Chargement des produits...</p>
            </div>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-gray-200 mb-4">
              <Package size={64} className="mx-auto opacity-50" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {searchTerm || filterCategory !== "TOUTES"
                ? "Aucun produit trouvé"
                : "Aucun produit enregistré"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || filterCategory !== "TOUTES"
                ? "Aucun produit ne correspond à vos critères de recherche. Essayez d'autres termes ou réinitialisez les filtres."
                : "Le catalogue est vide pour le moment."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group hover:border-amber-100 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-50 to-orange-50 rounded-bl-2xl transform translate-x-6 -translate-y-6 rotate-45 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="flex items-start mb-5 relative z-10">
                  <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl mr-4 shadow-inner">
                    <Package size={24} className="text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg truncate">
                      {product.nom}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 border ${
                        product.categorie === "CHIPS"
                          ? "bg-orange-50 text-orange-700 border-orange-200"
                          : "bg-purple-50 text-purple-700 border-purple-200"
                      }`}
                    >
                      {product.categorie}
                    </span>
                  </div>
                </div>

                {product.description && (
                  <p className="text-gray-600 text-sm mb-5 line-clamp-2 relative z-10">
                    {product.description}
                  </p>
                )}

                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Prix unitaire</span>
                    <span className="font-bold text-lg text-green-600">
                      {product.prixUnitaire.toLocaleString()} Ar
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">
                      Stock disponible
                    </span>
                    <span
                      className={`font-semibold ${
                        product.stockDisponible <= 20
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {product.stockDisponible} unités
                    </span>
                  </div>
                  {/* Barre de progression pour le stock */}
                  <div className="pt-2">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          product.stockDisponible <= 20
                            ? "bg-red-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (product.stockDisponible / 100) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
