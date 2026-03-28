import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { questions as generalQuestions, categoryLabels } from "@/data/diagnosticsQuestions";
import { physicsQuestions, physicsCategoryLabels } from "@/data/physicsQuestions";
import { infoCommQuestions, infoCommCategoryLabelsRu } from "@/data/infoCommQuestions";

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
                .order("completed_at", { ascending: false })
                .limit(50);

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
        const answers = (result.answers || {}) as Record<string, any>;
        const testType = answers._test_type || "general";

        // Pick question set and category labels based on test type
        const questionSet = testType === "physics"
            ? physicsQuestions
            : testType === "infocomm"
                ? infoCommQuestions
                : generalQuestions;

        const catLabels = testType === "physics"
            ? physicsCategoryLabels
            : testType === "infocomm"
                ? infoCommCategoryLabelsRu
                : categoryLabels;

        const testLabel = testType === "physics"
            ? "Физика"
            : testType === "infocomm"
                ? "Ақпараттық-коммуникативтік"
                : "Жалпы дағдылар";

        // Escape CSV value (wrap in quotes if contains comma or quote)
        const esc = (v: string) => {
            if (v.includes(",") || v.includes('"') || v.includes("\n")) {
                return `"${v.replace(/"/g, '""')}"`;
            }
            return v;
        };

        // Section 1: Summary
        const summaryRows = [
            `Диагностика нәтижелері - ${esc(userName)}`,
            `Тест түрі: ${testLabel}`,
            `Уақыты: ${timestamp}`,
            "",
            "Категория,Балл",
        ];

        // Map DB scores to category labels
        const scoreMapping: [string, number][] = testType === "physics"
            ? [
                [catLabels["mechanics" as keyof typeof catLabels] || "Механика", result.cognitive_score],
                [catLabels["thermodynamics" as keyof typeof catLabels] || "Термодинамика", result.soft_score],
                [catLabels["electromagnetism" as keyof typeof catLabels] || "Электромагнетизм", result.professional_score],
                [catLabels["optics_waves" as keyof typeof catLabels] || "Оптика", result.adaptability_score],
            ]
            : [
                [catLabels["cognitive" as keyof typeof catLabels] || "Когнитивті", result.cognitive_score],
                [catLabels["soft" as keyof typeof catLabels] || "Soft Skills", result.soft_score],
                [catLabels["professional" as keyof typeof catLabels] || "Кәсіби", result.professional_score],
                [catLabels["adaptability" as keyof typeof catLabels] || "Бейімделгіштік", result.adaptability_score],
            ];

        for (const [label, score] of scoreMapping) {
            summaryRows.push(`${esc(label)},${score}`);
        }
        summaryRows.push(`Жалпы балл,${result.average_score}`);

        // Section 2: Question-by-question breakdown
        const detailRows = [
            "",
            "",
            "№,Категория,Сұрақ,Таңдалған жауап,Балл,Макс балл,Ең жақсы жауап",
        ];

        for (const q of questionSet) {
            const chosenScore = answers[String(q.id)];
            if (chosenScore === undefined) continue;

            const catLabel = catLabels[q.category as keyof typeof catLabels] || q.category;
            const chosenOption = q.options.find((o: any) => o.score === chosenScore);
            const chosenLabel = chosenOption
                ? (chosenOption as any).labelKz || (chosenOption as any).label || `Балл ${chosenScore}`
                : `Балл ${chosenScore}`;
            const maxScore = Math.max(...q.options.map((o: any) => o.score));
            const bestOption = q.options.find((o: any) => o.score === maxScore);
            const bestLabel = bestOption
                ? (bestOption as any).labelKz || (bestOption as any).label || `Балл ${maxScore}`
                : `Балл ${maxScore}`;

            detailRows.push(
                `${q.id},${esc(catLabel)},${esc((q as any).textKz || q.text)},${esc(chosenLabel)},${chosenScore},${maxScore},${esc(bestLabel)}`
            );
        }

        return [...summaryRows, ...detailRows].join("\n");
    };

    /**
     * Download diagnostics results as CSV
     */
    const downloadAsCSV = (result: Tables<"diagnostics_results">, userName: string = "User") => {
        const csv = generateCSV(result, userName);
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
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
