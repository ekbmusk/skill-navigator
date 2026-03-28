import { motion } from "framer-motion";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { Radar as RadarIcon } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface Props {
  testResults: Tables<"diagnostics_results">[];
  lang: "ru" | "kz";
}

const SkillRadarChart = ({ testResults, lang }: Props) => {
  const isKz = lang === "kz";

  const byType = new Map<string, Tables<"diagnostics_results">>();
  const sorted = [...testResults].sort(
    (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  );
  for (const r of sorted) {
    const type = (r.answers as any)?._test_type || "general";
    if (!byType.has(type)) byType.set(type, r);
  }

  const data: { subject: string; value: number; fullMark: number }[] = [];

  const general = byType.get("general");
  if (general) {
    data.push(
      { subject: isKz ? "Когнитивті" : "Когнитивные", value: general.cognitive_score, fullMark: 100 },
      { subject: "Soft Skills", value: general.soft_score, fullMark: 100 },
      { subject: isKz ? "Кәсіби" : "Профессиональные", value: general.professional_score, fullMark: 100 },
      { subject: isKz ? "Бейімділік" : "Адаптивность", value: general.adaptability_score, fullMark: 100 },
    );
  }

  const physics = byType.get("physics");
  if (physics) {
    const avg = Math.round(
      (physics.cognitive_score + physics.soft_score + physics.professional_score + physics.adaptability_score) / 4
    );
    data.push({ subject: isKz ? "Физика" : "Физика", value: avg, fullMark: 100 });
  }

  const infocomm = byType.get("infocomm");
  if (infocomm) {
    const avg = Math.round(
      (infocomm.cognitive_score + infocomm.soft_score + infocomm.professional_score + infocomm.adaptability_score) / 4
    );
    data.push({ subject: isKz ? "Инфокомм" : "Инфокомм", value: avg, fullMark: 100 });
  }

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-[350px] flex flex-col items-center justify-center text-muted-foreground gap-3"
      >
        <RadarIcon className="h-12 w-12 opacity-20" />
        <p className="text-sm">{isKz ? "Деректер жоқ" : "Нет данных"}</p>
        <p className="text-xs opacity-60">
          {isKz ? "Диагностика тапсырыңыз" : "Пройдите диагностику"}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="h-[350px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="hsl(222, 25%, 18%)" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "hsl(215, 15%, 65%)", fontSize: 12, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "hsl(215, 15%, 45%)", fontSize: 10 }}
            tickCount={5}
          />
          <Radar
            dataKey="value"
            stroke="hsl(38, 92%, 55%)"
            fill="hsl(38, 92%, 55%)"
            fillOpacity={0.15}
            strokeWidth={2.5}
            dot={{ r: 5, fill: "hsl(38, 92%, 55%)", stroke: "hsl(38, 92%, 65%)", strokeWidth: 2 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default SkillRadarChart;
