import { useState } from "react";
import { RegisterResponse } from "../utils/auth";

const baseUrl = import.meta.env.VITE_API_URL;

interface RegisterPageProps {
  onRegisterSuccess: () => void;
  onShowLogin: () => void;
}

const app_name = import.meta.env.VITE_APP_NAME;

export default function RegisterPage({
  onRegisterSuccess,
  onShowLogin,
}: RegisterPageProps) {
  // États du formulaire
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activationKey, setActivationKey] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // États UI
  const [step, setStep] = useState<"email" | "form">("email");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [requestingKey, setRequestingKey] = useState(false);
  const [keySent, setKeySent] = useState(false);

  // États visibilité
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showActivationKey, setShowActivationKey] = useState(false);

  const API_KEY = import.meta.env.VITE_API_KEY;

  // Validation du mot de passe
  const isPasswordStrong = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  };

  // Vérification de l'email
  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
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
    return data.exists;
  };

  // Demander une clé d'activation
  const handleRequestActivationKey = async () => {
    if (!email || !isValidEmail(email)) {
      setError("Veuillez entrer une adresse email valide");
      return;
    }

    setError("");
    setSuccess("");
    setRequestingKey(true);

    try {
      // 🔎 Vérification email existant
      const exists = await checkEmailExists(email);

      if (exists) {
        setError(
          "Un compte avec cette adresse email existe déjà. Veuillez vous connecter."
        );
        return;
      }

      // 📧 Envoi de la clé seulement si email libre
      const res = await fetch(
        `${baseUrl}/api/auth/request-activation-key?email=${encodeURIComponent(
          email
        )}`,
        {
          method: "POST",
          headers: {
            "X-API-KEY": API_KEY,
          },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de l'envoi de la clé");
        return;
      }

      setKeySent(true);
      setSuccess(
        "Clé d'activation envoyée par email. Vérifiez votre boîte de réception."
      );

      setTimeout(() => setStep("form"), 2000);
    } catch (err) {
      console.error(err);
      setError("Erreur de connexion au serveur");
    } finally {
      setRequestingKey(false);
    }
  };

  // Soumission du formulaire d'inscription
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!nom || !prenom || !email || !password || !activationKey) {
      setError("Veuillez remplir tous les champs obligatoires !");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (!isPasswordStrong(password)) {
      setError(
        "Mot de passe faible. Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre."
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        `${baseUrl}/api/auth/register?activationKey=${encodeURIComponent(
          activationKey
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": API_KEY,
          },
          body: JSON.stringify({
            nom,
            prenom,
            email,
            motDePasse: password,
            role: "VENTE",
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de l'inscription");
        return;
      }

      const data: RegisterResponse = await res.json();

      // Stockage des informations de session
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data));

      setSuccess("Compte créé et connecté avec succès !");

      // Redirection après succès
      setTimeout(() => onRegisterSuccess(), 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur inattendue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  // Composant d'étape de vérification email
  const renderEmailStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-800">
          Vérification de l'email
        </h2>
        <p className="text-slate-500 text-sm mt-2">
          Nous allons vous envoyer une clé d'activation pour créer votre compte
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
        <label
          htmlFor="email-step"
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
            id="email-step"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            disabled={requestingKey || keySent}
            required
          />
        </div>
      </div>

      {keySent && (
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
              Clé envoyée ! Vérifiez votre boîte email.
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleRequestActivationKey}
          disabled={!email || !isValidEmail(email) || requestingKey || keySent}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors ${
            !email || !isValidEmail(email) || requestingKey || keySent
              ? "bg-amber-400 cursor-not-allowed"
              : "bg-amber-600 hover:bg-amber-700"
          }`}
        >
          {requestingKey ? (
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
          ) : keySent ? (
            "Clé envoyée ✓"
          ) : (
            "Demander une clé d'activation"
          )}
        </button>

        <button
          type="button"
          onClick={() => setStep("form")}
          className="w-full py-3 px-4 border border-amber-600 text-amber-600 rounded-lg font-medium hover:bg-amber-50 transition-colors"
        >
          J'ai déjà une clé d'activation
        </button>

        <button
          type="button"
          onClick={onShowLogin}
          className="text-sm text-amber-600 hover:text-amber-500 font-medium"
        >
          ← Retour à la connexion
        </button>
      </div>
    </div>
  );

  // Composant d'étape du formulaire
  const renderFormStep = () => (
    <form onSubmit={handleRegister} className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-800">
          Création de compte
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Remplissez vos informations personnelles
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Prénom
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-slate-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
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
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nom
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-slate-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
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
          Mot de passe
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Créez un mot de passe sécurisé"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            isPasswordStrong(password) ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPasswordStrong(password)
            ? "✓ Mot de passe sécurisé"
            : "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre."}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Confirmer le mot de passe
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Répétez votre mot de passe"
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

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Clé d'activation
        </label>
        <div className="relative">
          <input
            type={showActivationKey ? "text" : "password"}
            placeholder="Entrez la clé reçue par email"
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
            La clé vous a été envoyée par email
          </p>
          <button
            type="button"
            onClick={() => setStep("email")}
            className="text-xs text-amber-600 hover:text-amber-500 font-medium"
          >
            Renvoyer la clé
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={
            isLoading ||
            !nom ||
            !prenom ||
            !email ||
            !password ||
            !activationKey
          }
          className={`w-full py-3 px-4 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors ${
            isLoading ||
            !nom ||
            !prenom ||
            !email ||
            !password ||
            !activationKey
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
            Déjà inscrit ?{" "}
            <button
              type="button"
              onClick={onShowLogin}
              className="font-medium text-amber-600 hover:text-amber-500 focus:outline-none focus:underline transition-colors"
            >
              Se connecter
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
            {step === "email" ? "Première étape" : "Création de compte"}
          </p>
        </div>

        <div className="p-8">
          {step === "email" ? renderEmailStep() : renderFormStep()}
        </div>

        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200">
          <p className="text-xs text-center text-slate-500">
            © {new Date().getFullYear()} {app_name} • Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
}
