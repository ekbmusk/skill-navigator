import { CheckCircle2, AlertTriangle } from "lucide-react";

interface ScenarioOption {
  label: string;
  score: number;
}

interface ScenarioQuestionProps {
  scenario: string;
  questionText: string;
  options: ScenarioOption[];
  selectedScore?: number;
  onSelect: (score: number) => void;
}

/**
 * Scenario question component.
 * Shows a scenario context in a highlighted card, then regular single-choice options.
 */
const ScenarioQuestion = ({
  scenario,
  questionText,
  options,
  selectedScore,
  onSelect,
}: ScenarioQuestionProps) => {
  return (
    <div>
      {/* Scenario banner */}
      <div className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
              Ситуация
            </span>
            <p className="mt-1 text-sm text-foreground leading-relaxed">{scenario}</p>
          </div>
        </div>
      </div>

      {/* Question */}
      <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">{questionText}</h2>

      {/* Options (same as single_choice) */}
      <div className="space-y-3">
        {options.map((opt, i) => {
          const selected = selectedScore === opt.score;
          return (
            <button
              key={i}
              onClick={() => onSelect(opt.score)}
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
    </div>
  );
};

export default ScenarioQuestion;
