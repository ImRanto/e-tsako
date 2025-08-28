import { useEffect, useState } from "react";

interface Historique {
  id: number;
  dateAction: string;
  endpoint: string;
  methode: string;
  payload: string;
  utilisateur: string;
}

const baseUrl = import.meta.env.VITE_API_URL;

export default function HistoriquePage() {
  const [historiques, setHistoriques] = useState<Historique[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Utilisateur non authentifié !");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/historiques`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erreur lors du chargement des historiques");

      const data: Historique[] = await res.json();
      setHistoriques(data);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <p className="p-6 text-gray-500">Chargement des historiques...</p>;
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        📜 Historique des actions
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                ID
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Date
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Endpoint
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Méthode
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Payload
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Utilisateur
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {historiques.map((h) => (
              <tr key={h.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-800">{h.id}</td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {new Date(h.dateAction).toLocaleString("fr-FR")}
                </td>
                <td className="px-4 py-2 text-sm text-blue-600">
                  {h.endpoint}
                </td>
                <td className="px-4 py-2 text-sm font-semibold">
                  <span
                    className={`px-2 py-1 rounded ${
                      h.methode === "POST"
                        ? "bg-green-100 text-green-700"
                        : h.methode === "PUT"
                        ? "bg-yellow-100 text-yellow-700"
                        : h.methode === "DELETE"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {h.methode}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-500 max-w-xs truncate">
                  <pre className="whitespace-pre-wrap break-words text-xs">
                    {h.payload}
                  </pre>
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {h.utilisateur}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
