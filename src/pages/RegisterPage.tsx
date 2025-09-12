import { useState } from "react";

const baseUrl = import.meta.env.VITE_API_URL;

interface RegisterPageProps {
  onRegisterSuccess: () => void;
  onShowLogin: () => void;
}

interface RegisterResponse {
  id: number;
  nom: string;
  email: string;
  role: string;
  message: string;
  token: string;
}

const app_name = import.meta.env.VITE_APP_NAME;

export default function RegisterPage({
  onRegisterSuccess,
  onShowLogin,
}: RegisterPageProps) {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  const isPasswordStrong = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!nom || !prenom || !email || !password || !secret) {
      setError("Veuillez remplir tous les champs !");
      setIsLoading(false);
      return;
    }

    if (!isPasswordStrong(password)) {
      setError(
        "Mot de passe faible. Minimum 8 caractères, 1 maj, 1 min, 1 chiffre."
      );
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${baseUrl}/api/auth/register?activationKey=${encodeURIComponent(
          secret
        )}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nom,
            prenom,
            email,
            motDePasse: password,
            role: "VENTE", // ou "VENTE" selon le cas
          }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Erreur lors de l'inscription");
      }

      const data: RegisterResponse = await res.json();
      console.log("Utilisateur inscrit :", data);

      // ✅ Sauvegarde du token et utilisateur
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      setSuccess("Compte créé et connecté avec succès !");
      setTimeout(() => {
        onRegisterSuccess(); // => met isAuthenticated à true
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };
  // bouton désactivé si un champ est vide
  const isFormIncomplete = !nom || !prenom || !email || !password || !secret;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-0">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">{app_name}</h1>
          <p className="text-amber-100 text-sm mt-1">
            Création de compte administrateur
          </p>
        </div>

        <form onSubmit={handleRegister} className="p-8 flex flex-col gap-6">
          <div className="text-center mb-2">
            <h2 className="text-xl font-semibold text-slate-800">
              Créer un compte
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Remplissez les informations pour créer votre compte
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="prenom"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Prénom
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-slate-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  id="prenom"
                  type="text"
                  placeholder="Votre prénom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="w-full pl-10 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="nom"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Nom
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-slate-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  id="nom"
                  type="text"
                  placeholder="Votre nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full pl-10 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Adresse email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-slate-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Mot de passe
            </label>
            <div className="relative">
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Créez un mot de passe sécurisé"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
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
            </div>
            <p
              className={`text-xs mt-1 ${
                isPasswordStrong(password) ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPasswordStrong(password)
                ? "Mot de passe sécurisé"
                : "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre."}
            </p>
          </div>

          <div>
            <label
              htmlFor="secret"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Clé d'activation
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-slate-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                id="secret"
                type={showSecretKey ? "text" : "password"}
                placeholder="Mot de passe secret fourni par l'admin"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full pl-10 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)} // ✅ corrige ici
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gray-100 rounded-full hover:bg-amber-100 transition-colors flex items-center justify-center"
              >
                {showSecretKey ? ( // ✅ utilise showSecretKey
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
            <p className="text-xs text-slate-500 mt-1">
              Cette clé est nécessaire pour créer un compte administrateur
            </p>
          </div>

          <button
            type="submit"
            disabled={isFormIncomplete || isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors ${
              isFormIncomplete || isLoading
                ? "bg-amber-400 cursor-not-allowed"
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Création du compte...
              </div>
            ) : (
              "Créer mon compte"
            )}
          </button>

          <div className="text-center text-sm text-slate-600">
            <p>
              Vous avez déjà un compte?{" "}
              <button
                type="button"
                onClick={onShowLogin}
                className="font-medium text-amber-600 hover:text-amber-500 focus:outline-none focus:underline transition-colors"
              >
                Se connecter
              </button>
            </p>
          </div>
        </form>

        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200">
          <p className="text-xs text-center text-slate-500">
            © {new Date().getFullYear()} {app_name}. Comptes administrateur
            uniquement.
          </p>
        </div>
      </div>
    </div>
  );
}
