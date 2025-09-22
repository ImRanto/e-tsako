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
  const [unite, setUnite] = useState("KG");
  const [seuilAlerte, setSeuilAlerte] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const baseUrl = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem("token");

  // Options prédéfinies pour les unités
  const uniteOptions = ["KG", "LITRE", "UNITE"];

  useEffect(() => {
    if (stock) {
      setNomMatiere(stock.nomMatiere);
      setQuantite(stock.quantite);
      setUnite(stock.unite);
      setSeuilAlerte(stock.seuilAlerte);
    } else {
      setNomMatiere("");
      setQuantite(0);
      setUnite("KG");
      setSeuilAlerte(0);
    }
    setError("");
  }, [stock]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation améliorée
    if (!nomMatiere.trim()) {
      setError("Veuillez saisir un nom de matière !");
      return;
    }

    if (quantite < 0) {
      setError("La quantité ne peut pas être négative !");
      return;
    }

    if (!unite.trim()) {
      setError("Veuillez sélectionner une unité !");
      return;
    }

    if (seuilAlerte < 0) {
      setError("Le seuil d'alerte ne peut pas être négatif !");
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
      unite: unite.trim(),
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
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {stock ? "Modifier le stock" : "Nouveau stock"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-start">
            <svg
              className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom de la matière */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la matière <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nomMatiere}
              onChange={(e) => setNomMatiere(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
              placeholder="Ex: Farine, Sucre, Huile..."
              required
            />
          </div>

          {/* Quantité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={quantite}
              onChange={(e) => setQuantite(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
              min={0}
              step="0.01"
              required
            />
          </div>

          {/* Unité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unité <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={unite}
                onChange={(e) => setUnite(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors appearance-none"
                required
              >
                {uniteOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Seuil d'alerte */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seuil d'alerte <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={seuilAlerte}
                onChange={(e) => setSeuilAlerte(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                min={0}
                step="0.01"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500">{unite}</span>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Une alerte sera déclenchée lorsque le stock descend en dessous de
              ce seuil
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {stock ? "Modification..." : "Création..."}
              </>
            ) : (
              <>{stock ? "Modifier" : "Créer le stock"}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
