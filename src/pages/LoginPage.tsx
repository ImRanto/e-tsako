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
}

export default function LoginPage({ onLogin, onShowRegister }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
      console.log("Utilisateur connecté :", data);

      // Succès
      onLogin();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors de la connexion");
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

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

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

        <button
          type="button"
          onClick={onShowRegister}
          className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
        >
          Pas encore de compte ? S’inscrire
        </button>
      </form>
    </div>
  );
}
