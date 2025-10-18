import { Package } from "lucide-react";

const app_name = import.meta.env.VITE_APP_NAME;

export default function Footer() {
  const footerSections = [
    {
      title: "Produit",
      links: ["Fonctionnalités", "Tarifs", "API"],
    },
    {
      title: "Support",
      links: ["Documentation", "Contact", "FAQ"],
    },
    {
      title: "Entreprise",
      links: ["À propos", "Blog", "Carrières"],
    },
  ];

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Package className="h-8 w-8 text-amber-500 mr-2" />
              <span className="text-xl font-bold">{app_name}</span>
            </div>
            <p className="text-gray-400">
              La solution complète pour gérer des produits {app_name}{" "}
              artisanales à Madagascar.
            </p>
          </div>

          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2 text-gray-400">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href="#" className="hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 {app_name}. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
