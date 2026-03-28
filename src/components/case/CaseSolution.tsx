import { Trophy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CaseSolutionProps {
  solution: string;
  isKz: boolean;
  onSetSolution: (value: string) => void;
  onSubmitSolution: () => void;
}

const CaseSolution = ({
  solution,
  isKz,
  onSetSolution,
  onSubmitSolution,
}: CaseSolutionProps) => {
  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Trophy size={16} />
          {isKz ? "Симуляция аяқталды!" : "Симуляция завершена!"}
        </div>
        <h2 className="font-display text-2xl font-bold">
          {isKz ? "Команда шешімін жазыңыз" : "Напишите решение команды"}
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          {isKz
            ? "Симуляция барысында қабылданған барлық шешімдер мен стратегияны жинақтаңыз"
            : "Обобщите все решения и стратегию, принятые в ходе симуляции"}
        </p>
      </div>
      <textarea
        value={solution}
        onChange={(e) => onSetSolution(e.target.value)}
        placeholder={
          isKz
            ? "1. Негізгі стратегия...\n\n2. Қабылданған шешімдер...\n\n3. Күтілетін нәтижелер..."
            : "1. Основная стратегия...\n\n2. Принятые решения...\n\n3. Ожидаемые результаты..."
        }
        className="flex-1 bg-secondary/50 border border-border rounded-xl p-5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed"
      />
      <div className="flex justify-end mt-4">
        <Button
          className="gap-2"
          onClick={onSubmitSolution}
          disabled={!solution.trim()}
        >
          <CheckCircle2 size={16} />
          {isKz ? "Шешімді жіберу" : "Отправить решение"}
        </Button>
      </div>
    </div>
  );
};

export default CaseSolution;
