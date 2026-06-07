import Hero from "@/components/ui_components/home/Hero";
import Features from "@/components/ui_components/home/Features";
import Convincing from "@/components/ui_components/home/Convincing";
import Footer from "@/components/ui_components/home/Footer";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <Features />
      <Convincing />
      <Footer />
    </main>
  );
}
