import { motion, useInView } from "framer-motion";
import { ClipboardCheck, Dumbbell, TrendingUp, Sparkles } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { useRef } from "react";
import { LayeredIcon, HexIcon, BlobIcon } from "@/components/BrandIcons";

const HowItWorksSection = () => {
  const { t } = useLang();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const steps = [
    {
      icon: ClipboardCheck,
      title: t.howItWorks.step1Title,
      desc: t.howItWorks.step1Desc,
      num: "01",
      gradient: "from-blue-500 to-cyan-400",
      glow: "shadow-[0_0_40px_rgba(59,130,246,0.3)]",
      iconGlow: "bg-blue-500/20",
    },
    {
      icon: Dumbbell,
      title: t.howItWorks.step2Title,
      desc: t.howItWorks.step2Desc,
      num: "02",
      gradient: "from-violet-500 to-purple-400",
      glow: "shadow-[0_0_40px_rgba(139,92,246,0.3)]",
      iconGlow: "bg-violet-500/20",
    },
    {
      icon: TrendingUp,
      title: t.howItWorks.step3Title,
      desc: t.howItWorks.step3Desc,
      num: "03",
      gradient: "from-emerald-500 to-teal-400",
      glow: "shadow-[0_0_40px_rgba(16,185,129,0.3)]",
      iconGlow: "bg-emerald-500/20",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-32 relative overflow-hidden section-alt">
      {/* Background gradient blob */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
      <div className="absolute inset-0 bg-noise pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="container px-4 relative z-10" ref={sectionRef}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-wider">
            {t.howItWorks.label}
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3">
            {t.howItWorks.title}{" "}
            <span className="text-gradient">{t.howItWorks.titleHighlight}</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            {t.howItWorks.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
          {/* Animated connector line */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-[2px] z-0">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500/60 via-violet-500/60 to-emerald-500/60 rounded-full"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: "easeInOut" }}
              style={{ transformOrigin: "left" }}
            />
            {/* Animated glow on the line */}
            <motion.div
              className="absolute inset-0 h-full bg-gradient-to-r from-blue-400/40 via-violet-400/40 to-emerald-400/40 blur-sm rounded-full"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: "easeInOut" }}
              style={{ transformOrigin: "left" }}
            />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.2 + 0.3,
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
              className="relative text-center group z-10"
            >
              {/* Glassmorphic card */}
              <div className="relative p-8 rounded-2xl bg-white/[0.03] dark:bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-xl">
                {/* Numbered circle with gradient */}
                <div className="relative mx-auto mb-6">
                  <div
                    className={`w-20 h-20 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center mx-auto relative`}
                  >
                    <span className="text-white text-2xl font-bold tracking-tight">
                      {step.num}
                    </span>
                    {/* Outer ring glow */}
                    <div
                      className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-500`}
                    />
                  </div>
                </div>

                {/* Icon with BrandIcon shell */}
                <div className="relative mx-auto flex items-center justify-center mb-5">
                  {i === 0 && (
                    <LayeredIcon
                      main={<ClipboardCheck className="text-white" size={30} />}
                      accent={<Sparkles className="text-white" size={14} />}
                      gradient="from-blue-500 to-cyan-500"
                      accentGradient="from-primary to-violet-500"
                      glow="bg-blue-500"
                      size={72}
                    />
                  )}
                  {i === 1 && (
                    <HexIcon gradient="from-violet-500 to-purple-500" glow="bg-violet-500" size={72}>
                      <Dumbbell className="text-white" size={30} />
                    </HexIcon>
                  )}
                  {i === 2 && (
                    <BlobIcon gradient="from-emerald-500 to-teal-500" glow="bg-emerald-500" size={72}>
                      <TrendingUp className="text-white" size={30} />
                    </BlobIcon>
                  )}
                </div>

                {/* Title */}
                <motion.h3
                  className="font-display text-lg font-semibold mb-3"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 + 0.6 }}
                >
                  {step.title}
                </motion.h3>

                {/* Description with staggered fade-in */}
                <motion.p
                  className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 + 0.8 }}
                >
                  {step.desc}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
