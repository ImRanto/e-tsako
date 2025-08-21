import React, { useState, useEffect } from "react";

interface CustomerFormProps {
  customer: any | null;
  onSave: (customerData: Omit<any, "id">) => void;
  onCancel: () => void;
}

export default function CustomerForm({
  customer,
  onSave,
  onCancel,
}: CustomerFormProps) {
  const [nom, setNom] = useState("");
  const [typeClient, setTypeClient] = useState<"EPICERIE" | "PARTICULIER" | "RESTAURANT">(
    "PARTICULIER"
  );
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [adresse, setAdresse] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ nom, typeClient: typeClient, telephone, email, adresse });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

      {/* Type */}
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
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          {customer ? "Mettre à jour" : "Ajouter"}
        </button>
      </div>
    </form>
  );
}
