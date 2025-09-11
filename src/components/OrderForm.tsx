import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  X,
  User,
  Package,
  CreditCard,
  Truck,
  CheckCircle,
  AlertCircle,
  Loader2,
  ShoppingCart,
  Clock,
} from "lucide-react";

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
  onSaved?: () => void;
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
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchClients();
    fetchProduits();
  }, [token]);

  const fetchClients = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des clients");
      const data = await res.json();
      setClients(data);
    } catch (err: any) {
      console.error("Erreur fetch clients:", err);
      setError("Erreur lors du chargement des clients");
    }
  };

  const fetchProduits = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/produits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des produits");
      const data = await res.json();
      setProduits(data);
    } catch (err: any) {
      console.error("Erreur fetch produits:", err);
      setError("Erreur lors du chargement des produits");
    }
  };

  const handleAddDetail = () => {
    if (produits.length === 0) return;
    const produitDisponible = produits.find((p) => p.stockDisponible > 0);
    if (!produitDisponible) {
      setError("Aucun produit disponible en stock");
      return;
    }
    setDetails([
      ...details,
      {
        produit: produitDisponible,
        quantite: 1,
        prixTotal: produitDisponible.prixUnitaire,
      },
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
      const quantite = parseInt(value);
      if (quantite < 1) return;

      // Vérifier le stock disponible
      const produit = newDetails[index].produit;
      if (quantite > produit.stockDisponible) {
        setError(
          `Stock insuffisant pour ${produit.nom}. Stock disponible: ${produit.stockDisponible}`
        );
        return;
      }

      newDetails[index].quantite = quantite;
      newDetails[index].prixTotal = produit.prixUnitaire * quantite;
    }
    setDetails(newDetails);
    setError("");
  };

  const handleRemoveDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const getStatusConfig = (statut: string) => {
    switch (statut) {
      case "EN_ATTENTE":
        return {
          icon: Clock,
          color: "text-yellow-600 bg-yellow-100",
          label: "En attente",
        };
      case "PAYEE":
        return {
          icon: CreditCard,
          color: "text-blue-600 bg-blue-100",
          label: "Payée",
        };
      case "LIVREE":
        return {
          icon: Truck,
          color: "text-green-600 bg-green-100",
          label: "Livrée",
        };
      case "ANNULEE":
        return { icon: X, color: "text-red-600 bg-red-100", label: "Annulée" };
      default:
        return {
          icon: AlertCircle,
          color: "text-gray-600 bg-gray-100",
          label: statut,
        };
    }
  };

  const getAvailableStatus = (
    current: Commande["statut"]
  ): Commande["statut"][] => {
    switch (current) {
      case "EN_ATTENTE":
        return ["EN_ATTENTE", "PAYEE", "ANNULEE"];
      case "PAYEE":
        return ["PAYEE", "LIVREE"];
      case "LIVREE":
        return ["LIVREE"];
      case "ANNULEE":
        return ["ANNULEE"];
      default:
        return ["EN_ATTENTE"];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId) {
      setError("Veuillez sélectionner un client");
      return;
    }

    if (details.length === 0) {
      setError("Veuillez ajouter au moins un article");
      return;
    }

    if (!token) {
      setError("Utilisateur non authentifié");
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

    setIsSubmitting(true);
    setError("");
    setSuccess("");

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

      setSuccess(
        order
          ? "Commande mise à jour avec succès"
          : "Commande créée avec succès"
      );
      setTimeout(() => {
        onSaved?.();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur inconnue lors de la sauvegarde");
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = details.reduce((sum, d) => sum + d.prixTotal, 0);
  const StatusIcon = getStatusConfig(statut).icon;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {order ? "Modifier la commande" : "Nouvelle commande"}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
          title="Fermer"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Messages d'alerte */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Informations client */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                required
              >
                <option value="">Sélectionner un client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom} - {c.typeClient} - {c.telephone}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <div className="relative">
              <StatusIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statut}
                onChange={(e) =>
                  setStatut(e.target.value as Commande["statut"])
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              >
                {getAvailableStatus(statut).map((s) => (
                  <option key={s} value={s}>
                    {getStatusConfig(s).label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Articles de la commande */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Articles *
            </label>
            <button
              type="button"
              onClick={handleAddDetail}
              className="inline-flex items-center px-3 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm"
            >
              <Plus size={16} className="mr-1" />
              Ajouter un article
            </button>
          </div>

          {details.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Aucun article ajouté</p>
            </div>
          ) : (
            <div className="space-y-3">
              {details.map((detail, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-3 items-start p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Produit
                      </label>
                      <select
                        value={detail.produit.id}
                        onChange={(e) =>
                          handleChangeDetail(index, "produit", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      >
                        {produits
                          .filter((p) => p.stockDisponible > 0)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nom} - {p.prixUnitaire.toLocaleString()} Ar
                              {p.stockDisponible < 10 &&
                                ` (Stock: ${p.stockDisponible})`}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Quantité
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={detail.produit.stockDisponible}
                        value={detail.quantite}
                        onChange={(e) =>
                          handleChangeDetail(index, "quantite", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Stock: {detail.produit.stockDisponible}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 self-stretch">
                    <div className="text-right min-w-[100px]">
                      <div className="text-sm font-medium text-gray-900">
                        {detail.prixTotal.toLocaleString()} Ar
                      </div>
                      <div className="text-xs text-gray-500">
                        {detail.produit.prixUnitaire.toLocaleString()} Ar ×{" "}
                        {detail.quantite}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveDetail(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
          <span className="text-lg font-semibold text-gray-900">Total :</span>
          <span className="text-xl font-bold text-amber-700">
            {total.toLocaleString()} Ar
          </span>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || details.length === 0}
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                {order ? "Mise à jour..." : "Création..."}
              </>
            ) : (
              <>
                <ShoppingCart size={18} className="mr-2" />
                {order ? "Mettre à jour" : "Créer la commande"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
