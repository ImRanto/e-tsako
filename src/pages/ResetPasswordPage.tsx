import { useState } from "react";

const baseUrl = import.meta.env.VITE_API_URL;
const app_name = import.meta.env.VITE_APP_NAME;
const API_KEY = import.meta.env.VITE_API_KEY;

interface ResetPasswordPageProps {
  onShowLogin: () => void;
}

export default function ResetPasswordPage({
  onShowLogin,
}: ResetPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [activationKey, setActivationKey] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showActivationKey, setShowActivationKey] = useState(false);
  const [step, setStep] = useState<"request" | "reset">("request");
  const [requestingReset, setRequestingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const isPasswordStrong = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  };

  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Demander un code de réinitialisation
  const handleRequestReset = async () => {
    if (!email || !isValidEmail(email)) {
      setError("Veuillez entrer une adresse email valide");
      return;
    }

    setRequestingReset(true);
    setError("");
    setSuccess("");

    try {
      const exists = await checkEmailExists(email);

      if (!exists) {
        // Email inconnu → on bloque
        setError("Aucun compte n'est associé à cet email");
        setRequestingReset(false);
        return;
      }

      const res = await fetch(
        `${baseUrl}/api/auth/request-reset-password?email=${encodeURIComponent(
          email
        )}`,
        {
          method: "POST",
          headers: {
            "X-API-KEY": API_KEY,
          },
        }
      );

      if (res.ok) {
        setResetSent(true);
        setSuccess(
          "Code de réinitialisation envoyé par email. Vérifiez votre boîte de réception."
        );

        setTimeout(() => {
          setStep("reset");
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || "Erreur lors de l'envoi du code");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur de connexion au serveur");
    } finally {
      setRequestingReset(false);
    }
  };


  const checkEmailExists = async (email: string): Promise<boolean> => {
    const res = await fetch(
      `${baseUrl}/api/auth/check-email?email=${encodeURIComponent(email)}`,
      {
        headers: {
          "X-API-KEY": API_KEY,
        },
      }
    );

    if (!res.ok) {
      throw new Error("Impossible de vérifier l'email");
    }

    const data = await res.json();
    return data.exists; // true | false
  };


  // Réinitialiser le mot de passe
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!email || !activationKey || !newPassword || !confirmPassword) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (!isPasswordStrong(newPassword)) {
      setError(
        "Mot de passe faible. Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre."
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${baseUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": API_KEY,
        },
        body: JSON.stringify({
          email,
          activationKey,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la réinitialisation");
        return;
      }

      setSuccess(
        "Mot de passe réinitialisé avec succès ! Redirection vers la connexion..."
      );

      // Réinitialisation des champs
      setEmail("");
      setActivationKey("");
      setNewPassword("");
      setConfirmPassword("");

      // Redirection après 2 secondes
      setTimeout(() => {
        onShowLogin();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  // Composant d'étape de demande
  const renderRequestStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-800">
          Réinitialisation du mot de passe
        </h2>
        <p className="text-slate-500 text-sm mt-2">
          Entrez votre email pour recevoir un code de réinitialisation
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-red-400 mt-0.5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
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
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            disabled={requestingReset || resetSent}
            required
          />
        </div>
      </div>

      {resetSent && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-green-400 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-green-800 text-sm">
              Code envoyé ! Vérifiez votre boîte email.
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleRequestReset}
          disabled={
            !email || !isValidEmail(email) || requestingReset || resetSent
          }
          className={`w-full py-3 px-4 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors ${
            !email || !isValidEmail(email) || requestingReset || resetSent
              ? "bg-amber-400 cursor-not-allowed"
              : "bg-amber-600 hover:bg-amber-700"
          }`}
        >
          {requestingReset ? (
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
              Envoi en cours...
            </div>
          ) : resetSent ? (
            "Code envoyé ✓"
          ) : (
            "Recevoir un code de réinitialisation"
          )}
        </button>

        <button
          type="button"
          onClick={() => setStep("reset")}
          className="w-full py-3 px-4 border border-amber-600 text-amber-600 rounded-lg font-medium hover:bg-amber-50 transition-colors"
        >
          J'ai déjà un code de réinitialisation
        </button>

        <button
          type="button"
          onClick={onShowLogin}
          className="text-sm text-amber-600 hover:text-amber-500 font-medium text-center"
        >
          ← Retour à la connexion
        </button>
      </div>
    </div>
  );

  // Composant d'étape de réinitialisation
  const renderResetStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-800">
          Nouveau mot de passe
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Entrez le code reçu et votre nouveau mot de passe
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-red-400 mt-0.5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-green-400 mt-0.5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          type="email"
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
          required
          readOnly
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Code de réinitialisation
        </label>
        <div className="relative">
          <input
            type={showActivationKey ? "text" : "password"}
            placeholder="Entrez le code reçu par email"
            value={activationKey}
            onChange={(e) => setActivationKey(e.target.value)}
            className="w-full pl-4 pr-10 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            required
          />
          <button
            type="button"
            onClick={() => setShowActivationKey(!showActivationKey)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-amber-600"
          >
            {showActivationKey ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                  clipRule="evenodd"
                />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-slate-500">
            Code à 8 caractères envoyé par email
          </p>
          <button
            type="button"
            onClick={() => setStep("request")}
            className="text-xs text-amber-600 hover:text-amber-500 font-medium"
          >
            Renvoyer le code
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nouveau mot de passe
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Créez un nouveau mot de passe"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full pl-4 pr-10 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-amber-600"
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                  clipRule="evenodd"
                />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>
        <p
          className={`text-xs mt-1 ${
            isPasswordStrong(newPassword) ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPasswordStrong(newPassword)
            ? "✓ Mot de passe sécurisé"
            : "Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre"}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Confirmer le mot de passe
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Répétez le nouveau mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-4 pr-10 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-amber-600"
          >
            {showConfirmPassword ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                  clipRule="evenodd"
                />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={
            isLoading ||
            !email ||
            !activationKey ||
            !newPassword ||
            !confirmPassword
          }
          className={`w-full py-3 px-4 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors ${
            isLoading ||
            !email ||
            !activationKey ||
            !newPassword ||
            !confirmPassword
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
              Réinitialisation...
            </div>
          ) : (
            "Réinitialiser le mot de passe"
          )}
        </button>

        <div className="text-center text-sm text-slate-600">
          <p>
            Retour à la{" "}
            <button
              type="button"
              onClick={onShowLogin}
              className="font-medium text-amber-600 hover:text-amber-500 focus:outline-none focus:underline transition-colors"
            >
              Connexion
            </button>
          </p>
        </div>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">{app_name}</h1>
          <p className="text-amber-100 text-sm mt-1">
            {step === "request"
              ? "Demande de réinitialisation"
              : "Nouveau mot de passe"}
          </p>
        </div>

        <div className="p-8">
          {step === "request" ? renderRequestStep() : renderResetStep()}
        </div>

        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200">
          <p className="text-xs text-center text-slate-500">
            © {new Date().getFullYear()} {app_name} • Assistance technique
          </p>
        </div>
      </div>
    </div>
  );
}
