import { useState } from "react";

interface LoginPageTestProps {
  onLogin: () => void;
}

export default function LoginPageTest({ onLogin }: LoginPageTestProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Mock authentication simple : utilisateur = "admin", mot de passe = "1234"
    if (username === "admin" && password === "12344321") {
      onLogin();
    } else {
      alert("Identifiant ou mot de passe incorrect !");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-80 flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Se connecter</h2>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <button
          type="submit"
          className="bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition-colors"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}
