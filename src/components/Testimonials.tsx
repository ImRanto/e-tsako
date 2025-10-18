// components/Testimonials.jsx
import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Ranto Handraina",
      role: "Responsable Production",
      content:
        "Cette application a révolutionné notre gestion quotidienne. Tout est plus simple et organisé.",
      rating: 5,
    },
    {
      name: "Marie Rasoamalala",
      role: "Gérante Épicerie",
      content:
        "Le suivi des commandes est parfait. Je peux commander mes chips préférées en quelques clics.",
      rating: 5,
    },
    {
      name: "Jean Rakoto",
      role: "Client Particulier",
      content:
        "Interface très claire et professionnelle. J'adore pouvoir suivre mes commandes en temps réel.",
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Ce que disent nos utilisateurs
          </h2>
          <p className="text-xl text-gray-600">
            Découvrez pourquoi les professionnels nous font confiance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-8 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "{testimonial.content}"
              </p>
              <div>
                <div className="font-semibold text-gray-900">
                  {testimonial.name}
                </div>
                <div className="text-gray-600 text-sm">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
