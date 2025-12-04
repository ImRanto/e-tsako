import Dashboard from "../components/Dashboard";
import ProductsPage from "../pages/ProductsPage";
import ProductsPageVente from "../pages/ProductPageVente";
import CustomersPage from "../pages/CustomersPage";
import CustomersPageVente from "../pages/CustomersPageVente";
import OrdersPage from "../pages/OrdersPage";
import OrdersPageVente from "../pages/OrderPageVente";
import ExpensesPage from "../pages/ExpensesPage";
import StockPage from "../pages/StockPage";
import MarketingPage from "../pages/MarketingPage";
import ReportsPage from "../pages/ReportsPage";
import UsersPage from "../pages/UsersPage";
import HistoriquePage from "../pages/HistoriquePage";
import DashboardVentePage from "../pages/DashboardPageVente";

export const renderPage = (currentPage: string, role?: string) => {
  switch (currentPage) {
    case "dashboard":
      return role === "VENTE" ? <DashboardVentePage /> : <Dashboard />;
    case "products":
      return role === "VENTE" ? <ProductsPageVente /> : <ProductsPage />;
    case "customers":
      return role === "VENTE" ? <CustomersPageVente /> : <CustomersPage />;
    case "users":
      return <UsersPage />;
    case "orders":
      return role === "VENTE" ? <OrdersPageVente /> : <OrdersPage />;
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
      return role === "VENTE" ? <DashboardVentePage /> : <Dashboard />;
  }
};