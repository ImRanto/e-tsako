import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Besoin d'aide ?
        </h2>
        <p className="text-xl text-gray-600 mb-12">
          Notre équipe est à votre disposition pour répondre à toutes vos
          questions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <ContactItem
            icon={Phone}
            title="Appelez-nous"
            content="+261 38 13 277 37"
            link="tel:+261381327737"
          />
          <ContactItem
            icon={Mail}
            title="Envoyez un email"
            content="hei.ranto.2@gmail.com"
            link="mailto:hei.ranto.2@gmail.com"
          />
          <ContactItem
            icon={MapPin}
            title="Adresse"
            content="Antananarivo, Madagascar"
            link="#"
          />
        </div>

        <a
          href="/contact"
          className="inline-flex items-center gap-3 px-8 py-4 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 group"
        >
          Voir la page contact
          <ArrowRight
            size={20}
            className="group-hover:translate-x-1 transition-transform"
          />
        </a>
      </div>
    </section>
  );
}

function ContactItem({ icon: Icon, title, content, link }) {
  return (
    <a
      href={link}
      className="bg-gray-50 rounded-xl p-6 hover:bg-amber-50 transition-colors group"
    >
      <div className="bg-amber-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:bg-amber-200 transition-colors">
        <Icon size={24} className="text-amber-600" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{content}</p>
    </a>
  );
}
