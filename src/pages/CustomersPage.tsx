import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, User, Building } from "lucide-react";
import Modal from "../components/Modal";
import CustomerForm from "../components/CustomerForm";

interface Customer {
  id: number;
  nom: string;
  typeClient: "EPICERIE" | "PARTICULIER";
  telephone: string;
  email: string;
  adresse: string;
}

const baseUrl = import.meta.env.VITE_API_URL;

export default function CustomersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Charger depuis backend
  useEffect(() => {
    fetch(`${baseUrl}/api/clients`)
      .then((res) => res.json())
      .then((data: Customer[]) => setCustomers(data))
      .catch((err) => console.error("Erreur fetch clients:", err));
  }, []);

  // Ajouter / Modifier
  const handleSave = async (customerData: Omit<Customer, "id">) => {
    if (editingCustomer) {
      // UPDATE
      const updated = { ...editingCustomer, ...customerData };
      await fetch(`${baseUrl}/api/clients/${editingCustomer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      setCustomers(
        customers.map((c) => (c.id === editingCustomer.id ? updated : c))
      );
    } else {
      // CREATE
      const res = await fetch(`${baseUrl}/api/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });
      const newCustomer = await res.json();
      setCustomers([...customers, newCustomer]);
    }
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  // Supprimer
  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      await fetch(`${baseUrl}/api/clients/${id}`, {
        method: "DELETE",
      });
      setCustomers(customers.filter((c) => c.id !== id));
    }
  };

  // Filtrer recherche
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.typeClient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.telephone.includes(searchTerm)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clients</h1>
          <p className="text-gray-600">Gérez votre base clients</p>
        </div>
        <button
          onClick={() => {
            setEditingCustomer(null);
            setIsModalOpen(true);
          }}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
        >
          <Plus size={20} className="mr-2" />
          Nouveau client
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table Clients */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                      <div
                        className={`p-2 rounded-lg ${
                          customer.typeClient === "EPICERIE"
                            ? "bg-blue-100"
                            : "bg-green-100"
                        }`}
                      >
                        {customer.typeClient === "EPICERIE" ? (
                          <Building size={16} className="text-blue-600" />
                        ) : (
                          <User size={16} className="text-green-600" />
                        )}
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
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        customer.typeClient === "EPICERIE"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {customer.typeClient}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <p>{customer.telephone}</p>
                      <p className="text-gray-500">{customer.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.adresse}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCustomer(customer);
                          setIsModalOpen(true);
                        }}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
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

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? "Modifier le client" : "Nouveau client"}
      >
        <CustomerForm
          customer={editingCustomer}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
