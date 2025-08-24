import { useEffect, useState } from "react";
import { Calendar, TrendingUp, Download, BarChart3 } from "lucide-react";

interface SalesData {
  revenue: number;
  orders: number;
  growth: string;
}

interface ExpensesData {
  total: number;
  main: string;
}

interface Product {
  name: string;
  quantity: number;
  sales: number;
}

export default function ReportsPage() {
  const [period, setPeriod] = useState("month");
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [expensesData, setExpensesData] = useState<ExpensesData | null>(null);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${baseUrl}/api/reports?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erreur API");
        const data = await res.json();
        setSalesData(data.sales);
        setExpensesData(data.expenses);
        setTopProducts(data.topProducts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [period]);

  const getPeriodLabel = (p: string) => {
    switch (p) {
      case "week":
        return "Cette semaine";
      case "month":
        return "Ce mois";
      case "year":
        return "Cette année";
      default:
        return "Cette période";
    }
  };

  if (loading) return <p className="p-6">Chargement des rapports...</p>;
  if (!salesData || !expensesData) return <p className="p-6">Aucune donnée</p>;

  const handleExport = async () => {
    const res = await fetch(`${baseUrl}/api/reports/export?period=${period}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-${period}.pdf`;
    a.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rapports</h1>
          <p className="text-gray-600">Analyse des performances et tendances</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
          <button onClick={handleExport}>
            <Download size={20} className="mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Revenue */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 mb-1">Chiffre d'affaires</p>
              <p className="text-2xl font-bold">{salesData.revenue} Ar</p>
              <div className="flex items-center mt-2">
                <TrendingUp size={16} className="mr-1" />
                <span className="text-green-100">{salesData.growth}</span>
              </div>
            </div>
            <BarChart3 size={40} className="text-green-200" />
          </div>
        </div>

        {/* Orders */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 mb-1">Commandes</p>
              <p className="text-2xl font-bold">{salesData.orders}</p>
              <p className="text-blue-100 mt-2">{getPeriodLabel(period)}</p>
            </div>
            <Calendar size={40} className="text-blue-200" />
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 mb-1">Dépenses</p>
              <p className="text-2xl font-bold">{expensesData.total} Ar</p>
              <p className="text-red-100 text-sm mt-2">{expensesData.main}</p>
            </div>
            <TrendingUp size={40} className="text-red-200 rotate-180" />
          </div>
        </div>
      </div>

      {/* Top Products & Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Produits les plus vendus
            </h3>
            <p className="text-gray-600 text-sm">{getPeriodLabel(period)}</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                          ? "bg-gray-400"
                          : "bg-orange-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.quantity} unités vendues
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {product.sales.toLocaleString()} Ar
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Résumé des performances
            </h3>
            <p className="text-gray-600 text-sm">{getPeriodLabel(period)}</p>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {/* Growth */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Taux de croissance</span>
                  <span className="font-semibold text-green-600">
                    {salesData.growth}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: salesData.growth.replace("%", "") }}
                  ></div>
                </div>
              </div>

              {/* Sales Goal */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Objectif de ventes</span>
                  <span className="font-semibold text-blue-600">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "85%" }}
                  ></div>
                </div>
              </div>

              {/* Customer Satisfaction */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Satisfaction client</span>
                  <span className="font-semibold text-purple-600">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: "92%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
