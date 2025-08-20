import React from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  TrendingDown,
  Archive,
  Megaphone,
  BarChart3,
  Menu,
  X,
} from "lucide-react";

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Produits", icon: Package },
  { id: "customers", label: "Clients", icon: Users },
  { id: "orders", label: "Commandes", icon: ShoppingCart },
  { id: "expenses", label: "Dépenses", icon: TrendingDown },
  { id: "stock", label: "Stock", icon: Archive },
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "reports", label: "Rapports", icon: BarChart3 },
];

const app_name = import.meta.env.VITE_APP_NAME;

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-amber-500 text-white rounded-lg shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-20 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <Package size={32} className="mr-2" />
            <h1 className="text-xl font-bold">{app_name}</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onPageChange(item.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-amber-100 text-amber-700 border-r-4 border-amber-500"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <Icon size={20} className="mr-3" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">Admin Principal</p>
                <p className="text-sm text-gray-500">admin@i-tsaky.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
