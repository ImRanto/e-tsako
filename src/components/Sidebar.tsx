import { useState, useEffect } from "react";
import { menuByRole } from "../config/menus";
import {
  Package,
  Menu,
  X,
  LogOut,
  Key,
  ChevronDown,
  Settings,
  User,
  Building,
  Truck,
} from "lucide-react";

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
  isAdmin?: boolean;
}

interface User {
  nom: string;
  email: string;
  role?: string;
}

const app_name = import.meta.env.VITE_APP_NAME || "I-TSAKY";
const baseUrl = import.meta.env.VITE_API_URL;

// Icônes pour les différents rôles
const roleIcons = {
  ADMIN: <Settings size={14} className="text-purple-600" />,
  VENTE: <User size={14} className="text-blue-600" />,
  PRODUCTION: <Building size={14} className="text-green-600" />,
  MARKETING: <Truck size={14} className="text-orange-600" />,
};

// Couleurs pour les différents rôles
const roleColors = {
  ADMIN: "bg-purple-100 text-purple-800",
  VENTE: "bg-blue-100 text-blue-800",
  PRODUCTION: "bg-green-100 text-green-800",
  MARKETING: "bg-orange-100 text-orange-800",
};

export default function Sidebar({
  currentPage,
  onPageChange,
  onLogout,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const role = currentUser?.role || "VENTE";
  const menuItems = menuByRole[role] || [];

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Error parsing saved user:", e);
        }
      }

      if (!token) return;

      try {
        const res = await fetch(`${baseUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data: User = await res.json();
          setCurrentUser(data);
          localStorage.setItem("user", JSON.stringify(data));
        }
      } catch (err) {
        console.error("Erreur récupération utilisateur:", err);
      }
    };

    fetchUser();
  }, []);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = () => {
      if (dropdownOpen) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 bg-gradient-to-b from-white to-gray-50 shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:w-72 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-20 px-6 border-b border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mr-3 shadow-md">
              <Package size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{app_name}</h1>
              <p className="text-xs text-gray-500 font-medium">
                Gestion Premium
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="mb-4 px-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Navigation Principale
              </h2>
            </div>
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onPageChange(item.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                        isActive
                          ? "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-l-4 border-amber-500 shadow-sm"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
                      }`}
                    >
                      <Icon
                        size={20}
                        className={`mr-3 transition-colors ${
                          isActive
                            ? "text-amber-600"
                            : "text-gray-400 group-hover:text-gray-600"
                        }`}
                      />
                      <span className="font-medium text-sm">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-amber-500 rounded-full"></div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User info + Dropdown */}
          <div className="p-4 border-t border-gray-100 bg-white">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(!dropdownOpen);
                  }}
                  className="flex items-center w-full p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-semibold shadow-md">
                      {currentUser.nom
                        ? currentUser.nom.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>

                  <div className="ml-3 text-left flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {currentUser.nom || "Utilisateur"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {currentUser.email || "inconnu@example.com"}
                    </p>
                    <div className="flex items-center mt-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          roleColors[role as keyof typeof roleColors] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {roleIcons[role as keyof typeof roleIcons] || (
                          <User size={10} />
                        )}
                        <span className="ml-1">{role}</span>
                      </span>
                    </div>
                  </div>

                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Menu dropdown */}
                {dropdownOpen && (
                  <div
                    className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-fade-in-up z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
                        Compte
                      </div>

                      {role === "ADMIN" && (
                        <button
                          onClick={() => {
                            setIsAuthenticated(true);
                            onPageChange("admin");
                            setDropdownOpen(false);
                            setIsOpen(false);
                          }}
                          className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
                        >
                          <Key size={16} className="mr-2 text-purple-600" />
                          Générer une clé
                        </button>
                      )}
                      {/* 
                      <button
                        onClick={() => {
                          onPageChange("profile");
                          setDropdownOpen(false);
                          setIsOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
                      >
                        <User size={16} className="mr-2 text-blue-600" />
                        Mon profil
                      </button> */}

                      <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-100 mt-1">
                        Session
                      </div>

                      <button
                        onClick={onLogout}
                        className="flex items-center w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-lg"
                      >
                        <LogOut size={16} className="mr-2" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <User size={24} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">Non connecté</p>
                <button className="mt-2 text-sm text-amber-600 hover:text-amber-700 font-medium">
                  Se connecter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Animation CSS */}
      <style>
        {`
          @keyframes fade-in-up {
            from { 
              opacity: 0; 
              transform: translateY(10px) scale(0.95); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0) scale(1); 
            }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.2s ease-out;
          }
        `}
      </style>
    </>
  );
}
