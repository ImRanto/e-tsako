import { useState, useEffect } from "react";
import { Plus, Search, Eye, Edit, Package } from "lucide-react";

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
  id: number;
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

const baseUrl = import.meta.env.VITE_API_URL;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Commande[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Fetch commandes depuis API
  useEffect(() => {
    fetch(`${baseUrl}/api/commandes`)
      .then((res) => res.json())
      .then((data: Commande[]) => {
        setOrders(data);
      })
      .catch((err) => console.error("Erreur fetch commandes:", err));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAYEE":
        return "bg-green-100 text-green-800";
      case "LIVREE":
        return "bg-blue-100 text-blue-800";
      case "EN_ATTENTE":
        return "bg-yellow-100 text-yellow-800";
      case "ANNULEE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm);
    const matchesStatus = statusFilter === "" || order.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Commandes</h1>
          <p className="text-gray-600">Gérez toutes les commandes clients</p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm">
          <Plus size={20} className="mr-2" />
          Nouvelle commande
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Rechercher une commande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="PAYEE">Payée</option>
            <option value="LIVREE">Livrée</option>
            <option value="ANNULEE">Annulée</option>
          </select>
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="grid gap-6">
        {filteredOrders.map((order) => {
          const total = order.details.reduce((sum, d) => sum + d.prixTotal, 0);

          return (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-amber-100 rounded-lg mr-3">
                      <Package size={20} className="text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Commande #{order.id}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {order.client.nom}
                      </p>
                    </div>
                    <span
                      className={`ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        order.statut
                      )}`}
                    >
                      {order.statut.replace("_", " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-medium">
                        {new Date(order.dateCommande).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Articles</p>
                      <p className="font-medium">
                        {order.details.length} produit(s)
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="font-bold text-lg text-gray-900">
                        {total.toLocaleString()} Ar
                      </p>
                    </div>
                    <div className="lg:text-right">
                      <div className="flex gap-2 mt-4 lg:mt-0">
                        <button className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                          <Eye size={14} className="mr-1" />
                          Voir
                        </button>
                        <button className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm">
                          <Edit size={14} className="mr-1" />
                          Modifier
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items de la commande */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Articles commandés:
                </p>
                <div className="space-y-1">
                  {order.details.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-gray-600">
                        {item.produit.nom} × {item.quantite}
                      </span>
                      <span className="font-medium">
                        {item.prixTotal.toLocaleString()} Ar
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
