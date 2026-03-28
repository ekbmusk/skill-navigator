// ─────────────────────────────────────────────────────────────────────────────
// antiCheatDetection.ts
// Многоуровневая система обнаружения недобросовестных ответов
// ─────────────────────────────────────────────────────────────────────────────

import { questions as defaultQuestions, applyReversal as defaultApplyReversal, getQuestionsByCategory as defaultGetQuestionsByCategory } from "@/data/diagnosticsQuestions";
import type { DiagnosticsQuestion } from "@/data/diagnosticsQuestions";

// ─── Types ───────────────────────────────────────────────────────────────────

/** Generic question config so anti-cheat works with any diagnostics test */
export interface AntiCheatQuestionConfig {
    questions: { id: number; category: string; isReversed: boolean }[];
    applyReversal: (rawScore: number, isReversed: boolean) => number;
    getQuestionsByCategory: () => Record<string, { id: number; isReversed: boolean }[]>;
}

export type ViolationSeverity = "low" | "medium" | "high" | "critical";

export interface Violation {
    code: string;
    severity: ViolationSeverity;
    description: string;
    affectedIds: number[];
    evidence: string;
}

export interface AntiCheatReport {
    /** Прошёл ли тест проверку (допустимое качество ответов) */
    passed: boolean;
    /** Итоговый уровень подозрения: 0 (чисто) → 1 (точно жульничество) */
    suspicionScore: number;
    /** Насколько снизить доверие к результатам: 0 (не снижать) → 1 (обнулить) */
    confidencePenalty: number;
    violations: Violation[];
    summary: string;
    recommendation: "valid" | "warn_user" | "flag_for_review" | "invalidate";
}

export interface TimingData {
    /** Время начала теста в мс (Date.now()) */
    startTime: number;
    /** Время конца теста в мс */
    endTime: number;
    /** Время ответа на каждый вопрос: Record<questionId, ms> */
    perQuestionMs: Record<number, number>;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const THRESHOLDS = {
    /** Минимальное адекватное время ответа на один вопрос (мс) */
    MIN_QUESTION_MS: 2_500,
    /** Минимальное общее время прохождения теста (мс) */
    MIN_TOTAL_MS: 90_000,           // 1.5 минуты
    /** Максимальное разумное время (после — вероятно, ушёл и вернулся) */
    MAX_TOTAL_MS: 45 * 60_000,      // 45 минут
    /** Допустимая доля вопросов с подозрительно быстрым ответом */
    MAX_FAST_ANSWER_RATIO: 0.25,
    /** Минимальное число уникальных значений ответов */
    MIN_UNIQUE_ANSWER_VALUES: 2,
    /** Порог нарушения паттерна прямых/обратных вопросов */
    REVERSED_INCONSISTENCY_THRESHOLD: 3,
    /** Максимально допустимый suspicionScore для прохождения */
    PASS_THRESHOLD: 0.45,
    /** Порог для флага ревью */
    REVIEW_THRESHOLD: 0.65,
};

// ─── Utility ─────────────────────────────────────────────────────────────────

function variance(arr: number[]): number {
    if (arr.length < 2) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((sum, x) => sum + (x - mean) ** 2, 0) / arr.length;
}

function average(arr: number[]): number {
    return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function countRuns(arr: number[]): number {
    let runs = 1;
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] !== arr[i - 1]) runs++;
    }
    return runs;
}

// ─── Individual Checks ───────────────────────────────────────────────────────

/**
 * CHECK 1: Straight-lining
 * Все или почти все ответы одинаковые → автоматическое нажатие
 */
