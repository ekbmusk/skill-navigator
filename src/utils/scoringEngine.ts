// ─────────────────────────────────────────────────────────────────────────────
// scoringEngine.ts
// Обновлённый движок: weighted scoring + anti-cheat интеграция
// ─────────────────────────────────────────────────────────────────────────────

import {
    questions,
    categoryLabels,
    CATEGORY_WEIGHTS,
    getMaxCategoryScore,
    applyReversal,
    getQuestionsByCategory,
} from "@/data/diagnosticsQuestions";
import type { Category } from "@/data/diagnosticsQuestions";
import { runAntiCheatDetection, applyAntiCheatPenalty } from "./antiCheatDetection";
import type { TimingData, AntiCheatReport } from "./antiCheatDetection";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SkillLevel = "beginner" | "basic" | "advanced" | "expert";

export type ProfilePattern =
    | "analytical_thinker"
    | "team_player"
    | "self_organizer"
    | "change_agent"
    | "balanced_performer"
    | "emerging_talent"
    | "specialist";

export interface CategoryResult {
    category: Category;
    label: string;
    rawScore: number;   // 0–100, с учётом весов вопросов и reversal
    level: SkillLevel;
    questionScores: { id: number; adjusted: number; weight: number }[];
    internalVariance: number;
    weightedContribution: number; // вклад в composite score
}

export interface RadarDataPoint {
    category: string;
    value: number;
    fullMark: number;
}

export interface DiagnosticsResult {
    timestamp: string;
    categories: CategoryResult[];
    overallScore: number;
    rawConfidence: number;   // до anti-cheat штрафа
    adjustedConfidence: number;   // после штрафа
    antiCheat: AntiCheatReport;
    dominantPattern: ProfilePattern;
    strengthAreas: Category[];
    growthAreas: Category[];
    radarData: RadarDataPoint[];
    /** true если результаты технически посчитаны, но доверие низкое */
    isFlagged: boolean;
}

// ─── Level Thresholds ────────────────────────────────────────────────────────

function getSkillLevel(score: number): SkillLevel {
    if (score >= 75) return "expert";
    if (score >= 50) return "advanced";
    if (score >= 25) return "basic";
    return "beginner";
}

// ─── Variance ────────────────────────────────────────────────────────────────

function variance(arr: number[]): number {
    if (arr.length < 2) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((sum, x) => sum + (x - mean) ** 2, 0) / arr.length;
}

