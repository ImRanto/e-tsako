import { useEffect, useState } from "react";
import {
  Search,
  User,
  Store,
  Building,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Users,
} from "lucide-react";

interface Customer {
  id: number;
  nom: string;
  typeClient: "EPICERIE" | "PARTICULIER" | "RESTAURANT";
  telephone: string;
  email: string;
  adresse: string;
}

const baseUrl = import.meta.env.VITE_API_URL;

export default function VentePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("TOUS");

  // Charger depuis backend
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsLoading(true);
    fetch(`${baseUrl}/api/clients`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur chargement clients");
        return res.json();
      })
      .then((data: Customer[]) => setCustomers(data))
      .catch((err) => console.error("Erreur fetch clients:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // Filtrer par recherche et type
  const filtered = customers.filter(
    (c) =>
      (c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.telephone.includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.adresse.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterType === "TOUS" || c.typeClient === filterType)
  );

  const getIcon = (type: string) => {
    switch (type) {
      case "EPICERIE":
        return <Store size={20} className="text-blue-600" />;
      case "RESTAURANT":
        return <Building size={20} className="text-purple-600" />;
      default:
        return <User size={20} className="text-green-600" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "EPICERIE":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "RESTAURANT":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Espace Vente</h1>
              <p className="text-gray-600 mt-2">
                Consultez et gérez votre portefeuille clients
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
              <Users size={20} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {filtered.length} {filtered.length === 1 ? "client" : "clients"}
              </span>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Rechercher un client par nom, téléphone, email ou adresse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent px-2 py-1 text-gray-700 focus:outline-none focus:ring-0"
              >
                <option value="TOUS">Tous les types</option>
                <option value="EPICERIE">Épiceries</option>
                <option value="PARTICULIER">Particuliers</option>
                <option value="RESTAURANT">Restaurants</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Loader2 className="animate-spin text-amber-500 mb-4" size={32} />
            <p className="text-gray-600">Chargement de vos clients...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-gray-300 mb-4">
              <Users size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchTerm || filterType !== "TOUS"
                ? "Aucun client ne correspond à vos critères"
                : "Vous n'avez pas encore de clients"}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm || filterType !== "TOUS"
                ? "Essayez de modifier vos termes de recherche ou vos filtres."
                : "Commencez par ajouter vos premiers clients à votre base."}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((customer) => (
              <div
                key={customer.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-3 rounded-xl bg-gray-100 group-hover:bg-gray-200 transition-colors">
                        {getIcon(customer.typeClient)}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {customer.nom}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColor(
                            customer.typeClient
                          )}`}
                        >
                          {getTypeLabel(customer.typeClient)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone size={16} className="mr-2 text-gray-400" />
                      <span className="font-medium">{customer.telephone}</span>
                    </div>

                    {customer.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail size={16} className="mr-2 text-gray-400" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}

                    {customer.adresse && (
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin
                          size={16}
                          className="mr-2 mt-0.5 text-gray-400 flex-shrink-0"
                        />
                        <span className="line-clamp-2">{customer.adresse}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
