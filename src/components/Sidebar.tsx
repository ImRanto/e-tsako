import { useState, useEffect } from "react";
import { menuByRole } from "../config/menus";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  TrendingDown,
  Archive,
  Megaphone,
  BarChart3,
  Menu,
  X,
  LogOut,
  Key,
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

const menuItems = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "products", label: "Produits", icon: Package },
  { id: "customers", label: "Clients", icon: Users },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "orders", label: "Commandes", icon: ShoppingCart },
  { id: "expenses", label: "Dépenses", icon: TrendingDown },
  { id: "stock", label: "Stock", icon: Archive },
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "reports", label: "Rapports", icon: BarChart3 },
];

const app_name = import.meta.env.VITE_APP_NAME || "I-TSAKY";
const baseUrl = import.meta.env.VITE_API_URL;

export default function Sidebar({
  currentPage,
  onPageChange,
  onLogout,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const role = currentUser?.role || "VENTE"; // défaut: VENTE
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

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-amber-500 text-white rounded-md shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:w-64 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-20 px-4 border-b border-gray-200">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center mr-3">
              <Package size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{app_name}</h1>
              <p className="text-xs text-gray-500">Gestion de snacks</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onPageChange(item.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        isActive
                          ? "bg-amber-50 text-amber-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <Icon size={20} className="mr-3" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User info + Dropdown Logout */}
          <div className="relative p-4 border-t border-gray-200">
            {currentUser ? (
              <div>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center w-full px-2 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {currentUser?.nom
                      ? currentUser.nom.charAt(0).toUpperCase()
                      : "?"}
                  </div>
                  <div className="ml-3 text-left">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                      {currentUser?.nom || "Utilisateur"}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[120px]">
                      {currentUser?.email || "inconnu"}
                    </p>
                  </div>
                </button>
                {/* Menu dropdown avec animation */}
                {dropdownOpen && (
                  <div className="absolute bottom-16 left-4 w-48 bg-white border border-gray-200 rounded-xl shadow-lg transform origin-bottom animate-fade-in-up">
                    {
                      <button
                        onClick={() => {
                          setIsAuthenticated(true); // active l'affichage de la sidebar et des pages
                          onPageChange("admin");
                          setDropdownOpen(false);
                          setIsOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Générer une clé
                      </button>
                    }
                    <button
                      onClick={onLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Utilisateur non connecté</p>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Animation CSS */}
      <style>
        {`
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.2s ease-out;
          }
        `}
      </style>
    </>
  );
}
