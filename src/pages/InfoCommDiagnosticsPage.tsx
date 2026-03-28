import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import RankingQuestion from "@/components/RankingQuestion";
import ScenarioQuestion from "@/components/ScenarioQuestion";
import InfoCommResults from "@/components/InfoCommResults";
import { useLang } from "@/i18n/LanguageContext";
import { useDiagnostics } from "@/hooks/useDiagnostics";
import { useToast } from "@/hooks/use-toast";
import { getInfoCommResultsCompat } from "@/utils/infoCommScoringEngine";
import type { TimingData } from "@/utils/antiCheatDetection";
import { infoCommQuestions } from "@/data/infoCommQuestions";
import { infoCommCategoryLabels, infoCommCategoryLabelsRu } from "@/data/infoCommQuestions";

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const shuffled = [...arr];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const InfoCommDiagnosticsPage = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testStartTime] = useState(() => Date.now());
  const [shuffleSeed] = useState(() => Math.floor(Math.random() * 1000000));
  const [questionTimestamps, setQuestionTimestamps] = useState<Record<number, number>>({ 0: Date.now() });
  const { t, lang } = useLang();
  const { saveDiagnosticsResult } = useDiagnostics();
  const { toast } = useToast();

  const isKz = lang === "kz";
  const categoryLabels = isKz ? infoCommCategoryLabels : infoCommCategoryLabelsRu;

  useEffect(() => {
    setQuestionTimestamps((prev) => {
      if (prev[currentQ] !== undefined) return prev;
      return { ...prev, [currentQ]: Date.now() };
    });
  }, [currentQ]);

  // Map questions to current language
  const questions = infoCommQuestions.map((q) => ({
    ...q,
    displayText: isKz ? q.textKz : q.text,
    displayOptions: q.options.map((o) => ({
      label: isKz ? o.labelKz : o.label,
      score: o.score,
    })),
    displayScenario: q.scenario ? (isKz ? q.scenarioKz : q.scenario) : undefined,
  }));

  const q = questions[currentQ];
  const progress = (Object.keys(answers).length / questions.length) * 100;

  const selectAnswer = (score: number) => {
    setAnswers((prev) => ({ ...prev, [q.id]: score }));
  };

  const next = () => {
    if (currentQ < questions.length - 1) setCurrentQ((p) => p + 1);
    else handleFinish();
  };

  const prev = () => {
    if (currentQ > 0) setCurrentQ((p) => p - 1);
  };

  const buildTimingData = (): TimingData => {
    const endTime = Date.now();
    const sortedEntries = Object.entries(questionTimestamps)
      .map(([k, v]) => [Number(k), v] as [number, number])
      .sort((a, b) => a[0] - b[0]);

    const perQuestionMs: number[] = [];
    for (let i = 0; i < sortedEntries.length; i++) {
      const nextTime = i < sortedEntries.length - 1 ? sortedEntries[i + 1][1] : endTime;
      perQuestionMs.push(nextTime - sortedEntries[i][1]);
    }

    return { startTime: testStartTime, endTime, perQuestionMs };
  };

  const getResults = () => {
    return getInfoCommResultsCompat(answers, buildTimingData(), lang);
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Map 5 categories to the 4 DB columns (best effort mapping)
      // motivational + cognitive_info → cognitive, activity → professional,
      // reflective → soft, outcome → adaptability
      const { results } = getResults();
      const scoresMap: Record<string, number> = {};
      results.forEach((r) => { scoresMap[r.category] = r.score; });

      const avg = results.length > 0
        ? Math.round(results.reduce((a, b) => a + b.score, 0) / results.length)
        : 0;

      const mapped = {
        cognitive: Math.round(((scoresMap["motivational"] || 0) + (scoresMap["cognitive_info"] || 0)) / 2),
        soft: scoresMap["reflective"] || 0,
        professional: scoresMap["activity"] || 0,
        adaptability: scoresMap["outcome"] || 0,
        average: avg,
      };

      const answersWithMeta = { ...answers, _test_type: "infocomm" };

      const result = await saveDiagnosticsResult({
        answers: answersWithMeta,
        scores: mapped,
        testType: "infocomm",
      });

      if (result) {
        setFinished(true);
        toast({
          title: isKz ? "Сақталды" : "Сохранено",
          description: isKz
            ? "Диагностика нәтижелері сақталды"
            : "Результаты диагностики сохранены",
        });
      } else {
        toast({
          variant: "destructive",
          title: isKz ? "Қате" : "Ошибка",
          description: isKz
            ? "Нәтижелерді сақтау барысында қате орын алды"
            : "Ошибка при сохранении результатов",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: isKz ? "Қате" : "Ошибка",
        description: isKz
          ? "Нәтижелерді сақтау барысында қате орын алды"
          : "Ошибка при сохранении результатов",
      });
    } finally {
      setSaving(false);
    }
  };

  if (finished) {
    const { results, fullResult } = getResults();
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16">
          <InfoCommResults
            results={results}
            fullResult={fullResult}
            lang={lang}
            onRestart={() => { setAnswers({}); setCurrentQ(0); setFinished(false); }}
          />
        </div>
      </div>
    );
  }

  const questionOfText = isKz
    ? `${currentQ + 1} / ${questions.length} сұрақ`
    : `Вопрос ${currentQ + 1} из ${questions.length}`;

  const renderQuestionContent = () => {
    if (q.questionType === "ranking" && q.idealOrder) {
      return (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">{q.displayText}</h2>
          <RankingQuestion
            key={q.id}
            items={q.displayOptions.map(o => ({ label: o.label, score: o.score }))}
            idealOrder={q.idealOrder}
            onScore={(score) => selectAnswer(score)}
            currentScore={answers[q.id]}
          />
        </>
      );
    }

    if (q.questionType === "scenario" && q.displayScenario) {
      return (
        <ScenarioQuestion
          scenario={q.displayScenario}
          questionText={q.displayText}
          options={q.displayOptions.map(o => ({ label: o.label, score: o.score }))}
          selectedScore={answers[q.id]}
          onSelect={(score) => selectAnswer(score)}
        />
      );
    }

    return (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">{q.displayText}</h2>
        <div className="space-y-3">
          {seededShuffle(q.displayOptions, shuffleSeed + q.id).map((opt, i) => {
            const selected = answers[q.id] === opt.score;
            return (
              <button
                key={i}
                onClick={() => selectAnswer(opt.score)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  selected
                    ? "border-primary bg-primary/10 shadow-glow"
                    : "border-border bg-card hover:border-primary/30 hover:bg-card/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selected ? "border-primary bg-primary" : "border-muted-foreground/30"
                    }`}
                  >
                    {selected && <CheckCircle2 size={14} className="text-primary-foreground" />}
                  </div>
                  <span className={`text-sm ${selected ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {opt.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-2xl mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>{questionOfText}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
          {categoryLabels[q.category]}
        </span>

        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {renderQuestionContent()}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-10">
          <Button variant="outline" onClick={prev} disabled={currentQ === 0} className="gap-2">
            <ArrowLeft size={16} /> {isKz ? "Артқа" : "Назад"}
          </Button>
          <Button onClick={next} disabled={answers[q.id] === undefined || saving} className="gap-2">
            {currentQ === questions.length - 1
              ? isKz ? "Аяқтау" : "Завершить"
              : isKz ? "Келесі" : "Далее"}{" "}
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InfoCommDiagnosticsPage;
