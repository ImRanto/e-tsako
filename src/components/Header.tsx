import {
  Package,
  Menu,
  X,
  LogOut,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useState, useEffect } from "react";

const app_name = import.meta.env.VITE_APP_NAME;

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Effet de scroll pour changer l'apparence
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigationLinks = [
    { href: "#home", label: "Accueil" },
    { href: "#features", label: "Fonctionnalités" },
    { href: "#testimonials", label: "Témoignages" },
    { href: "#contact", label: "Contact" },
  ];

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
    setIsMenuOpen(false);
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md border-b border-slate-200 py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg group-hover:bg-amber-500 transition-all duration-300">
              <Package size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              {app_name}
              <span className="text-amber-500">.</span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navigationLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-amber-500 after:transition-all hover:after:w-full"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="h-6 w-px bg-slate-200 mx-2" />

            {user ? (
              /* USER CONNECTÉ */
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-full bg-slate-50 border border-slate-200 hover:border-amber-300 transition-all"
                >
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">
                    {getInitials(user.nom)}
                  </div>
                  <div className="hidden lg:block text-left leading-none">
                    <p className="text-xs font-bold text-slate-900">
                      {user.nom?.split(" ")[0]}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter mt-0.5">
                      {user.role}
                    </p>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-300 ${isUserDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* DROPDOWN ELEGANTE */}
                {isUserDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-0"
                      onClick={() => setIsUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-3 border-b border-slate-50">
                        <p className="text-xs text-slate-400 font-medium">
                          Connecté en tant que
                        </p>
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {user.email}
                        </p>
                      </div>

                      <div className="p-1">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
                        >
                          <LayoutDashboard size={16} /> Dashboard
                        </Link>
                        {/* <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors">
                          <Settings size={16} /> Paramètres
                        </Link> */}
                      </div>

                      <div className="p-1 border-t border-slate-50 mt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <LogOut size={16} /> Déconnexion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* NON CONNECTÉ */
              <Link to="/login">
                <button className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-200 transition-all active:scale-95">
                  Se connecter
                </button>
              </Link>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="space-y-4">
            {navigationLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block text-lg font-medium text-slate-600"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-6 border-t border-slate-100">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl font-bold"
              >
                <LogOut size={20} /> Déconnexion
              </button>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <button className="w-full p-4 bg-slate-900 text-white rounded-2xl font-bold">
                  Se connecter
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
