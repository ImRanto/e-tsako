import { Package, Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useState } from "react";

const app_name = import.meta.env.VITE_APP_NAME;

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navigationLinks = [
    { href: "#home", label: "Accueil" },
    { href: "#features", label: "Fonctionnalités" },
    { href: "#testimonials", label: "Témoignages" },
    { href: "#contact", label: "Contact" },
  ];

  const handleLogout = () => {
    logout(); // Utilise la fonction de votre contexte
    setIsUserDropdownOpen(false);
    setIsMenuOpen(false);
    navigate("/");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mr-3 shadow-md group-hover:shadow-lg transition-shadow">
              <Package size={20} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                {app_name}
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-amber-600 transition-colors font-medium text-sm"
              >
                {link.label}
              </a>
            ))}

            {user ? (
              // Utilisateur connecté
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                      {getInitials(user.nom)}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {user.nom?.split(" ")[0] || "Utilisateur"}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user.role?.toLowerCase() || "utilisateur"}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${
                      isUserDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown utilisateur */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.nom || "Utilisateur"}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {user.email || "Non spécifié"}
                      </p>
                      <span className="inline-block mt-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full capitalize">
                        {user.role?.toLowerCase() || "utilisateur"}
                      </span>
                    </div>

                    <Link
                      to="/login"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <User size={16} className="mr-3 text-gray-400" />
                      Tableau de bord
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 mt-1"
                    >
                      <LogOut size={16} className="mr-3" />
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Utilisateur non connecté
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <button className="text-gray-600 hover:text-amber-600 transition-colors font-medium text-sm border-2 rounded-lg border-amber-600 p-1">
                    Se connecter
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 animate-slide-down">
            <div className="px-4 py-4 space-y-4">
              {navigationLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block py-2 text-gray-600 hover:text-amber-600 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}

              {user ? (
                // Mobile - Utilisateur connecté
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                      {getInitials(user.nom)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.nom || "Utilisateur"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email || "Non spécifié"}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/login"
                    className="flex items-center w-full py-3 text-gray-700 border-t border-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={18} className="mr-3 text-gray-400" />
                    Tableau de bord
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full py-3 text-red-600 border-t border-gray-100"
                  >
                    <LogOut size={18} className="mr-3" />
                    Se déconnecter
                  </button>
                </div>
              ) : (
                // Mobile - Utilisateur non connecté
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <Link to="/login" className="block w-full">
                    <button
                      className="w-full py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors border-2 rounded-lg border-amber-600 p-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Se connecter
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay pour dropdown desktop */}
      {isUserDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserDropdownOpen(false)}
        />
      )}

      {/* Styles d'animation */}
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slide-down {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.2s ease-out;
          }
          .animate-slide-down {
            animation: slide-down 0.3s ease-out;
          }
        `}
      </style>
    </nav>
  );
}
