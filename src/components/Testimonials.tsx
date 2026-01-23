import { Star, Quote } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Ranto Rafalimanana",
      role: "Responsable Production",
      content:
        "Cette application a révolutionné notre gestion quotidienne. Tout est plus simple, fluide et surtout parfaitement organisé.",
      initials: "RH",
      color: "bg-amber-100 text-amber-600",
    },
    {
      name: "Marie Rafaramalala",
      role: "Gérante Épicerie",
      content:
        "Le suivi des commandes est un pur plaisir. Je peux réapprovisionner mes stocks en quelques clics sans aucune erreur.",
      initials: "MR",
      color: "bg-blue-100 text-blue-600",
    },
    {
      name: "Jean Rakoto",
      role: "Client Particulier",
      content:
        "Une interface d'une clarté rare. Le suivi en temps réel apporte une vraie sérénité sur la livraison de mes produits.",
      initials: "JR",
      color: "bg-emerald-100 text-emerald-600",
    },
  ];

  return (
    <section id="testimonials" className="py-24 bg-white relative">
      {/* Accent de design discret */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-amber-600 mb-4">
              Témoignages
            </h2>
            <h3 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Ils ont transformé leur <br />
              <span className="text-slate-400 font-light italic">
                quotidien avec nous.
              </span>
            </h3>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"
                />
              ))}
            </div>
            <p className="text-xs font-bold text-slate-600 ml-2">
              +10 utilisateurs actifs
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className="relative group bg-slate-50/50 rounded-[2rem] p-10 transition-all duration-300 border border-transparent hover:border-slate-200 hover:bg-white hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)]"
            >
              <Quote
                className="absolute top-8 right-8 text-slate-200 group-hover:text-amber-200 transition-colors"
                size={40}
              />

              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="text-amber-400 fill-amber-400"
                  />
                ))}
              </div>

              <blockquote className="text-slate-700 leading-relaxed mb-8 relative z-10">
                "{t.content}"
              </blockquote>

              <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
                <div
                  className={`w-12 h-12 rounded-full ${t.color} flex items-center justify-center font-bold text-sm shadow-sm`}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="font-bold text-slate-900 leading-none mb-1">
                    {t.name}
                  </div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
