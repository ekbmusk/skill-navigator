import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Eye, MessageSquare, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n/LanguageContext";
import { useTrainers } from "@/hooks/useTrainers";
import TrainerLayout from "@/components/trainers/TrainerLayout";
import { sbiScenarios, scoreSbiTotal } from "@/data/trainers/sbiFeedbackData";

const ScoreRing = ({ value, label, size = 64 }: { value: number; label: string; size?: number }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 60 ? "#4ade80" : value >= 30 ? "#facc15" : "#f87171";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="hsl(222, 25%, 18%)" strokeWidth={4} fill="none" />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={color} strokeWidth={4} fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-bold text-sm" style={{ color }}>{value}%</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
};

const SbiFeedbackTrainer = () => {
  const { t, lang } = useLang();
  const isKz = lang === "kz";
  const { saveAttempt } = useTrainers();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [sField, setSField] = useState("");
  const [bField, setBField] = useState("");
  const [iField, setIField] = useState("");
  const [scores, setScores] = useState<{ situation: number; behavior: number; impact: number; total: number }[]>([]);
  const [showModel, setShowModel] = useState(false);
  const [finished, setFinished] = useState(false);

  const scenario = sbiScenarios[currentIdx];
  const progress = ((currentIdx + (showModel ? 1 : 0)) / sbiScenarios.length) * 100;
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, r) => s + r.total, 0) / scores.length) : 0;

  const handleScore = () => {
    const result = scoreSbiTotal(sField, bField, iField, scenario);
    setScores(prev => [...prev, result]);
    setShowModel(true);
  };

  const handleNext = () => {
    setShowModel(false);
    setSField(""); setBField(""); setIField("");
    if (currentIdx < sbiScenarios.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    const allScores = [...scores];
    const totalScore = Math.round(allScores.reduce((s, r) => s + r.total, 0) / allScores.length);
    await saveAttempt({ trainerType: "sbi_feedback", score: totalScore, maxScore: 100, answers: { scores: allScores } });
    setFinished(true);
  };

  const handleRestart = () => {
    setCurrentIdx(0); setSField(""); setBField(""); setIField("");
    setScores([]); setShowModel(false); setFinished(false);
  };

  if (finished) {
    const avgS = Math.round(scores.reduce((s, r) => s + r.situation, 0) / scores.length);
    const avgB = Math.round(scores.reduce((s, r) => s + r.behavior, 0) / scores.length);
    const avgI = Math.round(scores.reduce((s, r) => s + r.impact, 0) / scores.length);

    return (
      <TrainerLayout
        title={t.trainers.sbiTitle}
        icon={<MessageSquare className="text-blue-400" size={22} />}
        onRestart={handleRestart}
        restartLabel={t.trainers.restart}
      >
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          {/* Big score */}
          <div className="relative inline-block mb-6">
            <motion.div
              className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <div>
                <Sparkles size={16} className="text-primary mx-auto mb-1" />
                <span className="text-4xl font-display font-bold text-gradient">{avgScore}%</span>
              </div>
            </motion.div>
          </div>

          <h2 className="font-display text-xl font-bold mb-1">{t.trainers.completed}</h2>
          <p className="text-sm text-muted-foreground mb-8">{t.trainers.avgScore}</p>

          {/* S/B/I rings */}
          <div className="flex justify-center gap-8 mb-8">
            <ScoreRing value={avgS} label="Situation" />
            <ScoreRing value={avgB} label="Behavior" />
            <ScoreRing value={avgI} label="Impact" />
          </div>

          {/* Per-scenario scores */}
          <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
            {scores.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="p-3 rounded-xl bg-card-gradient border border-border text-center"
              >
                <div className="text-[10px] text-muted-foreground mb-1">#{i + 1}</div>
                <div className={`font-bold text-sm ${s.total >= 60 ? "text-green-400" : s.total >= 30 ? "text-yellow-400" : "text-destructive"}`}>{s.total}%</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </TrainerLayout>
    );
  }

  const sbiLabels = [
    { key: "s", label: isKz ? "Жағдай" : "Ситуация", desc: isKz ? "Қашан, қайда, қандай жағдайда?" : "Когда, где, при каких обстоятельствах?", value: sField, setter: setSField, placeholder: t.trainers.sbiSPlaceholder },
    { key: "b", label: isKz ? "Мінез-құлық" : "Поведение", desc: isKz ? "Адам нақты не істеді/не айтты?" : "Что конкретно человек сделал/сказал?", value: bField, setter: setBField, placeholder: t.trainers.sbiBPlaceholder },
    { key: "i", label: isKz ? "Әсері" : "Влияние", desc: isKz ? "Бұл сізге/командаға қалай әсер етті?" : "Как это повлияло на вас/команду?", value: iField, setter: setIField, placeholder: t.trainers.sbiIPlaceholder },
  ];

  return (
    <TrainerLayout
      title={t.trainers.sbiTitle}
      icon={<MessageSquare className="text-blue-400" size={22} />}
      progress={progress}
      step={currentIdx + 1}
      totalSteps={sbiScenarios.length}
      score={scores.length > 0 ? avgScore : null}
      maxScore={100}
      onRestart={handleRestart}
      restartLabel={t.trainers.restart}
    >
      <AnimatePresence mode="wait">
        <motion.div key={`${scenario.id}-${showModel}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
          {/* Scenario card */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle size={16} className="text-blue-400" />
              </div>
              <p className="text-sm leading-relaxed">{isKz ? scenario.situationKz : scenario.situation}</p>
            </div>
          </div>

          {!showModel ? (
            <div className="space-y-5">
              {sbiLabels.map((field) => (
                <div key={field.key} className="group">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-primary uppercase">{field.key}</span>
                    <div>
                      <span className="text-sm font-medium">{field.label}</span>
                      <span className="text-[11px] text-muted-foreground ml-2">{field.desc}</span>
                    </div>
                  </div>
                  <textarea
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full p-4 rounded-xl border border-border bg-card text-sm resize-none h-24 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all"
                  />
                </div>
              ))}
              <Button onClick={handleScore} disabled={!sField.trim() || !bField.trim() || !iField.trim()} className="w-full h-12 text-base gap-2" size="lg">
                <CheckCircle2 size={18} />
                {t.trainers.checkAnswer}
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Score rings */}
              <div className="flex justify-center gap-6 py-4">
                <ScoreRing value={scores[scores.length - 1]?.situation ?? 0} label="S" size={56} />
                <ScoreRing value={scores[scores.length - 1]?.behavior ?? 0} label="B" size={56} />
                <ScoreRing value={scores[scores.length - 1]?.impact ?? 0} label="I" size={56} />
              </div>

              {/* Model answer */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-4">
                  <Eye size={16} /> {t.trainers.modelAnswer}
                </div>
                <div className="space-y-3">
                  {[
                    { label: "S", text: isKz ? scenario.modelSituationKz : scenario.modelSituation },
                    { label: "B", text: isKz ? scenario.modelBehaviorKz : scenario.modelBehavior },
                    { label: "I", text: isKz ? scenario.modelImpactKz : scenario.modelImpact },
                  ].map(({ label, text }) => (
                    <div key={label} className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 mt-0.5">{label}</span>
                      <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleNext} className="w-full h-12 text-base" size="lg">
                {currentIdx < sbiScenarios.length - 1 ? t.trainers.nextScenario : t.trainers.finishTrainer}
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </TrainerLayout>
  );
};

export default SbiFeedbackTrainer;
