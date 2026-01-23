import Dashboard from "../components/dasboard/Dashboard";
import ProductsPage from "../pages/ProductsPage";
import ProductsPageVente from "../pages/ProductPageVente";
import CustomersPage from "../pages/CustomersPageAdmin";
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

const normalizeRole = (role?: string) => role?.trim().toUpperCase() ?? "ADMIN";

export const renderPage = (currentPage: string, role?: string) => {
  const userRole = normalizeRole(role);

  switch (currentPage) {
    case "dashboard":
      return userRole === "VENTE" ? <Dashboard /> : <Dashboard />;

    case "products":
      return userRole === "VENTE" ? <ProductsPageVente /> : <ProductsPage />;

    case "customers":
      return userRole === "VENTE" ? <CustomersPageVente /> : <CustomersPage />;

    case "orders":
      return userRole === "VENTE" ? <OrdersPageVente /> : <OrdersPage />;

    case "users":
      return <UsersPage />;

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
      return userRole === "VENTE" ? <DashboardVentePage /> : <Dashboard />;
  }
};
