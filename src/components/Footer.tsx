import { Package, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const app_name = import.meta.env.VITE_APP_NAME;
const currentYear = new Date().getFullYear();

export default function Footer() {
  const footerSections = [
    {
      title: "Produit",
      links: [
        { name: "Fonctionnalités", href: "/features" },
        { name: "Témoignages", href: "/testimonials" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Centre d'aide", href: "/help" },
        { name: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Entreprise",
      links: [
        { name: "À propos", href: "/about" },
        { name: "Blog", href: "/blog" },
      ],
    },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      href: "https://facebook.com",
      icon: Facebook,
    },
    {
      name: "Twitter",
      href: "https://twitter.com",
      icon: Twitter,
    },
    {
      name: "Instagram",
      href: "https://instagram.com",
      icon: Instagram,
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com",
      icon: Linkedin,
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500 rounded-lg blur-sm opacity-75"></div>
                  <Package className="h-10 w-10 text-amber-500 relative z-10 mr-4" />
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                  {app_name}
                </span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed text-lg max-w-md">
                La solution complète pour valoriser nos produits
                artisanaux malgaches.
              </p>

              {/* Social Links */}
              <div className="flex space-x-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="p-3 bg-gray-800 rounded-xl hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 hover:scale-110 transition-all duration-300 group shadow-lg"
                    aria-label={`Suivez-nous sur ${social.name}`}
                  >
                    <social.icon className="h-5 w-5 group-hover:text-gray-900 transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation Sections */}
            {footerSections.map((section, index) => (
              <div key={index} className="lg:col-span-1">
                <h3 className="font-bold text-xl mb-6 text-white relative inline-block">
                  {section.title}
                  <div className="absolute -bottom-2 left-0 w-8 h-1 bg-amber-500 rounded-full"></div>
                </h3>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-gray-300 hover:text-amber-400 transition-all duration-300 block py-2 hover:translate-x-2 hover:font-medium"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800/50 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-base">
              <p>
                &copy; {currentYear} {app_name}. Tous droits réservés.
              </p>
            </div>

            <div className="text-gray-300 text-base font-medium">
              <p className="flex items-center space-x-2">
                <span className="text-amber-400">❤️</span>
                <span>Made with passion in Madagascar</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
