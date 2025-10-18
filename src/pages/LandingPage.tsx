import { useEffect } from "react";
import ContactSection from "../components/Contact";
import Features from "../components/Features";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Testimonials from "../components/Testimonials";

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
    const interval = setInterval(pingBackend, 13 * 60 * 1000); // toutes les 13 min
    return () => clearInterval(interval);
  }, [baseUrl]);
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
