import { useState, useEffect } from "react";
import {
  Search,
  Package,
  Filter,
  BarChart3,
  RefreshCw,
  ChevronDown,
  ChevronUp,
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
      const token = localStorage.getItem("token");
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

  const app_name = import.meta.env.VITE_APP_NAME;

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Catalogue Produits
            </h1>
            <p className="text-gray-600">
              Liste des produits disponibles {app_name}
            </p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl mr-4">
                <Package size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total produits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalProducts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-xl mr-4">
                <BarChart3 size={24} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Stock faible</p>
                <p className="text-2xl font-bold text-red-600">
                  {lowStockProducts}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Rechercher un produit par nom ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
              >
                <option value="TOUTES">Toutes les catégories</option>
                <option value="CHIPS">Chips</option>
                <option value="SNACK">Snacks</option>
              </select>
            </div>

            <button
              onClick={fetchProducts}
              className="inline-flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              title="Actualiser"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Loader />
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="text-gray-300 mb-4">
              <Package size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterCategory !== "TOUTES"
                ? "Aucun produit trouvé"
                : "Aucun produit enregistré"}
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterCategory !== "TOUTES"
                ? "Aucun produit ne correspond à vos critères de recherche."
                : "Le catalogue est vide."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start mb-5">
                  <div className="p-3 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl mr-4">
                    <Package size={24} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {product.nom}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                        product.categorie === "CHIPS"
                          ? "bg-orange-100 text-orange-800 border border-orange-200"
                          : "bg-purple-100 text-purple-800 border border-purple-200"
                      }`}
                    >
                      {product.categorie}
                    </span>
                  </div>
                </div>

                {product.description && (
                  <p className="text-gray-600 text-sm mb-5 line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Prix unitaire</span>
                    <span className="font-bold text-lg text-green-600">
                      {product.prixUnitaire.toLocaleString()} Ar
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Stock disponible</span>
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
