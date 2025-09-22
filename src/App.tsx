import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ProductsPage from "./pages/ProductsPage";
import CustomersPage from "./pages/CustomersPage";
import OrdersPage from "./pages/OrdersPage";
import ExpensesPage from "./pages/ExpensesPage";
import StockPage from "./pages/StockPage";
import MarketingPage from "./pages/MarketingPage";
import ReportsPage from "./pages/ReportsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import UsersPage from "./pages/UsersPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import HistoriquePage from "./pages/HistoriquePage";
import Loader from "./components/Loader";
import CustomersPageVente from "./pages/CustomersPageVente";
import { jwtDecode } from "jwt-decode";
import OrdersPageVente from "./pages/OrderPageVente";
import DashboardVentePage from "./pages/DashboardPageVente";
import ProductsPageVente from "./pages/ProductPageVente";

interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
  iat: number;
}

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<DecodedToken | null>(null);

  const baseUrl = import.meta.env.VITE_API_URL;
  const app_name = import.meta.env.VITE_APP_NAME;

  // ✅ Vérifier sessionStorage au démarrage
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        console.warn("⏳ Token expiré, suppression…");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("role");
        setIsAuthenticated(false);
        setUserInfo(null);
      } else {
        setUserInfo(decoded);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("❌ Token invalide :", err);
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("role");
      setIsAuthenticated(false);
    }
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "products":
        return userInfo?.role === "VENTE" ? (
          <ProductsPageVente />
        ) : (
          <ProductsPage />
        );
      case "customers":
        return userInfo?.role === "VENTE" ? (
          <CustomersPageVente />
        ) : (
          <CustomersPage />
        );
      case "users":
        return <UsersPage />;
      case "orders":
        return userInfo?.role === "VENTE" ? (
          <OrdersPageVente />
        ) : (
          <OrdersPage />
        );
      case "expenses":
        return <ExpensesPage />;
      case "stock":
        return <StockPage />;
      case "marketing":
        return <MarketingPage />;
      case "reports":
        return <ReportsPage />;
      case "history":
        return <HistoriquePage />;
      default:
        return userInfo?.role === "VENTE" ? (
          <Dashboard />
        ) : (
          <DashboardVentePage />
        );
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    setIsAuthenticated(false);
    setUserInfo(null);
    setCurrentPage("dashboard");
  };

  useEffect(() => {
    const pingBackend = async () => {
      try {
        await fetch(`${baseUrl}/pingR`);
        console.log("Backend awake");
      } catch (err) {
        console.error("Backend ping failed", err);
      }
    };
    pingBackend();
    const interval = setInterval(pingBackend, 13 * 60 * 1000);
    return () => clearInterval(interval);
  }, [baseUrl]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

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
              renderPage()
            )}
          </main>
        </div>
      ) : (
        <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-amber-400 to-orange-500">
          {/* Branding à gauche */}
          <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-white rounded-full mix-blend-overlay"></div>
              <div className="absolute top-[60%] left-[60%] w-96 h-96 bg-white rounded-full mix-blend-overlay"></div>
              <div className="absolute top-[20%] left-[70%] w-64 h-64 bg-white rounded-full mix-blend-overlay"></div>
            </div>

            <div className="relative z-10 text-center md:text-left max-w-lg">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                {app_name}
              </h1>
              <p className="text-xl md:text-2xl mb-8 font-light opacity-95">
                Application de gestion en ligne de snacks
              </p>
            </div>
          </div>

          {/* Auth pages */}
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 transform hover:shadow-2xl">
            <div className="p-8 md:p-10">
              {showResetPassword ? (
                <ResetPasswordPage
                  onShowLogin={() => setShowResetPassword(false)}
                />
              ) : showRegister ? (
                <RegisterPage
                  onRegisterSuccess={() => {
                    setShowRegister(false);
                    setIsAuthenticated(true);
                  }}
                  onShowLogin={() => setShowRegister(false)}
                />
              ) : (
                <LoginPage
                  onLogin={() => setIsAuthenticated(true)}
                  onShowRegister={() => setShowRegister(true)}
                  onShowResetPassword={() => setShowResetPassword(true)}
                />
              )}
            </div>

            <div className="bg-gray-50 p-4 text-center text-sm text-gray-600">
              {showRegister &&
                "En vous inscrivant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité."}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
