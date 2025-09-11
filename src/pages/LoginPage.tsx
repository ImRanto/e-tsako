import { useState } from "react";

const baseUrl = import.meta.env.VITE_API_URL;

interface LoginPageProps {
  onLogin: () => void;
  onShowRegister: () => void;
}

interface LoginResponse {
  id: number;
  nom: string;
  email: string;
  role: string;
  message: string;
  token: string;
}

const app_name = import.meta.env.VITE_APP_NAME || "I-TSAKY";

export default function LoginPage({ onLogin, onShowRegister }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

    const isPasswordStrong = (password: string) => {
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      return regex.test(password);
    };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isPasswordStrong(password)) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre."
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, motDePasse: password }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Erreur lors de la connexion");
      }

      const data: LoginResponse = await res.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.id,
          nom: data.nom,
          email: data.email,
          role: data.role,
        })
      );

      onLogin();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">{app_name}</h1>
          <p className="text-amber-100 text-sm mt-1">
            Plateforme de gestion de snacks
          </p>
        </div>

        <form onSubmit={handleLogin} className="p-8 flex flex-col gap-6">
          <div className="text-center mb-2">
            <h2 className="text-xl font-semibold text-slate-800">
              Connexion à votre espace
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Entrez vos identifiants pour accéder à votre compte
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gray-100 rounded-full hover:bg-amber-100 transition-colors flex items-center justify-center"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-amber-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 1l22 22" />
                      <path d="M17.94 17.94A10.94 10.94 0 0112 20c-5.33 0-9.64-3.44-11-8a11.06 11.06 0 012.58-4.18M9.88 9.88a3 3 0 014.24 4.24" />
                      <path d="M14.12 14.12a3 3 0 01-4.24-4.24" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-amber-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5c-4.5 0-8.5 4-8.5 7.5s4 7.5 8.5 7.5 8.5-4 8.5-7.5-4-7.5-8.5-7.5z"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                </button>
              </div>
                          <p
              className={`text-xs mt-1 ${
                isPasswordStrong(password) ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPasswordStrong(password)
                ? "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre."
                : "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre."}
            </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors ${
              isLoading
                ? "bg-amber-400 cursor-not-allowed"
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>

          <div className="text-center text-sm text-slate-600">
            <p>
              Pas encore de compte?{" "}
              <button
                type="button"
                onClick={onShowRegister}
                className="font-medium text-amber-600 hover:text-amber-500 focus:outline-none focus:underline transition-colors"
              >
                Créer un compte
              </button>
            </p>
          </div>
        </form>

        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200">
          <p className="text-xs text-center text-slate-500">
            © {new Date().getFullYear()} {app_name}. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}
