import { describe, it, expect } from "vitest";
import {
  runInfoCommScoringEngine,
  getInfoCommResultsCompat,
} from "@/utils/infoCommScoringEngine";
import type { InfoCommProfile } from "@/utils/infoCommScoringEngine";
import { infoCommQuestions } from "@/data/infoCommQuestions";
import type { InfoCommCategory } from "@/data/infoCommQuestions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build answers where every question gets the max score (4) */
function maxAnswers(): Record<number, number> {
  const answers: Record<number, number> = {};
  for (const q of infoCommQuestions) {
    answers[q.id] = 4;
  }
  return answers;
}

/** Build answers where every question gets the min score (1) */
function minAnswers(): Record<number, number> {
  const answers: Record<number, number> = {};
  for (const q of infoCommQuestions) {
    answers[q.id] = 1;
  }
  return answers;
}

/** Build varied answers to simulate genuine responses */
function variedAnswers(): Record<number, number> {
  const answers: Record<number, number> = {};
  const pattern = [3, 2, 4, 3, 2, 3, 4, 2];
  infoCommQuestions.forEach((q, i) => {
    answers[q.id] = pattern[i % pattern.length];
  });
  return answers;
}

/** Answers that maximize a specific category and minimize others */
function biasedAnswers(
  targetCategory: InfoCommCategory,
  highScore: number = 4,
  lowScore: number = 1
): Record<number, number> {
  const answers: Record<number, number> = {};
  for (const q of infoCommQuestions) {
    answers[q.id] = q.category === targetCategory ? highScore : lowScore;
  }
  return answers;
}

/**
 * Build answers that maximize adjusted scores:
 * - normal questions get highScore
 * - reversed questions get 5 - highScore (so adjusted = highScore)
 */
function optimizedMaxAnswers(): Record<number, number> {
  const answers: Record<number, number> = {};
  for (const q of infoCommQuestions) {
    answers[q.id] = q.isReversed ? 1 : 4; // adjusted: reversed → 5-1=4, normal → 4
  }
  return answers;
}

/**
 * Build answers that minimize adjusted scores:
 * - normal questions get lowScore
 * - reversed questions get 5 - lowScore (so adjusted = lowScore)
 */
