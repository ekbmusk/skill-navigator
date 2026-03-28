import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CaseHistoryItem {
  sessionId: string;
  caseId: string;
  caseTitle: string;
  caseTitleKz: string;
  role: string;
  completedAt: string;
  peerAvg: number | null;
  selfAvg: number | null;
  peerCommunication: number | null;
  peerTeamwork: number | null;
  peerLeadership: number | null;
  peerProblemSolving: number | null;
  selfCommunication: number | null;
  selfTeamwork: number | null;
  selfLeadership: number | null;
  selfProblemSolving: number | null;
  solutionScore: number | null;
}

export interface CaseHistoryStats {
  totalCases: number;
  avgFeedbackScore: number;
  mostCommonRole: string;
}

export const useCaseHistory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load completed case simulation history for the current user
   */
  const loadCaseHistory = async (): Promise<CaseHistoryItem[]> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Get all sessions the user participated in
      const { data: participations, error: partError } = await supabase
        .from("simulation_participants")
        .select("session_id, role")
        .eq("user_id", user.id);

      if (partError) {
        setError(partError.message);
        return [];
      }

      if (!participations || participations.length === 0) {
        return [];
      }

      const sessionIds = participations.map((p) => p.session_id);
      const roleBySession = new Map(
        participations.map((p) => [p.session_id, p.role])
      );

      // Step 2: Get completed sessions
      const { data: sessions, error: sessError } = await supabase
        .from("simulation_sessions")
        .select("id, case_id, completed_at")
        .in("id", sessionIds)
        .eq("status", "completed");

      if (sessError) {
        setError(sessError.message);
        return [];
      }

      if (!sessions || sessions.length === 0) {
        return [];
      }

      const caseIds = [...new Set(sessions.map((s) => s.case_id))];

      // Step 3: Batch-fetch cases, peer feedback, and solution scores in parallel
      const [casesResult, feedbackResult, solutionsResult] = await Promise.all([
        supabase
          .from("cases")
          .select("id, title, title_kz")
          .in("id", caseIds),
        supabase
          .from("peer_feedback")
          .select(
            "session_id, reviewer_id, reviewee_id, communication, teamwork, leadership, problem_solving"
          )
          .in("session_id", sessions.map((s) => s.id))
          .eq("reviewee_id", user.id),
        supabase
          .from("case_solutions")
          .select("case_id, score")
          .eq("user_id", user.id)
          .in("case_id", caseIds),
      ]);

      if (casesResult.error) {
        setError(casesResult.error.message);
        return [];
      }
      if (feedbackResult.error) {
        setError(feedbackResult.error.message);
        return [];
      }
      if (solutionsResult.error) {
        setError(solutionsResult.error.message);
        return [];
      }

      // Build lookup maps
      const caseMap = new Map(
        (casesResult.data || []).map((c) => [c.id, c])
      );

      // Group feedback by session_id, split peer vs self
      const peerFeedbackBySession = new Map<string, typeof feedbackResult.data>();
      const selfFeedbackBySession = new Map<string, typeof feedbackResult.data>();

      for (const fb of feedbackResult.data || []) {
        if (fb.reviewer_id === fb.reviewee_id) {
          // Self-assessment
          const arr = selfFeedbackBySession.get(fb.session_id) || [];
          arr.push(fb);
          selfFeedbackBySession.set(fb.session_id, arr);
        } else {
          // Peer review
          const arr = peerFeedbackBySession.get(fb.session_id) || [];
          arr.push(fb);
          peerFeedbackBySession.set(fb.session_id, arr);
        }
      }

      // Solution score by case_id (take latest/first)
      const solutionScoreByCase = new Map(
        (solutionsResult.data || []).map((s) => [s.case_id, s.score])
      );

      // Step 4: Assemble results
      const items: CaseHistoryItem[] = sessions.map((session) => {
        const caseData = caseMap.get(session.case_id);
        const peerReviews = peerFeedbackBySession.get(session.id) || [];
        const selfReviews = selfFeedbackBySession.get(session.id) || [];

        // Average peer feedback across all criteria
        const peerCommunication = avgField(peerReviews, "communication");
        const peerTeamwork = avgField(peerReviews, "teamwork");
        const peerLeadership = avgField(peerReviews, "leadership");
        const peerProblemSolving = avgField(peerReviews, "problem_solving");
        const peerAvg = avgOfNullable([
          peerCommunication,
          peerTeamwork,
          peerLeadership,
          peerProblemSolving,
        ]);

        // Self-assessment (should be one record, but average just in case)
        const selfCommunication = avgField(selfReviews, "communication");
        const selfTeamwork = avgField(selfReviews, "teamwork");
        const selfLeadership = avgField(selfReviews, "leadership");
        const selfProblemSolving = avgField(selfReviews, "problem_solving");
        const selfAvg = avgOfNullable([
          selfCommunication,
          selfTeamwork,
          selfLeadership,
          selfProblemSolving,
        ]);

        return {
          sessionId: session.id,
          caseId: session.case_id,
          caseTitle: caseData?.title ?? "",
          caseTitleKz: caseData?.title_kz ?? "",
          role: roleBySession.get(session.id) ?? "",
          completedAt: session.completed_at ?? "",
          peerAvg,
          selfAvg,
          peerCommunication,
          peerTeamwork,
          peerLeadership,
          peerProblemSolving,
          selfCommunication,
          selfTeamwork,
          selfLeadership,
          selfProblemSolving,
          solutionScore: solutionScoreByCase.get(session.case_id) ?? null,
        };
      });

      // Sort by completedAt descending (newest first)
      items.sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );

      return items;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Compute summary statistics from case history items
   */
  const computeStats = (items: CaseHistoryItem[]): CaseHistoryStats => {
    const totalCases = items.length;

    // Average of all non-null peerAvg values
    const peerScores = items
      .map((i) => i.peerAvg)
      .filter((v): v is number => v !== null);
    const avgFeedbackScore =
      peerScores.length > 0
        ? peerScores.reduce((sum, v) => sum + v, 0) / peerScores.length
        : 0;

    // Most common role
    const roleCounts = new Map<string, number>();
    for (const item of items) {
      if (item.role) {
        roleCounts.set(item.role, (roleCounts.get(item.role) || 0) + 1);
      }
    }
    let mostCommonRole = "";
    let maxCount = 0;
    for (const [role, count] of roleCounts) {
      if (count > maxCount) {
        mostCommonRole = role;
        maxCount = count;
      }
    }

    return { totalCases, avgFeedbackScore, mostCommonRole };
  };

  return { loading, error, loadCaseHistory, computeStats };
};

// --- Helper functions ---

type FeedbackRow = {
  communication: number | null;
  teamwork: number | null;
  leadership: number | null;
  problem_solving: number | null;
};

function avgField(
  rows: FeedbackRow[],
  field: keyof FeedbackRow
): number | null {
  const values = rows
    .map((r) => r[field])
    .filter((v): v is number => v !== null);
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function avgOfNullable(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => v !== null);
  if (nums.length === 0) return null;
  return nums.reduce((sum, v) => sum + v, 0) / nums.length;
}
