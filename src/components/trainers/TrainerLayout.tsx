import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

interface TrainerLayoutProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  /** @deprecated No longer used — icon is rendered directly */
  accentColor?: string;
  children: ReactNode;
  progress?: number;
  score?: number | null;
  maxScore?: number;
  step?: number;
  totalSteps?: number;
  onRestart?: () => void;
  restartLabel?: string;
}

const TrainerLayout = ({
  title, subtitle, icon,
  children, progress, score, maxScore, step, totalSteps,
  onRestart, restartLabel,
}: TrainerLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-3xl mx-auto px-4 pt-24 pb-16">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/trainers" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          </Link>
          {onRestart && (
            <Button variant="outline" size="sm" onClick={onRestart} className="gap-2 text-xs">
              <RotateCcw size={13} /> {restartLabel || "Restart"}
            </Button>
          )}
        </div>

        {/* Header with icon */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            {icon && icon}
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
            </div>
          </div>
        </motion.div>

        {/* Progress bar with step indicator */}
        {progress !== undefined && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <div className="flex items-center gap-2">
                {step !== undefined && totalSteps !== undefined && (
                  <span className="px-2 py-0.5 rounded-md bg-secondary font-medium">
                    {step}/{totalSteps}
                  </span>
                )}
                <span>{Math.round(progress)}%</span>
              </div>
              {score !== null && score !== undefined && maxScore !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Zap size={12} className="text-primary" />
                  <span className="font-medium text-foreground">{score}/{maxScore}</span>
                </div>
              )}
            </div>
            <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

export default TrainerLayout;
