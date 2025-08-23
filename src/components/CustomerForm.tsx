import React, { useState, useEffect } from "react";

interface CustomerFormProps {
  customer: any | null;
  onSaved?: () => void; // callback après sauvegarde réussie
  onCancel: () => void;
}

export default function CustomerForm({
  customer,
  onSaved,
  onCancel,
}: CustomerFormProps) {
  const [nom, setNom] = useState("");
  const [typeClient, setTypeClient] = useState<
    "EPICERIE" | "PARTICULIER" | "RESTAURANT"
  >("PARTICULIER");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [adresse, setAdresse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token"); // récupération du JWT

  // Pré-remplir si édition
  useEffect(() => {
    if (customer) {
      setNom(customer.nom);
      setTypeClient(customer.typeClient);
      setTelephone(customer.telephone);
      setEmail(customer.email);
      setAdresse(customer.adresse);
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Utilisateur non authentifié");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = customer
        ? `${baseUrl}/api/utilisateurs/${customer.id}`
        : `${baseUrl}/api/utilisateurs`;
      const method = customer ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nom, typeClient, telephone, email, adresse }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erreur lors de la sauvegarde");
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="text-red-600">{error}</p>}

      {/* Nom */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Nom</label>
        <input
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
        />
      </div>

      {/* Type de client */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Type de client
        </label>
        <select
          value={typeClient}
          onChange={(e) =>
            setTypeClient(
              e.target.value as "EPICERIE" | "PARTICULIER" | "RESTAURANT"
            )
          }
          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
        >
          <option value="PARTICULIER">PARTICULIER</option>
          <option value="EPICERIE">EPICERIE</option>
          <option value="RESTAURANT">RESTAURANT</option>
        </select>
      </div>

      {/* Téléphone */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Téléphone
        </label>
        <input
          type="text"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          required
          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
        />
      </div>

      {/* Adresse */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Adresse
        </label>
        <textarea
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
          rows={2}
          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
        />
      </div>

      {/* Boutons */}
      <div className="flex justify-end gap-3">
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
          {customer ? "Mettre à jour" : "Ajouter"}
        </button>
      </div>
    </form>
  );
}
