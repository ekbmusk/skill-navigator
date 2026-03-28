import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw, Download, Printer, TrendingUp, TrendingDown, Shield, ShieldAlert, Brain, Target } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
} from "recharts";
import { useLang } from "@/i18n/LanguageContext";
import { useDiagnostics } from "@/hooks/useDiagnostics";
import { useResources, type Resource } from "@/hooks/useResources";
import ResourceCard from "@/components/ResourceCard";
import type { Tables } from "@/integrations/supabase/types";
import type { DiagnosticsResult as FullResult, ProfilePattern, SkillLevel } from "@/utils/scoringEngine";
import { printReport } from "@/utils/pdfExport";

interface Result {
  category: string;
  label: string;
  score: number;
}

interface Props {
  results: Result[];
  fullResult?: FullResult;
  onRestart: () => void;
}

const DiagnosticsResults = ({ results, fullResult, onRestart }: Props) => {
  const { t } = useLang();
  const { downloadAsCSV, loading: loadingHistory } = useDiagnostics();
  const { loadResourcesByCategory } = useResources();
  const [showDetails, setShowDetails] = useState(false);
  const [recommendedResources, setRecommendedResources] = useState<Record<string, Resource[]>>({});

  useEffect(() => {
    const weakCategories = results.filter(r => r.score < 70).map(r => r.category);
    if (weakCategories.length === 0) return;
    Promise.all(
      weakCategories.map(cat =>
        loadResourcesByCategory(cat, 3).then(resources => ({ cat, resources }))
      )
    ).then(loaded => {
      const map: Record<string, Resource[]> = {};
      for (const { cat, resources } of loaded) {
        if (resources.length > 0) map[cat] = resources;
      }
      setRecommendedResources(map);
    });
  }, [results]);

  const getLevel = (score: number) => {
    if (score >= 80) return { text: t.results.excellent, color: "text-green-400" };
    if (score >= 60) return { text: t.results.good, color: "text-primary" };
    if (score >= 40) return { text: t.results.average, color: "text-yellow-400" };
    return { text: t.results.needsWork, color: "text-destructive" };
  };

  const getRecommendation = (category: string, score: number) => {
    if (score >= 70) return t.results.recExcellent;
    const recs: Record<string, string> = {
      cognitive: t.results.recCognitive,
      soft: t.results.recSoft,
      professional: t.results.recProfessional,
      adaptability: t.results.recAdaptability,
    };
    return recs[category] || "";
  };

  const getProfileLabel = (pattern: ProfilePattern): string => {
    const labels = t.results.profilePatterns as Record<string, string>;
    return labels[pattern] || pattern;
  };

  const getSkillLevelLabel = (level: SkillLevel): string => {
    const labels = t.results.skillLevels as Record<string, string>;
    return labels[level] || level;
  };

  const getCategoryLabel = (category: string): string => {
    const cats = t.categories as Record<string, string>;
    return cats[category] || category;
  };

  const handleDownload = () => {
    const mockResult: Tables<"diagnostics_results"> = {
      id: "temp-" + Date.now(),
      user_id: "",
      cognitive_score: results.find(r => r.category === "cognitive")?.score || 0,
      soft_score: results.find(r => r.category === "soft")?.score || 0,
      professional_score: results.find(r => r.category === "professional")?.score || 0,
      adaptability_score: results.find(r => r.category === "adaptability")?.score || 0,
      average_score: avgScore,
      answers: {},
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      version: 1,
    };
    downloadAsCSV(mockResult, "Student");
  };

  const handlePrintPDF = () => {
    const cats = t.categories as Record<string, string>;
    const scores = {
      cognitive: results.find(r => r.category === "cognitive")?.score || 0,
      soft: results.find(r => r.category === "soft")?.score || 0,
      professional: results.find(r => r.category === "professional")?.score || 0,
      adaptability: results.find(r => r.category === "adaptability")?.score || 0,
      average: Math.round(results.reduce((s, r) => s + r.score, 0) / results.length),
    };
    const recs: Record<string, string> = {};
    for (const r of results) {
      recs[r.category] = getRecommendation(r.category, r.score);
    }
    printReport({
      scores,
      profileType: fullResult ? getProfileLabel(fullResult.dominantPattern) : "",
      confidence: fullResult ? Math.round(fullResult.adjustedConfidence * 100) : 0,
      strengthAreas: fullResult ? fullResult.strengthAreas.map(a => cats[a] || a) : [],
      growthAreas: fullResult ? fullResult.growthAreas.map(a => cats[a] || a) : [],
      recommendations: recs,
      date: fullResult?.timestamp || new Date().toISOString(),
      studentName: "",
      antiCheatPassed: fullResult?.antiCheat.passed ?? true,
      categoryLabels: cats,
      translations: {
        reportTitle: t.results.reportTitle,
        totalScore: t.results.totalScore,
        profileType: t.results.profileType,
        confidence: t.results.confidence,
        strengthAreas: t.results.strengthAreas,
        growthAreas: t.results.growthAreas,
        antiCheatPassed: t.results.antiCheatPassed,
        antiCheatFailed: t.results.antiCheatFailed,
        generatedAt: t.results.generatedAt,
      },
    });
  };

  const avgScore = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
  const chartData = results.map((r) => ({ subject: r.label, score: r.score, fullMark: 100 }));

  return (
    <div className="container max-w-3xl mx-auto px-4">
      {/* Title */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
          {t.results.title} <span className="text-gradient">{t.results.titleHighlight}</span>
        </h1>
        <p className="text-muted-foreground">{t.results.subtitle}</p>
      </motion.div>

      {/* Radar + Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-card-gradient border border-border rounded-2xl p-6 shadow-card mb-8"
      >
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <PolarGrid stroke="hsl(222, 25%, 18%)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 10 }} />
              <Radar name={t.results.skills} dataKey="score" stroke="hsl(38, 92%, 55%)" fill="hsl(38, 92%, 55%)" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center mt-4">
          <div className="text-4xl font-display font-bold text-gradient">{avgScore}%</div>
          <div className="text-sm text-muted-foreground mt-1">{t.results.totalScore}</div>
        </div>
      </motion.div>

      {/* Profile & Confidence Cards */}
      {fullResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
        >
          {/* Profile Type */}
          <div className="p-4 rounded-xl bg-card-gradient border border-border shadow-card text-center">
            <Brain size={20} className="mx-auto mb-2 text-primary" />
            <div className="text-xs text-muted-foreground mb-1">{t.results.profileType}</div>
            <div className="text-sm font-semibold">{getProfileLabel(fullResult.dominantPattern)}</div>
          </div>

          {/* Confidence */}
          <div className="p-4 rounded-xl bg-card-gradient border border-border shadow-card text-center">
            {fullResult.antiCheat.passed ? (
              <Shield size={20} className="mx-auto mb-2 text-green-400" />
            ) : (
              <ShieldAlert size={20} className="mx-auto mb-2 text-yellow-400" />
            )}
            <div className="text-xs text-muted-foreground mb-1">{t.results.confidence}</div>
            <div className="text-sm font-semibold">{Math.round(fullResult.adjustedConfidence * 100)}%</div>
          </div>

          {/* Strength Areas */}
          <div className="p-4 rounded-xl bg-card-gradient border border-border shadow-card text-center">
            <TrendingUp size={20} className="mx-auto mb-2 text-green-400" />
            <div className="text-xs text-muted-foreground mb-1">{t.results.strengthAreas}</div>
            <div className="text-xs font-medium leading-tight">
              {fullResult.strengthAreas.map(a => getCategoryLabel(a)).join(", ")}
            </div>
          </div>

          {/* Growth Areas */}
          <div className="p-4 rounded-xl bg-card-gradient border border-border shadow-card text-center">
            <Target size={20} className="mx-auto mb-2 text-yellow-400" />
            <div className="text-xs text-muted-foreground mb-1">{t.results.growthAreas}</div>
            <div className="text-xs font-medium leading-tight">
              {fullResult.growthAreas.map(a => getCategoryLabel(a)).join(", ")}
            </div>
          </div>
        </motion.div>
      )}

      {/* Category Breakdown */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {results.map((r, i) => {
          const level = getLevel(r.score);
          const catResult = fullResult?.categories.find(c => c.category === r.category);
          return (
            <motion.div
              key={r.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="p-5 rounded-xl bg-card-gradient border border-border shadow-card"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display font-semibold text-sm">{r.label}</h3>
                <span className={`text-sm font-medium ${level.color}`}>{level.text}</span>
              </div>
              {catResult && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {t.results.skillLevel}: {getSkillLevelLabel(catResult.level)}
                  </span>
                </div>
              )}
              <div className="h-2 rounded-full bg-secondary overflow-hidden mb-3">
                <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${r.score}%` }} transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }} />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{getRecommendation(r.category, r.score)}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Recommended Resources */}
      {Object.keys(recommendedResources).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <h2 className="font-display text-lg font-semibold mb-4 text-center">
            {t.resources?.recommended || "Рекомендуемые материалы"}
          </h2>
          {Object.entries(recommendedResources).map(([category, resources]) => (
            <div key={category} className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {getCategoryLabel(category)}
              </h3>
              <div className="grid gap-2">
                {resources.map(resource => (
                  <ResourceCard key={resource.id} resource={resource} compact />
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Anti-cheat status */}
      {fullResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className={`flex items-center gap-2 justify-center mb-8 text-xs ${fullResult.antiCheat.passed ? "text-green-400" : "text-yellow-400"}`}
        >
          {fullResult.antiCheat.passed ? <Shield size={14} /> : <ShieldAlert size={14} />}
          <span>{fullResult.antiCheat.passed ? t.results.antiCheatPassed : t.results.antiCheatFailed}</span>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onRestart} className="gap-2">
          <RotateCcw size={16} /> {t.results.restart}
        </Button>
        <Button onClick={handleDownload} disabled={loadingHistory} className="gap-2">
          <Download size={16} /> {t.results.download}
        </Button>
        <Button variant="outline" onClick={handlePrintPDF} className="gap-2">
          <Printer size={16} /> {t.results.downloadPDF}
        </Button>
      </div>
    </div>
  );
};

export default DiagnosticsResults;
