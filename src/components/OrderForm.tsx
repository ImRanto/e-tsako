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
  onSave: (order: Omit<Commande, "id">) => void;
  onCancel: () => void;
}

const baseUrl = import.meta.env.VITE_API_URL;

export default function OrderForm({ order, onSave, onCancel }: OrderFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [clientId, setClientId] = useState(order?.client.id || "");
  const [statut, setStatut] = useState(order?.statut || "EN_ATTENTE");
  const [details, setDetails] = useState<DetailCommande[]>(
    order?.details || []
  );

  // Charger clients et produits depuis backend
  useEffect(() => {
    fetch(`${baseUrl}/api/clients`)
      .then((res) => res.json())
      .then(setClients)
      .catch((err) => console.error("Erreur fetch clients:", err));

    fetch(`${baseUrl}/api/produits`)
      .then((res) => res.json())
      .then(setProduits)
      .catch((err) => console.error("Erreur fetch produits:", err));
  }, []);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === parseInt(clientId as string));
    if (!client) return alert("Veuillez sélectionner un client");

    onSave({
      client,
      dateCommande: order?.dateCommande || new Date().toISOString(),
      statut,
      details,
    });
  };

  const total = details.reduce((sum, d) => sum + d.prixTotal, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      {/* Sélection statut */}
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

      {/* Détails commande */}
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
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
        >
          {order ? "Mettre à jour" : "Créer"}
        </button>
      </div>
    </form>
  );
}
