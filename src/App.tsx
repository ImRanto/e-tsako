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

  // Fonction pour déconnexion
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage("dashboard");
  };

  return (
    <>
      {isAuthenticated ? (
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onLogout={handleLogout}
          />
          <main className="flex-1 lg:ml-64">{renderPage()}</main>
        </div>
      ) : showRegister ? (
        <RegisterPage
          onRegisterSuccess={() => {
            setShowRegister(false); // cache le formulaire
            setIsAuthenticated(true); // connecte l'utilisateur
          }}
          onShowLogin={() => setShowRegister(false)} // ← passer cette fonction
        />
      ) : (
        <LoginPage
          onLogin={() => setIsAuthenticated(true)}
          onShowRegister={() => setShowRegister(true)}
        />
      )}
    </>
  );
}

export default App;
