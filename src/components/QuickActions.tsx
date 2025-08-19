import { ShoppingCart, Package, Users } from "lucide-react";

export default function QuickActions() {
  const actions = [
    { label: "Nouvelle commande", icon: ShoppingCart, color: "bg-blue-500" },
    { label: "Ajouter produit", icon: Package, color: "bg-green-500" },
    { label: "Nouveau client", icon: Users, color: "bg-purple-500" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Actions rapides</h3>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
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
  );
}
