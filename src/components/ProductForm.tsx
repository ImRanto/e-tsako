// src/components/ProductForm.tsx
import { useEffect, useState } from "react";

interface Product {
  id: number;
  nom: string;
  categorie: "CHIPS" | "SNACK";
  prixUnitaire: number;
  stockDisponible: number;
}

interface ProductFormProps {
  product: Product | null; // null => création, sinon édition
  onSave: (saved: Product) => void; // renvoie l'objet sauvegardé du backend
  onCancel: () => void;
}

const baseUrl = import.meta.env.VITE_API_URL;

export default function ProductForm({
  product,
  onSave,
  onCancel,
}: ProductFormProps) {
  const [nom, setNom] = useState("");
  const [categorie, setCategorie] = useState<"CHIPS" | "SNACK">("CHIPS");
  const [prixUnitaire, setPrixUnitaire] = useState<number>(0);
  const [stockDisponible, setStockDisponible] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setNom(product.nom);
      setCategorie(product.categorie);
      setPrixUnitaire(product.prixUnitaire);
      setStockDisponible(product.stockDisponible);
    } else {
      // reset si on ouvre en mode création
      setNom("");
      setCategorie("CHIPS");
      setPrixUnitaire(0);
      setStockDisponible(0);
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || prixUnitaire <= 0) {
      alert("Veuillez renseigner le nom et un prix unitaire > 0.");
      return;
    }
    setLoading(true);
    try {
      const payload = { nom, categorie, prixUnitaire, stockDisponible };

      const url = product
        ? `${baseUrl}/api/produits/${product.id}`
        : `${baseUrl}/api/produits`;

      const res = await fetch(url, {
        method: product ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Erreur API (${res.status}) : ${txt || "inconnue"}`);
      }

      const saved: Product = await res.json();
      onSave(saved);
    } catch (err) {
      console.error(err);
      alert("Échec de l'enregistrement du produit. Vérifiez le backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nom */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nom *
        </label>
        <input
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder="Ex : Chips Voanjo"
        />
      </div>

      {/* Catégorie */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Catégorie *
        </label>
        <select
          value={categorie}
          onChange={(e) => setCategorie(e.target.value as "CHIPS" | "SNACK")}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          required
        >
          <option value="CHIPS">CHIPS</option>
          <option value="SNACK">SNACK</option>
        </select>
      </div>

      {/* Prix unitaire */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prix unitaire (Ar) *
        </label>
        <input
          type="number"
          value={prixUnitaire}
          onChange={(e) => setPrixUnitaire(Number(e.target.value))}
          min={1}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>

      {/* Stock disponible */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stock disponible *
        </label>
        <input
          type="number"
          value={stockDisponible}
          onChange={(e) => setStockDisponible(Number(e.target.value))}
          min={0}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
        >
          {loading ? "Enregistrement..." : product ? "Mettre à jour" : "Créer"}
        </button>
      </div>
    </form>
  );
}
