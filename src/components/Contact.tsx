import { MapPin, Phone, Mail, ArrowRight, MessageSquare } from "lucide-react";

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="py-24 bg-[#fafafa] relative overflow-hidden"
    >
      {/* Background Decor - Un cercle subtil pour casser la rigidité */}
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-amber-600 mb-4">
            Assistance & Support
          </h2>
          <h3 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Parlons de votre{" "}
            <span className="text-slate-400 font-light italic">projet.</span>
          </h3>
          <p className="text-lg text-slate-500 leading-relaxed">
            Une question sur nos tarifs ou besoin d'une démonstration
            personnalisée ? Notre équipe d'experts vous répond en moins de 24h.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <ContactItem
            icon={Phone}
            title="Ligne Directe"
            content="+261 38 13 277 37"
            subContent="Lun-Ven, 8h à 18h"
            link="tel:+261381327737"
          />
          <ContactItem
            icon={Mail}
            title="Support Email"
            content="hei.ranto.2@gmail.com"
            subContent="Réponse rapide garantie"
            link="mailto:hei.ranto.2@gmail.com"
          />
          <ContactItem
            icon={MapPin}
            title="Siège Social"
            content="Antananarivo"
            subContent="Madagascar"
            link="#"
          />
        </div>

        {/* Call to Action Final - Plus imposant */}
        <div className="flex justify-center">
          <a
            href="/contact"
            className="group relative inline-flex items-center gap-4 px-10 py-5 bg-slate-900 text-white rounded-[20px] overflow-hidden transition-all duration-300 hover:bg-amber-600 shadow-2xl shadow-slate-200"
          >
            <div className="absolute inset-0 w-0 bg-white/10 transition-all duration-300 group-hover:w-full" />
            <MessageSquare size={20} className="relative z-10" />
            <span className="relative z-10 font-bold tracking-wide">
              Lancer une conversation
            </span>
            <ArrowRight
              size={20}
              className="relative z-10 group-hover:translate-x-1 transition-transform"
            />
          </a>
        </div>
      </div>
    </section>
  );
}

function ContactItem({ icon: Icon, title, content, subContent, link }) {
  return (
    <a
      href={link}
      className="group flex flex-col items-center text-center p-10 bg-white rounded-[32px] border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1"
    >
      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500 shadow-inner">
        <Icon size={24} className="text-slate-600 group-hover:text-white" />
      </div>
      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
        {title}
      </h4>
      <p className="text-lg font-bold text-slate-900 mb-1 group-hover:text-amber-600 transition-colors">
        {content}
      </p>
      <p className="text-sm text-slate-500">{subContent}</p>
    </a>
  );
}
