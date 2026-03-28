import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Case {
  id: string;
  title: string;
  description: string;
  title_kz: string;
  description_kz: string;
  category: string;
  difficulty: string;
  objectives: string[];
  objectives_kz: string[];
  materials: string[];
  materials_kz: string[];
  team_size: number;
  created_at: string;
}

export interface CaseSolution {
  id: string;
  case_id: string;
  user_id: string;
  solution_text: string;
  score: number | null;
  submitted_at: string;
}

export interface CaseMessage {
  id: string;
  case_id: string;
  user_id: string;
  message: string;
  created_at: string;
  author_name?: string;
}

export const useCases = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all cases
   */
  const loadCases = async (): Promise<Case[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from("cases")
        .select("*")
        .order("created_at", { ascending: true });

      if (supabaseError) {
        setError(supabaseError.message);
        return [];
      }

      return (data || []).map((row: any) => ({
        ...row,
        objectives: Array.isArray(row.objectives) ? row.objectives : [],
        objectives_kz: Array.isArray(row.objectives_kz) ? row.objectives_kz : [],
        materials: Array.isArray(row.materials) ? row.materials : [],
        materials_kz: Array.isArray(row.materials_kz) ? row.materials_kz : [],
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch a single case by id
   */
  const loadCase = async (id: string): Promise<Case | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from("cases")
        .select("*")
        .eq("id", id)
        .single();

      if (supabaseError) {
        setError(supabaseError.message);
        return null;
      }

      if (!data) return null;

      return {
        ...data,
        objectives: Array.isArray(data.objectives) ? data.objectives : [],
        materials: Array.isArray(data.materials) ? data.materials : [],
      } as Case;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Submit a solution for a case
   */
  const submitSolution = async (caseId: string, solutionText: string): Promise<CaseSolution | null> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from("case_solutions")
        .insert([
          {
            case_id: caseId,
            user_id: user.id,
            solution_text: solutionText,
          },
        ])
        .select()
        .single();

      if (supabaseError) {
        setError(supabaseError.message);
        return null;
      }

      return data as CaseSolution;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send a message in a case chat
   */
  const sendMessage = async (caseId: string, message: string): Promise<CaseMessage | null> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from("case_messages")
        .insert([
          {
            case_id: caseId,
            user_id: user.id,
            message,
          },
        ])
        .select()
        .single();

      if (supabaseError) {
        setError(supabaseError.message);
        return null;
      }

      return data as CaseMessage;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load messages for a case, ordered by created_at, with author names from profiles
   */
  const loadMessages = async (caseId: string): Promise<CaseMessage[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from("case_messages")
        .select("*, profiles!case_messages_user_id_fkey(full_name)")
        .eq("case_id", caseId)
        .order("created_at", { ascending: true });

      if (supabaseError) {
        // Fallback: query without join if FK name doesn't match
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("case_messages")
          .select("*")
          .eq("case_id", caseId)
          .order("created_at", { ascending: true });

        if (fallbackError) {
          setError(fallbackError.message);
          return [];
        }

        // Fetch profile names separately
        const userIds = [...new Set((fallbackData || []).map((m: any) => m.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);

        const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p.full_name]));

        return (fallbackData || []).map((msg: any) => ({
          ...msg,
          author_name: profileMap.get(msg.user_id) || null,
        }));
      }

      return (data || []).map((msg: any) => ({
        id: msg.id,
        case_id: msg.case_id,
        user_id: msg.user_id,
        message: msg.message,
        created_at: msg.created_at,
        author_name: msg.profiles?.full_name || null,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load user's solutions for a case
   */
  const loadSolutions = async (caseId: string): Promise<CaseSolution[]> => {
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
      const { data, error: supabaseError } = await supabase
        .from("case_solutions")
        .select("*")
        .eq("case_id", caseId)
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false });

      if (supabaseError) {
        setError(supabaseError.message);
        return [];
      }

      return (data || []) as CaseSolution[];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    loadCases,
    loadCase,
    submitSolution,
    sendMessage,
    loadMessages,
    loadSolutions,
  };
};
