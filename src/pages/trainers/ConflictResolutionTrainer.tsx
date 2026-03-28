import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, GitBranch, MessageCircle, Sparkles, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n/LanguageContext";
import { useTrainers } from "@/hooks/useTrainers";
import TrainerLayout from "@/components/trainers/TrainerLayout";
import { conflictScenarios } from "@/data/trainers/conflictDialogData";

const ConflictResolutionTrainer = () => {
  const { t, lang } = useLang();
  const isKz = lang === "kz";
  const { saveAttempt } = useTrainers();

  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [nodeIdx, setNodeIdx] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [chosenIdx, setChosenIdx] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [scenarioScores, setScenarioScores] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const scenario = conflictScenarios[scenarioIdx];
  const node = scenario.nodes[nodeIdx];
  const totalNodes = conflictScenarios.reduce((s, sc) => s + sc.nodes.length, 0);
  const doneNodes = conflictScenarios.slice(0, scenarioIdx).reduce((s, sc) => s + sc.nodes.length, 0) + nodeIdx;
  const progress = (doneNodes / totalNodes) * 100;

  const handleChoice = (optionIdx: number) => {
    const option = node.options[optionIdx];
    setTotalPoints(prev => prev + option.points);
    setChosenIdx(optionIdx);
    setFeedback(isKz ? option.feedbackKz : option.feedback);
  };

  const handleContinue = () => {
    const currentOption = chosenIdx !== null ? node.options[chosenIdx] : null;
    setFeedback(null);
    setChosenIdx(null);

    if (currentOption?.nextId === null || nodeIdx >= scenario.nodes.length - 1) {
      setScenarioScores(prev => [...prev, totalPoints]);
      if (scenarioIdx < conflictScenarios.length - 1) {
        setScenarioIdx(prev => prev + 1);
        setNodeIdx(0);
        setTotalPoints(0);
      } else {
        handleFinish();
      }
    } else {
      const nextNode = scenario.nodes.findIndex(n => n.id === currentOption?.nextId);
      setNodeIdx(nextNode >= 0 ? nextNode : nodeIdx + 1);
    }
  };

  const handleFinish = async () => {
    const allScores = [...scenarioScores, totalPoints];
    const totalMax = conflictScenarios.reduce((s, sc) => s + sc.maxScore, 0);
    const totalGot = allScores.reduce((s, v) => s + v, 0);

    await saveAttempt({
      trainerType: "conflict_resolution",
      score: totalGot,
      maxScore: totalMax,
      answers: { scenarioScores: allScores },
    });
    setFinished(true);
  };

  const handleRestart = () => {
    setScenarioIdx(0); setNodeIdx(0); setTotalPoints(0);
    setFeedback(null); setChosenIdx(null); setScenarioScores([]); setFinished(false);
  };

  if (finished) {
    const allScores = scenarioScores;
    const totalMax = conflictScenarios.reduce((s, sc) => s + sc.maxScore, 0);
    const totalGot = allScores.reduce((s, v) => s + v, 0);
    const pct = Math.round((totalGot / totalMax) * 100);

    return (
      <TrainerLayout
        title={t.trainers.conflictTitle}
        icon={<GitBranch className="text-red-400" size={22} />}
        onRestart={handleRestart}
        restartLabel={t.trainers.restart}
      >
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div
            className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <div>
              <Shield size={16} className="text-primary mx-auto mb-1" />
              <span className="text-4xl font-display font-bold text-gradient">{pct}%</span>
            </div>
          </motion.div>

          <h2 className="font-display text-xl font-bold mb-1">{t.trainers.completed}</h2>
          <p className="text-sm text-muted-foreground mb-8">{totalGot} / {totalMax} {t.trainers.points}</p>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {allScores.map((s, i) => {
              const sc = conflictScenarios[i];
              const scenPct = Math.round((s / sc.maxScore) * 100);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.12 }}
                  className="p-4 rounded-2xl bg-card-gradient border border-border"
                >
                  <div className={`text-3xl font-display font-bold mb-1 ${scenPct >= 70 ? "text-green-400" : scenPct >= 40 ? "text-yellow-400" : "text-destructive"}`}>
                    {scenPct}%
                  </div>
                  <div className="text-[11px] text-muted-foreground leading-tight">{isKz ? sc.titleKz : sc.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{s}/{sc.maxScore}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </TrainerLayout>
    );
  }

  return (
    <TrainerLayout
      title={t.trainers.conflictTitle}
      icon={<GitBranch className="text-red-400" size={22} />}
      progress={progress}
      step={nodeIdx + 1}
      totalSteps={scenario.nodes.length}
      score={totalPoints}
      maxScore={scenario.maxScore}
      onRestart={handleRestart}
      restartLabel={t.trainers.restart}
    >
      {/* Scenario badge */}
      <div className="flex items-center gap-2 mb-5">
        <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500/15 to-orange-500/15 border border-red-500/20 text-xs font-medium text-red-400">
          <Shield size={12} className="inline mr-1.5 -mt-0.5" />
          {isKz ? scenario.titleKz : scenario.title}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {isKz ? `${nodeIdx + 1}-кезең / ${scenario.nodes.length}` : `Шаг ${nodeIdx + 1} из ${scenario.nodes.length}`}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`${scenarioIdx}-${nodeIdx}-${chosenIdx}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
          {/* Dialog bubble */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-br from-secondary/50 to-secondary/20 border border-border mb-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-red-500/15 flex items-center justify-center shrink-0 mt-0.5">
                <MessageCircle size={16} className="text-red-400" />
              </div>
              <p className="text-sm leading-relaxed pt-1">{isKz ? node.textKz : node.text}</p>
            </div>
            {/* Bubble tail */}
            <div className="absolute -bottom-2 left-8 w-4 h-4 bg-gradient-to-br from-secondary/50 to-secondary/20 border-r border-b border-border rotate-45" />
          </div>

          {!feedback ? (
            <div className="space-y-3 mt-8">
              {node.options.map((opt, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => handleChoice(i)}
                  className="w-full text-left p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group flex items-center gap-3"
                >
                  <span className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors shrink-0">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm flex-1">{isKz ? opt.textKz : opt.text}</span>
                  <ChevronRight size={14} className="text-muted-foreground/0 group-hover:text-primary transition-all" />
                </motion.button>
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mt-8">
              {/* Points earned */}
              <div className="flex items-center gap-2 mb-2">
                {chosenIdx !== null && (() => {
                  const pts = node.options[chosenIdx].points;
                  const max = Math.max(...node.options.map(o => o.points));
                  return (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${pts === max ? "bg-green-500/15 text-green-400" : pts > 0 ? "bg-yellow-500/15 text-yellow-400" : "bg-destructive/15 text-destructive"}`}>
                      +{pts} {isKz ? "ұпай" : "баллов"}
                    </span>
                  );
                })()}
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm leading-relaxed">{feedback}</p>
              </div>
              <Button onClick={handleContinue} className="w-full h-12 text-base" size="lg">
                {t.trainers.continue}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </TrainerLayout>
  );
};

export default ConflictResolutionTrainer;
