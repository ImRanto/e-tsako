import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Filter,
  TrendingUp,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import Modal from "../components/Modal";
import ProductForm from "../components/ProductForm";
import Loader from "../components/Loader";

interface Product {
  id: number;
  nom: string;
  description?: string;
  categorie: "CHIPS" | "SNACK" | "AUTRE";
  prixUnitaire: number;
  stockDisponible: number;
  imageData?: string;
  imageType?: string;
}

const baseUrl = import.meta.env.VITE_API_URL;

export default function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("TOUTES");

  // 🔹 Récupération initiale
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

  // 🔹 CORRECTION : Sauvegarde produit - juste mise à jour de l'état local
  const handleSave = async (savedProduct: Product) => {
    try {
      if (editingProduct) {
        // Mise à jour d'un produit existant
        setProducts(
          products.map((p) => (p.id === editingProduct.id ? savedProduct : p))
        );
      } else {
        // Ajout d'un nouveau produit
        setProducts([...products, savedProduct]);
      }

      setIsModalOpen(false);
      setEditingProduct(null);

      // Optionnel : rafraîchir les données pour être sûr
      // fetchProducts();
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'état:", err);
    }
  };

  // 🔹 Suppression produit
  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(`${baseUrl}/api/produits/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Erreur suppression produit");
        setProducts(products.filter((p) => p.id !== id));
      } catch (err) {
        console.error("Erreur suppression :", err);
        alert("Impossible de supprimer ce produit");
      }
    }
  };

  // 🔹 Filtrage des produits
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false);

    const matchesCategory =
      filterCategory === "TOUTES" || product.categorie === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // 🔹 Statistiques
  const totalProducts = products.length;
  const totalStockValue = products.reduce(
    (sum, product) => sum + product.prixUnitaire * product.stockDisponible,
    0
  );
  const lowStockProducts = products.filter(
    (p) => p.stockDisponible <= 20
  ).length;

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

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
              Gérez votre catalogue de produits {app_name}
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="group relative inline-flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl font-medium overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
            <Plus size={20} className="mr-2 relative z-10" />
            <span className="relative z-10">Nouveau produit</span>
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md hover:border-amber-100">
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
                <BarChart3 size={24} className="text-red-600" />
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
                  En stock optimal
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {totalProducts - lowStockProducts}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Produits bien approvisionnés
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
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
                <option value="AUTRE">Autre</option>
              </select>
            </div>

            <button
              onClick={fetchProducts}
              className="inline-flex items-center justify-center px-5 py-3.5 border border-gray-200 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
              title="Actualiser"
            >
              <RefreshCw
                size={20}
                className="transform transition-transform duration-300 hover:rotate-180"
              />
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader />
          </div>
        ) : filteredProducts.length === 0 ? (
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
                : "Commencez par ajouter votre premier produit à votre catalogue."}
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
            >
              <Plus size={16} className="mr-2" />
              Ajouter un produit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group hover:border-amber-100 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-50 to-orange-50 rounded-bl-2xl transform translate-x-6 -translate-y-6 rotate-45 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Aperçu de l'image si disponible */}
                {product.imageData && product.imageType && (
                  <div className="mb-4 relative z-10">
                    <img
                      src={`data:${product.imageType};base64,${product.imageData}`}
                      alt={product.nom}
                      className="w-full h-32 object-cover rounded-xl border border-gray-200"
                    />
                  </div>
                )}

                <div className="flex items-start justify-between mb-5 relative z-10">
                  <div className="flex items-center">
                    {!product.imageData && (
                      <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl mr-4 shadow-inner">
                        <Package size={24} className="text-amber-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg truncate max-w-[160px]">
                        {product.nom}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 border ${
                          product.categorie === "CHIPS"
                            ? "bg-orange-50 text-orange-700 border-orange-200"
                            : product.categorie === "SNACK"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                      >
                        {product.categorie}
                      </span>
                    </div>
                  </div>
                </div>

                {product.description && (
                  <p className="text-gray-600 text-sm mb-5 line-clamp-2 relative z-10">
                    {product.description}
                  </p>
                )}

                <div className="space-y-3 mb-5 relative z-10">
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

                <div className="flex gap-3 relative z-10">
                  <button
                    onClick={() => openEditModal(product)}
                    className="flex-1 bg-blue-50 text-blue-700 py-2.5 px-3 rounded-lg hover:bg-blue-100 transition-all duration-300 text-sm font-medium flex items-center justify-center shadow-sm hover:shadow-md border border-blue-100"
                  >
                    <Edit size={14} className="mr-1.5" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 bg-red-50 text-red-700 py-2.5 px-3 rounded-lg hover:bg-red-100 transition-all duration-300 text-sm font-medium flex items-center justify-center shadow-sm hover:shadow-md border border-red-100"
                  >
                    <Trash2 size={14} className="mr-1.5" />
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          title={editingProduct ? "Modifier le produit" : "Nouveau produit"}
          size="lg"
        >
          <ProductForm
            product={editingProduct}
            onSave={handleSave}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingProduct(null);
            }}
          />
        </Modal>
      </div>
    </div>
  );
}
