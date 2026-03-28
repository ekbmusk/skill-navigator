import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Lightbulb, ClipboardList, Settings, Presentation,
  Search, Target, Layers, Timer, ChevronRight,
  CheckCircle2, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SimPhase } from "@/data/simulationData";

const ICON_MAP: Record<string, React.ReactNode> = {
  lightbulb: <Lightbulb size={20} />,
  clipboard: <ClipboardList size={20} />,
  cog: <Settings size={20} />,
  presentation: <Presentation size={20} />,
  search: <Search size={20} />,
  target: <Target size={20} />,
  layers: <Layers size={20} />,
};

interface PhaseManagerProps {
  phases: SimPhase[];
  currentPhase: number;
  phaseStartedAt: string | null;
  lang: "ru" | "kz";
  onAdvancePhase: () => void;
  onTimeUp: () => void;
  isLeader: boolean;
  completedTasks: Set<string>;
  onToggleTask: (taskKey: string) => void;
}

const PhaseManager = ({
  phases,
  currentPhase,
  phaseStartedAt,
  lang,
  onAdvancePhase,
  onTimeUp,
  isLeader,
  completedTasks,
  onToggleTask,
}: PhaseManagerProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isWarning, setIsWarning] = useState(false);
  const isKz = lang === "kz";

  const phase = phases[currentPhase];
  if (!phase) return null;

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    if (!phaseStartedAt) return;

    const startTime = new Date(phaseStartedAt).getTime();
    const duration = phase.duration * 1000;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
      setTimeLeft(remaining);
      setIsWarning(remaining <= 60 && remaining > 0);

      if (remaining <= 0) {
        onTimeUp();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [phaseStartedAt, phase.duration, onTimeUp]);

  const progressPercent =
    phase.duration > 0
      ? Math.max(0, Math.min(100, ((phase.duration - timeLeft) / phase.duration) * 100))
      : 0;

  const tasks = isKz ? phase.tasksKz : phase.tasks;

  return (
    <div className="space-y-4">
      {/* Phase Progress Bar */}
      <div className="flex items-center gap-2 mb-6">
        {phases.map((p, i) => (
          <div key={i} className="flex-1 flex items-center gap-1">
            <div
              className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                i < currentPhase
                  ? "bg-primary"
                  : i === currentPhase
                  ? "bg-primary/60"
                  : "bg-secondary"
              }`}
            >
              {i === currentPhase && (
                <div
                  className="h-full rounded-full bg-primary transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              )}
            </div>
            {i < phases.length - 1 && (
              <ChevronRight size={12} className="text-muted-foreground shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Current Phase Card */}
      <motion.div
        key={currentPhase}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-xl border border-border bg-card-gradient p-5"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {ICON_MAP[phase.icon] || <Target size={20} />}
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                {isKz ? "Кезең" : "Этап"} {currentPhase + 1}/{phases.length}
              </div>
              <h3 className="font-display font-bold text-lg">
                {isKz ? phase.nameKz : phase.name}
              </h3>
            </div>
          </div>

          {/* Timer */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-bold ${
              isWarning
                ? "bg-destructive/10 text-destructive animate-pulse"
                : "bg-primary/10 text-primary"
            }`}
          >
            <Timer size={16} />
            {formatTime(timeLeft)}
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {isKz ? phase.descriptionKz : phase.description}
        </p>

        {/* Phase Tasks */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {isKz ? "Тапсырмалар" : "Задачи этапа"}
          </h4>
          {tasks.map((task, i) => {
            const taskKey = `${currentPhase}-${i}`;
            const done = completedTasks.has(taskKey);
            return (
              <button
                key={i}
                onClick={() => onToggleTask(taskKey)}
                className="flex items-start gap-2.5 w-full text-left group py-1"
              >
                <div
                  className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${
                    done
                      ? "bg-primary border-primary"
                      : "border-muted-foreground/30 group-hover:border-primary/50"
                  }`}
                >
                  {done && (
                    <CheckCircle2 size={14} className="text-primary-foreground" />
                  )}
                </div>
                <span
                  className={`text-sm transition-colors ${
                    done ? "text-muted-foreground line-through" : "text-foreground"
                  }`}
                >
                  {task}
                </span>
              </button>
            );
          })}
        </div>

        {/* Advance Phase Button (Leader Only) */}
        {isLeader && (
          <div className="mt-5 pt-4 border-t border-border">
            <Button
              onClick={onAdvancePhase}
              className="gap-2 w-full"
              variant={currentPhase === phases.length - 1 ? "default" : "outline"}
            >
              {currentPhase === phases.length - 1
                ? isKz
                  ? "Симуляцияны аяқтау"
                  : "Завершить симуляцию"
                : isKz
                ? "Келесі кезеңге өту"
                : "Перейти к следующему этапу"}
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </motion.div>

      {/* Phase Timeline */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {phases.map((p, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap shrink-0 ${
              i === currentPhase
                ? "bg-primary/10 text-primary font-medium"
                : i < currentPhase
                ? "bg-secondary/50 text-muted-foreground"
                : "bg-secondary/30 text-muted-foreground/50"
            }`}
          >
            {i < currentPhase ? (
              <CheckCircle2 size={14} className="text-primary" />
            ) : (
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
                {i + 1}
              </span>
            )}
            {isKz ? p.nameKz : p.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhaseManager;
