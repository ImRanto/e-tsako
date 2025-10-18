import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: any;
  login: (userData: any, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  // Fonction pour synchroniser l'état d'authentification
  const syncAuthState = () => {
    const storedUser = sessionStorage.getItem("user");
    const storedToken = sessionStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing saved user:", e);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // Synchroniser au chargement initial
    syncAuthState();

    // Écouter les changements de sessionStorage entre les onglets
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" || e.key === "token") {
        syncAuthState();
      }
    };

    // Écouter les événements de storage (entre onglets)
    window.addEventListener("storage", handleStorageChange);

    // Écouter les événements personnalisés (même onglet)
    const handleAuthChange = () => {
      syncAuthState();
    };

    window.addEventListener("authStateChange", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authStateChange", handleAuthChange);
    };
  }, []);

  const login = (userData: any, token: string) => {
    sessionStorage.setItem("user", JSON.stringify(userData));
    sessionStorage.setItem("token", token);
    setUser(userData);
    // Déclencher l'événement pour synchroniser tous les composants
    window.dispatchEvent(new Event("authStateChange"));
  };

  const logout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setUser(null);
    // Déclencher l'événement pour synchroniser tous les composants
    window.dispatchEvent(new Event("authStateChange"));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
};
