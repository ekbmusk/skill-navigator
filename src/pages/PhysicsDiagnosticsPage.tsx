import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import PhysicsDiagnosticsResults from "@/components/PhysicsDiagnosticsResults";
import Navbar from "@/components/Navbar";
import { useLang } from "@/i18n/LanguageContext";
import { useDiagnostics } from "@/hooks/useDiagnostics";
import { useToast } from "@/hooks/use-toast";
import { getPhysicsResultsCompat } from "@/utils/physicsScoringEngine";
import type { TimingData } from "@/utils/antiCheatDetection";
import { physicsQuestions as allQuestions } from "@/data/physicsQuestions";

const PhysicsDiagnosticsPage = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testStartTime] = useState(() => Date.now());
  const [questionTimestamps, setQuestionTimestamps] = useState<Record<number, number>>({ 0: Date.now() });
  const { t } = useLang();
  const { saveDiagnosticsResult } = useDiagnostics();
  const { toast } = useToast();

  // Record timestamp when a new question is first shown
  useEffect(() => {
    setQuestionTimestamps((prev) => {
      if (prev[currentQ] !== undefined) return prev;
      return { ...prev, [currentQ]: Date.now() };
    });
  }, [currentQ]);

  // Use localized questions for display text, keeping scoring metadata from allQuestions
  const questions = t.physicsQuestions.map((tq, i) => ({
    ...allQuestions[i],
    text: tq.text,
    options: tq.options,
  }));

  const q = questions[currentQ];
  const progress = ((Object.keys(answers).length) / questions.length) * 100;

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
    return getPhysicsResultsCompat(answers, buildTimingData());
  };

  const getScoresObject = () => {
    const { results } = getResults();
    const scoresMap: Record<string, number> = {};

    results.forEach((r) => {
      scoresMap[r.category] = r.score;
    });

    const average = results.length > 0 ? Math.round(results.reduce((a, b) => a + b.score, 0) / results.length) : 0;

    return {
      // Map physics categories to the DB columns
      cognitive: scoresMap["mechanics"] || 0,
      soft: scoresMap["thermodynamics"] || 0,
      professional: scoresMap["electromagnetism"] || 0,
      adaptability: scoresMap["optics_waves"] || 0,
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
        testType: "physics",
      });

      if (result) {
        setFinished(true);
        toast({
          title: "Saved",
          description: "Your physics diagnostics results have been saved",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save results",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save results",
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
          <PhysicsDiagnosticsResults results={getResults().results} fullResult={getResults().fullResult} onRestart={() => { setAnswers({}); setCurrentQ(0); setFinished(false); }} />
        </div>
      </div>
    );
  }

  const questionOfText = t.diagnosticsPage.questionOf.replace("{current}", String(currentQ + 1)).replace("{total}", String(questions.length));

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
            <motion.div className="h-full rounded-full bg-primary" initial={false} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
          {t.physicsCategories[q.category as keyof typeof t.physicsCategories]}
        </span>

        <AnimatePresence mode="wait">
          <motion.div key={q.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">{q.text}</h2>
            <div className="space-y-3">
              {q.options.map((opt, i) => {
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
    </div>
  );
};

export default PhysicsDiagnosticsPage;
