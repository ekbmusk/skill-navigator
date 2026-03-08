import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { questions, categoryLabels } from "@/data/diagnosticsQuestions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import DiagnosticsResults from "@/components/DiagnosticsResults";
import Navbar from "@/components/Navbar";

const DiagnosticsPage = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);

  const q = questions[currentQ];
  const progress = ((Object.keys(answers).length) / questions.length) * 100;

  const selectAnswer = (score: number) => {
    setAnswers((prev) => ({ ...prev, [q.id]: score }));
  };

  const next = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((p) => p + 1);
    } else {
      setFinished(true);
    }
  };

  const prev = () => {
    if (currentQ > 0) setCurrentQ((p) => p - 1);
  };

  const getResults = () => {
    const cats: Record<string, { total: number; count: number }> = {};
    questions.forEach((question) => {
      if (!cats[question.category]) cats[question.category] = { total: 0, count: 0 };
      cats[question.category].count++;
      if (answers[question.id] !== undefined) {
        cats[question.category].total += answers[question.id];
      }
    });
    return Object.entries(cats).map(([key, val]) => ({
      category: key,
      label: categoryLabels[key],
      score: Math.round((val.total / (val.count * 4)) * 100),
    }));
  };

  if (finished) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16">
          <DiagnosticsResults
            results={getResults()}
            onRestart={() => {
              setAnswers({});
              setCurrentQ(0);
              setFinished(false);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-2xl mx-auto px-4 pt-24 pb-16">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Вопрос {currentQ + 1} из {questions.length}</span>
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

        {/* Category badge */}
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
          {categoryLabels[q.category]}
        </span>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">{q.text}</h2>

            <div className="space-y-3">
              {q.options.map((opt, i) => {
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
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          <Button
            variant="outline"
            onClick={prev}
            disabled={currentQ === 0}
            className="gap-2"
          >
            <ArrowLeft size={16} /> Назад
          </Button>
          <Button
            onClick={next}
            disabled={answers[q.id] === undefined}
            className="gap-2"
          >
            {currentQ === questions.length - 1 ? "Завершить" : "Далее"} <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsPage;
