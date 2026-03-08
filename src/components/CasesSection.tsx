import { motion } from "framer-motion";
import { Users2, Lightbulb, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n/LanguageContext";

const CasesSection = () => {
  const { t } = useLang();

  const cases = [
    { tag: t.casesSection.marketing, title: t.casesSection.case1Title, desc: t.casesSection.case1Desc, players: "3-5", difficulty: t.casesSection.medium },
    { tag: t.casesSection.management, title: t.casesSection.case2Title, desc: t.casesSection.case2Desc, players: "4-6", difficulty: t.casesSection.hard },
    { tag: t.casesSection.it, title: t.casesSection.case3Title, desc: t.casesSection.case3Desc, players: "3-4", difficulty: t.casesSection.medium },
  ];

  return (
    <section id="cases" className="py-24 md:py-32">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-wider">{t.casesSection.label}</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3">
            {t.casesSection.title} <span className="text-gradient">{t.casesSection.titleHighlight}</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">{t.casesSection.subtitle}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {cases.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative p-6 rounded-xl bg-card-gradient border border-border hover:border-primary/40 transition-all duration-300 shadow-card hover:shadow-glow flex flex-col"
            >
              <span className="inline-block self-start px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">{c.tag}</span>
              <h3 className="font-display text-xl font-semibold mb-2">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{c.desc}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
                <div className="flex items-center gap-1.5">
                  <Users2 size={14} className="text-primary" />
                  <span>{c.players} {t.casesSection.players}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Trophy size={14} className="text-primary" />
                  <span>{c.difficulty}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-12">
          <Button size="lg" variant="outline" className="gap-2">
            <Lightbulb size={18} /> {t.casesSection.viewAll}
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CasesSection;
