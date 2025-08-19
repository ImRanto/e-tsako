import { useState, useEffect } from "react";
import ProductForm from "./ProductForm";

interface Product {
  id: number;
  nom: string;
  prixUnitaire: number;
  categorie: "CHIPS" | "SNACK";
  stockDisponible: number;
}

const baseUrl = import.meta.env.VITE_API_URL;

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch initial products
  useEffect(() => {
    fetch(`${baseUrl}/api/produits`)
      .then((res) => res.json())
      .then(setProducts)
      .catch((err) => console.error("Erreur fetch produits:", err));
  }, []);

  const handleSave = (product: Omit<Product, "id">) => {
    if (editing) {
      // PUT update
      fetch(`${baseUrl}/api/produits/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      })
        .then((res) => res.json())
        .then((updated) => {
          setProducts((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p))
          );
          setEditing(null);
          setShowForm(false);
        });
    } else {
      // POST create
      fetch(`${baseUrl}/api/produits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      })
        .then((res) => res.json())
        .then((newProduct) => {
          setProducts((prev) => [...prev, newProduct]);
          setShowForm(false);
        });
    }
  };

  const handleDelete = (id: number) => {
    fetch(`${baseUrl}/api/produits/${id}`, {
      method: "DELETE",
    }).then(() => {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Produits</h2>

      {showForm ? (
        <ProductForm
          product={editing}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mb-4 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600"
        >
          Ajouter un produit
        </button>
      )}

      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2">Nom</th>
            <th className="border px-3 py-2">Catégorie</th>
            <th className="border px-3 py-2">Prix unitaire</th>
            <th className="border px-3 py-2">Stock</th>
            <th className="border px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td className="border px-3 py-2">{p.nom}</td>
              <td className="border px-3 py-2">{p.categorie}</td>
              <td className="border px-3 py-2">{p.prixUnitaire} Ar</td>
              <td className="border px-3 py-2">{p.stockDisponible}</td>
              <td className="border px-3 py-2 flex gap-2">
                <button
                  onClick={() => {
                    setEditing(p);
                    setShowForm(true);
                  }}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
