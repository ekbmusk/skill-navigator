import { motion } from "framer-motion";
import { ClipboardCheck, Dumbbell, TrendingUp } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";

const HowItWorksSection = () => {
  const { t } = useLang();

  const steps = [
    { icon: ClipboardCheck, title: t.howItWorks.step1Title, desc: t.howItWorks.step1Desc, num: "01" },
    { icon: Dumbbell, title: t.howItWorks.step2Title, desc: t.howItWorks.step2Desc, num: "02" },
    { icon: TrendingUp, title: t.howItWorks.step3Title, desc: t.howItWorks.step3Desc, num: "03" },
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-wider">{t.howItWorks.label}</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3">
            {t.howItWorks.title} <span className="text-gradient">{t.howItWorks.titleHighlight}</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">{t.howItWorks.subtitle}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center group"
            >
              {/* Connector line between steps */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-primary/5" />
              )}

              <div className="relative mx-auto w-24 h-24 rounded-2xl bg-card-gradient border border-border group-hover:border-primary/40 transition-all duration-300 flex items-center justify-center mb-6 shadow-card group-hover:shadow-glow">
                <step.icon className="text-primary" size={32} />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {step.num}
                </span>
              </div>

              <h3 className="font-display text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
