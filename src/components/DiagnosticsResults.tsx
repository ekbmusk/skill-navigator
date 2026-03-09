import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw, Download } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
} from "recharts";
import { useLang } from "@/i18n/LanguageContext";
import { useDiagnostics } from "@/hooks/useDiagnostics";
import type { Tables } from "@/integrations/supabase/types";

interface Result {
  category: string;
  label: string;
  score: number;
}

interface Props {
  results: Result[];
  onRestart: () => void;
}

const DiagnosticsResults = ({ results, onRestart }: Props) => {
  const { t } = useLang();
  const { downloadAsCSV, loading: loadingHistory } = useDiagnostics();
  const [savedResult, setSavedResult] = useState<Tables<"diagnostics_results"> | null>(null);

  useEffect(() => {
    // In a real scenario, we'd load the saved result from the DB
    // For now, we'll just track that we're on the results page
    console.log("Results displayed successfully");
  }, []);

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

  const handleDownload = () => {
    // Create a mock result object for download
    // In a real scenario, this would come from props or Supabase
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

  const avgScore = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
  const chartData = results.map((r) => ({ subject: r.label, score: r.score, fullMark: 100 }));

  return (
    <div className="container max-w-3xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
          {t.results.title} <span className="text-gradient">{t.results.titleHighlight}</span>
        </h1>
        <p className="text-muted-foreground">{t.results.subtitle}</p>
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

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onRestart} className="gap-2">
          <RotateCcw size={16} /> {t.results.restart}
        </Button>
        <Button onClick={handleDownload} disabled={loadingHistory} className="gap-2">
          <Download size={16} /> {t.results.download}
        </Button>
      </div>
    </div>
  );
};

export default DiagnosticsResults;
