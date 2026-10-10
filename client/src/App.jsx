import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Optimizer from "./components/Optimizer";
import Bento from "./components/Bento";
import Specs3D from "./components/Specs3D";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Optimizer />
        <Bento />
        <Specs3D />
      </main>
      <Footer />
    </div>
  );
}
