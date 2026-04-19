import Hero from "@/components/Hero";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <h1 className="sr-only">Designs by OVKB — Handcrafted Greeting Cards</h1>
      <Hero />
      <About />
      <Gallery />
      <Footer />
    </main>
  );
};

export default Index;
