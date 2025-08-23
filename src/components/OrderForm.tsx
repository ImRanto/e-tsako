import { useState, useEffect } from "react";

interface Client {
  id: number;
  nom: string;
  typeClient: "EPICERIE" | "PARTICULIER";
  telephone: string;
  email: string;
  adresse: string;
}

interface Produit {
  id: number;
  nom: string;
  prixUnitaire: number;
  categorie: "CHIPS" | "SNACK";
  stockDisponible: number;
}

interface DetailCommande {
  produit: Produit;
  quantite: number;
  prixTotal: number;
}

interface Commande {
  id: number;
  client: Client;
  dateCommande: string;
  statut: "EN_ATTENTE" | "PAYEE" | "LIVREE" | "ANNULEE";
  details: DetailCommande[];
}

interface OrderFormProps {
  order?: Commande | null;
  onSaved?: () => void; // callback après sauvegarde
  onCancel: () => void;
}

const baseUrl = import.meta.env.VITE_API_URL;

export default function OrderForm({
  order,
  onSaved,
  onCancel,
}: OrderFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [clientId, setClientId] = useState(order?.client.id || "");
  const [statut, setStatut] = useState(order?.statut || "EN_ATTENTE");
  const [details, setDetails] = useState<DetailCommande[]>(
    order?.details || []
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${baseUrl}/api/clients`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setClients)
      .catch((err) => console.error("Erreur fetch clients:", err));

    fetch(`${baseUrl}/api/produits`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setProduits)
      .catch((err) => console.error("Erreur fetch produits:", err));
  }, [token]);

  const handleAddDetail = () => {
    if (produits.length === 0) return;
    const produit = produits[0];
    setDetails([
      ...details,
      { produit, quantite: 1, prixTotal: produit.prixUnitaire },
    ]);
  };

  const handleChangeDetail = (
    index: number,
    field: "produit" | "quantite",
    value: any
  ) => {
    const newDetails = [...details];
    if (field === "produit") {
      const produit = produits.find((p) => p.id === parseInt(value));
      if (produit) {
        newDetails[index].produit = produit;
        newDetails[index].prixTotal =
          produit.prixUnitaire * newDetails[index].quantite;
      }
    } else if (field === "quantite") {
      newDetails[index].quantite = parseInt(value);
      newDetails[index].prixTotal =
        newDetails[index].produit.prixUnitaire * newDetails[index].quantite;
    }
    setDetails(newDetails);
  };

  const handleRemoveDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setError("Veuillez sélectionner un client !");
      return;
    }

    if (!token) {
      setError("Utilisateur non authentifié !");
      return;
    }

    const client = clients.find((c) => c.id === parseInt(clientId as string));
    if (!client) return;

    const payload: Omit<Commande, "id"> = {
      client,
      dateCommande: order?.dateCommande || new Date().toISOString(),
      statut,
      details,
    };

    setLoading(true);
    setError("");

    try {
      const url = order
        ? `${baseUrl}/api/commandes/${order.id}`
        : `${baseUrl}/api/commandes`;
      const method = order ? "PUT" : "POST";

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
        throw new Error(text || "Erreur lors de la sauvegarde de la commande");
      }

      onSaved?.();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const total = details.reduce((sum, d) => sum + d.prixTotal, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600">{error}</p>}

      {/* Sélection client */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Client
        </label>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
          required
        >
          <option value="">-- Sélectionner un client --</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom} ({c.typeClient})
            </option>
          ))}
        </select>
      </div>

      {/* Statut */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Statut
        </label>
        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value as Commande["statut"])}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
        >
          <option value="EN_ATTENTE">En attente</option>
          <option value="PAYEE">Payée</option>
          <option value="LIVREE">Livrée</option>
          <option value="ANNULEE">Annulée</option>
        </select>
      </div>

      {/* Détails */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Articles
        </label>
        {details.map((detail, index) => (
          <div key={index} className="flex gap-2 items-center mb-2">
            <select
              value={detail.produit.id}
              onChange={(e) =>
                handleChangeDetail(index, "produit", e.target.value)
              }
              className="border border-gray-300 rounded-md p-2 flex-1"
            >
              {produits.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom} ({p.prixUnitaire} Ar)
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={detail.quantite}
              onChange={(e) =>
                handleChangeDetail(index, "quantite", e.target.value)
              }
              className="w-20 border border-gray-300 rounded-md p-2"
            />
            <span className="w-24 text-right font-medium">
              {detail.prixTotal.toLocaleString()} Ar
            </span>
            <button
              type="button"
              onClick={() => handleRemoveDetail(index)}
              className="px-2 py-1 text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddDetail}
          className="mt-2 inline-flex px-3 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200"
        >
          + Ajouter un article
        </button>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center font-bold text-lg">
        <span>Total :</span>
        <span>{total.toLocaleString()} Ar</span>
      </div>

      {/* Boutons */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          disabled={loading}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
          disabled={loading}
        >
          {order ? "Mettre à jour" : "Créer"}
        </button>
      </div>
    </form>
  );
}
