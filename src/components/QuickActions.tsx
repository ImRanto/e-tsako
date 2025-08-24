// src/components/QuickActions.tsx
import { useState } from "react";
import { ShoppingCart, Package, Users } from "lucide-react";
import StockForm, { StockData } from "./StockForm";
import CustomerForm from "./CustomerForm";
import OrderForm from "./OrderForm";

export default function QuickActions() {
  const [modalOpen, setModalOpen] = useState<
    "stock" | "customer" | "order" | null
  >(null);
  const [editingStock, setEditingStock] = useState<StockData | null>(null);

  const actions = [
    {
      label: "Nouvelle commande",
      type: "order",
      icon: ShoppingCart,
      color: "bg-blue-500",
    },
    {
      label: "Ajouter produit dans Stock",
      type: "stock",
      icon: Package,
      color: "bg-green-500",
    },
    {
      label: "Nouveau client",
      type: "customer",
      icon: Users,
      color: "bg-purple-500",
    },
  ];

  const handleOpenModal = (type: "stock" | "customer" | "order") => {
    setModalOpen(type);
    if (type === "stock") setEditingStock(null); // reset stock pour création
  };

  const handleCloseModal = () => {
    setModalOpen(null);
    setEditingStock(null);
  };

  const handleStockSaved = () => {
    // tu peux ajouter un refresh de la liste de stock ici si besoin
    handleCloseModal();
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Actions rapides
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => handleOpenModal(action.type as any)}
                  className="w-full flex items-center p-3 text-left rounded-lg border-2 border-dashed border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all duration-200 group"
                >
                  <div
                    className={`p-2 rounded-lg ${action.color} group-hover:scale-110 transition-transform`}
                  >
                    <Icon size={16} className="text-white" />
                  </div>
                  <span className="ml-3 font-medium text-gray-700 group-hover:text-amber-700">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      {modalOpen === "stock" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Ajouter dans Stock</h3>
            <StockForm
              stock={editingStock}
              onSaved={handleStockSaved}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}

      {modalOpen === "customer" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Ajouter un client</h3>
            <CustomerForm
              customer={null}
              onSaved={handleCloseModal}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}

      {modalOpen === "order" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Nouvelle commande</h3>
            <OrderForm
              order={null}
              onSaved={handleCloseModal}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}
    </>
  );
}
