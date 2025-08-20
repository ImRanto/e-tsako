import { useState } from "react";

export interface StockData {
  id?: number;
  nomMatiere: string;
  quantite: number;
  unite: string;
  seuilAlerte: number;
}

interface StockFormProps {
  stock: StockData | null;
  onSave: (stockData: Omit<StockData, "id">) => void;
  onCancel: () => void;
}

export default function StockForm({ stock, onSave, onCancel }: StockFormProps) {
  const [nomMatiere, setNomMatiere] = useState(stock?.nomMatiere || "");
  const [quantite, setQuantite] = useState(stock?.quantite || 0);
  const [unite, setUnite] = useState(stock?.unite || "kg");
  const [seuilAlerte, setSeuilAlerte] = useState(stock?.seuilAlerte || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const quant = Number(quantite);
    const seuil = Number(seuilAlerte);

    if (!nomMatiere || !unite || quant < 0 || seuil < 0) {
      alert("Veuillez remplir correctement tous les champs !");
      return;
    }

    onSave({
      nomMatiere: nomMatiere.trim(),
      quantite: quant,
      unite: unite.trim().toUpperCase(),
      seuilAlerte: seuil,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nom de la matière
        </label>
        <input
          type="text"
          value={nomMatiere}
          onChange={(e) => setNomMatiere(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantité
          </label>
          <input
            type="number"
            value={quantite}
            onChange={(e) => setQuantite(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            min={0}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unité
          </label>
          <input
            type="text"
            value={unite}
            onChange={(e) => setUnite(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Seuil d'alerte
        </label>
        <input
          type="number"
          value={seuilAlerte}
          onChange={(e) => setSeuilAlerte(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          min={0}
        />
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          {stock ? "Modifier" : "Créer"}
        </button>
      </div>
    </form>
  );
}
