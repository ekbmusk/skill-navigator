import { motion } from "framer-motion";
import { Brain, Target, BarChart3, Zap } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";

const DiagnosticsSection = () => {
  const { t } = useLang();

  const features = [
    { icon: Brain, title: t.diagSection.cognitive, description: t.diagSection.cognitiveDesc },
    { icon: Target, title: t.diagSection.soft, description: t.diagSection.softDesc },
    { icon: BarChart3, title: t.diagSection.professional, description: t.diagSection.professionalDesc },
    { icon: Zap, title: t.diagSection.adaptability, description: t.diagSection.adaptabilityDesc },
  ];

  return (
    <section id="diagnostics" className="py-24 md:py-32">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-wider">{t.diagSection.label}</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3">
            {t.diagSection.title} <span className="text-gradient">{t.diagSection.titleHighlight}</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">{t.diagSection.subtitle}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative p-6 rounded-xl bg-card-gradient border border-border hover:border-primary/40 transition-all duration-300 shadow-card hover:shadow-glow"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="text-primary" size={24} />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DiagnosticsSection;
