import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  TrendingDown,
  Archive,
  Megaphone,
  BarChart3,
} from "lucide-react";

export const menuByRole: Record<string, any[]> = {
  ADMIN: [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "products", label: "Produits", icon: Package },
    { id: "customers", label: "Clients", icon: Users },
    { id: "users", label: "Utilisateurs", icon: Users },
    { id: "orders", label: "Commandes", icon: ShoppingCart },
    { id: "expenses", label: "Dépenses", icon: TrendingDown },
    { id: "stock", label: "Stock", icon: Archive },
    { id: "marketing", label: "Marketing", icon: Megaphone },
    { id: "reports", label: "Rapports", icon: BarChart3 },
  ],
  PRODUCTION: [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "products", label: "Produits", icon: Package },
    { id: "stock", label: "Stock", icon: Archive },
  ],
  VENTE: [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "orders", label: "Commandes", icon: ShoppingCart },
    { id: "customers", label: "Clients", icon: Users },
  ],
  MARKETING: [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "marketing", label: "Marketing", icon: Megaphone },
    { id: "reports", label: "Rapports", icon: BarChart3 },
  ],
};
