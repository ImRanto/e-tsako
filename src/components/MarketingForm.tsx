import { useState, useEffect } from "react";

interface MarketingFormProps {
  marketing: {
    id?: number;
    canal: "FACEBOOK" | "MARCHE_LOCAL" | "PARTENARIAT" | "SITE_WEB" | "AUTRE";
    cout: number;
    dateAction: string;
    description: string;
  } | null;
  onSaved?: () => void;
  onCancel: () => void;
}

export default function MarketingForm({
  marketing,
  onSaved,
  onCancel,
}: MarketingFormProps) {
  const [canal, setCanal] = useState<MarketingFormProps["marketing"]["canal"]>(
    marketing?.canal || "FACEBOOK"
  );
  const [cout, setCout] = useState(marketing?.cout || 0);
  const [dateAction, setDateAction] = useState(
    marketing?.dateAction || new Date().toISOString().slice(0, 10)
  );
  const [description, setDescription] = useState(marketing?.description || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (marketing) {
      setCanal(marketing.canal);
      setCout(marketing.cout);
      setDateAction(marketing.dateAction);
      setDescription(marketing.description);
    }
  }, [marketing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cout || !description) {
      setError("Veuillez remplir tous les champs obligatoires !");
      return;
    }

    if (!token) {
      setError("Utilisateur non authentifié !");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = marketing
        ? `${baseUrl}/api/marketing/${marketing.id}`
        : `${baseUrl}/api/marketing`;
      const method = marketing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          canal,
          cout,
          dateAction,
          description,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          text || "Erreur lors de la sauvegarde de l'action marketing"
        );
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
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-2xl p-6 space-y-5 border border-gray-100"
    >
      {error && (
        <p className="text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      {/* Canal */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Canal marketing
        </label>
        <select
          value={canal}
          onChange={(e) =>
            setCanal(e.target.value as MarketingFormProps["marketing"]["canal"])
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        >
          <option value="FACEBOOK">Facebook</option>
          <option value="MARCHE_LOCAL">Marché local</option>
          <option value="SITE_WEB">Site Web</option>
          <option value="PARTENARIAT">Partenariat</option>
          <option value="AUTRE">Autre</option>
        </select>
      </div>

      {/* Coût */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Coût (Ar)
        </label>
        <input
          type="number"
          value={cout}
          onChange={(e) => setCout(Number(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          min={0}
        />
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Date de l'action
        </label>
        <input
          type="date"
          value={dateAction}
          onChange={(e) => setDateAction(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          rows={3}
        />
      </div>

      {/* Boutons */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Enregistrement..." : marketing ? "Modifier" : "Créer"}
        </button>
      </div>
    </form>
  );
}
