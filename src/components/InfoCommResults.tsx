import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  RotateCcw, TrendingUp, TrendingDown, Shield, ShieldAlert,
  Brain, Target, MessageSquare, BookOpen, Eye, Award,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
} from "recharts";
import type {
  InfoCommDiagnosticsResult, InfoCommProfile, SkillLevel,
} from "@/utils/infoCommScoringEngine";
import type { InfoCommCategory } from "@/data/infoCommQuestions";
import { infoCommCategoryLabels, infoCommCategoryLabelsRu } from "@/data/infoCommQuestions";
import { useResources, type Resource } from "@/hooks/useResources";
import ResourceCard from "@/components/ResourceCard";

interface Result {
  category: string;
  label: string;
  score: number;
}

interface Props {
  results: Result[];
  fullResult?: InfoCommDiagnosticsResult;
  lang: "ru" | "kz";
  onRestart: () => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  motivational: <Award size={18} />,
  cognitive_info: <Brain size={18} />,
  activity: <Target size={18} />,
  reflective: <Eye size={18} />,
  outcome: <BookOpen size={18} />,
};

const InfoCommResults = ({ results, fullResult, lang, onRestart }: Props) => {
  const [showDetails, setShowDetails] = useState(false);
  const isKz = lang === "kz";
  const { loadResourcesByCategory } = useResources();
  const [infoCommResources, setInfoCommResources] = useState<Resource[]>([]);

  useEffect(() => {
    const hasWeakArea = results.some(r => r.score < 70);
    if (hasWeakArea) {
      loadResourcesByCategory("infocomm", 3).then(setInfoCommResources);
    }
  }, [results]);
  const categoryLabelsMap = isKz ? infoCommCategoryLabels : infoCommCategoryLabelsRu;

  const getLevel = (score: number) => {
    if (score >= 80) return { text: isKz ? "Жоғары" : "Высокий", color: "text-green-400" };
    if (score >= 60) return { text: isKz ? "Жақсы" : "Хороший", color: "text-primary" };
    if (score >= 40) return { text: isKz ? "Орташа" : "Средний", color: "text-yellow-400" };
    return { text: isKz ? "Дамыту керек" : "Требует развития", color: "text-destructive" };
  };

  const getRecommendation = (category: string, score: number) => {
    if (score >= 70) return isKz
      ? "Тамаша деңгей! Дамуды жалғастырыңыз."
      : "Отличный уровень! Продолжайте развиваться.";

    const recs: Record<string, string> = isKz ? {
      motivational: "Жаңа ақпарат көздерін белсенді зерттеңіз, ішкі қызығушылықты дамытыңыз.",
      cognitive_info: "Ақпараттың түрлері мен іздеу әдістерін тереңірек зерттеңіз.",
      activity: "Цифрлық құралдарды қолдану тәжірибесін арттырыңыз, топтық жұмысқа белсенді қатысыңыз.",
      reflective: "Өзін-өзі бағалау мен рефлексия дағдыларын дамытыңыз.",
      outcome: "Ақпаратпен дербес жұмыс істеу және кәсіби коммуникация дағдыларын жетілдіріңіз.",
    } : {
      motivational: "Активнее исследуйте новые источники информации, развивайте внутреннюю мотивацию.",
      cognitive_info: "Углубите знания о типах информации и методах поиска.",
      activity: "Повышайте практику использования цифровых инструментов, активнее участвуйте в групповой работе.",
      reflective: "Развивайте навыки самооценки и рефлексии.",
      outcome: "Совершенствуйте навыки самостоятельной работы с информацией и профессиональной коммуникации.",
    };
    return recs[category] || "";
  };

  const getProfileLabel = (profile: InfoCommProfile): string => {
    const labels: Record<InfoCommProfile, string> = isKz ? {
      info_seeker: "Ақпарат іздеуші",
      communicator: "Коммуникатор",
      reflective_learner: "Рефлексивті оқушы",
      digital_native: "Цифрлық маман",
      balanced_competent: "Теңгерімді құзыретті",
      emerging_learner: "Дамушы оқушы",
      specialist_info: "Мамандандырылған",
    } : {
      info_seeker: "Информационный искатель",
      communicator: "Коммуникатор",
      reflective_learner: "Рефлексивный ученик",
      digital_native: "Цифровой специалист",
      balanced_competent: "Сбалансированный компетентный",
      emerging_learner: "Развивающийся ученик",
      specialist_info: "Специализированный",
    };
    return labels[profile] || profile;
  };

  const getSkillLevelLabel = (level: SkillLevel): string => {
    const labels: Record<SkillLevel, string> = isKz ? {
      beginner: "Бастауыш",
      basic: "Базалық",
      advanced: "Жетілдірілген",
      expert: "Сарапшы",
    } : {
      beginner: "Начальный",
      basic: "Базовый",
      advanced: "Продвинутый",
      expert: "Эксперт",
    };
    return labels[level] || level;
  };

  const overallScore = fullResult
    ? Math.round(fullResult.overallScore)
    : Math.round(results.reduce((a, b) => a + b.score, 0) / results.length);

  const radarData = fullResult?.radarData || results.map(r => ({
    category: r.label,
    value: r.score,
    fullMark: 100,
  }));

  return (
    <div className="container max-w-4xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
          {isKz ? "Диагностика нәтижелері" : "Результаты диагностики"}
        </h1>
        <p className="text-muted-foreground">
          {isKz
            ? "Ақпараттық-коммуникативтік құзыреттілік"
            : "Информационно-коммуникативная компетентность"}
        </p>
      </motion.div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-primary/20 relative">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(hsl(var(--primary)) ${overallScore * 3.6}deg, transparent 0deg)`,
              mask: "radial-gradient(transparent 55%, black 56%)",
              WebkitMask: "radial-gradient(transparent 55%, black 56%)",
            }}
          />
          <div className="text-center relative z-10">
            <span className="font-display text-4xl font-bold">{overallScore}</span>
            <span className="text-sm text-muted-foreground block">/ 100</span>
          </div>
        </div>

        {fullResult && (
          <div className="mt-4 space-y-1">
            <p className="text-sm font-medium">
              {isKz ? "Профиль: " : "Профиль: "}
              <span className="text-primary">{getProfileLabel(fullResult.dominantProfile)}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {isKz ? "Сенімділік: " : "Уверенность: "}
              {Math.round(fullResult.adjustedConfidence * 100)}%
            </p>
          </div>
        )}
      </motion.div>

      {/* Radar Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-10"
      >
        <div className="rounded-xl border border-border bg-card-gradient p-6">
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              />
              <Radar
                name={isKz ? "Деңгей" : "Уровень"}
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Category Scores */}
      <div className="space-y-4 mb-10">
        {results.map((r, i) => {
          const level = getLevel(r.score);
          const catResult = fullResult?.categories.find(c => c.category === r.category);

          return (
            <motion.div
              key={r.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className="rounded-xl border border-border bg-card-gradient p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {CATEGORY_ICONS[r.category] || <Target size={18} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{r.label}</h3>
                    {catResult && (
                      <span className="text-xs text-muted-foreground">
                        {getSkillLevelLabel(catResult.level)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-display text-2xl font-bold">{r.score}</span>
                  <span className="text-xs text-muted-foreground"> / 100</span>
                </div>
              </div>

              <div className="h-2.5 rounded-full bg-secondary overflow-hidden mb-3">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${r.score}%` }}
                  transition={{ duration: 0.8, delay: 0.1 * i }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${level.color}`}>{level.text}</span>
                <p className="text-xs text-muted-foreground max-w-[60%] text-right">
                  {getRecommendation(r.category, r.score)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Anti-cheat info */}
      {fullResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-10"
        >
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            {fullResult.antiCheat.passed ? (
              <Shield size={14} className="text-green-500" />
            ) : (
              <ShieldAlert size={14} className="text-destructive" />
            )}
            {isKz ? "Тексеру мәліметтері" : "Детали проверки"}
          </button>

          {showDetails && (
            <div className="mt-3 p-4 rounded-lg bg-secondary/50 border border-border text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isKz ? "Статус" : "Статус"}</span>
                <span className={fullResult.antiCheat.passed ? "text-green-500" : "text-destructive"}>
                  {fullResult.antiCheat.passed
                    ? isKz ? "Өтті" : "Пройдена"
                    : isKz ? "Ескерту" : "Предупреждение"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isKz ? "Сенімділік" : "Уверенность"}</span>
                <span>{Math.round(fullResult.adjustedConfidence * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isKz ? "Күдік деңгейі" : "Уровень подозрения"}</span>
                <span>{Math.round(fullResult.antiCheat.suspicionScore * 100)}%</span>
              </div>
              {fullResult.antiCheat.violations.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <span className="text-muted-foreground block mb-1">
                    {isKz ? "Бұзушылықтар:" : "Нарушения:"}
                  </span>
                  {fullResult.antiCheat.violations.map((v, i) => (
                    <div key={i} className="text-muted-foreground">
                      — {v.code} ({v.severity})
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Strength / Growth Areas */}
      {fullResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 gap-4 mb-10"
        >
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <div className="flex items-center gap-2 mb-3 text-green-500">
              <TrendingUp size={16} />
              <span className="text-sm font-semibold">
                {isKz ? "Күшті жақтар" : "Сильные стороны"}
              </span>
            </div>
            {fullResult.strengthAreas.map((cat) => (
              <div key={cat} className="text-sm text-foreground mb-1">
                {categoryLabelsMap[cat]}
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
            <div className="flex items-center gap-2 mb-3 text-orange-500">
              <TrendingDown size={16} />
              <span className="text-sm font-semibold">
                {isKz ? "Дамыту аймақтары" : "Зоны роста"}
              </span>
            </div>
            {fullResult.growthAreas.map((cat) => (
              <div key={cat} className="text-sm text-foreground mb-1">
                {categoryLabelsMap[cat]}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recommended Resources */}
      {infoCommResources.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-10"
        >
          <h2 className="font-display text-lg font-semibold mb-4 text-center">
            {isKz ? "Ұсынылған материалдар" : "Рекомендуемые материалы"}
          </h2>
          <div className="grid gap-2">
            {infoCommResources.map(resource => (
              <ResourceCard key={resource.id} resource={resource} compact />
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onRestart} className="gap-2">
          <RotateCcw size={16} />
          {isKz ? "Қайта тапсыру" : "Пройти заново"}
        </Button>
      </div>
    </div>
  );
};

export default InfoCommResults;
