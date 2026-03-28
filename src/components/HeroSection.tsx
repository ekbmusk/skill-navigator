import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Target, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLang } from "@/i18n/LanguageContext";

const AnimatedCounter = ({ target, label, icon: Icon }: { target: number; label: string; icon: React.ElementType }) => {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const steps = 40;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              setDone(true);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, 1500 / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <Icon className="text-accent mx-auto mb-2" size={18} />
      <motion.div
        className="text-4xl md:text-5xl font-display font-bold text-gradient"
        animate={done ? { scale: [1.12, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {count}+
      </motion.div>
      <div className="text-sm text-muted-foreground mt-1 font-light tracking-wide">{label}</div>
    </div>
  );
};

const HeroSection = () => {
  const { t } = useLang();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />

      {/* Diagonal accent band */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, transparent 0%, transparent 45%, hsl(var(--primary) / 0.03) 45%, hsl(var(--primary) / 0.05) 55%, transparent 55%)",
        }}
      />

      {/* Grid — editorial feel */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--accent) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent) / 0.1) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 60%)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 60%)",
        }}
      />

      {/* Ambient orbs */}
      <motion.div
        className="absolute top-[10%] right-[5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/6 dark:from-primary/4 to-accent/4 dark:to-accent/3 blur-[140px]"
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[15%] left-[0%] w-[500px] h-[500px] rounded-full bg-accent/5 dark:bg-accent/3 blur-[120px]"
        animate={{ x: [0, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Noise texture */}
      <div className="absolute inset-0 bg-noise pointer-events-none" />

      {/* Content — asymmetric layout */}
      <div className="container relative z-10 px-4">
        <div className="grid lg:grid-cols-12 gap-8 items-center min-h-[85vh]">
          {/* Left — main content, takes 7 cols */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              {/* Badge */}
              <motion.div
                className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-medium uppercase tracking-[0.15em]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                {t.hero.badge}
              </motion.div>

              {/* Heading — editorial stacked */}
              <h1 className="font-display font-800 tracking-[-0.04em] leading-[0.95]">
                <motion.span
                  className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-foreground"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {t.hero.titleLine1}
                </motion.span>
                <motion.span
                  className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-gradient mt-1"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.35 }}
                >
                  {t.hero.titleHighlight}
                </motion.span>
                <motion.span
                  className="block text-2xl sm:text-3xl md:text-4xl text-muted-foreground font-light mt-4 tracking-[-0.02em]"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  {t.hero.titleLine2}
                </motion.span>
              </h1>

              {/* Subtitle */}
              <motion.p
                className="mt-8 text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed font-light"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.65 }}
              >
                {t.hero.subtitle}
              </motion.p>

              {/* CTA */}
              <motion.div
                className="mt-10 flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Button size="lg" className="text-base gap-2 h-13 px-8 shadow-glow group" asChild>
                  <Link to="/tests">
                    {t.hero.cta}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-base h-13 px-8 border-border hover:bg-accent/5 hover:border-accent/30 hover:text-accent transition-all" asChild>
                  <a href="#teachers">{t.hero.learnMore}</a>
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Right — stats column, takes 5 cols */}
          <motion.div
            className="lg:col-span-5 lg:pl-8"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="relative">
              {/* Decorative vertical line */}
              <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent/30 to-transparent" />

              <div className="lg:pl-12 space-y-12">
                <AnimatedCounter target={15} label={t.hero.statSkills} icon={Target} />
                <AnimatedCounter target={500} label={t.hero.statStudents} icon={Users} />
                <AnimatedCounter target={50} label={t.hero.statCases} icon={Briefcase} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-muted-foreground/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown size={24} />
        </motion.div>
      </motion.div>

      {/* Diagonal section cut at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none">
        <svg viewBox="0 0 1440 96" fill="none" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
          <path d="M0 96L1440 96L1440 0L0 96Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
