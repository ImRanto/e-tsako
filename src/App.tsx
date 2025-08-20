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

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "products":
        return <ProductsPage />;
      case "customers":
        return <CustomersPage />;
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

  return (
    <>
      {isAuthenticated ? (
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
          <main className="flex-1 lg:ml-64">{renderPage()}</main>
        </div>
      ) : (
        <LoginPage onLogin={() => setIsAuthenticated(true)} />
      )}
    </>
  );
}

export default App;
