import { useEffect, useState } from "react";
import { X, User as UserIcon, Loader2 } from "lucide-react";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  actif: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function UserProfileModal({ isOpen, onClose }: UserModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const fetchUserProfile = async () => {
      setIsLoading(true);
      setError("");

      try {
        const token = sessionStorage.getItem("token");
        if (!token) throw new Error("Session utilisateur non valide");

        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Échec de la récupération du profil utilisateur");
        }

        const userData: User = await response.json();
        setUser(userData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Une erreur inattendue s'est produite"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [isOpen]);

  if (!isOpen) return null;

  const userInitial = user?.nom?.charAt(0)?.toUpperCase() || "U";
  const fullName = user ? `${user.nom} ${user.prenom}` : "";

  return (
    <>
      {/* Overlay avec animation */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center space-x-3">
              <UserIcon className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Profil Utilisateur
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/50 transition-all duration-200 group"
              aria-label="Fermer le modal"
            >
              <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {user && !isLoading && (
              <div className="space-y-6">
                {/* Avatar et informations principales */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-white">
                        {userInitial}
                      </span>
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        user.actif ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {fullName}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {user.email}
                    </p>
                    <span className="inline-block mt-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* Détails du profil */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                    <span className="text-sm font-medium text-gray-700">
                      Rôle
                    </span>
                    <span className="text-sm font-semibold text-gray-900 capitalize">
                      {user.role.toLowerCase()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                    <span className="text-sm font-medium text-gray-700">
                      Statut du compte
                    </span>
                    <span
                      className={`inline-flex items-center text-sm font-semibold ${
                        user.actif ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${
                          user.actif ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      {user.actif ? "Actif" : "Inactif"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-100 bg-gray-50/50">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
