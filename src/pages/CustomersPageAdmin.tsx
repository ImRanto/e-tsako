import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  User,
  Building,
  Store,
  Filter,
  MoreVertical,
} from "lucide-react";
import Modal from "../components/form/Modal";
import CustomerForm from "../components/form/CustomerForm";
import { Customer } from "../components/types/customerType";

const baseUrl = import.meta.env.VITE_API_URL;

export default function CustomersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Utilisateur non authentifié");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const res = await fetch(`${baseUrl}/api/clients`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `Erreur ${res.status}: ${errorText || "Échec du chargement"}`,
          );
        }

        const data: Customer[] = await res.json();
        setCustomers(data);
      } catch (err: any) {
        console.error("Erreur fetch clients:", err);
        setError(err.message || "Erreur lors du chargement des clients");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleSave = async (customerData: Omit<Customer, "id">) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("Utilisateur non authentifié");
      return;
    }

    try {
      if (editingCustomer) {
        const res = await fetch(
          `${baseUrl}/api/clients/${editingCustomer.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(customerData),
          },
        );

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `Erreur ${res.status}: ${errorText || "Échec de la modification"}`,
          );
        }

        const updated: Customer = await res.json();
        setCustomers(
          customers.map((c) => (c.id === editingCustomer.id ? updated : c)),
        );
      } else {
        const res = await fetch(`${baseUrl}/api/clients`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(customerData),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `Erreur ${res.status}: ${errorText || "Échec de la création"}`,
          );
        }

        const newCustomer: Customer = await res.json();
        setCustomers([...customers, newCustomer]);
      }

      setIsModalOpen(false);
      setEditingCustomer(null);
      setError("");
    } catch (error: any) {
      console.error("Erreur sauvegarde client:", error);
      setError(error.message || "Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (id: number) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("Utilisateur non authentifié");
      return;
    }

    if (confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      try {
        const res = await fetch(`${baseUrl}/api/clients/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `Erreur ${res.status}: ${errorText || "Échec de la suppression"}`,
          );
        }

        setCustomers(customers.filter((c) => c.id !== id));
        setError("");
      } catch (error: any) {
        console.error("Erreur suppression client:", error);
        setError(error.message || "Erreur lors de la suppression");
      }
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.telephone.includes(searchTerm) ||
      (customer.email &&
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.adresse &&
        customer.adresse.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType =
      filterType === "ALL" || customer.typeClient === filterType;

    return matchesSearch && matchesType;
  });

  const getCustomerIcon = (type: string) => {
    switch (type) {
      case "EPICERIE":
        return <Store size={16} className="text-blue-600" />;
      case "RESTAURANT":
        return <Building size={16} className="text-purple-600" />;
      default:
        return <User size={16} className="text-green-600" />;
    }
  };

  const getCustomerColor = (type: string) => {
    switch (type) {
      case "EPICERIE":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "RESTAURANT":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      default:
        return "bg-green-100 text-green-800 border border-green-200";
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Clients
          </h1>
          <p className="text-gray-600">Gérez votre base clients</p>
        </div>
        <button
          onClick={() => {
            setEditingCustomer(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors shadow-sm hover:shadow-md font-medium"
        >
          <Plus size={20} className="mr-2" />
          Nouveau client
        </button>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Rechercher un client par nom, téléphone, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
            >
              <option value="ALL">Tous les types</option>
              <option value="EPICERIE">Épiceries</option>
              <option value="PARTICULIER">Particuliers</option>
              <option value="RESTAURANT">Restaurants</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table/Grid Clients */}
      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-8"></div>
              </div>
            ))}
          </div>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterType !== "ALL"
              ? "Aucun client trouvé"
              : "Aucun client"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== "ALL"
              ? "Aucun client ne correspond à vos critères de recherche."
              : "Vous n'avez pas encore de clients dans votre base."}
          </p>
          <button
            onClick={() => {
              setEditingCustomer(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Ajouter votre premier client
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Adresse
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 rounded-xl bg-gray-100">
                            {getCustomerIcon(customer.typeClient)}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">
                              {customer.nom}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCustomerColor(
                            customer.typeClient,
                          )}`}
                        >
                          {customer.typeClient}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <p className="font-medium">{customer.telephone}</p>
                          {customer.email && (
                            <p className="text-gray-500">{customer.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <p className="truncate">
                          {customer.adresse || "Non renseignée"}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingCustomer(customer);
                              setIsModalOpen(true);
                            }}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Modifier"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="p-2 rounded-xl bg-gray-100 mt-1">
                      {getCustomerIcon(customer.typeClient)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900 truncate">
                          {customer.nom}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCustomerColor(
                            customer.typeClient,
                          )}`}
                        >
                          {customer.typeClient}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm">
                        <p className="text-gray-900 font-medium">
                          {customer.telephone}
                        </p>
                        {customer.email && (
                          <p className="text-gray-600 truncate">
                            {customer.email}
                          </p>
                        )}
                        {customer.adresse && (
                          <p className="text-gray-600 text-xs truncate">
                            {customer.adresse}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() =>
                        setMobileMenuOpen(
                          mobileMenuOpen === customer.id ? null : customer.id,
                        )
                      }
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {mobileMenuOpen === customer.id && (
                      <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 z-10 min-w-[120px]">
                        <button
                          onClick={() => {
                            setEditingCustomer(customer);
                            setIsModalOpen(true);
                            setMobileMenuOpen(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <Edit size={14} className="mr-2" />
                          Modifier
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(customer.id);
                            setMobileMenuOpen(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <Trash2 size={14} className="mr-2" />
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
          setError("");
        }}
        title={editingCustomer ? "Modifier le client" : "Nouveau client"}
      >
        <CustomerForm
          customer={editingCustomer}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingCustomer(null);
            setError("");
          }}
        />
      </Modal>
    </div>
  );
}
