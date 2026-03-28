import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface StudentWithScores {
  userId: string;
  name: string;
  cognitive: number;
  soft: number;
  professional: number;
  adaptability: number;
  total: number;
  completedAt: string | null;
  casesCompleted: number;
  avgPeerFeedback: number | null;
  avgSolutionScore: number | null;
}

export interface StudentCaseDetail {
  sessionId: string;
  caseTitle: string;
  caseTitleKz: string;
  role: string;
  completedAt: string;
  peerCommunication: number | null;
  peerTeamwork: number | null;
  peerLeadership: number | null;
  peerProblemSolving: number | null;
  peerAvg: number | null;
  solutionId: string | null;
  solutionText: string | null;
  solutionScore: number | null;
}

interface UseTeacherDashboardResult {
  students: StudentWithScores[];
  loading: boolean;
  error: string | null;
  groupName: string | null;
  scoreSolution: (solutionId: string, score: number) => Promise<boolean>;
  loadStudentCaseDetails: (studentId: string) => Promise<StudentCaseDetail[]>;
}

export function useTeacherDashboard(): UseTeacherDashboardResult {
  const { profile, user } = useAuth();
  const [students, setStudents] = useState<StudentWithScores[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const groupName = profile?.group_name ?? null;

  useEffect(() => {
    if (!user || !groupName) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Get all student profiles in the same group
        const { data: studentProfiles, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .eq("group_name", groupName)
          .neq("user_id", user.id);

        if (profilesError) throw profilesError;
        if (!studentProfiles || studentProfiles.length === 0) {
          if (!cancelled) {
            setStudents([]);
            setLoading(false);
          }
          return;
        }

        // 2. Filter to only students (not teachers)
        const userIds = studentProfiles.map((p) => p.user_id);
        const { data: roles, error: rolesError } = await supabase
          .from("user_roles")
          .select("user_id, role")
          .in("user_id", userIds)
          .eq("role", "student");

        if (rolesError) throw rolesError;

        const studentUserIds = new Set((roles ?? []).map((r) => r.user_id));
        const filteredProfiles = studentProfiles.filter((p) =>
          studentUserIds.has(p.user_id)
        );

        if (filteredProfiles.length === 0) {
          if (!cancelled) {
            setStudents([]);
            setLoading(false);
          }
          return;
        }

        // 3. Fetch diagnostics results for these students
        const studentIds = filteredProfiles.map((p) => p.user_id);
        const { data: results, error: resultsError } = await supabase
          .from("diagnostics_results")
          .select(
            "user_id, cognitive_score, soft_score, professional_score, adaptability_score, average_score, completed_at"
          )
          .in("user_id", studentIds)
          .order("completed_at", { ascending: false });

        if (resultsError) throw resultsError;

        // 4. Keep only the latest result per student
        const latestByUser = new Map<string, (typeof results)[number]>();
        for (const r of results ?? []) {
          if (!latestByUser.has(r.user_id)) {
            latestByUser.set(r.user_id, r);
          }
        }

        // 5. Fetch case performance data in parallel
        const [participantsRes, feedbackRes, solutionsRes] = await Promise.all([
          // Completed simulation sessions per student
          supabase
            .from("simulation_participants" as any)
            .select("user_id, session_id, simulation_sessions!inner(status)")
            .in("user_id", studentIds)
            .eq("simulation_sessions.status" as any, "completed"),
          // Peer feedback (exclude self-reviews)
          supabase
            .from("peer_feedback" as any)
            .select("reviewee_id, communication, teamwork, leadership, problem_solving, reviewer_id")
            .in("reviewee_id", studentIds),
          // Case solutions with scores
          supabase
            .from("case_solutions")
            .select("user_id, score")
            .in("user_id", studentIds),
        ]);

        // Count completed cases per student
        const casesCountMap = new Map<string, number>();
        if (participantsRes.data) {
          for (const row of participantsRes.data as any[]) {
            const uid = row.user_id as string;
            casesCountMap.set(uid, (casesCountMap.get(uid) ?? 0) + 1);
          }
        }

        // Compute avg peer feedback per student (exclude self-reviews)
        const peerFeedbackMap = new Map<string, { sum: number; count: number }>();
        if (feedbackRes.data) {
          for (const row of feedbackRes.data as any[]) {
            if (row.reviewer_id === row.reviewee_id) continue;
            const uid = row.reviewee_id as string;
            const avg =
              ((row.communication ?? 0) +
                (row.teamwork ?? 0) +
                (row.leadership ?? 0) +
                (row.problem_solving ?? 0)) /
              4;
            const entry = peerFeedbackMap.get(uid) ?? { sum: 0, count: 0 };
            entry.sum += avg;
            entry.count += 1;
            peerFeedbackMap.set(uid, entry);
          }
        }

        // Compute avg solution score per student
        const solutionScoreMap = new Map<string, { sum: number; count: number }>();
        if (solutionsRes.data) {
          for (const row of solutionsRes.data) {
            if (row.score == null) continue;
            const uid = row.user_id as string;
            const entry = solutionScoreMap.get(uid) ?? { sum: 0, count: 0 };
            entry.sum += row.score;
            entry.count += 1;
            solutionScoreMap.set(uid, entry);
          }
        }

        // 6. Build final student list
        const studentList: StudentWithScores[] = filteredProfiles.map((p) => {
          const r = latestByUser.get(p.user_id);
          const peerEntry = peerFeedbackMap.get(p.user_id);
          const solEntry = solutionScoreMap.get(p.user_id);
          return {
            userId: p.user_id,
            name: p.full_name || p.user_id.slice(0, 8),
            cognitive: r ? Math.round(r.cognitive_score) : 0,
            soft: r ? Math.round(r.soft_score) : 0,
            professional: r ? Math.round(r.professional_score) : 0,
            adaptability: r ? Math.round(r.adaptability_score) : 0,
            total: r ? Math.round(r.average_score) : 0,
            completedAt: r?.completed_at ?? null,
            casesCompleted: casesCountMap.get(p.user_id) ?? 0,
            avgPeerFeedback: peerEntry
              ? Math.round((peerEntry.sum / peerEntry.count) * 10) / 10
              : null,
            avgSolutionScore: solEntry
              ? Math.round(solEntry.sum / solEntry.count)
              : null,
          };
        });

        if (!cancelled) {
          setStudents(studentList);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [user, groupName]);

  const scoreSolution = useCallback(
    async (solutionId: string, score: number): Promise<boolean> => {
      try {
        const { error } = await supabase
          .from("case_solutions")
          .update({ score })
          .eq("id", solutionId);
        return !error;
      } catch {
        return false;
      }
    },
    []
  );

  const loadStudentCaseDetails = useCallback(
    async (studentId: string): Promise<StudentCaseDetail[]> => {
      try {
        // Get simulation participations with completed sessions
        const { data: participations } = await supabase
          .from("simulation_participants" as any)
          .select(
            "session_id, role, simulation_sessions!inner(id, case_id, status, completed_at, cases!inner(title, title_kz))"
          )
          .eq("user_id", studentId)
          .eq("simulation_sessions.status" as any, "completed");

        if (!participations || participations.length === 0) return [];

        const sessionIds = (participations as any[]).map(
          (p: any) => p.session_id as string
        );

        // Get peer feedback for this student across these sessions
        const { data: feedback } = await supabase
          .from("peer_feedback" as any)
          .select(
            "session_id, communication, teamwork, leadership, problem_solving, reviewer_id, reviewee_id"
          )
          .in("session_id", sessionIds)
          .eq("reviewee_id", studentId);

        // Group feedback by session (exclude self-reviews)
        const feedbackBySession = new Map<
          string,
          { comm: number[]; team: number[]; lead: number[]; prob: number[] }
        >();
        if (feedback) {
          for (const f of feedback as any[]) {
            if (f.reviewer_id === f.reviewee_id) continue;
            const sid = f.session_id as string;
            const entry = feedbackBySession.get(sid) ?? {
              comm: [],
              team: [],
              lead: [],
              prob: [],
            };
            entry.comm.push(f.communication ?? 0);
            entry.team.push(f.teamwork ?? 0);
            entry.lead.push(f.leadership ?? 0);
            entry.prob.push(f.problem_solving ?? 0);
            feedbackBySession.set(sid, entry);
          }
        }

        // Get case solutions for this student
        const { data: solutions } = await supabase
          .from("case_solutions")
          .select("id, case_id, solution_text, score")
          .eq("user_id", studentId);

        // Map solutions by case_id
        const solutionByCaseId = new Map<string, (typeof solutions extends (infer U)[] | null ? U : never)>();
        if (solutions) {
          for (const s of solutions) {
            solutionByCaseId.set(s.case_id, s);
          }
        }

        const avg = (arr: number[]) =>
          arr.length > 0
            ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10
            : null;

        return (participations as any[]).map((p: any) => {
          const session = p.simulation_sessions;
          const caseData = session.cases;
          const fb = feedbackBySession.get(p.session_id);
          const sol = solutionByCaseId.get(session.case_id);

          const peerComm = fb ? avg(fb.comm) : null;
          const peerTeam = fb ? avg(fb.team) : null;
          const peerLead = fb ? avg(fb.lead) : null;
          const peerProb = fb ? avg(fb.prob) : null;

          const peerScores = [peerComm, peerTeam, peerLead, peerProb].filter(
            (v): v is number => v !== null
          );
          const peerAvg =
            peerScores.length > 0
              ? Math.round(
                  (peerScores.reduce((a, b) => a + b, 0) / peerScores.length) *
                    10
                ) / 10
              : null;

          return {
            sessionId: p.session_id,
            caseTitle: caseData?.title ?? "",
            caseTitleKz: caseData?.title_kz ?? caseData?.title ?? "",
            role: p.role ?? "",
            completedAt: session.completed_at ?? "",
            peerCommunication: peerComm,
            peerTeamwork: peerTeam,
            peerLeadership: peerLead,
            peerProblemSolving: peerProb,
            peerAvg,
            solutionId: sol?.id ?? null,
            solutionText: sol?.solution_text ?? null,
            solutionScore: sol?.score ?? null,
          };
        });
      } catch {
        return [];
      }
    },
    []
  );

  return { students, loading, error, groupName, scoreSolution, loadStudentCaseDetails };
}
