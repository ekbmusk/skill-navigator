import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import {
  Users2, Trophy, ChevronRight, Clock, Layers,
  Shield, Award, Play,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { useCases, type Case } from "@/hooks/useCases";

const categoryColorMap: Record<string, string> = {
  marketing: "bg-blue-500/10 text-blue-500",
  management: "bg-orange-500/10 text-orange-500",
  it: "bg-emerald-500/10 text-emerald-500",
  education: "bg-violet-500/10 text-violet-500",
  physics_ed: "bg-cyan-500/10 text-cyan-500",
  social: "bg-pink-500/10 text-pink-500",
};

const difficultyColorMap: Record<string, string> = {
  easy: "bg-green-500/10 text-green-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  hard: "bg-destructive/10 text-destructive",
};

const CasesListPage = () => {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const { loadCases, loading, error } = useCases();
  const [cases, setCases] = useState<Case[]>([]);
  const isKz = lang === "kz";

  useEffect(() => {
    loadCases().then(setCases);
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

  const getPhaseCount = (c: Case) => {
    const phases = (c as any).phases;
    return Array.isArray(phases) ? phases.length : 0;
  };

  const getConflictCount = (c: Case) => {
    const conflicts = (c as any).conflicts;
    return Array.isArray(conflicts) ? conflicts.length : 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Play size={16} />
            {isKz ? "Командалық симулятор" : "Командный симулятор"}
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold">
            {t.casesListPage.title}{" "}
            <span className="text-gradient">{t.casesListPage.titleHighlight}</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {isKz
              ? "Рөлдерді бөліңіз, кезеңдерден өтіңіз, қақтығыстарды шешіңіз және командадастарыңызды бағалаңыз"
              : "Распределяйте роли, проходите этапы, решайте конфликты и оценивайте работу команды"}
          </p>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-xs text-muted-foreground">
              <Layers size={14} className="text-blue-500" />
              {isKz ? "Кезеңдік симуляция" : "Пошаговая симуляция"}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-xs text-muted-foreground">
              <Shield size={14} className="text-red-500" />
              {isKz ? "Қақтығыс сценарийлері" : "Конфликтные сценарии"}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-xs text-muted-foreground">
              <Award size={14} className="text-green-500" />
              360° {isKz ? "кері байланыс" : "обратная связь"}
            </span>
          </div>
        </motion.div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-destructive">{error}</div>
        )}

        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c, i) => {
              const phaseCount = getPhaseCount(c);
              const conflictCount = getConflictCount(c);

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => navigate(`/case/${c.id}`)}
                  className="group relative p-6 rounded-xl bg-card-gradient border border-border hover:border-primary/40 transition-all duration-300 shadow-card hover:shadow-glow flex flex-col cursor-pointer"
                >
                  {/* Category + Difficulty */}
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        categoryColorMap[c.category] || "bg-primary/10 text-primary"
                      }`}
                    >
                      {getCategoryLabel(c.category)}
                    </span>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        difficultyColorMap[c.difficulty] ||
                        "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {getDifficultyLabel(c.difficulty)}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-semibold mb-2">
                    {isKz ? c.title_kz || c.title : c.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-3">
                    {isKz ? c.description_kz || c.description : c.description}
                  </p>

                  {/* Simulator features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {phaseCount > 0 && (
                      <span className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-blue-500/10 text-blue-500">
                        <Layers size={12} />
                        {phaseCount} {isKz ? "кезең" : "этапов"}
                      </span>
                    )}
                    {conflictCount > 0 && (
                      <span className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-red-500/10 text-red-500">
                        <Shield size={12} />
                        {conflictCount} {isKz ? "қақтығыс" : "конфликтов"}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-green-500/10 text-green-500">
                      <Award size={12} />
                      360°
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
                    <div className="flex items-center gap-1.5">
                      <Users2 size={14} className="text-primary" />
                      <span>
                        {c.team_size} {t.casesListPage.teamSize}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Trophy size={14} className="text-primary" />
                      <span>{getDifficultyLabel(c.difficulty)}</span>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CasesListPage;
