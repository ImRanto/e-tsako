import { useState, useEffect } from "react";

export interface StockData {
  id?: number;
  nomMatiere: string;
  quantite: number;
  unite: string;
  seuilAlerte: number;
}

interface StockFormProps {
  stock: StockData | null;
  onSaved?: () => void; // callback après sauvegarde réussie
  onCancel: () => void;
}

export default function StockForm({
  stock,
  onSaved,
  onCancel,
}: StockFormProps) {
  const [nomMatiere, setNomMatiere] = useState("");
  const [quantite, setQuantite] = useState(0);
  const [unite, setUnite] = useState("kg");
  const [seuilAlerte, setSeuilAlerte] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const baseUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (stock) {
      setNomMatiere(stock.nomMatiere);
      setQuantite(stock.quantite);
      setUnite(stock.unite);
      setSeuilAlerte(stock.seuilAlerte);
    } else {
      setNomMatiere("");
      setQuantite(0);
      setUnite("kg");
      setSeuilAlerte(0);
    }
  }, [stock]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomMatiere || !unite || quantite < 0 || seuilAlerte < 0) {
      setError("Veuillez remplir correctement tous les champs !");
      return;
    }

    if (!token) {
      setError("Utilisateur non authentifié !");
      return;
    }

    setLoading(true);
    setError("");

    const payload: Omit<StockData, "id"> = {
      nomMatiere: nomMatiere.trim(),
      quantite,
      unite: unite.trim().toUpperCase(),
      seuilAlerte,
    };

    try {
      const url = stock
        ? `${baseUrl}/api/stocks/${stock.id}`
        : `${baseUrl}/api/stocks`;
      const method = stock ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erreur lors de la sauvegarde du stock");
      }

      onSaved?.(); // callback pour fermer le modal et rafraîchir la liste
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="text-red-600">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nom de la matière
        </label>
        <input
          type="text"
          value={nomMatiere}
          onChange={(e) => setNomMatiere(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantité
          </label>
          <input
            type="number"
            value={quantite}
            onChange={(e) => setQuantite(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            min={0}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unité
          </label>
          <input
            type="text"
            value={unite}
            onChange={(e) => setUnite(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Seuil d'alerte
        </label>
        <input
          type="number"
          value={seuilAlerte}
          onChange={(e) => setSeuilAlerte(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          min={0}
        />
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          disabled={loading}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          disabled={loading}
        >
          {stock ? "Modifier" : "Créer"}
        </button>
      </div>
    </form>
  );
}
