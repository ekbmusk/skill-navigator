import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Resource {
  id: string;
  title: string;
  title_kz: string;
  description: string;
  description_kz: string;
  category: string;
  resource_type: string;
  url: string | null;
  difficulty: string;
  duration_minutes: number | null;
  tags: string[];
  sort_order: number;
  created_at: string;
}

export interface ResourceFilters {
  category?: string;
  resource_type?: string;
  difficulty?: string;
}

export const useResources = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadResources = async (filters?: ResourceFilters): Promise<Resource[]> => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("resources" as any)
        .select("*")
        .order("sort_order", { ascending: true });

      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.resource_type) {
        query = query.eq("resource_type", filters.resource_type);
      }
      if (filters?.difficulty) {
        query = query.eq("difficulty", filters.difficulty);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        setError(supabaseError.message);
        return [];
      }

      return (data || []).map((row: any) => ({
        ...row,
        tags: Array.isArray(row.tags) ? row.tags : [],
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const loadResourcesByCategory = async (category: string, limit = 3): Promise<Resource[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from("resources" as any)
        .select("*")
        .eq("category", category)
        .order("sort_order", { ascending: true })
        .limit(limit);

      if (supabaseError) {
        setError(supabaseError.message);
        return [];
      }

      return (data || []).map((row: any) => ({
        ...row,
        tags: Array.isArray(row.tags) ? row.tags : [],
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, loadResources, loadResourcesByCategory };
};
