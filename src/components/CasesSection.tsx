import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users2, Lightbulb, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLang } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

const categoryColorMap: Record<string, string> = {
  marketing: "bg-blue-500/10 text-blue-400",
  management: "bg-red-500/10 text-red-400",
  it: "bg-emerald-500/10 text-emerald-400",
  education: "bg-cyan-500/10 text-cyan-400",
  physics_ed: "bg-violet-500/10 text-violet-400",
  social: "bg-amber-500/10 text-amber-400",
};

const CasesSection = () => {
  const { t, lang } = useLang();
  const isKz = lang === "kz";

  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("cases")
      .select("id, title, title_kz, description, description_kz, category, difficulty, team_size")
      .order("created_at", { ascending: true })
      .limit(6)
      .then(({ data }) => {
        if (data) setCases(data);
      });
  }, []);

  const getCategoryLabel = (category: string) => {
    const map: Record<string, string> = {
      marketing: t.casesSection.marketing,
      management: t.casesSection.management,
      it: t.casesSection.it,
      education: t.casesSection.education,
      physics_ed: t.casesSection.physics_ed,
      social: t.casesSection.social,
    };
    return map[category] || category;
  };

  const getDifficultyLabel = (difficulty: string) => {
    const map: Record<string, string> = {
      easy: t.casesSection.easy,
      medium: t.casesSection.medium,
      hard: t.casesSection.hard,
    };
    return map[difficulty] || difficulty;
  };

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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative p-6 rounded-xl bg-card-gradient border border-border hover:border-primary/40 transition-all duration-300 shadow-card hover:shadow-glow flex flex-col"
            >
              <span className={`inline-block self-start px-3 py-1 rounded-full text-xs font-medium mb-4 ${categoryColorMap[c.category] || "bg-primary/10 text-primary"}`}>
                {getCategoryLabel(c.category)}
              </span>
              <h3 className="font-display text-xl font-semibold mb-2">
                {isKz ? c.title_kz || c.title : c.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1 line-clamp-3">
                {isKz ? c.description_kz || c.description : c.description}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
                <div className="flex items-center gap-1.5">
                  <Users2 size={14} className="text-primary" />
                  <span>{c.team_size} {t.casesSection.players}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Trophy size={14} className="text-primary" />
                  <span>{getDifficultyLabel(c.difficulty)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-12">
          <Link to="/cases">
            <Button size="lg" variant="outline" className="gap-2">
              <Lightbulb size={18} /> {t.casesSection.viewAll}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CasesSection;
