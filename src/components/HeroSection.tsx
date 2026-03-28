import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ChevronDown, Target, Users, Briefcase } from "lucide-react";
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
          const duration = 1500;
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
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <motion.div
      ref={ref}
      className="relative flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl px-6 py-6 shadow-card"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Icon className="text-primary/60" size={18} />
      <motion.div
        className="text-4xl md:text-5xl font-display font-bold text-gradient"
        animate={done ? { scale: [1.15, 1] } : {}}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {count}+
      </motion.div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </motion.div>
  );
};

const HeroSection = () => {
  const { t } = useLang();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background — adapts to theme */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
      {/* Noise texture for depth in light mode */}
      <div className="absolute inset-0 bg-noise pointer-events-none" />

      {/* Animated grid overlay — subtle in both modes */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary) / 0.08) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.08) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 50%)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 50%)",
        }}
      />

      {/* Large gradient orbs — stronger in light mode */}
      <motion.div
        className="absolute top-[15%] left-[5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/10 dark:from-primary/8 to-violet-500/10 dark:to-violet-500/5 blur-[120px]"
        animate={{ y: [0, -40, 0], x: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-cyan-500/10 dark:from-cyan-500/5 to-primary/10 dark:to-primary/5 blur-[120px]"
        animate={{ y: [0, 30, 0], x: [0, -30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-[100px]"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Small floating particles */}
      {[
        { top: "18%", left: "12%", size: 6, color: "bg-primary/30", dur: 7 },
        { top: "25%", left: "80%", size: 4, color: "bg-violet-400/25", dur: 9 },
        { top: "60%", left: "15%", size: 5, color: "bg-cyan-400/20", dur: 6 },
        { top: "45%", left: "85%", size: 3, color: "bg-primary/20", dur: 11 },
        { top: "70%", left: "70%", size: 4, color: "bg-violet-400/20", dur: 8 },
        { top: "35%", left: "50%", size: 3, color: "bg-cyan-400/15", dur: 10 },
      ].map((p, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${p.color}`}
          style={{ top: p.top, left: p.left, width: p.size, height: p.size }}
          animate={{ y: [0, -20, 0], x: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
        />
      ))}

      {/* Content */}
      <div className="container relative z-10 text-center px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
          {/* Badge */}
          <motion.span
            className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm text-primary text-sm font-medium"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Sparkles size={14} className="animate-pulse" />
            {t.hero.badge}
          </motion.span>

          {/* Heading */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[1.1] max-w-5xl mx-auto">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {t.hero.titleLine1}{" "}
            </motion.span>
            <motion.span
              className="bg-gradient-to-r from-primary via-violet-400 to-cyan-400 bg-clip-text text-transparent"
              style={{ textShadow: "0 0 60px rgba(124,58,237,0.25)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              {t.hero.titleHighlight}
            </motion.span>
            <br />
            <motion.span
              className="text-3xl sm:text-4xl md:text-5xl text-muted-foreground/80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {t.hero.titleLine2}
            </motion.span>
          </h1>

          {/* Subtitle */}
          <motion.p
            className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.75 }}
          >
            {t.hero.subtitle}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <Button size="lg" className="text-base gap-2 h-13 px-8 shadow-glow relative overflow-hidden group" asChild>
              <Link to="/tests">
                {t.hero.cta}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base h-13 px-8 border-white/10 hover:bg-white/5 hover:border-white/20 transition-all"
              asChild
            >
              <a href="#how-it-works">{t.hero.learnMore}</a>
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl mx-auto"
        >
          <AnimatedCounter target={15} label={t.hero.statSkills} icon={Target} />
          <AnimatedCounter target={500} label={t.hero.statStudents} icon={Users} />
          <AnimatedCounter target={50} label={t.hero.statCases} icon={Briefcase} />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-muted-foreground/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={24} />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
