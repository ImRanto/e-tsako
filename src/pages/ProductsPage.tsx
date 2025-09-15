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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Modal from "../components/Modal";
import ProductForm from "../components/ProductForm";

interface Product {
  id: number;
  nom: string;
  description?: string;
  categorie: "CHIPS" | "SNACK";
  prixUnitaire: number;
  stockDisponible: number;
}

const baseUrl = import.meta.env.VITE_API_URL;

export default function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("TOUTES");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  } | null>(null);

  // 🔹 Récupération initiale
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

  // 🔹 Sauvegarde produit (create ou update)
  const handleSave = async (productData: Omit<Product, "id">) => {
    try {
      const token = localStorage.getItem("token");
      let savedProduct: Product;

      if (editingProduct) {
        // PUT vers backend
        const res = await fetch(
          `${baseUrl}/api/produits/${editingProduct.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(productData),
          }
        );
        if (!res.ok) throw new Error("Erreur modification produit");
        savedProduct = await res.json();

        setProducts(
          products.map((p) => (p.id === editingProduct.id ? savedProduct : p))
        );
      } else {
        // POST vers backend
        const res = await fetch(`${baseUrl}/api/produits`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(productData),
        });
        if (!res.ok) throw new Error("Erreur création produit");
        savedProduct = await res.json();

        setProducts([...products, savedProduct]);
      }

      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde :", err);
      alert("Échec de la sauvegarde du produit");
    }
  };

  // 🔹 Suppression produit
  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        const token = localStorage.getItem("token");
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

  // 🔹 Tri des produits
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

  // 🔹 Icône de tri
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

  // 🔹 Filtrage et tri des produits
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false);

    const matchesCategory =
      filterCategory === "TOUTES" || product.categorie === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // 🔹 Tri des produits
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
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Catalogue Produits
            </h1>
            <p className="text-gray-600">
              Gérez votre catalogue de produits {app_name}
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 lg:mt-0 inline-flex items-center justify-center px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg font-medium"
          >
            <Plus size={20} className="mr-2" />
            Nouveau produit
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
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
              <div className="p-3 bg-green-100 rounded-xl mr-4">
                <TrendingUp size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Valeur stock</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalStockValue.toLocaleString()} Ar
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
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des produits...</p>
            </div>
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
            <p className="text-gray-600 mb-4">
              {searchTerm || filterCategory !== "TOUTES"
                ? "Aucun produit ne correspond à vos critères de recherche."
                : "Commencez par ajouter votre premier produit."}
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Ajouter un produit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center">
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
                </div>

                {product.description && (
                  <p className="text-gray-600 text-sm mb-5 line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="space-y-3 mb-5">
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
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Valeur stock</span>
                    <span className="font-medium text-gray-900">
                      {(
                        product.prixUnitaire * product.stockDisponible
                      ).toLocaleString()}{" "}
                      Ar
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(product)}
                    className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    <Edit size={14} className="mr-1" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
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
