// ─────────────────────────────────────────────────────────────────────────────
// infoCommScoringEngine.ts
// Scoring engine for Information & Communicative Competence diagnostics
// 5 components × 8 questions = 40 questions
// ─────────────────────────────────────────────────────────────────────────────

import {
  infoCommQuestions,
  infoCommCategoryLabelsRu,
  infoCommCategoryLabels,
  INFOCOMM_CATEGORY_WEIGHTS,
  getInfoCommMaxCategoryScore,
  applyInfoCommReversal,
  getInfoCommQuestionsByCategory,
} from "@/data/infoCommQuestions";
import type { InfoCommCategory } from "@/data/infoCommQuestions";
import { runAntiCheatDetection, applyAntiCheatPenalty } from "./antiCheatDetection";
import type { TimingData, AntiCheatReport, AntiCheatQuestionConfig } from "./antiCheatDetection";

// ─── Anti-cheat config for infocomm questions ───────────────────────────────

const infoCommAntiCheatConfig: AntiCheatQuestionConfig = {
  questions: infoCommQuestions,
  applyReversal: applyInfoCommReversal,
  getQuestionsByCategory: getInfoCommQuestionsByCategory as () => Record<string, { id: number; isReversed: boolean }[]>,
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type SkillLevel = "beginner" | "basic" | "advanced" | "expert";

export type InfoCommProfile =
  | "info_seeker"       // высокий мотивационный + когнитивный
  | "communicator"      // высокий деятельностный + нәтижелік
  | "reflective_learner" // высокий рефлексивный
  | "digital_native"    // высокий когнитивный + деятельностный
  | "balanced_competent" // все высокие
  | "emerging_learner"  // все низкие
  | "specialist_info";  // один компонент сильно доминирует

export interface InfoCommCategoryResult {
  category: InfoCommCategory;
  label: string;
  rawScore: number;
  level: SkillLevel;
  questionScores: { id: number; adjusted: number; weight: number }[];
  internalVariance: number;
  weightedContribution: number;
}

export interface InfoCommRadarDataPoint {
  category: string;
  value: number;
  fullMark: number;
}

export interface InfoCommDiagnosticsResult {
  timestamp: string;
  categories: InfoCommCategoryResult[];
  overallScore: number;
  rawConfidence: number;
  adjustedConfidence: number;
  antiCheat: AntiCheatReport;
  dominantProfile: InfoCommProfile;
  strengthAreas: InfoCommCategory[];
  growthAreas: InfoCommCategory[];
  radarData: InfoCommRadarDataPoint[];
  isFlagged: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSkillLevel(score: number): SkillLevel {
  if (score >= 75) return "expert";
  if (score >= 50) return "advanced";
  if (score >= 25) return "basic";
  return "beginner";
}

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
  category: InfoCommCategory,
  answers: Record<number, number>,
  lang: "ru" | "kz" = "ru"
): InfoCommCategoryResult {
  const qs = getInfoCommQuestionsByCategory()[category] ?? [];

  const questionScores = qs.map(q => {
    const raw = answers[q.id] ?? 1;
    const adjusted = applyInfoCommReversal(raw, q.isReversed);
    return { id: q.id, adjusted, weight: q.weight };
  });

  const weightedSum = questionScores.reduce((sum, qs) => sum + qs.adjusted * qs.weight, 0);
  const maxPossible = getInfoCommMaxCategoryScore(category);
  const rawScore = maxPossible > 0 ? (weightedSum / maxPossible) * 100 : 0;

  const categoryWeight = INFOCOMM_CATEGORY_WEIGHTS[category];
  const labels = lang === "kz" ? infoCommCategoryLabels : infoCommCategoryLabelsRu;

  return {
    category,
    label: labels[category],
    rawScore: Math.round(rawScore * 10) / 10,
    level: getSkillLevel(rawScore),
    questionScores,
    internalVariance: Math.round(variance(questionScores.map(q => q.adjusted)) * 100) / 100,
    weightedContribution: rawScore * categoryWeight,
  };
}

// ─── Confidence ──────────────────────────────────────────────────────────────

function calculateRawConfidence(
  answers: Record<number, number>,
  categories: InfoCommCategoryResult[]
): number {
  const total = infoCommQuestions.length;
  const answered = Object.keys(answers).length;

  const completeness = answered / total;
  const avgVariance = average(categories.map(c => c.internalVariance));
  const varianceFactor = Math.min(1, avgVariance / 1.2);
  const uniqueValues = new Set(Object.values(answers)).size;
  const diversityFactor = Math.min(1, uniqueValues / 4);

  const confidence = completeness * 0.55 + varianceFactor * 0.30 + diversityFactor * 0.15;
  return Math.round(Math.min(1, confidence) * 100) / 100;
}

// ─── Profile Pattern ─────────────────────────────────────────────────────────

function determineProfile(categories: InfoCommCategoryResult[]): InfoCommProfile {
  const s = Object.fromEntries(
    categories.map(c => [c.category, c.rawScore])
  ) as Record<InfoCommCategory, number>;

  const values = Object.values(s);
  const avg = average(values);
  const spread = Math.max(...values) - Math.min(...values);

  if (avg >= 72) return "balanced_competent";
  if (avg < 30) return "emerging_learner";
  if (spread > 35) return "specialist_info";

  if (s.motivational >= 65 && s.cognitive_info >= 65) return "info_seeker";
  if (s.activity >= 65 && s.outcome >= 65) return "communicator";
  if (s.reflective >= 65) return "reflective_learner";
  if (s.cognitive_info >= 65 && s.activity >= 65) return "digital_native";

  return "balanced_competent";
}

// ─── Main Entry ──────────────────────────────────────────────────────────────

export function runInfoCommScoringEngine(
  answers: Record<number, number>,
  timing?: TimingData,
  lang: "ru" | "kz" = "ru"
): InfoCommDiagnosticsResult {
  // 1. Anti-cheat with infocomm-specific config
  const antiCheat = runAntiCheatDetection(answers, timing, infoCommAntiCheatConfig);

  // 2. Category scores
  const allCategories: InfoCommCategory[] = [
    "motivational", "cognitive_info", "activity", "reflective", "outcome"
  ];
  const categories = allCategories.map(cat => scoreCategoryWeighted(cat, answers, lang));

  // 3. Composite score
  const totalWeight = Object.values(INFOCOMM_CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0);
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
  const dominantProfile = determineProfile(categories);

  // 6. Radar
  const radarData: InfoCommRadarDataPoint[] = categories.map(c => ({
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
    dominantProfile,
    strengthAreas,
    growthAreas,
    radarData,
    isFlagged: !antiCheat.passed || antiCheat.recommendation !== "valid",
  };
}

// ─── Backward-compatible helper ──────────────────────────────────────────────

export function getInfoCommResultsCompat(
  answers: Record<number, number>,
  timing?: TimingData,
  lang: "ru" | "kz" = "ru"
) {
  const result = runInfoCommScoringEngine(answers, timing, lang);
  return {
    results: result.categories.map(c => ({
      category: c.category,
      label: c.label,
      score: Math.round(c.rawScore),
    })),
    fullResult: result,
  };
}
