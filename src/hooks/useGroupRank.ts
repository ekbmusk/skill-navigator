import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GroupRank {
  position: number;
  total: number;
  percentile: number;
}

export const useGroupRank = () => {
  const [loading, setLoading] = useState(false);
  const [rank, setRank] = useState<GroupRank | null | undefined>(undefined);

  const loadRank = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setRank(null); return; }

      const { data: myProfile } = await supabase
        .from("profiles")
        .select("group_name")
        .eq("user_id", user.id)
        .single();
      if (!myProfile?.group_name) { setRank(null); return; }

      const { data: groupProfiles } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("group_name", myProfile.group_name);
      if (!groupProfiles || groupProfiles.length < 3) { setRank(null); return; }

      const studentIds = groupProfiles.map((p: any) => p.user_id);
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("user_id", studentIds)
        .eq("role", "student");
      if (!roles || roles.length < 3) { setRank(null); return; }

      const filteredIds = roles.map((r: any) => r.user_id);
      const { data: results } = await supabase
        .from("diagnostics_results")
        .select("user_id, average_score, completed_at")
        .in("user_id", filteredIds)
        .order("completed_at", { ascending: false });
      if (!results) { setRank(null); return; }

      const latestScores = new Map<string, number>();
      for (const r of results) {
        if (!latestScores.has(r.user_id)) latestScores.set(r.user_id, r.average_score);
      }

      const myScore = latestScores.get(user.id);
      if (myScore === undefined) { setRank(null); return; }

      const total = latestScores.size;
      if (total < 3) { setRank(null); return; }

      // Sort scores descending to find position
      const sorted = [...latestScores.entries()].sort((a, b) => b[1] - a[1]);
      const position = sorted.findIndex(([id]) => id === user.id) + 1;
      const lowerCount = [...latestScores.values()].filter(s => s < myScore).length;
      const percentile = Math.round((lowerCount / (total - 1)) * 100);

      setRank({ position, total, percentile: Math.min(percentile, 99) });
    } catch {
      setRank(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loadRank, rank, loading };
};
