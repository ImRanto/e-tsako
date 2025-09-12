import { Link } from "react-router-dom";
import { Home, ArrowLeft, Search, Mail, AlertTriangle } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* En-tête avec dégradé */}
        <div className="h-2 bg-gradient-to-r from-amber-500 to-amber-700"></div>

        <div className="px-8 py-12 md:p-12 text-center">
          {/* Illustration et animation */}
          <div className="mb-8">
            <div className="relative mx-auto w-64 h-48">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-48 bg-amber-100 rounded-full"></div>
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-amber-600">
                <AlertTriangle className="w-20 h-20 mx-auto" />
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-8xl font-bold text-amber-600 animate-pulse">
                404
              </div>
            </div>
          </div>

          {/* Contenu texte */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Page non trouvée
          </h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Désolé, la page que vous recherchez semble introuvable. Elle a
            peut-être été déplacée, supprimée ou n'existe tout simplement pas.
          </p>

          {/* Bouton d'action principal */}
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-md transition-all duration-300 transform hover:-translate-y-1 mb-6"
          >
            <Home className="w-5 h-5 mr-2" />
            Retour à l'accueil
          </Link>

          {/* Actions secondaires */}
          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-gray-500 text-sm mb-4">Vous pouvez aussi :</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="text-amber-600 hover:text-amber-800 text-sm flex items-center transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Retourner en arrière
              </button>
              <button onClick={() => (window.location.href = "/contact")} className="text-amber-600 hover:text-amber-800 text-sm flex items-center transition-colors">
                <Mail className="w-4 h-4 mr-1" />
                
                Nous contacter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
