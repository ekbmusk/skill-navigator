import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import DiagnosticsSection from "@/components/DiagnosticsSection";
import TeachersSection from "@/components/TeachersSection";
import CasesSection from "@/components/CasesSection";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <TeachersSection />
    <HowItWorksSection />
    <DiagnosticsSection />
    <CasesSection />
    <Footer />
  </div>
);

export default Index;
