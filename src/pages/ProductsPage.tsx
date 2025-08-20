import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
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

  // Fetch des produits depuis l'API au chargement
  useEffect(() => {
    fetch(`${baseUrl}/api/produits`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Erreur lors du fetch des produits:", err));
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categorie.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (productData: Omit<Product, "id">) => {
    try {
      let savedProduct: Product;

      if (editingProduct) {
        // PUT vers backend
        const res = await fetch(
          `${baseUrl}/api/produits/${editingProduct.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData),
          }
        );
        savedProduct = await res.json();

        setProducts(
          products.map((p) => (p.id === editingProduct.id ? savedProduct : p))
        );
      } else {
        // POST vers backend
        const res = await fetch(`${baseUrl}/api/produits`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
        savedProduct = await res.json();

        // ⚡ Utilise l'ID venant de la base
        setProducts([...products, savedProduct]);
      }

      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde :", err);
      alert("Échec de la sauvegarde du produit");
    }
  };


  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        await fetch(`${baseUrl}/api/produits/${id}`, { method: "DELETE" });
        setProducts(products.filter((p) => p.id !== id));
      } catch (err) {
        console.error("Erreur suppression :", err);
        alert("Impossible de supprimer ce produit");
      }
    }
  };


  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Produits</h1>
          <p className="text-gray-600">
            Gérez votre catalogue de produits MadaChips
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
        >
          <Plus size={20} className="mr-2" />
          Nouveau produit
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Package size={20} className="text-amber-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">
                      {product.nom}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        product.categorie === "CHIPS"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {product.categorie}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">
                {product.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {product.prixUnitaire.toLocaleString()} Ar
                  </p>
                  <p className="text-sm text-gray-500">Prix unitaire</p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      product.stockDisponible <= 20
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {product.stockDisponible}
                  </p>
                  <p className="text-sm text-gray-500">En stock</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(product)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Edit size={16} className="mr-1" />
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 size={16} className="mr-1" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Modifier le produit" : "Nouveau produit"}
      >
        <ProductForm
          product={editingProduct}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
