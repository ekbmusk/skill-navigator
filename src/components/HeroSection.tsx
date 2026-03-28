import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Brain, Users, Dumbbell, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLang } from "@/i18n/LanguageContext";

// ── Typing effect ────────────────────────────────────────────────────────────

const TypedText = ({ text, speed = 35, delay = 800 }: { text: string; speed?: number; delay?: number }) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return (
    <span>
      {displayed}
      {!done && <span className="animate-pulse text-primary">|</span>}
    </span>
  );
};

// ── Feature card data ────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Brain,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    borderHover: "hover:border-blue-500/30",
    titleRu: "Диагностика",
    titleKz: "Диагностика",
    descRu: "3 типа тестов для оценки навыков",
    descKz: "Дағдыларды бағалау үшін 3 түрлі тест",
    stat: "15+",
    floatClass: "animate-[float1_6s_ease-in-out_infinite]",
    offset: "lg:translate-x-4",
  },
  {
    icon: Users,
    color: "text-green-400",
    bg: "bg-green-500/10",
    borderHover: "hover:border-green-500/30",
    titleRu: "Кейсы",
    titleKz: "Кейстер",
    descRu: "Командные симуляции с 360° оценкой",
    descKz: "360° бағалаумен командалық симуляциялар",
    stat: "5+",
    floatClass: "animate-[float2_8s_ease-in-out_infinite]",
    offset: "lg:-translate-x-2",
  },
  {
    icon: Dumbbell,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    borderHover: "hover:border-purple-500/30",
    titleRu: "Тренажёры",
    titleKz: "Тренажерлер",
    descRu: "Интерактивные упражнения на практике",
    descKz: "Тәжірибедегі интерактивті жаттығулар",
    stat: "3+",
    floatClass: "animate-[float3_7s_ease-in-out_infinite]",
    offset: "lg:translate-x-6",
  },
];

// ── Main hero ────────────────────────────────────────────────────────────────

const HeroSection = () => {
  const { t, lang } = useLang();
  const isKz = lang === "kz";

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />

      {/* Two ambient orbs — CSS only */}
      <div
        className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[150px] animate-[pulse_12s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.07), hsl(270 60% 60% / 0.04), transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-5%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[130px] animate-[pulse_16s_ease-in-out_infinite_2s]"
        style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.06), hsl(340 70% 65% / 0.03), transparent 70%)" }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(hsl(var(--primary) / 0.07) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 70% 50% at 30% 40%, rgba(0,0,0,0.35), transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 50% at 30% 40%, rgba(0,0,0,0.35), transparent)",
        }}
      />

      {/* Diagonal accent band */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, transparent 42%, hsl(var(--primary) / 0.03) 42%, hsl(270 60% 60% / 0.03) 58%, transparent 58%)",
        }}
      />

      {/* Content */}
      <div className="container relative z-10 px-4">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[85vh]">
          {/* Left — main content */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              {/* Badge */}
              <motion.div
                className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm text-xs font-medium uppercase tracking-[0.15em]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Sparkles size={14} className="text-primary animate-spin" style={{ animationDuration: "4s" }} />
                <span className="text-gradient">{t.hero.badge}</span>
              </motion.div>

              {/* Heading */}
              <h1 className="font-display font-bold tracking-[-0.03em] leading-[0.95]">
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

              {/* Typed subtitle */}
              <motion.div
                className="mt-8 text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed font-light h-[3.5em]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <TypedText text={t.hero.subtitle} delay={1000} />
              </motion.div>

              {/* CTA */}
              <motion.div
                className="mt-8 flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Button size="lg" className="text-lg gap-2.5 h-14 px-10 shadow-glow group" asChild>
                  <Link to="/tests">
                    {t.hero.cta}
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg h-14 px-10 border-border hover:bg-accent/5 hover:border-accent/30 hover:text-accent transition-all" asChild>
                  <a href="#teachers">{t.hero.learnMore}</a>
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Right — floating feature cards */}
          <div className="lg:col-span-5 lg:pl-4">
            <div className="space-y-5">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={f.titleRu}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 + i * 0.15, ease: "easeOut" }}
                    className={`${f.floatClass} ${f.offset}`}
                  >
                    <div
                      className={`p-5 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/50 ${f.borderHover} hover:scale-[1.02] transition-all duration-300 cursor-default`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center shrink-0`}>
                          <Icon className={`h-6 w-6 ${f.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-display font-semibold text-sm text-foreground">
                              {isKz ? f.titleKz : f.titleRu}
                            </h3>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                              {f.stat}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {isKz ? f.descKz : f.descRu}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
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

      {/* Diagonal section cut */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none">
        <svg viewBox="0 0 1440 96" fill="none" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
          <path d="M0 96L1440 96L1440 0L0 96Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
