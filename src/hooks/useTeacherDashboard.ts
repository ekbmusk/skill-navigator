import { useState, useEffect } from "react";
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
}

interface UseTeacherDashboardResult {
  students: StudentWithScores[];
  loading: boolean;
  error: string | null;
  groupName: string | null;
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

        // 5. Build final student list
        const studentList: StudentWithScores[] = filteredProfiles.map((p) => {
          const r = latestByUser.get(p.user_id);
          return {
            userId: p.user_id,
            name: p.full_name || p.user_id.slice(0, 8),
            cognitive: r ? Math.round(r.cognitive_score) : 0,
            soft: r ? Math.round(r.soft_score) : 0,
            professional: r ? Math.round(r.professional_score) : 0,
            adaptability: r ? Math.round(r.adaptability_score) : 0,
            total: r ? Math.round(r.average_score) : 0,
            completedAt: r?.completed_at ?? null,
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

  return { students, loading, error, groupName };
}
