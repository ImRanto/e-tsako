import { useState } from "react";
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
import UsersPage from "./pages/UsersPage";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const app_name = import.meta.env.VITE_APP_NAME;

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "products":
        return <ProductsPage />;
      case "customers":
        return <CustomersPage />;
      case "users":
        return <UsersPage />;
      case "orders":
        return <OrdersPage />;
      case "expenses":
        return <ExpensesPage />;
      case "stock":
        return <StockPage />;
      case "marketing":
        return <MarketingPage />;
      case "reports":
        return <ReportsPage />;
      default:
        return <Dashboard />;
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage("dashboard");
  };

  return (
    <>
      {isAuthenticated ? (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
          <Sidebar
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onLogout={handleLogout}
          />
          <main className="flex-1 md:ml-64">{renderPage()}</main>
        </div>
      ) : (
        <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-amber-400 to-orange-500">
          {/* Branding à gauche - Version améliorée */}
          <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-12 text-white relative overflow-hidden">
            {/* Éléments décoratifs d'arrière-plan */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-10% left-10% w-72 h-72 bg-white rounded-full mix-blend-overlay"></div>
              <div className="absolute top-60% left-60% w-96 h-96 bg-white rounded-full mix-blend-overlay"></div>
              <div className="absolute top-20% left-70% w-64 h-64 bg-white rounded-full mix-blend-overlay"></div>
            </div>

            <div className="relative z-10 text-center md:text-left max-w-lg">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                {app_name}
              </h1>
              <p className="text-xl md:text-2xl mb-8 font-light opacity-95">
                Application en ligne pour gérer tous sur {app_name}
              </p>

              <div className="hidden md:block mt-12">
                <div className="flex items-center mb-6">
                  <div className="bg-white bg-opacity-30 p-3 rounded-full mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <span>Gestion simplifiée des produits</span>
                </div>

                <div className="flex items-center mb-6">
                  <div className="bg-white bg-opacity-30 p-3 rounded-full mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <span>Suivi des clients et commandes</span>
                </div>

                <div className="flex items-center">
                  <div className="bg-white bg-opacity-30 p-3 rounded-full mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <span>Analyses et rapports détaillés</span>
                </div>
              </div>
            </div>
          </div>
          {/* Formulaires à droite - Version améliorée */}
          <div className="flex-1 flex items-center justify-center p-8 md:p-12">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 transform hover:shadow-2xl">
              <div className="p-10">
                {" "}
                {/* padding augmenté */}
                {showRegister ? (
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
                  />
                )}
              </div>

              <div className="bg-gray-50 p-5 text-center text-sm text-gray-600">
                {showRegister
                  ? "En vous inscrivant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité."
                  : ""}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