function checkStraightLining(answers: Record<number, number>): Violation | null {
    const values = Object.values(answers);
    if (values.length < 4) return null;

    const counts = values.reduce((acc, v) => {
        acc[v] = (acc[v] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    const maxCount = Math.max(...Object.values(counts));
    const dominantRatio = maxCount / values.length;
    const dominantValue = Number(
        Object.entries(counts).find(([, c]) => c === maxCount)?.[0]
    );

    if (dominantRatio >= 0.85) {
        return {
            code: "STRAIGHT_LINE",
            severity: "critical",
            description: "Подозрение на straight-lining: один вариант ответа выбран в ≥85% случаев",
            affectedIds: Object.entries(answers)
                .filter(([, v]) => v === dominantValue)
                .map(([id]) => Number(id)),
            evidence: `Вариант ${dominantValue} выбран ${maxCount}/${values.length} раз (${Math.round(dominantRatio * 100)}%)`,
        };
    }

    if (dominantRatio >= 0.70) {
        return {
            code: "NEAR_STRAIGHT_LINE",
            severity: "medium",
            description: "Слабое разнообразие ответов: один вариант выбран в ≥70% случаев",
            affectedIds: [],
            evidence: `Вариант ${dominantValue} выбран ${maxCount}/${values.length} раз`,
        };
    }

    return null;
}

/**
 * CHECK 2: Pattern detection
 * Ответы образуют регулярный паттерн: 1,2,3,4,1,2,3,4 или 4,3,2,1 и т.д.
 */
function checkPatternResponses(answers: Record<number, number>, cfg: AntiCheatQuestionConfig): Violation | null {
    const orderedAnswers = cfg.questions
        .map(q => answers[q.id])
        .filter((v): v is number => v !== undefined);

    if (orderedAnswers.length < 8) return null;

    const runs = countRuns(orderedAnswers);
    const minPossibleRuns = orderedAnswers.length / 4; // идеальный паттерн из 4 значений
    const runRatio = runs / orderedAnswers.length;

    // Паттерн 1,2,3,4 повторяющийся
    let periodicScore = 0;
    const periods = [4, 3, 2];
    for (const p of periods) {
        let matches = 0;
        for (let i = p; i < orderedAnswers.length; i++) {
            if (orderedAnswers[i] === orderedAnswers[i - p]) matches++;
        }
        const matchRatio = matches / (orderedAnswers.length - p);
        if (matchRatio > 0.6) periodicScore = Math.max(periodicScore, matchRatio);
    }

    if (periodicScore > 0.7) {
        return {
            code: "PERIODIC_PATTERN",
            severity: "high",
            description: `Обнаружен периодический паттерн ответов (совпадений: ${Math.round(periodicScore * 100)}%)`,
            affectedIds: cfg.questions.map(q => q.id),
            evidence: `Периодический паттерн с коэффициентом ${periodicScore.toFixed(2)}`,
        };
    }

    // Монотонное возрастание или убывание
    const ascending = orderedAnswers.every((v, i) => i === 0 || v >= orderedAnswers[i - 1]);
    const descending = orderedAnswers.every((v, i) => i === 0 || v <= orderedAnswers[i - 1]);
    if (ascending || descending) {
        return {
            code: "MONOTONIC_PATTERN",
            severity: "high",
            description: `Ответы монотонно ${ascending ? "возрастают" : "убывают"}`,
            affectedIds: cfg.questions.map(q => q.id),
            evidence: `Направление: ${ascending ? "↑" : "↓"}`,
        };
    }

    return null;
}

/**
 * CHECK 3: Reversed question inconsistency
 * Студент отвечает высоко на прямой И высоко на обратный вопрос одной категории
 * (либо низко на оба) — логическое противоречие
 */
function checkReversedInconsistency(answers: Record<number, number>, cfg: AntiCheatQuestionConfig): Violation | null {
    const byCategory = cfg.getQuestionsByCategory();
    const violations: number[] = [];
    const details: string[] = [];

    for (const [cat, qs] of Object.entries(byCategory)) {
        const reversed = qs.filter(q => q.isReversed);
        const normal = qs.filter(q => !q.isReversed);

        for (const rq of reversed) {
            const rRaw = answers[rq.id];
            if (rRaw === undefined) continue;
            const rAdjusted = cfg.applyReversal(rRaw, true); // инвертированный

            for (const nq of normal) {
                const nRaw = answers[nq.id];
                if (nRaw === undefined) continue;

                // Противоречие: разрыв между скорректированным обратным и прямым > 2
                const gap = Math.abs(rAdjusted - nRaw);
                if (gap >= 3) {
                    violations.push(rq.id, nq.id);
                    details.push(`[${cat}] Q${nq.id}(прямой=${nRaw}) vs Q${rq.id}(обр=${rRaw}→${rAdjusted}), разрыв=${gap}`);
                }
            }
        }
    }

    const uniqueViolations = [...new Set(violations)];

    if (uniqueViolations.length >= THRESHOLDS.REVERSED_INCONSISTENCY_THRESHOLD) {
        return {
            code: "REVERSED_INCONSISTENCY",
            severity: "high",
            description: "Логические противоречия между прямыми и обратными вопросами",
            affectedIds: uniqueViolations,
            evidence: details.join("; "),
        };
    }

    if (uniqueViolations.length >= 1) {
        return {
            code: "REVERSED_INCONSISTENCY_MINOR",
            severity: "low",
            description: "Небольшие расхождения между прямыми и обратными вопросами",
            affectedIds: uniqueViolations,
            evidence: details.join("; "),
        };
    }

    return null;
}

/**
 * CHECK 4: Extreme response style (ERS)
 * Студент выбирает только крайние варианты (1 или 4), игнорируя промежуточные
 */
function checkExtremeResponseStyle(answers: Record<number, number>): Violation | null {
    const values = Object.values(answers);
    if (values.length < 6) return null;

    const extremeCount = values.filter(v => v === 1 || v === 4).length;
    const extremeRatio = extremeCount / values.length;

    if (extremeRatio >= 0.90) {
        return {
            code: "EXTREME_RESPONSE_STYLE",
            severity: "medium",
            description: "Extreme Response Style: выбираются только крайние варианты (1 или 4)",
            affectedIds: Object.entries(answers)
                .filter(([, v]) => v === 1 || v === 4)
                .map(([id]) => Number(id)),
            evidence: `Крайние ответы: ${extremeCount}/${values.length} (${Math.round(extremeRatio * 100)}%)`,
        };
    }

    return null;
}

/**
 * CHECK 5: Intra-category variance
 * В одной категории все ответы одинаковые → нет дифференциации
 */
function checkIntraCategoryVariance(answers: Record<number, number>, cfg: AntiCheatQuestionConfig): Violation | null {
    const byCategory = cfg.getQuestionsByCategory();
    const flagged: string[] = [];

    for (const [cat, qs] of Object.entries(byCategory)) {
        const scores = qs
            .map(q => answers[q.id])
            .filter((v): v is number => v !== undefined);

        if (scores.length < 3) continue;

        const v = variance(scores);
        const uniqueVals = new Set(scores).size;

        if (uniqueVals === 1 && scores.length >= 3) {
            flagged.push(`${cat}(все=${scores[0]}, n=${scores.length})`);
        }
    }

    if (flagged.length >= 2) {
        return {
            code: "ZERO_INTRA_VARIANCE",
            severity: "high",
            description: "В нескольких категориях все ответы одинаковые",
            affectedIds: [],
            evidence: `Категории: ${flagged.join(", ")}`,
        };
    }

    if (flagged.length === 1) {
        return {
            code: "ZERO_INTRA_VARIANCE_SINGLE",
            severity: "low",
            description: "В одной категории все ответы одинаковые",
            affectedIds: [],
            evidence: flagged[0],
        };
    }

    return null;
}

/**
 * CHECK 6: Speed-based detection (требует TimingData)
 */
function checkSpeedAbuse(
    answers: Record<number, number>,
    timing: TimingData
): Violation | null {
    const totalMs = timing.endTime - timing.startTime;

    // Слишком быстро для всего теста
    if (totalMs < THRESHOLDS.MIN_TOTAL_MS) {
        return {
            code: "SPEED_TOO_FAST_TOTAL",
            severity: "critical",
            description: `Тест пройден подозрительно быстро (${Math.round(totalMs / 1000)}с)`,
            affectedIds: [],
            evidence: `Время: ${Math.round(totalMs / 1000)}с, минимум: ${THRESHOLDS.MIN_TOTAL_MS / 1000}с`,
        };
    }

    // Отдельные вопросы с ответом < MIN_QUESTION_MS
    const fastQuestions = Object.entries(timing.perQuestionMs)
        .filter(([, ms]) => ms < THRESHOLDS.MIN_QUESTION_MS)
        .map(([id]) => Number(id));

    const fastRatio = fastQuestions.length / Object.keys(timing.perQuestionMs).length;

    if (fastRatio > THRESHOLDS.MAX_FAST_ANSWER_RATIO) {
        return {
            code: "SPEED_TOO_FAST_QUESTIONS",
            severity: "high",
            description: `${fastQuestions.length} вопросов отвечены быстрее ${THRESHOLDS.MIN_QUESTION_MS / 1000}с`,
            affectedIds: fastQuestions,
            evidence: `Быстрые ответы: ${fastQuestions.length}/${Object.keys(timing.perQuestionMs).length} (${Math.round(fastRatio * 100)}%)`,
        };
    }

    return null;
}

/**
 * CHECK 7: Completeness
 * Пропущенные вопросы
 */
function checkCompleteness(answers: Record<number, number>, cfg: AntiCheatQuestionConfig): Violation | null {
    const total = cfg.questions.length;
    const answered = Object.keys(answers).length;
    const missing = total - answered;

    if (missing > 4) {
        return {
            code: "INCOMPLETE_CRITICAL",
            severity: "critical",
            description: `Не отвечено на ${missing} вопросов из ${total}`,
            affectedIds: cfg.questions
                .filter(q => answers[q.id] === undefined)
                .map(q => q.id),
            evidence: `Пропущено: ${missing}/${total}`,
        };
    }

    if (missing > 0) {
        return {
            code: "INCOMPLETE_MINOR",
            severity: "low",
            description: `Пропущено ${missing} вопрос(а)`,
            affectedIds: cfg.questions
                .filter(q => answers[q.id] === undefined)
                .map(q => q.id),
            evidence: `Пропущено: ${missing}/${total}`,
        };
    }

    return null;
}

// ─── Severity → Score ─────────────────────────────────────────────────────────

const SEVERITY_SCORES: Record<ViolationSeverity, number> = {
    low: 0.08,
    medium: 0.18,
    high: 0.30,
    critical: 0.50,
};

const SEVERITY_PENALTY: Record<ViolationSeverity, number> = {
    low: 0.05,
    medium: 0.15,
    high: 0.30,
    critical: 0.55,
};

// ─── Main Function ────────────────────────────────────────────────────────────

/** Default config using the general diagnostics questions */
const defaultConfig: AntiCheatQuestionConfig = {
    questions: defaultQuestions,
    applyReversal: defaultApplyReversal,
    getQuestionsByCategory: defaultGetQuestionsByCategory as () => Record<string, { id: number; isReversed: boolean }[]>,
};

/**
 * Запустить все anti-cheat проверки.
 * @param answers    Словарь {questionId: score}
 * @param timing     Опционально: данные о времени прохождения
 * @param config     Опционально: конфигурация вопросов (по умолчанию — общий тест)
 */
export function runAntiCheatDetection(
    answers: Record<number, number>,
    timing?: TimingData,
    config?: AntiCheatQuestionConfig
): AntiCheatReport {
    const cfg = config ?? defaultConfig;
    const rawViolations: (Violation | null)[] = [
        checkCompleteness(answers, cfg),
        checkStraightLining(answers),
        checkPatternResponses(answers, cfg),
        checkReversedInconsistency(answers, cfg),
        checkExtremeResponseStyle(answers),
        checkIntraCategoryVariance(answers, cfg),
        timing ? checkSpeedAbuse(answers, timing) : null,
    ];

    const violations = rawViolations.filter((v): v is Violation => v !== null);

    // Вычисляем итоговый suspicion score (накопительный, но не > 1)
    let suspicionScore = 0;
    let confidencePenalty = 0;

    for (const v of violations) {
        suspicionScore = Math.min(1, suspicionScore + SEVERITY_SCORES[v.severity]);
        confidencePenalty = Math.min(1, confidencePenalty + SEVERITY_PENALTY[v.severity]);
    }

    suspicionScore = Math.round(suspicionScore * 100) / 100;
    confidencePenalty = Math.round(confidencePenalty * 100) / 100;

    // Определяем рекомендацию
    let recommendation: AntiCheatReport["recommendation"];
    let passed: boolean;

    const hasCritical = violations.some(v => v.severity === "critical");
    const hasMultipleHigh = violations.filter(v => v.severity === "high").length >= 2;

    if (hasCritical || suspicionScore >= THRESHOLDS.REVIEW_THRESHOLD || hasMultipleHigh) {
        passed = false;
        recommendation = suspicionScore >= 0.85 ? "invalidate" : "flag_for_review";
    } else if (suspicionScore >= THRESHOLDS.PASS_THRESHOLD) {
        passed = true; // но с предупреждением
        recommendation = "warn_user";
    } else {
        passed = true;
        recommendation = "valid";
    }

    // Человекочитаемое резюме
    const summary = buildSummary(violations, suspicionScore, recommendation);

    return {
        passed,
        suspicionScore,
        confidencePenalty,
        violations,
        summary,
        recommendation,
    };
}

// ─── Summary Builder ─────────────────────────────────────────────────────────

function buildSummary(
    violations: Violation[],
    suspicionScore: number,
    recommendation: AntiCheatReport["recommendation"]
): string {
    if (violations.length === 0) {
        return "✅ Ответы выглядят достоверными. Паттернов нарушений не обнаружено.";
    }

    const messages: Record<AntiCheatReport["recommendation"], string> = {
        valid: `⚠️ Обнаружены незначительные признаки (${violations.length}). Результаты приняты с небольшой поправкой.`,
        warn_user: `⚠️ Обнаружены подозрительные паттерны ответов. Рекомендуем пройти тест внимательнее.`,
        flag_for_review: `🚩 Ответы помечены для проверки. Высокая вероятность недобросовестного прохождения (score=${suspicionScore}).`,
        invalidate: `❌ Результаты аннулированы: обнаружены критические нарушения (score=${suspicionScore}).`,
    };

    return messages[recommendation];
}

// ─── Export for scoring integration ──────────────────────────────────────────

/**
 * Применить штраф к confidence score на основе anti-cheat отчёта
 */
export function applyAntiCheatPenalty(
    baseConfidence: number,
    report: AntiCheatReport
): number {
    const adjusted = baseConfidence * (1 - report.confidencePenalty);
    return Math.round(Math.max(0, adjusted) * 100) / 100;
}
