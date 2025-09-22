import { useState, useEffect, useRef } from "react";
import { X, User as UserIcon, Loader2 } from "lucide-react";

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  actif: boolean;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

export function UserProfileModal({
  isOpen,
  onClose,
  triggerRef,
}: UserProfileModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [position, setPosition] = useState({ top: 100, left: 100 });

  const modalRef = useRef<HTMLDivElement>(null);

  // Gestion du drag & drop
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [modalStartPosition, setModalStartPosition] = useState({
    top: 0,
    left: 0,
  });

  // Centrage initial de la modale
  useEffect(() => {
    if (isOpen) {
      const centerX = window.innerWidth / 2 - 160;
      const centerY = window.innerHeight / 2 - 200;
      setPosition({ top: Math.max(centerY, 20), left: Math.max(centerX, 20) });
    }
  }, [isOpen]);

  // Gestion du drag
  const startDrag = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
    setModalStartPosition({ top: position.top, left: position.left });
  };

  const duringDrag = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;

    const newTop = Math.max(0, modalStartPosition.top + deltaY);
    const newLeft = Math.max(0, modalStartPosition.left + deltaX);

    setPosition({ top: newTop, left: newLeft });
  };

  const endDrag = () => setIsDragging(false);

  // Événements souris
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => duringDrag(e.clientX, e.clientY);
    const handleMouseUp = () => endDrag();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Événements tactiles
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    duringDrag(touch.clientX, touch.clientY);
  };

  // Récupération des données utilisateur
  useEffect(() => {
    if (!isOpen) return;

    const fetchUserProfile = async () => {
      setIsLoading(true);
      setError("");

      try {
        const token = sessionStorage.getItem("token");
        if (!token) throw new Error("Session invalide");

        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Impossible de récupérer le profil");

        const userData: User = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [isOpen]);

  // Fermeture en cliquant à l'extérieur
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const userInitial = user?.nom?.charAt(0)?.toUpperCase() || "U";
  const fullName = user ? `${user.prenom} ${user.nom}` : "";

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" />

      {/* Modale */}
      <div
        ref={modalRef}
        className={`fixed z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-100/80 backdrop-blur-lg transform transition-all duration-200 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={endDrag}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <UserIcon className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">
              Mon Profil
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors duration-150"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-5 space-y-5">
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {user && !isLoading && (
            <div className="space-y-5">
              {/* Avatar et informations principales */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-xl font-bold text-white">
                      {userInitial}
                    </span>
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      user.actif ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {fullName}
                  </h3>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {user.email}
                  </p>
                  <span className="inline-block mt-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-md">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Détails */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Rôle
                  </span>
                  <span className="text-sm font-semibold text-gray-900 capitalize">
                    {user.role.toLowerCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Statut
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

        {/* Pied de page */}
        <div className="flex justify-end p-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors duration-150"
          >
            Fermer
          </button>
        </div>
      </div>
    </>
  );
}
