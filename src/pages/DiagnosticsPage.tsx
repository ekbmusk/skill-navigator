import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import DiagnosticsResults from "@/components/DiagnosticsResults";
import Navbar from "@/components/Navbar";
import RankingQuestion from "@/components/RankingQuestion";
import ScenarioQuestion from "@/components/ScenarioQuestion";
import { useLang } from "@/i18n/LanguageContext";
import { useDiagnostics, type DiagnosticsResult } from "@/hooks/useDiagnostics";
import { useToast } from "@/hooks/use-toast";
import { getResultsCompat } from "@/utils/scoringEngine";
import type { TimingData } from "@/utils/antiCheatDetection";
import { questions as allQuestions } from "@/data/diagnosticsQuestions";

// Seeded shuffle — stable per question per test session
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

const DiagnosticsPage = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [testStartTime] = useState(() => Date.now());
  const [shuffleSeed] = useState(() => Math.floor(Math.random() * 1000000));
  const [questionTimestamps, setQuestionTimestamps] = useState<Record<number, number>>({ 0: Date.now() });
  const { t } = useLang();
  const { saveDiagnosticsResult } = useDiagnostics();
  const { toast } = useToast();

  // Elapsed timer
  useEffect(() => {
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - testStartTime) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [testStartTime]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  // Record timestamp when a new question is first shown
  useEffect(() => {
    setQuestionTimestamps((prev) => {
      if (prev[currentQ] !== undefined) return prev;
      return { ...prev, [currentQ]: Date.now() };
    });
  }, [currentQ]);

  // Use localized questions for display text, keeping scoring metadata from allQuestions
  const questions = t.questions.map((tq, i) => ({
    ...allQuestions[i],
    text: tq.text,
    options: tq.options,
    ...("scenario" in tq && tq.scenario ? { scenario: tq.scenario } : {}),
  }));

  const q = questions[currentQ];
  const progress = ((Object.keys(answers).length) / questions.length) * 100;

  const selectAnswer = (score: number) => {
    setAnswers((prev) => ({ ...prev, [q.id]: score }));
  };

  const next = () => {
    if (currentQ < questions.length - 1) setCurrentQ((p) => p + 1);
    else setShowConfirm(true);
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
    return getResultsCompat(answers, buildTimingData());
  };

  const getScoresObject = (): DiagnosticsResult => {
    const { results } = getResults();
    const scoresMap: Record<string, number> = {};

    results.forEach((r) => {
      scoresMap[r.category] = r.score;
    });

    const average = results.length > 0 ? Math.round(results.reduce((a, b) => a + b.score, 0) / results.length) : 0;

    return {
      cognitive: scoresMap["cognitive"] || 0,
      soft: scoresMap["soft"] || 0,
      professional: scoresMap["professional"] || 0,
      adaptability: scoresMap["adaptability"] || 0,
      average,
    };
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const scores = getScoresObject();
      const result = await saveDiagnosticsResult({
        answers,
        scores,
      });

      if (result) {
        setFinished(true);
        toast({
          title: t.diagnosticsToast.savedTitle,
          description: t.diagnosticsToast.savedDesc,
        });
      } else {
        toast({
          variant: "destructive",
          title: t.diagnosticsToast.errorTitle,
          description: t.diagnosticsToast.errorDesc,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t.diagnosticsToast.errorTitle,
        description: t.diagnosticsToast.errorDesc,
      });
    } finally {
      setSaving(false);
    }
  };

  if (finished) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16">
          <DiagnosticsResults results={getResults().results} fullResult={getResults().fullResult} onRestart={() => { setAnswers({}); setCurrentQ(0); setFinished(false); }} />
        </div>
      </div>
    );
  }

  const questionOfText = t.diagnosticsPage.questionOf.replace("{current}", String(currentQ + 1)).replace("{total}", String(questions.length));

  const renderQuestionContent = () => {
    const questionType = q.questionType;

    if (questionType === "ranking" && q.idealOrder) {
      return (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">{q.text}</h2>
          <RankingQuestion
            key={q.id}
            items={q.options.map(o => ({ label: o.label, score: o.score }))}
            idealOrder={q.idealOrder}
            onScore={(score) => selectAnswer(score)}
            currentScore={answers[q.id]}
          />
        </>
      );
    }

    if (questionType === "scenario" && q.scenario) {
      return (
        <ScenarioQuestion
          scenario={q.scenario}
          questionText={q.text}
          options={q.options.map(o => ({ label: o.label, score: o.score }))}
          selectedScore={answers[q.id]}
          onSelect={(score) => selectAnswer(score)}
        />
      );
    }

    // Default: single_choice — shuffle options so position doesn't correlate with score
    const shuffledOptions = seededShuffle(q.options, shuffleSeed + q.id);
    return (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">{q.text}</h2>
        <div className="space-y-3">
          {shuffledOptions.map((opt, i) => {
            const selected = answers[q.id] === opt.score;
            return (
              <button
                key={i}
                onClick={() => selectAnswer(opt.score)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${selected ? "border-primary bg-primary/10 shadow-glow" : "border-border bg-card hover:border-primary/30 hover:bg-card/80"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selected ? "border-primary bg-primary" : "border-muted-foreground/30"
                      }`}
                  >
                    {selected && <CheckCircle2 size={14} className="text-primary-foreground" />}
                  </div>
                  <span className={`text-sm ${selected ? "text-foreground font-medium" : "text-muted-foreground"}`}>{opt.label}</span>
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
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {formatTime(elapsed)}
              </span>
              <span>{Math.round(progress)}%</span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div className="h-full rounded-full bg-primary" initial={false} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
          {t.categories[q.category as keyof typeof t.categories]}
        </span>

        <AnimatePresence mode="wait">
          <motion.div key={q.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            {renderQuestionContent()}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-10">
          <Button variant="outline" onClick={prev} disabled={currentQ === 0} className="gap-2">
            <ArrowLeft size={16} /> {t.diagnosticsPage.back}
          </Button>
          <Button onClick={next} disabled={answers[q.id] === undefined} className="gap-2">
            {currentQ === questions.length - 1 ? t.diagnosticsPage.finish : t.diagnosticsPage.next} <ArrowRight size={16} />
          </Button>
        </div>
      </div>

      {/* Finish confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-8 max-w-md mx-4 shadow-card"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertTriangle size={20} className="text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold">{t.diagnosticsPage.confirmTitle}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {t.diagnosticsPage.confirmDesc
                .replace("{answered}", String(Object.keys(answers).length))
                .replace("{total}", String(questions.length))}
            </p>
            {Object.keys(answers).length < questions.length && (
              <p className="text-xs text-destructive mb-4">
                {t.diagnosticsPage.unanswered.replace("{count}", String(questions.length - Object.keys(answers).length))}
              </p>
            )}
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>
                {t.diagnosticsPage.confirmCancel}
              </Button>
              <Button className="flex-1" onClick={() => { setShowConfirm(false); handleFinish(); }} disabled={saving}>
                {saving ? "..." : t.diagnosticsPage.confirmSubmit}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticsPage;
