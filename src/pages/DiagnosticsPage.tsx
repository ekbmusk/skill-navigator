import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import DiagnosticsResults from "@/components/DiagnosticsResults";
import Navbar from "@/components/Navbar";
import { useLang } from "@/i18n/LanguageContext";
import { useDiagnostics, type DiagnosticsResult } from "@/hooks/useDiagnostics";
import { useToast } from "@/hooks/use-toast";
import { getResultsCompat } from "@/utils/scoringEngine";
import { questions as allQuestions, categoryLabels } from "@/data/diagnosticsQuestions";

const DiagnosticsPage = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const { t } = useLang();
  const { saveDiagnosticsResult } = useDiagnostics();
  const { toast } = useToast();

  // Используем вопросы из diagnosticsQuestions.ts (32 вопроса)
  const questions = allQuestions;
  // categoryLabels уже импортирован выше

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

  const getResults = () => {
    const { results } = getResultsCompat(answers);
    return results;
  };

  const getScoresObject = (): DiagnosticsResult => {
    const results = getResults();
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
          title: "Сақталды",
          description: "Сіздің диагностика нәтижелері сақталды",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Қате",
          description: "Нәтижелерді сақтау барысында қате орын алды",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Қате",
        description: "Нәтижелерді сақтау барысында қате орын алды",
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
          <DiagnosticsResults results={getResults()} onRestart={() => { setAnswers({}); setCurrentQ(0); setFinished(false); }} />
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
          {categoryLabels[q.category as keyof typeof categoryLabels]}
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

export default DiagnosticsPage;
