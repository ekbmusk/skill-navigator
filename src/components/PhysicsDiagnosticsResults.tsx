import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw, Shield, ShieldAlert } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
} from "recharts";
import { useLang } from "@/i18n/LanguageContext";
import { useResources, type Resource } from "@/hooks/useResources";
import ResourceCard from "@/components/ResourceCard";
import type { PhysicsDiagnosticsResult } from "@/utils/physicsScoringEngine";

interface Result {
  category: string;
  label: string;
  score: number;
}

interface Props {
  results: Result[];
  fullResult?: PhysicsDiagnosticsResult;
  onRestart: () => void;
}

const PhysicsDiagnosticsResults = ({ results, fullResult, onRestart }: Props) => {
  const { t } = useLang();
  const { loadResourcesByCategory } = useResources();
  const [physicsResources, setPhysicsResources] = useState<Resource[]>([]);

  useEffect(() => {
    const hasWeakArea = results.some(r => r.score < 70);
    if (hasWeakArea) {
      loadResourcesByCategory("physics", 3).then(setPhysicsResources);
    }
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
      mechanics: t.physicsResults.recMechanics,
      thermodynamics: t.physicsResults.recThermodynamics,
      electromagnetism: t.physicsResults.recElectromagnetism,
      optics_waves: t.physicsResults.recOpticsWaves,
    };
    return recs[category] || "";
  };

  const avgScore = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
  const chartData = results.map((r) => ({ subject: r.label, score: r.score, fullMark: 100 }));

  return (
    <div className="container max-w-3xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
          {t.results.title} <span className="text-gradient">{t.results.titleHighlight}</span>
        </h1>
        <p className="text-muted-foreground">{t.physicsDiagSection.subtitle}</p>
      </motion.div>

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

      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {results.map((r, i) => {
          const level = getLevel(r.score);
          return (
            <motion.div
              key={r.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="p-5 rounded-xl bg-card-gradient border border-border shadow-card"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-semibold text-sm">{r.label}</h3>
                <span className={`text-sm font-medium ${level.color}`}>{level.text}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden mb-3">
                <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${r.score}%` }} transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }} />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{getRecommendation(r.category, r.score)}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Anti-cheat & Confidence */}
      {fullResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="mb-8"
        >
          <div className="bg-card-gradient border border-border rounded-xl p-5 shadow-card">
            <div className="grid grid-cols-2 gap-4 text-center mb-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">{t.results.confidence}</div>
                <div className="text-sm font-semibold">{Math.round(fullResult.adjustedConfidence * 100)}%</div>
              </div>
              <div>
                {fullResult.antiCheat.passed ? (
                  <div className="flex items-center justify-center gap-1 text-green-400 text-sm">
                    <Shield size={14} />
                    <span>{t.results.antiCheatPassed}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1 text-yellow-400 text-sm">
                    <ShieldAlert size={14} />
                    <span>{t.results.antiCheatFailed}</span>
                  </div>
                )}
              </div>
            </div>
            {fullResult.strengthAreas.length > 0 && (
              <div className="text-xs text-muted-foreground text-center">
                <span className="text-green-400">{t.results.strengthAreas}: </span>
                {fullResult.strengthAreas.map(a => {
                  const r = results.find(r => r.category === a);
                  return r?.label || a;
                }).join(", ")}
                <span className="mx-2">|</span>
                <span className="text-yellow-400">{t.results.growthAreas}: </span>
                {fullResult.growthAreas.map(a => {
                  const r = results.find(r => r.category === a);
                  return r?.label || a;
                }).join(", ")}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Recommended Resources */}
      {physicsResources.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <h2 className="font-display text-lg font-semibold mb-4 text-center">
            {t.resources?.recommended || "Рекомендуемые материалы"}
          </h2>
          <div className="grid gap-2">
            {physicsResources.map(resource => (
              <ResourceCard key={resource.id} resource={resource} compact />
            ))}
          </div>
        </motion.div>
      )}

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onRestart} className="gap-2">
          <RotateCcw size={16} /> {t.results.restart}
        </Button>
      </div>
    </div>
  );
};

export default PhysicsDiagnosticsResults;
