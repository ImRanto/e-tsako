import { useState, useEffect } from "react";
import { Plus, Search, Megaphone, Facebook, MapPin, X } from "lucide-react";
import MarketingForm from "./../components/MarketingForm";
import Loader from "../components/Loader";

interface Marketing {
  id: number;
  canal: "FACEBOOK" | "MARCHE_LOCAL" | "PARTENARIAT" | "SITE_WEB" | "AUTRE";
  cout: number;
  dateAction: string;
  description: string;
}

const baseUrl = import.meta.env.VITE_API_URL;

export default function MarketingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [canalFilter, setCanalFilter] = useState<string>("");
  const [marketingActions, setMarketingActions] = useState<Marketing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMarketing, setEditingMarketing] = useState<Marketing | null>(
    null
  );

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Utilisateur non authentifié !");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/marketing`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erreur lors du chargement des campagnes");

      const data: Marketing[] = await res.json();
      setMarketingActions(data);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCanalIcon = (canal: string) => {
    switch (canal) {
      case "FACEBOOK":
        return <Facebook size={16} className="text-blue-600" />;
      case "MARCHE_LOCAL":
        return <MapPin size={16} className="text-green-600" />;
      default:
        return <Megaphone size={16} className="text-purple-600" />;
    }
  };

  const getCanalColor = (canal: string) => {
    switch (canal) {
      case "FACEBOOK":
        return "bg-blue-100 text-blue-800";
      case "MARCHE_LOCAL":
        return "bg-green-100 text-green-800";
      case "SITE_WEB":
        return "bg-purple-100 text-purple-800";
      case "PARTENARIAT":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCanalLabel = (canal: string) => {
    switch (canal) {
      case "FACEBOOK":
        return "Facebook";
      case "MARCHE_LOCAL":
        return "Marché local";
      case "SITE_WEB":
        return "Site Web";
      case "PATENARIAT":
        return "Partenariat";
      default:
        return "Autre";
    }
  };

  const filteredActions = marketingActions.filter((action) => {
    const matchesSearch =
      action.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCanalLabel(action.canal)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesCanal = canalFilter === "" || action.canal === canalFilter;
    return matchesSearch && matchesCanal;
  });

  const totalBudget = filteredActions.reduce(
    (sum, action) => sum + action.cout,
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <p className="p-6 text-red-600">
        ❌ Erreur : {error} (vérifie ton token ou ton backend)
      </p>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketing</h1>
          <p className="text-gray-600">
            Gestion des campagnes et actions marketing
          </p>
        </div>
        <button
          onClick={() => {
            setEditingMarketing(null);
            setIsModalOpen(true);
          }}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
        >
          <Plus size={20} className="mr-2" />
          Nouvelle campagne
        </button>
      </div>

      {/* Budget Summary */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-sm p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 mb-1">Budget marketing total</p>
            <p className="text-3xl font-bold">
              {totalBudget.toLocaleString()} Ar
            </p>
          </div>
          <div className="p-3 bg-white bg-opacity-20 rounded-lg">
            <Megaphone size={32} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Rechercher une campagne..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <select
            value={canalFilter}
            onChange={(e) => setCanalFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">Tous les canaux</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="MARCHE_LOCAL">Marché local</option>
            <option value="SITE_WEB">Site Web</option>
            <option value="PATENARIAT">Partenariat</option>
            <option value="AUTRE">Autre</option>
          </select>
        </div>
      </div>

      {/* Marketing Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActions.map((action) => (
          <div
            key={action.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-gray-100">
                  {getCanalIcon(action.canal)}
                </div>
                <div className="ml-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCanalColor(
                      action.canal
                    )}`}
                  >
                    {getCanalLabel(action.canal)}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(action.dateAction).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-3">
              {action.description}
            </h3>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Coût de la campagne</span>
              <span className="font-bold text-lg text-purple-600">
                {action.cout.toLocaleString()} Ar
              </span>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                Voir résultats
              </button>
              <button
                onClick={() => {
                  setEditingMarketing(action);
                  setIsModalOpen(true);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Modifier
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">
              {editingMarketing ? "Modifier la campagne" : "Nouvelle campagne"}
            </h2>
            <MarketingForm
              marketing={editingMarketing}
              onSaved={() => {
                setIsModalOpen(false);
                fetchData();
              }}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