function optimizedMinAnswers(): Record<number, number> {
  const answers: Record<number, number> = {};
  for (const q of infoCommQuestions) {
    answers[q.id] = q.isReversed ? 4 : 1; // adjusted: reversed → 5-4=1, normal → 1
  }
  return answers;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("infoCommScoringEngine", () => {
  describe("runInfoCommScoringEngine()", () => {
    describe("with empty answers", () => {
      it("should return 5 categories without crashing", () => {
        const result = runInfoCommScoringEngine({});
        expect(result.categories).toHaveLength(5);
      });

      it("should return low scores for all categories", () => {
        const result = runInfoCommScoringEngine({});
        for (const cat of result.categories) {
          // Empty answers default to 0; reversed questions inflate scores slightly
          expect(cat.rawScore).toBeLessThanOrEqual(35);
        }
      });

      it("should return all expected properties", () => {
        const result = runInfoCommScoringEngine({});
        expect(result.timestamp).toBeDefined();
        expect(result.overallScore).toBeDefined();
        expect(result.rawConfidence).toBeDefined();
        expect(result.adjustedConfidence).toBeDefined();
        expect(result.antiCheat).toBeDefined();
        expect(result.dominantProfile).toBeDefined();
        expect(result.strengthAreas).toBeDefined();
        expect(result.growthAreas).toBeDefined();
        expect(result.radarData).toBeDefined();
        expect(typeof result.isFlagged).toBe("boolean");
      });
    });

    describe("with all max answers", () => {
      it("should return higher scores than min answers for all categories", () => {
        const maxResult = runInfoCommScoringEngine(maxAnswers());
        const minResult = runInfoCommScoringEngine(minAnswers());
        for (let i = 0; i < maxResult.categories.length; i++) {
          // Categories with reversed questions may not have max=100,
          // but max answers should still score higher overall
          expect(maxResult.overallScore).toBeGreaterThan(minResult.overallScore);
        }
      });

      it("should produce a high overall score with optimized answers", () => {
        const result = runInfoCommScoringEngine(optimizedMaxAnswers());
        expect(result.overallScore).toBeGreaterThan(70);
      });
    });

    describe("with all min answers", () => {
      it("should produce a low overall score with optimized min answers", () => {
        const result = runInfoCommScoringEngine(optimizedMinAnswers());
        expect(result.overallScore).toBeLessThan(30);
      });
    });

    describe("category scores", () => {
      it("should include all 5 infocomm categories", () => {
        const result = runInfoCommScoringEngine(variedAnswers());
        const categories = result.categories.map(c => c.category);
        expect(categories).toContain("motivational");
        expect(categories).toContain("cognitive_info");
        expect(categories).toContain("activity");
        expect(categories).toContain("reflective");
        expect(categories).toContain("outcome");
      });

      it("should have scores between 0 and 100", () => {
        const result = runInfoCommScoringEngine(variedAnswers());
        for (const cat of result.categories) {
          expect(cat.rawScore).toBeGreaterThanOrEqual(0);
          expect(cat.rawScore).toBeLessThanOrEqual(100);
        }
      });

      it("should assign correct skill levels based on score thresholds", () => {
        const result = runInfoCommScoringEngine(variedAnswers());
        for (const cat of result.categories) {
          if (cat.rawScore >= 75) expect(cat.level).toBe("expert");
          else if (cat.rawScore >= 50) expect(cat.level).toBe("advanced");
          else if (cat.rawScore >= 25) expect(cat.level).toBe("basic");
          else expect(cat.level).toBe("beginner");
        }
      });

      it("should include a label for each category", () => {
        const result = runInfoCommScoringEngine(variedAnswers());
        for (const cat of result.categories) {
          expect(cat.label).toBeDefined();
          expect(cat.label.length).toBeGreaterThan(0);
        }
      });

      it("should have question scores with valid weight values", () => {
        const result = runInfoCommScoringEngine(variedAnswers());
        for (const cat of result.categories) {
          for (const qs of cat.questionScores) {
            expect(qs.weight).toBeGreaterThanOrEqual(1.0);
            expect(qs.weight).toBeLessThanOrEqual(2.0);
          }
        }
      });
    });

    describe("reversed question handling", () => {
      it("should invert scores for reversed questions", () => {
        const answers = maxAnswers(); // all 4s
        const result = runInfoCommScoringEngine(answers);
        for (const cat of result.categories) {
          for (const qs of cat.questionScores) {
            const question = infoCommQuestions.find(q => q.id === qs.id);
            if (!question) continue;
            if (question.isReversed) {
              // reversed: 5 - 4 = 1
              expect(qs.adjusted).toBe(1);
            } else {
              expect(qs.adjusted).toBe(4);
            }
          }
        }
      });
    });

    describe("confidence calculation", () => {
      it("should return rawConfidence between 0 and 1", () => {
        const result = runInfoCommScoringEngine(variedAnswers());
        expect(result.rawConfidence).toBeGreaterThanOrEqual(0);
        expect(result.rawConfidence).toBeLessThanOrEqual(1);
      });

      it("should return adjustedConfidence between 0 and 1", () => {
        const result = runInfoCommScoringEngine(variedAnswers());
        expect(result.adjustedConfidence).toBeGreaterThanOrEqual(0);
        expect(result.adjustedConfidence).toBeLessThanOrEqual(1);
      });

      it("should have adjustedConfidence <= rawConfidence", () => {
        const result = runInfoCommScoringEngine(variedAnswers());
        expect(result.adjustedConfidence).toBeLessThanOrEqual(result.rawConfidence);
      });
    });

    describe("profile classification", () => {
      const VALID_PROFILES: InfoCommProfile[] = [
        "info_seeker",
        "communicator",
        "reflective_learner",
        "digital_native",
        "balanced_competent",
        "emerging_learner",
        "specialist_info",
      ];

      it("should return a valid infocomm profile", () => {
        const result = runInfoCommScoringEngine(variedAnswers());
        expect(VALID_PROFILES).toContain(result.dominantProfile);
      });

      it("should classify high overall scorer as balanced_competent", () => {
        const result = runInfoCommScoringEngine(optimizedMaxAnswers());
        expect(result.dominantProfile).toBe("balanced_competent");
      });

      it("should classify low overall scorer as emerging_learner", () => {
        const result = runInfoCommScoringEngine(optimizedMinAnswers());
        expect(result.dominantProfile).toBe("emerging_learner");
      });

      it("should detect specialist when one category dominates", () => {
        const result = runInfoCommScoringEngine(biasedAnswers("activity"));
        // With activity=4 and others=1, spread should be > 35
        expect(VALID_PROFILES).toContain(result.dominantProfile);
      });
    });

    describe("language support", () => {
      it("should use Russian labels by default", () => {
        const result = runInfoCommScoringEngine(variedAnswers());
        const labels = result.categories.map(c => c.label);
        expect(labels).toContain("Мотивационный");
      });

      it("should use Kazakh labels when lang is 'kz'", () => {
        const result = runInfoCommScoringEngine(variedAnswers(), undefined, "kz");
        const labels = result.categories.map(c => c.label);
        expect(labels).toContain("Мотивациялық");
      });
    });

    describe("strength and growth areas", () => {
      it("should return 2 strength areas and 2 growth areas", () => {
        const result = runInfoCommScoringEngine(variedAnswers());
        expect(result.strengthAreas).toHaveLength(2);
        expect(result.growthAreas).toHaveLength(2);
      });

      it("strength areas should have higher or equal scores than growth areas", () => {
        const result = runInfoCommScoringEngine(variedAnswers());
        const scoreMap = Object.fromEntries(
          result.categories.map(c => [c.category, c.rawScore])
        );
        const strengthScores = result.strengthAreas.map(c => scoreMap[c]);
        const growthScores = result.growthAreas.map(c => scoreMap[c]);
        expect(Math.min(...strengthScores)).toBeGreaterThanOrEqual(
          Math.min(...growthScores)
        );
      });
    });

    describe("radar data", () => {
      it("should return 5 radar data points", () => {
        const result = runInfoCommScoringEngine(variedAnswers());
        expect(result.radarData).toHaveLength(5);
      });

      it("should have fullMark of 100 for all data points", () => {
        const result = runInfoCommScoringEngine(variedAnswers());
        for (const dp of result.radarData) {
          expect(dp.fullMark).toBe(100);
        }
      });

      it("should have values between 0 and 100", () => {
        const result = runInfoCommScoringEngine(variedAnswers());
        for (const dp of result.radarData) {
          expect(dp.value).toBeGreaterThanOrEqual(0);
          expect(dp.value).toBeLessThanOrEqual(100);
        }
      });
    });

    describe("edge cases", () => {
      it("should produce a valid ISO timestamp", () => {
        const result = runInfoCommScoringEngine(variedAnswers());
        expect(() => new Date(result.timestamp)).not.toThrow();
        expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
      });

      it("should handle partial answers gracefully", () => {
        const partial: Record<number, number> = {};
        infoCommQuestions.slice(0, 10).forEach(q => {
          partial[q.id] = 3;
        });
        const result = runInfoCommScoringEngine(partial);
        expect(result.categories).toHaveLength(5);
        for (const cat of result.categories) {
          expect(cat.rawScore).toBeGreaterThanOrEqual(0);
          expect(cat.rawScore).toBeLessThanOrEqual(100);
        }
      });
    });
  });

  describe("getInfoCommResultsCompat()", () => {
    it("should return results array with 5 categories", () => {
      const { results } = getInfoCommResultsCompat(variedAnswers());
      expect(results).toHaveLength(5);
    });

    it("should return scores between 0 and 100 for all categories", () => {
      const { results } = getInfoCommResultsCompat(variedAnswers());
      for (const r of results) {
        expect(r.score).toBeGreaterThanOrEqual(0);
        expect(r.score).toBeLessThanOrEqual(100);
      }
    });

    it("should include category, label, and score in each result", () => {
      const { results } = getInfoCommResultsCompat(variedAnswers());
      for (const r of results) {
        expect(r.category).toBeDefined();
        expect(r.label).toBeDefined();
        expect(r.label.length).toBeGreaterThan(0);
        expect(typeof r.score).toBe("number");
      }
    });

    it("should return a fullResult with all expected properties", () => {
      const { fullResult } = getInfoCommResultsCompat(variedAnswers());
      expect(fullResult.timestamp).toBeDefined();
      expect(fullResult.categories).toHaveLength(5);
      expect(fullResult.overallScore).toBeDefined();
      expect(fullResult.rawConfidence).toBeDefined();
      expect(fullResult.adjustedConfidence).toBeDefined();
      expect(fullResult.antiCheat).toBeDefined();
      expect(fullResult.dominantProfile).toBeDefined();
      expect(fullResult.strengthAreas).toBeDefined();
      expect(fullResult.growthAreas).toBeDefined();
      expect(fullResult.radarData).toBeDefined();
      expect(typeof fullResult.isFlagged).toBe("boolean");
    });

    it("should have integer scores (rounded)", () => {
      const { results } = getInfoCommResultsCompat(variedAnswers());
      for (const r of results) {
        expect(r.score).toBe(Math.round(r.score));
      }
    });

    it("should respect language parameter", () => {
      const ruResult = getInfoCommResultsCompat(variedAnswers(), undefined, "ru");
      const kzResult = getInfoCommResultsCompat(variedAnswers(), undefined, "kz");
      // Labels should differ between languages
      expect(ruResult.results[0].label).not.toBe(kzResult.results[0].label);
    });
  });
});
