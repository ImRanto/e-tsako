import { useState, useEffect } from "react";

interface ExpenseFormProps {
  expense: {
    id?: number;
    typeDepense:
      | "MATIERE_PREMIERE"
      | "EMBALLAGE"
      | "TRANSPORT"
      | "MARKETING"
      | "AUTRE";
    montant: number;
    dateDepense: string;
    description: string;
  } | null;
  onSaved?: () => void; // callback après sauvegarde réussie
  onCancel: () => void;
}

export default function ExpenseForm({
  expense,
  onSaved,
  onCancel,
}: ExpenseFormProps) {
  const [typeDepense, setTypeDepense] = useState(
    expense?.typeDepense || "MATIERE_PREMIERE"
  );
  const [montant, setMontant] = useState(expense?.montant || 0);
  const [dateDepense, setDateDepense] = useState(
    expense?.dateDepense || new Date().toISOString().slice(0, 10)
  );
  const [description, setDescription] = useState(expense?.description || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem("token"); // JWT

  useEffect(() => {
    if (expense) {
      setTypeDepense(expense.typeDepense);
      setMontant(expense.montant);
      setDateDepense(expense.dateDepense);
      setDescription(expense.description);
    }
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!montant || montant <= 0) {
      setError("Veuillez saisir un montant valide !");
      return;
    }

    if (!description.trim()) {
      setError("Veuillez saisir une description !");
      return;
    }

    if (!dateDepense) {
      setError("Veuillez sélectionner une date !");
      return;
    }

    if (!token) {
      setError("Utilisateur non authentifié !");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = expense
        ? `${baseUrl}/api/depenses/${expense.id}`
        : `${baseUrl}/api/depenses`;
      const method = expense ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          typeDepense,
          montant,
          dateDepense,
          description: description.trim(),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erreur lors de la sauvegarde de la dépense");
      }

      onSaved?.();
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
        {expense ? "Modifier la dépense" : "Nouvelle dépense"}
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
          {/* Type de dépense */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de dépense <span className="text-red-500">*</span>
            </label>
            <select
              value={typeDepense}
              onChange={(e) => setTypeDepense(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
              required
            >
              <option value="MATIERE_PREMIERE">Matière première</option>
              <option value="EMBALLAGE">Emballage</option>
              <option value="TRANSPORT">Transport</option>
              <option value="MARKETING">Marketing</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>

          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant (Ar) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">Ar</span>
              <input
                type="number"
                value={montant}
                onChange={(e) => setMontant(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                min={0}
                step="0.01"
                required
              />
            </div>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={dateDepense}
            readOnly
            onChange={(e) => setDateDepense(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
            rows={4}
            placeholder="Décrivez cette dépense..."
            required
          />
        </div>

        {/* Boutons */}
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
                {expense ? "Modification..." : "Création..."}
              </>
            ) : (
              <>{expense ? "Modifier" : "Créer la dépense"}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
