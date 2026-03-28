import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import {
  Users2, Trophy, ChevronRight, Layers,
  Shield, Award, Play, Sparkles, Zap, Target,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { useCases, type Case } from "@/hooks/useCases";
import { Skeleton } from "@/components/ui/skeleton";

/* ── colour maps with border-accent variants ── */

const categoryMeta: Record<string, { badge: string; accent: string; glow: string }> = {
  marketing:  { badge: "bg-blue-500/10 text-blue-400",    accent: "from-blue-500 to-blue-400",    glow: "group-hover:shadow-blue-500/20" },
  management: { badge: "bg-orange-500/10 text-orange-400", accent: "from-orange-500 to-amber-400", glow: "group-hover:shadow-orange-500/20" },
  it:         { badge: "bg-emerald-500/10 text-emerald-400", accent: "from-emerald-500 to-teal-400", glow: "group-hover:shadow-emerald-500/20" },
  education:  { badge: "bg-violet-500/10 text-violet-400", accent: "from-violet-500 to-purple-400", glow: "group-hover:shadow-violet-500/20" },
  physics_ed: { badge: "bg-cyan-500/10 text-cyan-400",    accent: "from-cyan-500 to-sky-400",     glow: "group-hover:shadow-cyan-500/20" },
  social:     { badge: "bg-pink-500/10 text-pink-400",    accent: "from-pink-500 to-rose-400",    glow: "group-hover:shadow-pink-500/20" },
};

const difficultyColorMap: Record<string, string> = {
  easy: "bg-green-500/10 text-green-400 ring-1 ring-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/20",
  hard: "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
};

const fallbackCategory = { badge: "bg-primary/10 text-primary", accent: "from-primary to-primary", glow: "" };

/* ── animation variants ── */

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
};

/* ── component ── */

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
        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center mb-16"
        >
          {/* Glowing background orb */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[320px] rounded-full bg-primary/8 blur-[100px]" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 ring-1 ring-primary/20 backdrop-blur-sm"
          >
            <Play size={15} className="fill-primary" />
            {t.casesListExtra.simulator}
            <Sparkles size={14} className="text-primary/60" />
          </motion.div>

          <h1 className="relative font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            {t.casesListPage.title}{" "}
            <span className="text-gradient">{t.casesListPage.titleHighlight}</span>
          </h1>
          <p className="relative mt-5 text-muted-foreground max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            {t.casesListExtra.subtitle}
          </p>

          {/* Feature chips */}
          <div className="relative flex flex-wrap gap-3 justify-center mt-8">
            {[
              { icon: <Layers size={15} className="text-blue-400" />,  label: t.casesListExtra.stepSim },
              { icon: <Shield size={15} className="text-red-400" />,   label: t.casesListExtra.conflictScenarios },
              { icon: <Award size={15} className="text-green-400" />,  label: `360° ${t.casesListExtra.feedback360}` },
            ].map((chip, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.08 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 ring-1 ring-border text-xs font-medium text-muted-foreground backdrop-blur-sm"
              >
                {chip.icon}
                {chip.label}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* ── Loading skeletons ── */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="relative overflow-hidden rounded-2xl border border-border bg-card-gradient">
                {/* Top accent strip skeleton */}
                <Skeleton className="h-1.5 w-full rounded-none" />
                <div className="p-6">
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-18 rounded-full" />
                  </div>
                  <Skeleton className="h-7 w-3/4 mb-3 rounded-md" />
                  <Skeleton className="h-3.5 w-full mb-1.5 rounded" />
                  <Skeleton className="h-3.5 w-5/6 mb-1.5 rounded" />
                  <Skeleton className="h-3.5 w-2/3 mb-5 rounded" />
                  <div className="flex gap-2 mb-5">
                    <Skeleton className="h-7 w-28 rounded-lg" />
                    <Skeleton className="h-7 w-28 rounded-lg" />
                    <Skeleton className="h-7 w-16 rounded-lg" />
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between items-center">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-5 w-5 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Error state ── */}
        {error && (
          <div className="text-center py-20 text-destructive">{error}</div>
        )}

        {/* ── Cards grid ── */}
        {!loading && !error && (
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {cases.map((c) => {
              const phaseCount = getPhaseCount(c);
              const conflictCount = getConflictCount(c);
              const meta = categoryMeta[c.category] || fallbackCategory;

              return (
                <motion.div
                  key={c.id}
                  variants={cardVariants}
                  onClick={() => navigate(`/case/${c.id}`)}
                  whileHover={{ y: -4, scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  className={`group relative overflow-hidden rounded-2xl bg-card-gradient border border-border/60
                    hover:border-primary/40 transition-all duration-300
                    shadow-card hover:shadow-xl ${meta.glow}
                    flex flex-col cursor-pointer`}
                >
                  {/* Category colour accent strip */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${meta.accent} opacity-70 group-hover:opacity-100 transition-opacity`} />

                  <div className="p-6 flex flex-col flex-1">
                    {/* Category + Difficulty badges */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${meta.badge}`}>
                        <Target size={12} />
                        {getCategoryLabel(c.category)}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                        difficultyColorMap[c.difficulty] || "bg-secondary text-muted-foreground"
                      }`}>
                        <Zap size={12} />
                        {getDifficultyLabel(c.difficulty)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-200">
                      {isKz ? c.title_kz || c.title : c.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1 line-clamp-3">
                      {isKz ? c.description_kz || c.description : c.description}
                    </p>

                    {/* Feature badges */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {phaseCount > 0 && (
                        <span className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                          <Layers size={13} />
                          {phaseCount} {t.casesListExtra.phases}
                        </span>
                      )}
                      {conflictCount > 0 && (
                        <span className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 ring-1 ring-red-500/20">
                          <Shield size={13} />
                          {conflictCount} {t.casesListExtra.conflicts}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-green-500/10 text-green-400 ring-1 ring-green-500/20">
                        <Award size={13} />
                        360°
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/60 pt-4">
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
                        className="text-primary opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CasesListPage;
