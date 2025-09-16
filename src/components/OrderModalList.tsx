import {
  X,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  Package,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Commande } from "../utils/types";

export default function OrderModal({
  order,
  onClose,
}: {
  order: Commande | null;
  onClose: () => void;
}) {
  if (!order) return null;

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case "EN_ATTENTE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PAYEE":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "LIVREE":
        return "bg-green-100 text-green-800 border-green-200";
      case "ANNULEE":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "EN_ATTENTE":
        return <Clock size={16} className="text-yellow-600" />;
      case "PAYEE":
        return <CheckCircle size={16} className="text-blue-600" />;
      case "LIVREE":
        return <Truck size={16} className="text-green-600" />;
      case "ANNULEE":
        return <X size={16} className="text-red-600" />;
      default:
        return <Package size={16} className="text-gray-600" />;
    }
  };

  // Formater le prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " Ar";
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculer le total
  const totalAmount = order.details.reduce(
    (sum, item) => sum + item.prixTotal,
    0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Commande #{order.id.toString().padStart(4, "0")}
            </h2>
            <div className="flex items-center mt-1">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                  order.statut
                )}`}
              >
                {getStatusIcon(order.statut)}
                <span className="ml-1.5 capitalize">
                  {order.statut.toLowerCase().replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center ml-4 text-gray-500 text-sm">
                <Calendar size={16} className="mr-1" />
                {formatDate(order.dateCommande)}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Informations client */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User size={20} className="mr-2 text-blue-600" />
                Informations client
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <User size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.client.nom}
                    </p>
                    <p className="text-sm text-gray-500">Client</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <Phone size={16} className="mr-3 text-gray-400" />
                  <span>{order.client.telephone}</span>
                </div>

                {order.client.email && (
                  <div className="flex items-center text-gray-700">
                    <Mail size={16} className="mr-3 text-gray-400" />
                    <span className="truncate">{order.client.email}</span>
                  </div>
                )}

                {order.client.adresse && (
                  <div className="flex items-start text-gray-700">
                    <MapPin
                      size={16}
                      className="mr-3 mt-0.5 text-gray-400 flex-shrink-0"
                    />
                    <span>{order.client.adresse}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Informations commande */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard size={20} className="mr-2 text-purple-600" />
                Détails de la commande
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total produits:</span>
                  <span className="font-medium">{order.details.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Montant total:</span>
                  <span className="font-bold text-green-600">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Créé par:</span>
                    <span className="font-medium">
                      {order.createdBy.nom} {order.createdBy.prenom}
                    </span>
                  </div>
                  {order.updatedBy && (
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600">Modifié par:</span>
                      <span className="font-medium">
                        {order.updatedBy.nom} {order.updatedBy.prenom}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Liste des produits */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package size={20} className="mr-2 text-amber-600" />
              Produits commandés
            </h3>

            {/* Version Desktop */}
            <div className="hidden sm:block border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantité
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix unitaire
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.details.map((detail) => (
                    <tr
                      key={detail.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {detail.produit.nom}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {detail.produit.categorie}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {detail.quantite}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatPrice(detail.produit.prixUnitaire)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {formatPrice(detail.prixTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-3 text-sm font-medium text-right text-gray-700"
                    >
                      Total
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">
                      {formatPrice(totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Version Mobile */}
            <div className="sm:hidden space-y-3">
              {order.details.map((detail) => (
                <div
                  key={detail.id}
                  className="border border-gray-200 rounded-lg p-3 shadow-sm"
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {detail.produit.nom}
                  </p>
                  <p className="text-xs text-gray-500">
                    {detail.produit.categorie}
                  </p>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-gray-600">Quantité:</span>
                    <span className="font-medium">{detail.quantite}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Prix unitaire:</span>
                    <span>{formatPrice(detail.produit.prixUnitaire)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold text-green-600">
                      {formatPrice(detail.prixTotal)}
                    </span>
                  </div>
                </div>
              ))}

              <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between text-sm font-bold">
                <span>Total</span>
                <span className="text-green-600">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
