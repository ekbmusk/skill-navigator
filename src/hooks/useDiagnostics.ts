import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export interface DiagnosticsScore {
    category: string;
    label: string;
    score: number;
}

export interface DiagnosticsResult {
    cognitive: number;
    soft: number;
    professional: number;
    adaptability: number;
    average: number;
}

export interface SaveDiagnosticsParams {
    answers: Record<number, number>;
    scores: DiagnosticsResult;
    testType?: string;
}

export const useDiagnostics = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Save diagnostics results to Supabase
     */
    const saveDiagnosticsResult = async (params: SaveDiagnosticsParams) => {
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
            const { scores, answers, testType } = params;

            const answersWithMeta = testType
                ? { ...answers, _test_type: testType }
                : answers;

            const result: TablesInsert<"diagnostics_results"> = {
                user_id: user.id,
                cognitive_score: scores.cognitive,
                soft_score: scores.soft,
                professional_score: scores.professional,
                adaptability_score: scores.adaptability,
                average_score: scores.average,
                answers: answersWithMeta,
            };

            const { data, error: supabaseError } = await supabase
                .from("diagnostics_results")
                .insert([result])
                .select()
                .single();

            if (supabaseError) {
                setError(supabaseError.message);
                return null;
            }

            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Load latest diagnostics results for current user
     */
    const loadLatestResults = async () => {
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
                .from("diagnostics_results")
                .select("*")
                .eq("user_id", user.id)
                .order("completed_at", { ascending: false })
                .limit(1)
                .single();

            if (supabaseError && supabaseError.code !== "PGRST116") {
                // PGRST116 is "no rows found"
                setError(supabaseError.message);
                return null;
            }

            return data || null;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Load all diagnostics results for current user
     */
    const loadAllResults = async () => {
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
                .from("diagnostics_results")
                .select("*")
                .eq("user_id", user.id)
                .order("completed_at", { ascending: false });

            if (supabaseError) {
                setError(supabaseError.message);
                return [];
            }

            return data || [];
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(errorMessage);
            return [];
        } finally {
            setLoading(false);
        }
    };

    /**
     * Load diagnostics results for a specific student (teachers only)
     */
    const loadStudentResults = async (studentId: string) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: supabaseError } = await supabase
                .from("diagnostics_results")
                .select("*")
                .eq("user_id", studentId)
                .order("completed_at", { ascending: false });

            if (supabaseError) {
                setError(supabaseError.message);
                return [];
            }

            return data || [];
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(errorMessage);
            return [];
        } finally {
            setLoading(false);
        }
    };

    /**
     * Generate CSV content from diagnostics result
     */
    const generateCSV = (result: Tables<"diagnostics_results">, userName: string = "User"): string => {
        const timestamp = new Date(result.completed_at).toLocaleString();

        const headers = ["Категория", "Балл"];
        const rows = [
            ["Когнитивті дағдылар", result.cognitive_score],
            ["Soft Skills", result.soft_score],
            ["Кәсіби дағдылар", result.professional_score],
            ["Бейімделгіштік", result.adaptability_score],
            ["Жалпы балл", result.average_score],
        ];

        const csv = [
            `Диагностика нәтижелері - ${userName}`,
            `Уақыты: ${timestamp}`,
            "",
            headers.join(","),
            ...rows.map((row) => row.join(",")),
        ].join("\n");

        return csv;
    };

    /**
     * Download diagnostics results as CSV
     */
    const downloadAsCSV = (result: Tables<"diagnostics_results">, userName: string = "User") => {
        const csv = generateCSV(result, userName);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        const timestamp = new Date(result.completed_at).toISOString().split("T")[0];
        link.setAttribute("href", url);
        link.setAttribute("download", `diagnostics_${timestamp}.csv`);
        link.style.visibility = "hidden";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    /**
     * Compute trend from an array of diagnostics results
     * Results should be ordered by completed_at descending (newest first)
     */
    const computeTrend = (results: Tables<"diagnostics_results">[]): "improving" | "declining" | "stable" => {
        if (results.length < 2) return "stable";
        // Sort ascending by date for comparison
        const sorted = [...results].sort(
            (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
        );
        const first = sorted[0].average_score;
        const last = sorted[sorted.length - 1].average_score;
        const diff = last - first;
        if (diff >= 3) return "improving";
        if (diff <= -3) return "declining";
        return "stable";
    };

    return {
        loading,
        error,
        saveDiagnosticsResult,
        loadLatestResults,
        loadAllResults,
        loadStudentResults,
        downloadAsCSV,
        generateCSV,
        computeTrend,
    };
};
