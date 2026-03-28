import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users2, Lightbulb, Trophy, ArrowRight, Loader2, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLang } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

const categoryMeta: Record<string, { badge: string; accent: string }> = {
  marketing:  { badge: "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/25",       accent: "from-blue-500 to-blue-400" },
  management: { badge: "bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/25",  accent: "from-orange-500 to-amber-400" },
  it:         { badge: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/25", accent: "from-emerald-500 to-teal-400" },
  education:  { badge: "bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/25",  accent: "from-violet-500 to-purple-400" },
  physics_ed: { badge: "bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/25",        accent: "from-cyan-500 to-sky-400" },
  social:     { badge: "bg-pink-500/10 text-pink-400 ring-1 ring-pink-500/25",        accent: "from-pink-500 to-rose-400" },
};

const difficultyMeta: Record<string, string> = {
  easy:   "bg-green-500/10 text-green-400 ring-1 ring-green-500/25",
  medium: "bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/25",
  hard:   "bg-red-500/10 text-red-400 ring-1 ring-red-500/25",
};

const fallbackCategory = { badge: "bg-primary/10 text-primary ring-1 ring-primary/25", accent: "from-primary to-primary" };

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
};

const CasesSection = () => {
  const { t, lang } = useLang();
  const isKz = lang === "kz";

  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("cases")
      .select("id, title, title_kz, description, description_kz, category, difficulty, team_size")
      .order("created_at", { ascending: true })
      .limit(6)
      .then(({ data }) => {
        if (data) setCases(data);
        setLoading(false);
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

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">{t.casesSection.label}...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && cases.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary/60 flex items-center justify-center">
              <Inbox className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-center max-w-sm">
              {t.casesSection.subtitle}
            </p>
          </div>
        )}

        {/* Cards grid */}
        {!loading && cases.length > 0 && (
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            {cases.map((c) => {
              const cat = categoryMeta[c.category] || fallbackCategory;
              return (
                <motion.div
                  key={c.id}
                  variants={cardVariants}
                  whileHover={{ y: -6, transition: { type: "spring", stiffness: 400, damping: 20 } }}
                  className="group relative rounded-xl bg-card-gradient border border-border hover:border-primary/40 transition-colors duration-300 shadow-card hover:shadow-glow flex flex-col overflow-hidden"
                >
                  {/* Gradient accent strip */}
                  <div className={`h-1 w-full bg-gradient-to-r ${cat.accent}`} />

                  <div className="p-6 flex flex-col flex-1">
                    {/* Badges row */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${cat.badge}`}>
                        {getCategoryLabel(c.category)}
                      </span>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${difficultyMeta[c.difficulty] || "bg-primary/10 text-primary"}`}>
                        {getDifficultyLabel(c.difficulty)}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-200">
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
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-12">
          <Link to="/cases">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 group/btn relative overflow-hidden border-primary/30 hover:border-primary/60 transition-colors duration-300"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-primary/5 to-violet-500/5 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
              <Lightbulb size={18} className="relative z-10" />
              <span className="relative z-10">{t.casesSection.viewAll}</span>
              <ArrowRight size={16} className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CasesSection;
