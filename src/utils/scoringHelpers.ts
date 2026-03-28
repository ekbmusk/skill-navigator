// ─────────────────────────────────────────────────────────────────────────────
// scoringHelpers.ts
// Shared utility functions used across all scoring engines
// ─────────────────────────────────────────────────────────────────────────────

export type SkillLevel = "beginner" | "basic" | "advanced" | "expert";

export function getSkillLevel(score: number): SkillLevel {
  if (score >= 75) return "expert";
  if (score >= 50) return "advanced";
  if (score >= 25) return "basic";
  return "beginner";
}

export function variance(arr: number[]): number {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((sum, x) => sum + (x - mean) ** 2, 0) / arr.length;
}

export function average(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

/**
 * Compute raw confidence score from completeness, answer variance, and diversity.
 * Used identically across all three scoring engines.
 */
export function calculateRawConfidence(
  answeredCount: number,
  totalQuestions: number,
  categories: { internalVariance: number }[]
): number {
  const completeness = answeredCount / totalQuestions;
  const avgVariance = average(categories.map(c => c.internalVariance));
  // variance ~1.2 is considered normal response pattern
  const varianceFactor = Math.min(1, avgVariance / 1.2);

  return Math.round(Math.min(1, completeness * 0.55 + varianceFactor * 0.30 + 0.15) * 100) / 100;
}

/**
 * Calculate confidence with diversity factor (unique answer values).
 * Full version used when answer values are available.
 */
export function calculateRawConfidenceWithDiversity(
  answeredCount: number,
  totalQuestions: number,
  categories: { internalVariance: number }[],
  answers: Record<number, number>
): number {
  const completeness = answeredCount / totalQuestions;
  const avgVariance = average(categories.map(c => c.internalVariance));
  const varianceFactor = Math.min(1, avgVariance / 1.2);
  const uniqueValues = new Set(Object.values(answers)).size;
  const diversityFactor = Math.min(1, uniqueValues / 4);

  const confidence = completeness * 0.55 + varianceFactor * 0.30 + diversityFactor * 0.15;
  return Math.round(Math.min(1, confidence) * 100) / 100;
}
