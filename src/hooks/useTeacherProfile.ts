import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RecentActivity {
  type: "test" | "case" | "trainer";
  studentName: string;
  detail: string;
  timestamp: string;
}

export interface TeacherProfileData {
  studentCount: number;
  avgScore: number;
  topStudent: { name: string; score: number } | null;
  recentActivity: RecentActivity[];
  testsCompleted: number;
  casesCompleted: number;
  trainerAttempts: number;
  ungradedSolutions: number;
  allStudentsTested: boolean;
}

export const useTeacherProfile = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TeacherProfileData | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 2. Get teacher's group_name
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("group_name")
        .eq("user_id", user.id)
        .single();
      if (!myProfile?.group_name) {
        setData({ studentCount: 0, avgScore: 0, topStudent: null, recentActivity: [], testsCompleted: 0, casesCompleted: 0, trainerAttempts: 0, ungradedSolutions: 0, allStudentsTested: false });
        return;
      }

      // 3. Get all profiles in group
      const { data: groupProfiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .eq("group_name", myProfile.group_name)
        .neq("user_id", user.id);

      if (!groupProfiles || groupProfiles.length === 0) {
        setData({ studentCount: 0, avgScore: 0, topStudent: null, recentActivity: [], testsCompleted: 0, casesCompleted: 0, trainerAttempts: 0, ungradedSolutions: 0, allStudentsTested: false });
        return;
      }

      // 4. Filter to students only
      const allIds = groupProfiles.map(p => p.user_id);
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("user_id", allIds)
        .eq("role", "student");

      const studentIds = (roles || []).map((r: any) => r.user_id);
      const nameMap = new Map(groupProfiles.map(p => [p.user_id, p.full_name || "Student"]));

      if (studentIds.length === 0) {
        setData({ studentCount: 0, avgScore: 0, topStudent: null, recentActivity: [], testsCompleted: 0, casesCompleted: 0, trainerAttempts: 0, ungradedSolutions: 0, allStudentsTested: false });
        return;
      }

      // 5. Parallel queries
      const [diagRes, caseRes, trainerRes, caseSolRes] = await Promise.all([
        supabase.from("diagnostics_results")
          .select("user_id, average_score, completed_at, answers")
          .in("user_id", studentIds)
          .order("completed_at", { ascending: false }),
        supabase.from("simulation_participants")
          .select("user_id, session_id, simulation_sessions!inner(status, completed_at, case_id)")
          .in("user_id", studentIds)
          .eq("simulation_sessions.status", "completed"),
        supabase.from("trainer_attempts")
          .select("user_id, trainer_type, score, max_score, completed_at")
          .in("user_id", studentIds)
          .order("completed_at", { ascending: false }),
        supabase.from("case_solutions")
          .select("user_id, score, submitted_at, case_id")
          .in("user_id", studentIds)
          .order("submitted_at", { ascending: false }),
      ]);

      const diagData = diagRes.data || [];
      const caseData = caseRes.data || [];
      const trainerData = trainerRes.data || [];
      const caseSolData = caseSolRes.data || [];

      // Compute latest score per student
      const latestScores = new Map<string, number>();
      const studentsWithTests = new Set<string>();
      for (const r of diagData) {
        studentsWithTests.add(r.user_id);
        if (!latestScores.has(r.user_id)) latestScores.set(r.user_id, r.average_score);
      }

      const scores = [...latestScores.values()];
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

      let topStudent: { name: string; score: number } | null = null;
      if (latestScores.size > 0) {
        const [topId, topScore] = [...latestScores.entries()].sort((a, b) => b[1] - a[1])[0];
        topStudent = { name: nameMap.get(topId) || "Student", score: topScore };
      }

      // Ungraded solutions
      const ungradedSolutions = caseSolData.filter(s => s.score === null).length;

      // Recent activity — merge top items from each source
      const activity: RecentActivity[] = [];

      // Recent tests (top 5)
      for (const r of diagData.slice(0, 5)) {
        const testType = (r.answers as any)?._test_type || "general";
        const typeLabel = testType === "physics" ? "Физика" : testType === "infocomm" ? "Инфокомм" : "Жалпы";
        activity.push({
          type: "test",
          studentName: nameMap.get(r.user_id) || "Student",
          detail: `${typeLabel} — ${r.average_score}%`,
          timestamp: r.completed_at,
        });
      }

      // Recent case completions (top 3)
      for (const r of caseData.slice(0, 3)) {
        const session = (r as any).simulation_sessions;
        if (session?.completed_at) {
          activity.push({
            type: "case",
            studentName: nameMap.get(r.user_id) || "Student",
            detail: "Кейс симуляция",
            timestamp: session.completed_at,
          });
        }
      }

      // Recent trainer attempts (top 3)
      for (const r of trainerData.slice(0, 3)) {
        const pct = r.max_score > 0 ? Math.round((r.score / r.max_score) * 100) : 0;
        const typeLabel = r.trainer_type === "sbi_feedback" ? "SBI" : r.trainer_type === "conflict_resolution" ? "Конфликт" : "Выступление";
        activity.push({
          type: "trainer",
          studentName: nameMap.get(r.user_id) || "Student",
          detail: `${typeLabel} — ${pct}%`,
          timestamp: r.completed_at,
        });
      }

      // Sort by timestamp desc, take top 10
      activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setData({
        studentCount: studentIds.length,
        avgScore,
        topStudent,
        recentActivity: activity.slice(0, 10),
        testsCompleted: diagData.length,
        casesCompleted: caseData.length,
        trainerAttempts: trainerData.length,
        ungradedSolutions,
        allStudentsTested: studentsWithTests.size >= studentIds.length,
      });
    } catch (err) {
      console.error("Teacher profile load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportGroupCSV = useCallback(async () => {
    if (!data) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: myProfile } = await supabase
      .from("profiles")
      .select("group_name")
      .eq("user_id", user.id)
      .single();
    if (!myProfile?.group_name) return;

    const { data: groupProfiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .eq("group_name", myProfile.group_name)
      .neq("user_id", user.id);
    if (!groupProfiles) return;

    const studentIds = groupProfiles.map(p => p.user_id);

    // Fetch all data in parallel
    const [diagRes, trainerRes, caseSolRes, feedbackRes] = await Promise.all([
      supabase.from("diagnostics_results")
        .select("user_id, cognitive_score, soft_score, professional_score, adaptability_score, average_score, completed_at, answers")
        .in("user_id", studentIds)
        .order("completed_at", { ascending: false }),
      supabase.from("trainer_attempts")
        .select("user_id, trainer_type, score, max_score")
        .in("user_id", studentIds),
      supabase.from("case_solutions")
        .select("user_id, score")
        .in("user_id", studentIds),
      supabase.from("peer_feedback")
        .select("reviewee_id, communication, teamwork, leadership, problem_solving, reviewer_id")
        .in("reviewee_id", studentIds),
    ]);

    const diagData = diagRes.data || [];
    const trainerData = trainerRes.data || [];
    const caseSolData = caseSolRes.data || [];
    const feedbackData = feedbackRes.data || [];

    // Latest result per student per test type
    const latestByStudentType = new Map<string, Map<string, any>>();
    for (const r of diagData) {
      const type = (r.answers as any)?._test_type || "general";
      if (!latestByStudentType.has(r.user_id)) latestByStudentType.set(r.user_id, new Map());
      const byType = latestByStudentType.get(r.user_id)!;
      if (!byType.has(type)) byType.set(type, r);
    }

    // Trainer best scores per student
    const trainerBest = new Map<string, { sbi: number; conflict: number; speaking: number }>();
    for (const r of trainerData) {
      if (!trainerBest.has(r.user_id)) trainerBest.set(r.user_id, { sbi: 0, conflict: 0, speaking: 0 });
      const best = trainerBest.get(r.user_id)!;
      const pct = r.max_score > 0 ? Math.round((r.score / r.max_score) * 100) : 0;
      if (r.trainer_type === "sbi_feedback") best.sbi = Math.max(best.sbi, pct);
      if (r.trainer_type === "conflict_resolution") best.conflict = Math.max(best.conflict, pct);
      if (r.trainer_type === "public_speaking") best.speaking = Math.max(best.speaking, pct);
    }

    // Case solution avg per student
    const caseScores = new Map<string, { total: number; count: number; graded: number }>();
    for (const r of caseSolData) {
      if (!caseScores.has(r.user_id)) caseScores.set(r.user_id, { total: 0, count: 0, graded: 0 });
      const cs = caseScores.get(r.user_id)!;
      cs.count++;
      if (r.score != null) { cs.total += r.score; cs.graded++; }
    }

    // Peer feedback avg per student (exclude self-reviews)
    const peerAvgs = new Map<string, { sum: number; count: number }>();
    for (const r of feedbackData) {
      if (r.reviewer_id === r.reviewee_id) continue;
      if (!peerAvgs.has(r.reviewee_id)) peerAvgs.set(r.reviewee_id, { sum: 0, count: 0 });
      const pa = peerAvgs.get(r.reviewee_id)!;
      pa.sum += (r.communication + r.teamwork + r.leadership + r.problem_solving) / 4;
      pa.count++;
    }

    const sep = ";";
    const esc = (v: string) => v.includes(sep) || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v;

    const header = [
      "Студент", "Группа",
      "Общий тест (балл)", "Когнитивные", "Soft Skills", "Профессиональные", "Адаптивность",
      "Физика (балл)",
      "Инфокомм (балл)",
      "SBI тренажёр (%)", "Конфликты тренажёр (%)", "Выступление тренажёр (%)",
      "Кейсов пройдено", "Ср. балл решений",
      "360° оценка (ср.)",
    ].join(sep);

    const rows = groupProfiles.map(p => {
      const byType = latestByStudentType.get(p.user_id);
      const gen = byType?.get("general");
      const phys = byType?.get("physics");
      const info = byType?.get("infocomm");
      const tb = trainerBest.get(p.user_id);
      const cs = caseScores.get(p.user_id);
      const pa = peerAvgs.get(p.user_id);

      const physAvg = phys ? Math.round((phys.cognitive_score + phys.soft_score + phys.professional_score + phys.adaptability_score) / 4) : "";
      const infoAvg = info ? Math.round((info.cognitive_score + info.soft_score + info.professional_score + info.adaptability_score) / 4) : "";
      const caseAvg = cs && cs.graded > 0 ? Math.round(cs.total / cs.graded) : "";
      const peerScore = pa && pa.count > 0 ? (pa.sum / pa.count).toFixed(1) : "";

      const v = (val: any) => val != null && val !== "" && val !== 0 ? val : "—";
      return [
        esc(p.full_name || "—"),
        esc(myProfile.group_name || "—"),
        gen?.average_score ?? "—",
        gen?.cognitive_score ?? "—",
        gen?.soft_score ?? "—",
        gen?.professional_score ?? "—",
        gen?.adaptability_score ?? "—",
        v(physAvg),
        v(infoAvg),
        v(tb?.sbi),
        v(tb?.conflict),
        v(tb?.speaking),
        cs?.count ?? 0,
        v(caseAvg),
        v(peerScore),
      ].join(sep);
    });

    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + "sep=;\n" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `group_${myProfile.group_name}_results.csv`;
    link.click();
  }, [data]);

  return { loadProfile, data, loading, exportGroupCSV };
};