function average(arr: number[]): number {
    return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

// ─── Category Scoring ────────────────────────────────────────────────────────

function scoreCategoryWeighted(
    category: Category,
    answers: Record<number, number>
): CategoryResult {
    const qs = getQuestionsByCategory()[category] ?? [];

    const questionScores = qs.map(q => {
        const raw = answers[q.id] ?? 1;
        const adjusted = applyReversal(raw, q.isReversed);
        return { id: q.id, adjusted, weight: q.weight };
    });

    const weightedSum = questionScores.reduce((sum, qs) => sum + qs.adjusted * qs.weight, 0);
    const maxPossible = getMaxCategoryScore(category);
    const rawScore = maxPossible > 0 ? (weightedSum / maxPossible) * 100 : 0;

    const categoryWeight = CATEGORY_WEIGHTS[category];

    return {
        category,
        label: categoryLabels[category],
        rawScore: Math.round(rawScore * 10) / 10,
        level: getSkillLevel(rawScore),
        questionScores,
        internalVariance: Math.round(variance(questionScores.map(q => q.adjusted)) * 100) / 100,
        weightedContribution: rawScore * categoryWeight,
    };
}

// ─── Confidence Score ─────────────────────────────────────────────────────────

function calculateRawConfidence(
    answers: Record<number, number>,
    categories: CategoryResult[]
): number {
    const total = questions.length;
    const answered = Object.keys(answers).length;

    // 1. Completeness (60%)
    const completeness = answered / total;

    // 2. Average intra-category variance — низкая однородность снижает доверие
    // Идеально: каждый вопрос отвечен по-разному (variance ≈ 1–2)
    const avgVariance = average(categories.map(c => c.internalVariance));
    // Нормализуем: variance 0 → подозрение, variance ~1.5 → норма
    const varianceFactor = Math.min(1, avgVariance / 1.2);

    // 3. Unique values across all answers
    const uniqueValues = new Set(Object.values(answers)).size;
    const diversityFactor = Math.min(1, uniqueValues / 4);

    const confidence = completeness * 0.55 + varianceFactor * 0.30 + diversityFactor * 0.15;
    return Math.round(Math.min(1, confidence) * 100) / 100;
}

// ─── Profile Pattern ──────────────────────────────────────────────────────────

function determineProfilePattern(categories: CategoryResult[]): ProfilePattern {
    const s = Object.fromEntries(
        categories.map(c => [c.category, c.rawScore])
    ) as Record<Category, number>;

    const values = Object.values(s);
    const avg = average(values);
    const spread = Math.max(...values) - Math.min(...values);

    if (avg >= 72) return "balanced_performer";
    if (avg < 30) return "emerging_talent";
    if (spread > 35) return "specialist";

    if (s.cognitive >= 65 && s.soft < 48) return "analytical_thinker";
    if (s.soft >= 65 && s.cognitive < 58) return "team_player";
    if (s.professional >= 65) return "self_organizer";
    if (s.adaptability >= 65) return "change_agent";

    return "balanced_performer";
}

// ─── Main Entry ──────────────────────────────────────────────────────────────

/**
 * Запустить полный scoring с anti-cheat проверкой.
 *
 * @example
 * const result = runScoringEngine(answers, timing);
 * if (!result.antiCheat.passed) showWarning(result.antiCheat.summary);
 */
export function runScoringEngine(
    answers: Record<number, number>,
    timing?: TimingData
): DiagnosticsResult {

    // 1. Anti-cheat
    const antiCheat = runAntiCheatDetection(answers, timing);

    // 2. Category scores
    const categories: CategoryResult[] = (Object.keys(CATEGORY_WEIGHTS) as Category[]).map(
        cat => scoreCategoryWeighted(cat, answers)
    );

    // 3. Composite score
    const totalWeight = Object.values(CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0);
    const overallScore = Math.round(
        (categories.reduce((sum, c) => sum + c.weightedContribution, 0) / totalWeight) * 10
    ) / 10;

    // 4. Confidence
    const rawConfidence = calculateRawConfidence(answers, categories);
    const adjustedConfidence = applyAntiCheatPenalty(rawConfidence, antiCheat);

    // 5. Profile
    const sorted = [...categories].sort((a, b) => b.rawScore - a.rawScore);
    const strengthAreas = sorted.slice(0, 2).map(c => c.category);
    const growthAreas = sorted.slice(-2).map(c => c.category);
    const dominantPattern = determineProfilePattern(categories);

    // 6. Radar
    const radarData: RadarDataPoint[] = categories.map(c => ({
        category: c.label,
        value: Math.round(c.rawScore),
        fullMark: 100,
    }));

    return {
        timestamp: new Date().toISOString(),
        categories,
        overallScore,
        rawConfidence,
        adjustedConfidence,
        antiCheat,
        dominantPattern,
        strengthAreas,
        growthAreas,
        radarData,
        isFlagged: !antiCheat.passed || antiCheat.recommendation !== "valid",
    };
}

// ─── Backward-compatible helper (для DiagnosticsPage.tsx) ────────────────────

/**
 * Совместимая замена для getResults() из DiagnosticsPage.
 * Возвращает простой массив {category, label, score} как раньше,
 * плюс расширенные данные.
 */
export function getResultsCompat(answers: Record<number, number>, timing?: TimingData) {
    const result = runScoringEngine(answers, timing);
    return {
        /** Массив результатов в формате, ожидаемом DiagnosticsResults.tsx */
        results: result.categories.map(c => ({
            category: c.category,
            label: c.label,
            score: Math.round(c.rawScore),
        })),
        /** Полный расширенный результат */
        fullResult: result,
    };
}
