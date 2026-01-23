import { useEffect } from "react";
import ContactSection from "../components/landingPage/Contact";
import Features from "../components/landingPage/Features";
import Footer from "../components/landingPage/Footer";
import Header from "../components/landingPage/Header";
import Hero from "../components/landingPage/Hero";
import Stats from "../components/landingPage/Stats";
import Testimonials from "../components/landingPage/Testimonials";

const API_KEY = import.meta.env.VITE_API_KEY;
const baseUrl = import.meta.env.VITE_API_URL;

export default function LandingPage() {
  useEffect(() => {
    const pingBackend = async () => {
      try {
        const res = await fetch(`${baseUrl}/pingR`, {
          method: "GET",
          headers: { "X-API-KEY": API_KEY },
        });
        if (!res.ok) console.error("Ping failed with status", res.status);
      } catch (err) {
        console.error("Backend ping failed", err);
      }
    };

    pingBackend();
    const interval = setInterval(pingBackend, 0.5 * 60 * 1000); // toutes les 13 min
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Stats />
      <Features />
      <Testimonials />
      <ContactSection />
      <Footer />
    </div>
  );
}
