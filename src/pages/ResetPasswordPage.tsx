import { useState } from "react";

const baseUrl = import.meta.env.VITE_API_URL;
const app_name = import.meta.env.VITE_APP_NAME || "I-TSAKY";

interface ResetPasswordPageProps {
  onShowLogin: () => void;
}

export default function ResetPasswordPage({
  onShowLogin,
}: ResetPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [activationKey, setActivationKey] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showActivation, setShowActivation] = useState(false);

  const isPasswordStrong = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isPasswordStrong(newPassword)) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${baseUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, activationKey, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error || "Erreur lors de la réinitialisation du mot de passe"
        );
      }

      setSuccess(
        "Mot de passe réinitialisé avec succès ! Vous allez être redirigé vers la connexion..."
      );
      setEmail("");
      setActivationKey("");
      setNewPassword("");

      // Redirection après 2 secondes
      setTimeout(() => {
        onShowLogin();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || "Erreur lors de la réinitialisation du mot de passe"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">
            Réinitialiser le mot de passe
          </h1>
          <p className="text-amber-100 text-sm mt-1">
            Entrez vos informations pour créer un nouveau mot de passe
          </p>
        </div>

        <div className="p-8 md:p-10 flex flex-col gap-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
            />
            <div className="relative">
              <input
                type={showActivation ? "text" : "password"}
                placeholder="Clé d'activation"
                value={activationKey}
                onChange={(e) => setActivationKey(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowActivation(!showActivation)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gray-100 rounded-full hover:bg-amber-100 transition-colors flex items-center justify-center"
              >
                {showActivation ? (
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

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 pr-10 transition-colors"
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
            {/* Confirmation du mot de passe */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 pr-10 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gray-100 rounded-full hover:bg-amber-100 transition-colors"
              >
                {showConfirmPassword ? (
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
                isPasswordStrong(newPassword)
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              Le mot de passe doit contenir au moins 8 caractères, une
              majuscule, une minuscule et un chiffre.
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${
                isLoading
                  ? "bg-amber-400 cursor-not-allowed"
                  : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              {isLoading ? "En cours..." : "Réinitialiser"}
            </button>
          </form>

          <div className="text-center mt-4 text-sm text-slate-600">
            <button
              onClick={onShowLogin}
              className="font-medium text-amber-600 hover:text-amber-500 focus:outline-none focus:underline"
            >
              Retour à la connexion
            </button>
            {/* Texte pour demander la clé à l'admin */}
            <p className="text-xs mt-1 text-slate-500">
              Vous n'avez pas de clé d'activation ?{" "}
              <button
                type="button"
                onClick={() => (window.location.href = "/contact")} // redirection vers la page contact
                className="text-amber-600 hover:text-amber-500 underline font-medium focus:outline-none"
              >
                Contactez l'administrateur
              </button>
            </p>
          </div>
        </div>

        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200">
          <p className="text-xs text-center text-slate-500">
            © {new Date().getFullYear()} {app_name}. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}
