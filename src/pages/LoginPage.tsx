import { useState } from "react";

const baseUrl = import.meta.env.VITE_API_URL;

interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  role: string;
  email: string;
  motDePasse: string;
}

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${baseUrl}/api/utilisateurs`);
      if (!res.ok) throw new Error("Impossible de récupérer les utilisateurs");
      const utilisateurs: Utilisateur[] = await res.json();

      const utilisateur = utilisateurs.find(
        (u) => u.email === email && u.motDePasse === password
      );

      if (utilisateur) {
        // Auth réussie
        onLogin();
      } else {
        setError("Email ou mot de passe incorrect");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la connexion");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-lg rounded-xl p-8 w-96 flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Connexion
        </h2>

        {error && (
          <p className="text-red-600 text-sm mb-2 text-center">{error}</p>
        )}

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
        <button
          type="submit"
          className="w-full bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition-colors"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}
