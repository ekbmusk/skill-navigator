import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw, Download } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

interface Result {
  category: string;
  label: string;
  score: number;
}

interface Props {
  results: Result[];
  onRestart: () => void;
}

const getLevel = (score: number) => {
  if (score >= 80) return { text: "Отлично", color: "text-green-400" };
  if (score >= 60) return { text: "Хорошо", color: "text-primary" };
  if (score >= 40) return { text: "Средне", color: "text-yellow-400" };
  return { text: "Нужно развивать", color: "text-destructive" };
};

const getRecommendation = (category: string, score: number) => {
  if (score >= 70) return "Отличный уровень! Продолжайте развиваться и делитесь опытом с другими.";
  const recs: Record<string, string> = {
    cognitive: "Рекомендуем практиковать решение логических задач, участвовать в дебатах и анализировать кейсы.",
    soft: "Попробуйте больше работать в команде, участвовать в групповых проектах и развивать эмпатию.",
    professional: "Составьте план обучения, изучайте новые инструменты и следите за трендами в вашей области.",
    adaptability: "Выходите из зоны комфорта, пробуйте новые подходы и воспринимайте изменения как возможности.",
  };
  return recs[category] || "";
};

const DiagnosticsResults = ({ results, onRestart }: Props) => {
  const avgScore = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
  const chartData = results.map((r) => ({ subject: r.label, score: r.score, fullMark: 100 }));

  return (
    <div className="container max-w-3xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
          Ваш <span className="text-gradient">результат</span>
        </h1>
        <p className="text-muted-foreground">Комплексная оценка навыков</p>
      </motion.div>

      {/* Radar Chart */}
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
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 10 }}
              />
              <Radar
                name="Навыки"
                dataKey="score"
                stroke="hsl(38, 92%, 55%)"
                fill="hsl(38, 92%, 55%)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="text-center mt-4">
          <div className="text-4xl font-display font-bold text-gradient">{avgScore}%</div>
          <div className="text-sm text-muted-foreground mt-1">Общий балл</div>
        </div>
      </motion.div>

      {/* Detail cards */}
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
              {/* Score bar */}
              <div className="h-2 rounded-full bg-secondary overflow-hidden mb-3">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${r.score}%` }}
                  transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {getRecommendation(r.category, r.score)}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onRestart} className="gap-2">
          <RotateCcw size={16} /> Пройти заново
        </Button>
        <Button className="gap-2">
          <Download size={16} /> Скачать отчёт
        </Button>
      </div>
    </div>
  );
};

export default DiagnosticsResults;
