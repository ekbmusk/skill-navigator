import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface GroupMember {
  userId: string;
  name: string;
  avatarUrl: string | null;
  cognitive: number;
  soft: number;
  professional: number;
  adaptability: number;
  total: number;
  completedAt: string | null;
}

interface UseGroupMembersResult {
  members: GroupMember[];
  loading: boolean;
  error: string | null;
  groupName: string | null;
}

export function useGroupMembers(): UseGroupMembersResult {
  const { profile, user } = useAuth();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const groupName = profile?.group_name ?? null;

  useEffect(() => {
    if (!user || !groupName) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchMembers = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Get all profiles in the same group
        const { data: groupProfiles, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .eq("group_name", groupName);

        if (profilesError) throw profilesError;
        if (!groupProfiles || groupProfiles.length === 0) {
          if (!cancelled) { setMembers([]); setLoading(false); }
          return;
        }

        // 2. Filter to students only
        const userIds = groupProfiles.map((p) => p.user_id);
        const { data: roles, error: rolesError } = await supabase
          .from("user_roles")
          .select("user_id")
          .in("user_id", userIds)
          .eq("role", "student");

        if (rolesError) throw rolesError;

        const studentIds = new Set((roles ?? []).map((r) => r.user_id));
        const studentProfiles = groupProfiles.filter((p) =>
          studentIds.has(p.user_id)
        );

        if (studentProfiles.length === 0) {
          if (!cancelled) { setMembers([]); setLoading(false); }
          return;
        }

        // 3. Fetch diagnostics results for students
        const ids = studentProfiles.map((p) => p.user_id);
        const { data: results, error: resultsError } = await supabase
          .from("diagnostics_results")
          .select(
            "user_id, cognitive_score, soft_score, professional_score, adaptability_score, average_score, completed_at"
          )
          .in("user_id", ids)
          .order("completed_at", { ascending: false });

        if (resultsError) throw resultsError;

        // 4. Keep only latest result per student
        const latestByUser = new Map<string, (typeof results)[number]>();
        for (const r of results ?? []) {
          if (!latestByUser.has(r.user_id)) {
            latestByUser.set(r.user_id, r);
          }
        }

        // 5. Build member list sorted by total score descending
        const memberList: GroupMember[] = studentProfiles.map((p) => {
          const r = latestByUser.get(p.user_id);
          return {
            userId: p.user_id,
            name: p.full_name || p.user_id.slice(0, 8),
            avatarUrl: p.avatar_url ?? null,
            cognitive: r ? Math.round(r.cognitive_score) : 0,
            soft: r ? Math.round(r.soft_score) : 0,
            professional: r ? Math.round(r.professional_score) : 0,
            adaptability: r ? Math.round(r.adaptability_score) : 0,
            total: r ? Math.round(r.average_score) : 0,
            completedAt: r?.completed_at ?? null,
          };
        });

        memberList.sort((a, b) => b.total - a.total);

        if (!cancelled) {
          setMembers(memberList);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setLoading(false);
        }
      }
    };

    fetchMembers();

    return () => {
      cancelled = true;
    };
  }, [user, groupName]);

  return { members, loading, error, groupName };
}
