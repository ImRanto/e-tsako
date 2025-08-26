import { useState, useEffect } from "react";
import {
  Copy,
  Check,
  Key,
  Plus,
  Trash2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const baseUrl = import.meta.env.VITE_API_URL;

interface ActivationKey {
  id: number;
  keyValue: string;
  createdAt: string;
  used: boolean;
  expiresAt?: string;
}

export default function AdminActivationPage() {
  const [keys, setKeys] = useState<ActivationKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedKeyId, setCopiedKeyId] = useState<number | null>(null);
  const token = localStorage.getItem("token");

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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Gestion des clés d'activation
              </h1>
              <p className="text-slate-600">
                Générez, consommez et supprimez les clés d'activation
              </p>
            </div>
            <button
              onClick={handleGenerateKey}
              disabled={loading}
              className={`mt-4 md:mt-0 inline-flex items-center py-3 px-6 rounded-xl font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all ${
                loading
                  ? "bg-amber-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-md hover:shadow-lg"
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

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start">
              <Check className="h-5 w-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-emerald-700">{success}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Clés d'activation existantes
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="h-6 w-6 text-amber-600 animate-spin mr-3 inline-block" />
              <span className="text-slate-600">Chargement des clés...</span>
            </div>
          ) : keys.length === 0 ? (
            <div className="p-12 text-center">
              <Key className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Aucune clé d'activation
              </h3>
              <p className="text-slate-600">
                Générez votre première clé pour commencer
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Clé d'activation
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Créée le
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Expiration
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {keys.map((key) => (
                    <tr
                      key={key.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-slate-900">
                        #{key.id}
                      </td>
                      <td className="py-4 px-6 text-sm font-mono text-slate-800">
                        <div className="flex items-center">
                          <span className="truncate max-w-xs">
                            {key.keyValue}
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(key.keyValue, key.id)
                            }
                            className="ml-2 p-1 text-slate-400 hover:text-amber-600 transition-colors"
                            title="Copier la clé"
                          >
                            {copiedKeyId === key.id ? (
                              <Check className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-sm text-slate-600">
                        {formatDate(key.createdAt)}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
                            key.used
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-200"
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
                          {key.used ? "Utilisée" : "Active"}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-sm text-slate-600">
                        {key.expiresAt ? formatDate(key.expiresAt) : "N/A"}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteKey(key.id)}
                          className="text-red-600 hover:text-red-800 p-1 transition-colors"
                          title="Supprimer la clé"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
