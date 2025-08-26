// pages/AdminLoginPage.tsx
import { useState, useEffect } from "react";
import AdminActivationPage from "./AdminActivationPage";
import {
  Eye,
  EyeOff,
  Key,
  User,
  Shield,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const ADMIN_USER = import.meta.env.VITE_ADMIN_USER;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

export default function AdminLoginPage() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simuler un délai de traitement pour une meilleure UX
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (user === ADMIN_USER && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Identifiants incorrects. Veuillez réessayer.");
    }
    setIsLoading(false);
  };

  // Vérifie si le mot de passe est fort (au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre)
  const isPasswordStrong = (pwd: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(pwd);
  };

  if (isAuthenticated) {
    return <AdminActivationPage />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl shadow-inner mb-4">
            <Shield className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Espace Administrateur
          </h1>
          <p className="text-slate-600">Accédez au panneau de gestion</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="username"
                type="text"
                placeholder="Saisissez votre identifiant"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Saisissez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-12 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {password && (
              <div
                className={`mt-2 flex items-center text-xs ${
                  isPasswordStrong(password)
                    ? "text-emerald-600"
                    : "text-amber-600"
                }`}
              >
                {isPasswordStrong(password) ? (
                  <CheckCircle className="h-4 w-4 mr-1" />
                ) : (
                  <AlertCircle className="h-4 w-4 mr-1" />
                )}
                <span>
                  {isPasswordStrong(password)
                    ? "Mot de passe sécurisé"
                    : "Doit contenir 8+ caractères, majuscule, minuscule et chiffre"}
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-xl font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all ${
              isLoading
                ? "bg-amber-400 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-md hover:shadow-lg"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Connexion...
              </div>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            Accès réservé au personnel autorisé. Toute utilisation non autorisée
            est strictement interdite.
          </p>
        </div>
      </div>
    </div>
  );
}
