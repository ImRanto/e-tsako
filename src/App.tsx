// App.tsx
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Loader from "./components/Loader";
import { getUserFromToken, DecodedToken } from "./utils/auth";
import AdminLoginPage from "./pages/AdminLoginPage";
import Branding from "./components/Brainding";
import AuthContainer from "./components/AuthContainer";
import { renderPage } from "./config/page";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<DecodedToken | null>(null);

  const baseUrl = import.meta.env.VITE_API_URL;
  const app_name = import.meta.env.VITE_APP_NAME;
  const API_KEY = import.meta.env.VITE_API_KEY;

  // Vérifier sessionStorage au démarrage
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    const decoded = getUserFromToken(token);
    if (!decoded) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("role");
      setIsAuthenticated(false);
      setUserInfo(null);
    } else {
      setUserInfo(decoded);
      setIsAuthenticated(true);
    }
  }, []);

  // Ping backend régulièrement
  useEffect(() => {
    const pingBackend = async () => {
      try {
        const res = await fetch(`${baseUrl}/pingR`, {
          method: "GET",
          headers: { "X-API-KEY": API_KEY },
        });
        if (!res.ok) console.error("Ping failed with status", res.status);
      } catch (err) {
        console.error("Backend ping failed", err);
      }
    };

    pingBackend();
    const interval = setInterval(pingBackend, 13 * 60 * 1000); // toutes les 13 min
    return () => clearInterval(interval);
  }, [baseUrl]);

  // Loader initial
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    setIsAuthenticated(false);
    setUserInfo(null);
    setCurrentPage("dashboard");
  };

  return (
    <>
      {isLoading && <Loader />}
      {isAuthenticated || currentPage === "admin" ? (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
          <Sidebar
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onLogout={handleLogout}
          />
          <main className="flex-1 lg:ml-72 transition-all duration-300">
            {currentPage === "admin" ? (
              <AdminLoginPage
                adminUser={import.meta.env.VITE_ADMIN_USER}
                adminPassword={import.meta.env.VITE_ADMIN_PASSWORD}
              />
            ) : (
              renderPage(currentPage, userInfo?.role)
            )}
          </main>
        </div>
      ) : (
        <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-amber-400 to-orange-500">
          <Branding app_name={app_name} />
          <AuthContainer
            showRegister={showRegister}
            showResetPassword={showResetPassword}
            setShowRegister={setShowRegister}
            setShowResetPassword={setShowResetPassword}
            onLogin={() => setIsAuthenticated(true)}
          />
        </div>
      )}
    </>
  );
}

export default App;
