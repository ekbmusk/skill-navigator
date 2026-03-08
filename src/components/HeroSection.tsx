import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero pt-16">
      {/* Background image */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />

      <div className="container relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block mb-6 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
            Платформа нового поколения
          </span>

          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight max-w-4xl mx-auto">
            Раскройте{" "}
            <span className="text-gradient">потенциал</span>
            <br />
            каждого студента
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Диагностика навыков, аналитика для преподавателей и совместное решение кейсов — всё в одной платформе
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-base gap-2" asChild>
              <Link to="/diagnostics">Пройти диагностику <ArrowRight size={18} /></Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base">
              Узнать больше
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-xl mx-auto"
        >
          {[
            { value: "15+", label: "Навыков" },
            { value: "500+", label: "Студентов" },
            { value: "50+", label: "Кейсов" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl md:text-3xl font-display font-bold text-gradient">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
