// ─────────────────────────────────────────────────────────────────────────────
// physicsScoringEngine.ts
// Scoring engine for physics diagnostics with anti-cheat integration
// ─────────────────────────────────────────────────────────────────────────────

import {
  physicsQuestions,
  physicsCategoryLabels,
  PHYSICS_CATEGORY_WEIGHTS,
  getPhysicsMaxCategoryScore,
  applyPhysicsReversal,
  getPhysicsQuestionsByCategory,
} from "@/data/physicsQuestions";
import type { PhysicsCategory } from "@/data/physicsQuestions";
import { runAntiCheatDetection, applyAntiCheatPenalty } from "./antiCheatDetection";
import type { TimingData, AntiCheatReport, AntiCheatQuestionConfig } from "./antiCheatDetection";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PhysicsSkillLevel = "beginner" | "basic" | "advanced" | "expert";

export type PhysicsProfile =
  | "mechanics_expert"
  | "thermo_specialist"
  | "em_specialist"
  | "optics_specialist"
  | "balanced_physicist"
  | "emerging_physicist"
  | "specialist_physics";

export interface PhysicsCategoryResult {
  category: PhysicsCategory;
  label: string;
  rawScore: number;
  level: PhysicsSkillLevel;
  questionScores: { id: number; adjusted: number; weight: number }[];
  internalVariance: number;
  weightedContribution: number;
}

export interface PhysicsRadarDataPoint {
  category: string;
  value: number;
  fullMark: number;
}

export interface PhysicsDiagnosticsResult {
  timestamp: string;
  categories: PhysicsCategoryResult[];
  overallScore: number;
  rawConfidence: number;
  adjustedConfidence: number;
  antiCheat: AntiCheatReport;
  dominantProfile: PhysicsProfile;
  strengthAreas: PhysicsCategory[];
  growthAreas: PhysicsCategory[];
  radarData: PhysicsRadarDataPoint[];
  isFlagged: boolean;
}

// ─── Anti-cheat config for physics questions ────────────────────────────────

const physicsAntiCheatConfig: AntiCheatQuestionConfig = {
  questions: physicsQuestions,
  applyReversal: applyPhysicsReversal,
  getQuestionsByCategory: getPhysicsQuestionsByCategory as () => Record<string, { id: number; isReversed: boolean }[]>,
};

// ─── Level Thresholds ────────────────────────────────────────────────────────

function getSkillLevel(score: number): PhysicsSkillLevel {
  if (score >= 75) return "expert";
  if (score >= 50) return "advanced";
  if (score >= 25) return "basic";
  return "beginner";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
  category: PhysicsCategory,
  answers: Record<number, number>
): PhysicsCategoryResult {
  const qs = getPhysicsQuestionsByCategory()[category] ?? [];

  const questionScores = qs.map(q => {
    const raw = answers[q.id] ?? 1;
    const adjusted = applyPhysicsReversal(raw, q.isReversed);
    return { id: q.id, adjusted, weight: q.weight };
  });

  const weightedSum = questionScores.reduce((sum, qs) => sum + qs.adjusted * qs.weight, 0);
  const maxPossible = getPhysicsMaxCategoryScore(category);
  const rawScore = maxPossible > 0 ? (weightedSum / maxPossible) * 100 : 0;

  const categoryWeight = PHYSICS_CATEGORY_WEIGHTS[category];

  return {
    category,
    label: physicsCategoryLabels[category],
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
  categories: PhysicsCategoryResult[]
): number {
  const total = physicsQuestions.length;
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

function determineProfile(categories: PhysicsCategoryResult[]): PhysicsProfile {
  const s = Object.fromEntries(
    categories.map(c => [c.category, c.rawScore])
  ) as Record<PhysicsCategory, number>;

  const values = Object.values(s);
  const avg = average(values);
  const spread = Math.max(...values) - Math.min(...values);

  if (avg >= 72) return "balanced_physicist";
  if (avg < 30) return "emerging_physicist";
  if (spread > 35) return "specialist_physics";

  if (s.mechanics >= 65) return "mechanics_expert";
  if (s.thermodynamics >= 65) return "thermo_specialist";
  if (s.electromagnetism >= 65) return "em_specialist";
  if (s.optics_waves >= 65) return "optics_specialist";

  return "balanced_physicist";
}

// ─── Main Entry ──────────────────────────────────────────────────────────────

export function runPhysicsScoringEngine(
  answers: Record<number, number>,
  timing?: TimingData
): PhysicsDiagnosticsResult {
  // 1. Anti-cheat with physics-specific config
  const antiCheat = runAntiCheatDetection(answers, timing, physicsAntiCheatConfig);

  // 2. Category scores
  const categories: PhysicsCategoryResult[] = (
    Object.keys(PHYSICS_CATEGORY_WEIGHTS) as PhysicsCategory[]
  ).map(cat => scoreCategoryWeighted(cat, answers));

  // 3. Composite score
  const totalWeight = Object.values(PHYSICS_CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0);
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
  const radarData: PhysicsRadarDataPoint[] = categories.map(c => ({
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

export function getPhysicsResultsCompat(
  answers: Record<number, number>,
  timing?: TimingData
) {
  const result = runPhysicsScoringEngine(answers, timing);
  return {
    results: result.categories.map(c => ({
      category: c.category,
      label: c.label,
      score: Math.round(c.rawScore),
    })),
    fullResult: result,
  };
}
