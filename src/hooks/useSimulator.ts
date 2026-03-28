import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type {
  SimRole,
  SimPhase,
  ConflictEvent,
  Participant,
  SimulationSession,
  PeerFeedbackData,
  FeedbackSummary,
} from "@/data/simulationData";

export const useSimulator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Session Management ──────────────────────────────────────

  const createSession = useCallback(
    async (caseId: string): Promise<SimulationSession | null> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from("simulation_sessions")
          .insert({ case_id: caseId, created_by: user.id, status: "lobby" })
          .select()
          .single();

        if (err) {
          setError(err.message);
          return null;
        }

        // Auto-join creator
        await supabase
          .from("simulation_participants")
          .insert({ session_id: data.id, user_id: user.id, role: "member" });

        return data as SimulationSession;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loadSession = useCallback(
    async (sessionId: string): Promise<SimulationSession | null> => {
      const { data, error: err } = await supabase
        .from("simulation_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (err) {
        setError(err.message);
        return null;
      }
      return data as SimulationSession;
    },
    []
  );

  const findActiveSession = useCallback(
    async (caseId: string): Promise<SimulationSession | null> => {
      const { data } = await supabase
        .from("simulation_sessions")
        .select("*")
        .eq("case_id", caseId)
        .in("status", ["lobby", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(1);

      return (data && data.length > 0) ? (data[0] as SimulationSession) : null;
    },
    []
  );

  // ── Participants ────────────────────────────────────────────

  const loadParticipants = useCallback(
    async (sessionId: string): Promise<Participant[]> => {
      const { data, error: err } = await supabase
        .from("simulation_participants")
        .select("user_id, role, profiles!simulation_participants_user_id_fkey(full_name, avatar_url)")
        .eq("session_id", sessionId);

      if (err) {
        // Fallback without join
        const { data: parts } = await supabase
          .from("simulation_participants")
          .select("user_id, role")
          .eq("session_id", sessionId);

        if (!parts) return [];

        const userIds = parts.map((p: any) => p.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", userIds);

        const profileMap = new Map(
          (profiles || []).map((p: any) => [p.user_id, p])
        );

        return parts.map((p: any) => ({
          user_id: p.user_id,
          full_name: profileMap.get(p.user_id)?.full_name || "Unknown",
          avatar_url: profileMap.get(p.user_id)?.avatar_url || null,
          role: p.role as SimRole | "member",
        }));
      }

      return (data || []).map((p: any) => ({
        user_id: p.user_id,
        full_name: p.profiles?.full_name || "Unknown",
        avatar_url: p.profiles?.avatar_url || null,
        role: p.role as SimRole | "member",
      }));
    },
    []
  );

  const joinSession = useCallback(
    async (sessionId: string): Promise<boolean> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error: err } = await supabase
        .from("simulation_participants")
        .upsert(
          { session_id: sessionId, user_id: user.id, role: "member" },
          { onConflict: "session_id,user_id" }
        );

      return !err;
    },
    []
  );

  const assignRole = useCallback(
    async (
      sessionId: string,
      userId: string,
      role: SimRole
    ): Promise<boolean> => {
      const { error: err } = await supabase
        .from("simulation_participants")
        .update({ role })
        .eq("session_id", sessionId)
        .eq("user_id", userId);

      return !err;
    },
    []
  );

  // ── Phase Control ──────────────────────────────────────────

  const startSimulation = useCallback(
    async (sessionId: string): Promise<boolean> => {
      const { error: err } = await supabase
        .from("simulation_sessions")
        .update({
          status: "in_progress",
          current_phase: 0,
          phase_started_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      return !err;
    },
    []
  );

  const advancePhase = useCallback(
    async (
      sessionId: string,
      nextPhase: number,
      totalPhases: number
    ): Promise<boolean> => {
      if (nextPhase >= totalPhases) {
        // Complete simulation
        const { error: err } = await supabase
          .from("simulation_sessions")
          .update({
            status: "completed",
            current_phase: nextPhase,
            completed_at: new Date().toISOString(),
          })
          .eq("id", sessionId);
        return !err;
      }

      const { error: err } = await supabase
        .from("simulation_sessions")
        .update({
          current_phase: nextPhase,
          phase_started_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      return !err;
    },
    []
  );

  // ── Conflict Events ────────────────────────────────────────

  const triggerConflict = useCallback(
    async (
      sessionId: string,
      eventKey: string,
      phase: number
    ): Promise<boolean> => {
      const { error: err } = await supabase
        .from("simulation_events")
        .insert({ session_id: sessionId, event_key: eventKey, phase });

      return !err;
    },
    []
  );

  const resolveConflict = useCallback(
    async (eventId: string, response: Record<string, any>): Promise<boolean> => {
      const { error: err } = await supabase
        .from("simulation_events")
        .update({ response, resolved_at: new Date().toISOString() })
        .eq("id", eventId);

      return !err;
    },
    []
  );

  const loadEvents = useCallback(
    async (
      sessionId: string
    ): Promise<
      Array<{
        id: string;
        event_key: string;
        phase: number;
        response: any;
        resolved_at: string | null;
      }>
    > => {
      const { data } = await supabase
        .from("simulation_events")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      return (data || []) as any[];
    },
    []
  );

  // ── Chat (phase-aware) ─────────────────────────────────────

  const sendMessage = useCallback(
    async (
      caseId: string,
      message: string,
      sessionId?: string,
      phase?: number
    ): Promise<any> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const row: any = { case_id: caseId, user_id: user.id, message };
      if (sessionId) row.session_id = sessionId;
      if (phase !== undefined) row.phase = phase;

      const { data, error: err } = await supabase
        .from("case_messages")
        .insert([row])
        .select()
        .single();

      if (err) return null;
      return data;
    },
    []
  );

  const loadMessages = useCallback(
    async (
      caseId: string,
      sessionId?: string
    ): Promise<
      Array<{
        id: string;
        user_id: string;
        message: string;
        created_at: string;
        phase: number | null;
        author_name: string | null;
      }>
    > => {
      let query = supabase
        .from("case_messages")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: true });

      if (sessionId) {
        query = query.eq("session_id", sessionId);
      }

      const { data, error: err } = await query;

      if (err || !data) return [];

      // Fetch author names
      const userIds = [...new Set(data.map((m: any) => m.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const profileMap = new Map(
        (profiles || []).map((p: any) => [p.user_id, p.full_name])
      );

      return data.map((msg: any) => ({
        id: msg.id,
        user_id: msg.user_id,
        message: msg.message,
        created_at: msg.created_at,
        phase: msg.phase,
        author_name: profileMap.get(msg.user_id) || null,
      }));
    },
    []
  );

  // ── Peer Feedback ──────────────────────────────────────────

  const submitFeedback = useCallback(
    async (
      sessionId: string,
      feedbacks: PeerFeedbackData[]
    ): Promise<boolean> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const rows = feedbacks.map((f) => ({
        session_id: sessionId,
        reviewer_id: user.id,
        reviewee_id: f.reviewee_id,
        communication: f.communication,
        teamwork: f.teamwork,
        leadership: f.leadership,
        problem_solving: f.problem_solving,
        comment: f.comment || "",
      }));

      const { error: err } = await supabase
        .from("peer_feedback")
        .upsert(rows, {
          onConflict: "session_id,reviewer_id,reviewee_id",
        });

      return !err;
    },
    []
  );

  const loadFeedbackSummary = useCallback(
    async (sessionId: string): Promise<FeedbackSummary[]> => {
      const { data } = await supabase
        .from("peer_feedback")
        .select("*")
        .eq("session_id", sessionId);

      if (!data || data.length === 0) return [];

      // Group by reviewee
      const grouped = new Map<string, any[]>();
      for (const fb of data) {
        const arr = grouped.get(fb.reviewee_id) || [];
        arr.push(fb);
        grouped.set(fb.reviewee_id, arr);
      }

      // Fetch names
      const userIds = [...grouped.keys()];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const nameMap = new Map(
        (profiles || []).map((p: any) => [p.user_id, p.full_name])
      );

      const summaries: FeedbackSummary[] = [];
      for (const [userId, feedbacks] of grouped) {
        const count = feedbacks.length;
        const avg = (field: string) =>
          feedbacks.reduce((s: number, f: any) => s + (f[field] || 0), 0) /
          count;

        const avgComm = avg("communication");
        const avgTeam = avg("teamwork");
        const avgLead = avg("leadership");
        const avgPS = avg("problem_solving");

        summaries.push({
          user_id: userId,
          full_name: nameMap.get(userId) || "Unknown",
          avg_communication: Math.round(avgComm * 10) / 10,
          avg_teamwork: Math.round(avgTeam * 10) / 10,
          avg_leadership: Math.round(avgLead * 10) / 10,
          avg_problem_solving: Math.round(avgPS * 10) / 10,
          total_avg:
            Math.round(((avgComm + avgTeam + avgLead + avgPS) / 4) * 10) / 10,
          count,
        });
      }

      return summaries.sort((a, b) => b.total_avg - a.total_avg);
    },
    []
  );

  // ── Solution ───────────────────────────────────────────────

  const submitSolution = useCallback(
    async (caseId: string, solutionText: string): Promise<boolean> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error: err } = await supabase
        .from("case_solutions")
        .insert({ case_id: caseId, user_id: user.id, solution_text: solutionText });

      return !err;
    },
    []
  );

  return {
    loading,
    error,
    // Session
    createSession,
    loadSession,
    findActiveSession,
    // Participants
    loadParticipants,
    joinSession,
    assignRole,
    // Phases
    startSimulation,
    advancePhase,
    // Conflicts
    triggerConflict,
    resolveConflict,
    loadEvents,
    // Chat
    sendMessage,
    loadMessages,
    // Feedback
    submitFeedback,
    loadFeedbackSummary,
    // Solution
    submitSolution,
  };
};
