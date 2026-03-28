import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Mic, ChevronRight, Sparkles, PenLine, ListChecks } from "lucide-react";
import { BlobIcon } from "@/components/BrandIcons";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n/LanguageContext";
import { useTrainers } from "@/hooks/useTrainers";
import TrainerLayout from "@/components/trainers/TrainerLayout";
import { speakingTopics, rubricItems, outlineFields } from "@/data/trainers/publicSpeakingData";

type Stage = "topic" | "outline" | "checklist" | "done";

const stageProgress: Record<Stage, number> = { topic: 0, outline: 33, checklist: 66, done: 100 };

const PublicSpeakingTrainer = () => {
  const { t, lang } = useLang();
  const isKz = lang === "kz";
  const { saveAttempt } = useTrainers();

  const [stage, setStage] = useState<Stage>("topic");
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [outline, setOutline] = useState<Record<string, string>>({});
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);

  const progress = stageProgress[stage];

  const handleTopicSelect = (id: number) => {
    setSelectedTopic(id);
    setStage("outline");
  };

  const handleOutlineSubmit = () => setStage("checklist");

  const toggleCheck = (id: number) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleFinish = async () => {
    const finalScore = checkedItems.size * 10;
    setScore(finalScore);
    await saveAttempt({
      trainerType: "public_speaking",
      score: finalScore,
      maxScore: 100,
      answers: { topicId: selectedTopic, outline, checkedItems: Array.from(checkedItems) },
    });
    setStage("done");
  };

  const handleRestart = () => {
    setStage("topic"); setSelectedTopic(null);
    setOutline({}); setCheckedItems(new Set()); setScore(0);
  };

  const outlineFilled = outlineFields.every(f => (outline[f.key] || "").trim().length > 0);
  const topic = speakingTopics.find(t => t.id === selectedTopic);

  const stageStep = stage === "topic" ? 1 : stage === "outline" ? 2 : stage === "checklist" ? 3 : 3;
  const stageSubtitle = stage === "topic"
    ? (isKz ? "Тақырып таңдаңыз" : "Выберите тему")
    : stage === "outline"
    ? (isKz ? "Жоспар жазыңыз" : "Напишите план")
    : stage === "checklist"
    ? (isKz ? "Өзін-өзі бағалаңыз" : "Самооценка")
    : undefined;

  if (stage === "done") {
    const missed = rubricItems.filter(r => !checkedItems.has(r.id));
    const got = rubricItems.filter(r => checkedItems.has(r.id));

    return (
      <TrainerLayout
        title={t.trainers.speakingTitle}
        icon={<Mic className="text-violet-400" size={22} />}
        onRestart={handleRestart}
        restartLabel={t.trainers.restart}
      >
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="mx-auto mb-6 flex justify-center"
          >
            <BlobIcon size={96} gradient="from-violet-500 to-purple-500" glow="bg-violet-500">
              <span className="text-3xl font-display font-bold text-white">{score}%</span>
            </BlobIcon>
          </motion.div>

          <h2 className="font-display text-xl font-bold mb-1">{t.trainers.completed}</h2>
          <p className="text-sm text-muted-foreground mb-8">{checkedItems.size}/10 {t.trainers.criteriaMatched}</p>

          {/* What you did well */}
          {got.length > 0 && (
            <div className="text-left max-w-md mx-auto mb-4">
              <div className="flex items-center gap-2 text-green-400 text-xs font-medium mb-2">
                <CheckCircle2 size={14} />
                {isKz ? "Жетістіктеріңіз" : "Ваши сильные стороны"}
              </div>
              <div className="space-y-1.5">
                {got.map(r => (
                  <div key={r.id} className="p-2.5 rounded-lg bg-green-500/5 border border-green-500/15 text-xs text-muted-foreground">
                    {isKz ? r.textKz : r.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What to improve */}
          {missed.length > 0 && (
            <div className="text-left max-w-md mx-auto">
              <div className="flex items-center gap-2 text-yellow-400 text-xs font-medium mb-2">
                <Sparkles size={14} />
                {isKz ? "Дамыту керек" : "Стоит развить"}
              </div>
              <div className="space-y-1.5">
                {missed.map(r => (
                  <div key={r.id} className="p-2.5 rounded-lg bg-yellow-500/5 border border-yellow-500/15 text-xs text-muted-foreground">
                    {isKz ? r.textKz : r.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </TrainerLayout>
    );
  }

  return (
    <TrainerLayout
      title={t.trainers.speakingTitle}
      subtitle={stageSubtitle}
      icon={<Mic className="text-violet-400" size={22} />}
      progress={progress}
      step={stageStep}
      totalSteps={3}
      onRestart={handleRestart}
      restartLabel={t.trainers.restart}
    >
      {/* Stage steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { icon: Mic, label: isKz ? "Тақырып" : "Тема" },
          { icon: PenLine, label: isKz ? "Жоспар" : "План" },
          { icon: ListChecks, label: isKz ? "Бағалау" : "Оценка" },
        ].map((s, i) => {
          const isActive = i + 1 === stageStep;
          const isDone = i + 1 < stageStep;
          return (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isDone ? "bg-primary text-primary-foreground" : isActive ? "bg-primary/20 text-primary border border-primary/40" : "bg-secondary text-muted-foreground"
              }`}>
                {isDone ? <CheckCircle2 size={14} /> : <s.icon size={14} />}
              </div>
              <span className={`text-xs hidden sm:block ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s.label}</span>
              {i < 2 && <div className={`flex-1 h-px ${isDone ? "bg-primary" : "bg-border"}`} />}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {stage === "topic" && (
          <motion.div key="topic" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
            <p className="text-muted-foreground mb-6">{t.trainers.chooseTopic}</p>
            <div className="space-y-3">
              {speakingTopics.map((tp, i) => (
                <motion.button
                  key={tp.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => handleTopicSelect(tp.id)}
                  className="w-full text-left p-5 rounded-xl border border-border bg-card hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 text-xs font-bold shrink-0 mt-0.5">{tp.id}</span>
                      <div>
                        <h3 className="font-semibold text-sm mb-1">{isKz ? tp.titleKz : tp.title}</h3>
                        <p className="text-xs text-muted-foreground">{isKz ? tp.descriptionKz : tp.description}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground/0 group-hover:text-violet-400 transition-all shrink-0 ml-3" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {stage === "outline" && topic && (
          <motion.div key="outline" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/5 border border-violet-500/20 mb-6">
              <div className="flex items-center gap-2 mb-1.5">
                <Mic size={15} className="text-violet-400" />
                <span className="font-medium text-sm">{isKz ? topic.titleKz : topic.title}</span>
              </div>
              <p className="text-xs text-muted-foreground">{isKz ? topic.descriptionKz : topic.description}</p>
            </div>

            <p className="text-sm text-muted-foreground mb-5">{t.trainers.fillOutline}</p>

            <div className="space-y-5">
              {outlineFields.map((f, i) => (
                <motion.div key={f.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-md bg-violet-500/15 flex items-center justify-center text-[10px] font-bold text-violet-400">{i + 1}</span>
                    <label className="text-sm font-medium">{isKz ? f.labelKz : f.label}</label>
                  </div>
                  <textarea
                    value={outline[f.key] || ""}
                    onChange={(e) => setOutline(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full p-4 rounded-xl border border-border bg-card text-sm resize-none h-20 focus:outline-none focus:border-violet-500/50 focus:bg-violet-500/5 transition-all"
                  />
                </motion.div>
              ))}
              <Button onClick={handleOutlineSubmit} disabled={!outlineFilled} className="w-full h-12 text-base" size="lg">
                {t.trainers.toChecklist}
              </Button>
            </div>
          </motion.div>
        )}

        {stage === "checklist" && (
          <motion.div key="checklist" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <p className="text-sm text-muted-foreground mb-6">{t.trainers.selfAssess}</p>
            <div className="space-y-2.5">
              {rubricItems.map((item, i) => {
                const checked = checkedItems.has(item.id);
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => toggleCheck(item.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                      checked
                        ? "border-green-500/40 bg-green-500/5"
                        : "border-border bg-card hover:border-violet-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        checked ? "border-green-500 bg-green-500 scale-110" : "border-muted-foreground/30"
                      }`}>
                        {checked && <CheckCircle2 size={14} className="text-white" />}
                      </div>
                      <span className={`text-sm ${checked ? "text-foreground" : "text-muted-foreground"}`}>{isKz ? item.textKz : item.text}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
            <div className="mt-6 p-3 rounded-xl bg-secondary/30 border border-border text-center mb-4">
              <span className="text-2xl font-display font-bold text-gradient">{checkedItems.size * 10}%</span>
              <span className="text-xs text-muted-foreground ml-2">{checkedItems.size}/10</span>
            </div>
            <Button onClick={handleFinish} className="w-full h-12 text-base" size="lg">
              {t.trainers.finishTrainer}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </TrainerLayout>
  );
};

export default PublicSpeakingTrainer;
