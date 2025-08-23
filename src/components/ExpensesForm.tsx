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
  const token = localStorage.getItem("token"); // JWT

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
    if (!montant || !description) {
      setError("Veuillez remplir tous les champs !");
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
          description,
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="text-red-600">{error}</p>}

      {/* Type de dépense */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type de dépense
        </label>
        <select
          value={typeDepense}
          onChange={(e) => setTypeDepense(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Montant (Ar)
        </label>
        <input
          type="number"
          value={montant}
          onChange={(e) => setMontant(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          min={0}
        />
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <input
          type="date"
          value={dateDepense}
          onChange={(e) => setDateDepense(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          rows={3}
        />
      </div>

      {/* Boutons */}
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
          {expense ? "Modifier" : "Créer"}
        </button>
      </div>
    </form>
  );
}
