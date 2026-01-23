import React, { useState, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Home,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
} from "lucide-react";

interface Customer {
  id: number;
  nom: string;
  typeClient: "EPICERIE" | "PARTICULIER" | "RESTAURANT";
  telephone: string;
  email?: string;
  adresse?: string;
}

interface CustomerFormProps {
  customer: Customer | null;
  onSaved?: () => void;
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
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baseUrl = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem("token");

  // Pré-rempli
  useEffect(() => {
    if (customer) {
      setNom(customer.nom || "");
      setTypeClient(
        (customer.typeClient as "EPICERIE" | "PARTICULIER" | "RESTAURANT") ||
          "PARTICULIER"
      );
      setTelephone(customer.telephone || "");
      setEmail(customer.email || "");
      setAdresse(customer.adresse || "");
    }
  }, [customer]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "EPICERIE":
        return <Building size={16} className="text-blue-500" />;
      case "RESTAURANT":
        return <Home size={16} className="text-green-500" />;
      default:
        return <User size={16} className="text-amber-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "EPICERIE":
        return "Épicerie";
      case "RESTAURANT":
        return "Restaurant";
      default:
        return "Particulier";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Utilisateur non authentifié");
      return;
    }

    if (!nom.trim()) {
      setError("Le nom est obligatoire");
      return;
    }

    if (!telephone.trim()) {
      setError("Le téléphone est obligatoire");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const url = customer
        ? `${baseUrl}/api/clients/${customer.id}`
        : `${baseUrl}/api/clients`;
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

      setSuccess(
        customer ? "Client mis à jour avec succès" : "Client créé avec succès"
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {customer ? "Modifier le client" : "Nouveau client"}
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

        {/* Informations de base */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom */}
          <div>
            <label
              htmlFor="nom"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nom *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="nom"
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                placeholder="Nom complet"
              />
            </div>
          </div>

          {/* Type de client */}
          <div>
            <label
              htmlFor="typeClient"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Type de client *
            </label>
            <div className="relative">
              {getTypeIcon(typeClient)}
              <select
                id="typeClient"
                value={typeClient}
                onChange={(e) =>
                  setTypeClient(
                    e.target.value as "EPICERIE" | "PARTICULIER" | "RESTAURANT"
                  )
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors appearance-none"
              >
                <option value="PARTICULIER">Particulier</option>
                <option value="EPICERIE">Épicerie</option>
                <option value="RESTAURANT">Restaurant</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Coordonnées */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Téléphone */}
          <div>
            <label
              htmlFor="telephone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Téléphone *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="telephone"
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                placeholder="+261 34 12 345 67"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                placeholder="email@exemple.com"
              />
            </div>
          </div>
        </div>

        {/* Adresse */}
        <div>
          <label
            htmlFor="adresse"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Adresse
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <textarea
              id="adresse"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              rows={3}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors resize-none"
              placeholder="Adresse complète du client"
            />
          </div>
        </div>

        {/* Résumé du type */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              {getTypeIcon(typeClient)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Type sélectionné
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {getTypeLabel(typeClient)}
              </p>
            </div>
          </div>
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
            disabled={isSubmitting}
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                {customer ? "Mise à jour..." : "Création..."}
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                {customer ? "Mettre à jour" : "Créer le client"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
