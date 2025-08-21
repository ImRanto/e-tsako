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
}

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Vérifier que tous les champs sont remplis
    if (!nom || !prenom || !email || !password || !secret) {
      setError("Veuillez remplir tous les champs !");
      return;
    }

    // Vérifier le mot de passe secret
    if (secret !== SECRET_KEY) {
      setError(
        "Mot de passe secret incorrect ! Veuillez contacter l'administrateur."
      );
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom,
          prenom,
          email,
          motDePasse: password,
          role: "VENTE",
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Erreur lors de l'inscription");
      }

      const data: RegisterResponse = await res.json();
      console.log("Utilisateur inscrit :", data);

      setSuccess("Compte créé avec succès !");
      setTimeout(() => {
        onRegisterSuccess(); // connexion automatique après inscription
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors de l'inscription");
    }
  };

  // bouton désactivé si un champ est vide
  const isFormIncomplete = !nom || !prenom || !email || !password || !secret;

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white shadow-lg rounded-xl p-8 w-96 flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Inscription
        </h2>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        {success && (
          <p className="text-green-600 text-sm text-center">{success}</p>
        )}

        <input
          type="text"
          placeholder="Nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <input
          type="text"
          placeholder="Prénom"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <input
          type="password"
          placeholder="Mot de passe secret"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        <button
          type="submit"
          disabled={isFormIncomplete}
          className={`w-full py-2 rounded-lg transition-colors ${
            isFormIncomplete
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-amber-500 text-white hover:bg-amber-600"
          }`}
        >
          S’inscrire
        </button>

        <button
          type="button"
          onClick={onShowLogin}
          className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
        >
          Déjà inscrit ? Se connecter
        </button>
      </form>
    </div>
  );
}
