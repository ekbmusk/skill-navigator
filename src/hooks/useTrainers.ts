import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type TrainerType = "sbi_feedback" | "conflict_resolution" | "public_speaking";

export interface TrainerAttempt {
  id: string;
  user_id: string;
  trainer_type: TrainerType;
  score: number;
  max_score: number;
  level: number;
  answers: Record<string, any>;
  completed_at: string;
}

export const useTrainers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveAttempt = async (params: {
    trainerType: TrainerType;
    score: number;
    maxScore: number;
    level?: number;
    answers: Record<string, any>;
  }): Promise<TrainerAttempt | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Not authenticated"); return null; }

    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("trainer_attempts" as any)
        .insert([{
          user_id: user.id,
          trainer_type: params.trainerType,
          score: params.score,
          max_score: params.maxScore,
          level: params.level ?? 1,
          answers: params.answers,
        }])
        .select()
        .single();

      if (err) { setError(err.message); return null; }
      return data as TrainerAttempt;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadAttempts = async (trainerType?: TrainerType): Promise<TrainerAttempt[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    setLoading(true);
    try {
      let query = supabase
        .from("trainer_attempts" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(20);

      if (trainerType) query = query.eq("trainer_type", trainerType);

      const { data, error: err } = await query;
      if (err) { setError(err.message); return []; }
      return (data || []) as TrainerAttempt[];
    } finally {
      setLoading(false);
    }
  };

  const loadBestScores = async (): Promise<Record<TrainerType, number>> => {
    const attempts = await loadAttempts();
    const best: Record<TrainerType, number> = {
      sbi_feedback: 0,
      conflict_resolution: 0,
      public_speaking: 0,
    };
    for (const a of attempts) {
      const pct = Math.round((a.score / a.max_score) * 100);
      if (pct > (best[a.trainer_type] || 0)) {
        best[a.trainer_type] = pct;
      }
    }
    return best;
  };

  return { loading, error, saveAttempt, loadAttempts, loadBestScores };
};
