import { useEffect, useState } from "react";

interface Product {
  id: number;
  nom: string;
  categorie: "CHIPS" | "SNACK" | "AUTRE";
  prixUnitaire: number;
  stockDisponible: number;
  imageData?: string;
  imageType?: string;
}

interface ProductFormProps {
  product: Product | null;
  onSave: (saved: Product) => void;
  onCancel: () => void;
}

const baseUrl = import.meta.env.VITE_API_URL;

export default function ProductForm({
  product,
  onSave,
  onCancel,
}: ProductFormProps) {
  const [nom, setNom] = useState("");
  const [categorie, setCategorie] = useState<"CHIPS" | "SNACK" | "AUTRE">(
    "CHIPS"
  );
  const [prixUnitaire, setPrixUnitaire] = useState<number>(0);
  const [stockDisponible, setStockDisponible] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (product) {
      setNom(product.nom);
      setCategorie(product.categorie);
      setPrixUnitaire(product.prixUnitaire);
      setStockDisponible(product.stockDisponible);

      // Réinitialiser les états d'image
      setImage(null);
      setImagePreview(null);

      // Si le produit a déjà une image, créer l'URL de prévisualisation
      if (product.imageData && product.imageType) {
        const imageUrl = `data:${product.imageType};base64,${product.imageData}`;
        setImagePreview(imageUrl);
      }
    } else {
      setNom("");
      setCategorie("CHIPS");
      setPrixUnitaire(0);
      setStockDisponible(0);
      setImage(null);
      setImagePreview(null);
    }
    setError("");
  }, [product]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation du type de fichier
      if (!file.type.startsWith("image/")) {
        setError("Veuillez sélectionner un fichier image valide !");
        return;
      }

      // Validation de la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5MB !");
        return;
      }

      setImage(file);
      setError("");

      // Créer l'URL de prévisualisation
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);

    // Réinitialiser l'input file
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation améliorée
    if (!nom.trim()) {
      setError("Veuillez saisir un nom de produit !");
      return;
    }

    if (prixUnitaire <= 0) {
      setError("Le prix unitaire doit être supérieur à 0 !");
      return;
    }

    if (stockDisponible < 0) {
      setError("Le stock disponible ne peut pas être négatif !");
      return;
    }

    if (!token) {
      setError("Utilisateur non authentifié !");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("nom", nom.trim());
      formData.append("categorie", categorie);
      formData.append("prixUnitaire", prixUnitaire as any);
      formData.append("stockDisponible", stockDisponible as any);

      // CORRECTION : Bien vérifier l'image
      if (image) {
        // console.log("Image à envoyer:", image.name, image.type, image.size);
        formData.append("image", image);
      } else {
        // console.log("Aucune image sélectionnée");
      }

      // Debug: afficher le contenu du FormData
      // console.log("Contenu du FormData:");
      // for (let [key, value] of formData.entries()) {
      // console.log(key, value);
      // }

      const url = product
        ? `${baseUrl}/api/produits/${product.id}`
        : `${baseUrl}/api/produits`;

      const method = product ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          // NE PAS mettre Content-Type pour FormData
        },
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = `Erreur API (${res.status}) : ${
          errorText || "inconnue"
        }`;

        if (res.status === 401) {
          errorMessage = "Session expirée. Veuillez vous reconnecter.";
        } else if (res.status === 413) {
          errorMessage = "L'image est trop volumineuse. Maximum 5MB autorisé.";
        } else if (res.status === 415) {
          errorMessage = "Format d'image non supporté.";
        }

        throw new Error(errorMessage);
      }

      const saved: Product = await res.json();
      // console.log("Produit sauvegardé:", saved);

      // Nettoyer les URLs de prévisualisation
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      onSave(saved);
    } catch (err: any) {
      console.error("Erreur lors de l'enregistrement:", err);
      setError(
        err.message ||
          "Échec de l'enregistrement du produit. Vérifiez le backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // Nettoyer les URLs de prévisualisation lors du démontage
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {product ? "Modifier le produit" : "Nouveau produit"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-start">
            <svg
              className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
              placeholder="Ex : Chips"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <select
              value={categorie}
              onChange={(e) =>
                setCategorie(e.target.value as "CHIPS" | "SNACK" | "AUTRE")
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
              required
            >
              <option value="CHIPS">CHIPS</option>
              <option value="SNACK">SNACK</option>
              <option value="AUTRE">AUTRE</option>
            </select>
          </div>

          {/* Prix unitaire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix unitaire (Ar) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">Ar</span>
              <input
                type="number"
                value={prixUnitaire}
                onChange={(e) => setPrixUnitaire(Number(e.target.value))}
                min={1}
                step="0.01"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          {/* Stock disponible */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock disponible <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={stockDisponible}
              onChange={(e) => setStockDisponible(Number(e.target.value))}
              min={0}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Image du produit */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image du produit
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
            />

            <p className="text-sm text-gray-500 mt-1">
              Formats supportés: JPG, PNG, WebP. Taille max: 5MB
            </p>

            {/* Aperçu de l'image */}
            {(imagePreview || (product?.imageData && !image)) && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Aperçu:
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={
                      imagePreview ||
                      (product?.imageData && product?.imageType
                        ? `data:${product.imageType};base64,${product.imageData}`
                        : "")
                    }
                    alt="Aperçu du produit"
                    className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-red-500 hover:text-red-700 underline text-sm font-medium"
                  >
                    Supprimer l'image
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium flex items-center justify-center min-w-[140px]"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {product ? "Mise à jour..." : "Création..."}
              </>
            ) : (
              <>{product ? "Mettre à jour" : "Créer le produit"}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
