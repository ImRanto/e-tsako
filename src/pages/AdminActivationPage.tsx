import { useState, useEffect } from "react";
import {
  Copy,
  Check,
  Key,
  Plus,
  Trash2,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Download,
  Eye,
  EyeOff,
  Calendar,
  UserCheck,
  UserX,
} from "lucide-react";
import { ActivationKey } from "../utils/types";

const baseUrl = import.meta.env.VITE_API_URL;

export default function AdminActivationPage() {
  const [keys, setKeys] = useState<ActivationKey[]>([]);
  const [filteredKeys, setFilteredKeys] = useState<ActivationKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedKeyId, setCopiedKeyId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showKey, setShowKey] = useState<{ [key: number]: boolean }>({});
  const token = sessionStorage.getItem("token");

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/activation-keys`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des clés");
      const data: ActivationKey[] = await res.json();
      setKeys(data);
      setFilteredKeys(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  // Filtrer les clés en fonction de la recherche et du filtre
  useEffect(() => {
    let result = keys;

    // Filtre par statut
    if (statusFilter !== "all") {
      result = result.filter((key) =>
        statusFilter === "used" ? key.used : !key.used
      );
    }

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (key) =>
          key.keyValue.toLowerCase().includes(term) ||
          key.id.toString().includes(term) ||
          (key.usedBy && key.usedBy.toLowerCase().includes(term))
      );
    }

    setFilteredKeys(result);
  }, [searchTerm, statusFilter, keys]);

  const handleGenerateKey = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${baseUrl}/api/activation-keys/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Erreur lors de la génération");
      }

      const newKey: ActivationKey = await res.json();
      setKeys([newKey, ...keys]);
      setSuccess("Clé d'activation générée avec succès !");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleUseKey = async (keyValue: string) => {
    try {
      const res = await fetch(
        `${baseUrl}/api/activation-keys/use/${keyValue}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Impossible de consommer la clé");
      const updated = await res.json();
      setKeys(
        keys.map((k) => (k.keyValue === keyValue ? { ...k, used: updated } : k))
      );
      setSuccess("Clé consommée avec succès !");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleDeleteKey = async (id: number) => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette clé ? Cette action est irréversible."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/activation-keys/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Impossible de supprimer la clé");
      setKeys(keys.filter((k) => k.id !== id));
      setSuccess("Clé supprimée avec succès !");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(""), 5000);
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const toggleKeyVisibility = (id: number) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const exportToCSV = () => {
    const headers =
      "ID,Clé,Créée le,Statut,Expiration,Utilisé par,Utilisé le\n";
    const csvContent = keys
      .map(
        (key) =>
          `${key.id},"${key.keyValue}",${formatDate(key.createdAt)},${
            key.used ? "Utilisée" : "Active"
          },"${key.expiresAt || "N/A"}","${key.usedBy || "N/A"}","${
            key.usedAt ? formatDate(key.usedAt) : "N/A"
          }"`
      )
      .join("\n");

    const blob = new Blob([headers + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `cles_activation_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };

  const StatsCard = ({
    title,
    value,
    icon: Icon,
    color,
  }: {
    title: string;
    value: number;
    icon: any;
    color: string;
  }) => (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Gestion des clés d'activation
              </h1>
              <p className="text-gray-600">
                Générez et gérez les clés d'activation pour votre application
              </p>
            </div>
            <button
              onClick={handleGenerateKey}
              disabled={loading}
              className={`mt-4 md:mt-0 inline-flex items-center py-3 px-6 rounded-xl font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all shadow-sm ${
                loading
                  ? "bg-amber-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 hover:shadow-md"
              }`}
            >
              {loading ? (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Plus className="h-5 w-5 mr-2" />
              )}
              {loading ? "Génération..." : "Nouvelle clé"}
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatsCard
              title="Total des clés"
              value={keys.length}
              icon={Key}
              color="text-blue-500"
            />
            <StatsCard
              title="Clés actives"
              value={keys.filter((k) => !k.used).length}
              icon={UserCheck}
              color="text-emerald-500"
            />
            <StatsCard
              title="Clés utilisées"
              value={keys.filter((k) => k.used).length}
              icon={UserX}
              color="text-gray-500"
            />
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start">
              <Check className="h-5 w-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-emerald-700">{success}</p>
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une clé, ID ou utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actives</option>
                  <option value="used">Utilisées</option>
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              <button
                onClick={exportToCSV}
                className="flex items-center px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                title="Exporter en CSV"
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </button>
            </div>
          </div>
        </div>

        {/* Keys Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Clés d'activation ({filteredKeys.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="h-8 w-8 text-amber-500 animate-spin mx-auto mb-3" />
              <span className="text-gray-600">Chargement des clés...</span>
            </div>
          ) : filteredKeys.length === 0 ? (
            <div className="p-12 text-center">
              <Key className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== "all"
                  ? "Aucun résultat"
                  : "Aucune clé d'activation"}
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Aucune clé ne correspond à vos critères de recherche"
                  : "Générez votre première clé pour commencer"}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              {/* Desktop Table (hidden on mobile) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Clé d'activation
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Créée le
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expiration
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredKeys.map((key) => (
                      <tr
                        key={key.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{key.id}
                        </td>
                        <td className="py-4 px-6 text-sm font-mono text-gray-800">
                          <div className="flex items-center">
                            <span
                              className={
                                showKey[key.id]
                                  ? ""
                                  : "blur-sm hover:blur-none transition-all"
                              }
                            >
                              {showKey[key.id]
                                ? key.keyValue
                                : key.keyValue.replace(/./g, "•")}
                            </span>
                            <div className="ml-2 flex items-center gap-1">
                              <button
                                onClick={() => toggleKeyVisibility(key.id)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title={
                                  showKey[key.id]
                                    ? "Masquer la clé"
                                    : "Afficher la clé"
                                }
                              >
                                {showKey[key.id] ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  copyToClipboard(key.keyValue, key.id)
                                }
                                className="p-1 text-gray-400 hover:text-amber-600 transition-colors"
                                title="Copier la clé"
                              >
                                {copiedKeyId === key.id ? (
                                  <Check className="h-4 w-4 text-emerald-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            {formatDate(key.createdAt)}
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                              key.used
                                ? "bg-gray-100 text-gray-800"
                                : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            }`}
                            onClick={() =>
                              !key.used && handleUseKey(key.keyValue)
                            }
                            title={
                              key.used
                                ? "Clé déjà utilisée"
                                : "Cliquer pour consommer"
                            }
                          >
                            {key.used ? (
                              <>
                                <UserCheck className="h-3 w-3 mr-1" />
                                Utilisée
                              </>
                            ) : (
                              <>
                                <Key className="h-3 w-3 mr-1" />
                                Active
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-600">
                          {key.expiresAt ? (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                              {formatDate(key.expiresAt)}
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDeleteKey(key.id)}
                            className="text-red-500 hover:text-red-700 p-1 transition-colors"
                            title="Supprimer la clé"
                            disabled={key.used}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards (shown on mobile) */}
              <div className="md:hidden divide-y divide-gray-200">
                {filteredKeys.map((key) => (
                  <div
                    key={key.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    {/* Header avec ID et statut */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-900">
                        #{key.id}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          key.used
                            ? "bg-gray-100 text-gray-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {key.used ? (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Utilisée
                          </>
                        ) : (
                          <>
                            <Key className="h-3 w-3 mr-1" />
                            Active
                          </>
                        )}
                      </span>
                    </div>

                    {/* Clé d'activation */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Clé d'activation
                      </label>
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                        <span
                          className={`font-mono text-sm ${
                            showKey[key.id] ? "" : "blur-sm"
                          }`}
                        >
                          {showKey[key.id]
                            ? key.keyValue
                            : key.keyValue.replace(/./g, "•")}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => toggleKeyVisibility(key.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title={showKey[key.id] ? "Masquer" : "Afficher"}
                          >
                            {showKey[key.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              copyToClipboard(key.keyValue, key.id)
                            }
                            className="p-1 text-gray-400 hover:text-amber-600 transition-colors"
                            title="Copier"
                          >
                            {copiedKeyId === key.id ? (
                              <Check className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Créée le
                        </label>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                          {formatDate(key.createdAt)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Expiration
                        </label>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                          {key.expiresAt ? formatDate(key.expiresAt) : "N/A"}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      {!key.used && (
                        <button
                          onClick={() => handleUseKey(key.keyValue)}
                          className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
                        >
                          Marquer comme utilisée
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteKey(key.id)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Supprimer la clé"
                        disabled={key.used}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* États vides */}
              {filteredKeys.length === 0 && (
                <div className="p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Key className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune clé trouvée
                  </h3>
                  <p className="text-gray-500">
                    Aucune clé ne correspond à vos critères de recherche
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
