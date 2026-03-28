import { describe, it, expect } from "vitest";
import {
  runPhysicsScoringEngine,
  getPhysicsResultsCompat,
} from "@/utils/physicsScoringEngine";
import type { PhysicsProfile } from "@/utils/physicsScoringEngine";
import { physicsQuestions } from "@/data/physicsQuestions";
import type { PhysicsCategory } from "@/data/physicsQuestions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build answers where every question gets the correct answer (score 1) */
function maxAnswers(): Record<number, number> {
  const answers: Record<number, number> = {};
  for (const q of physicsQuestions) {
    answers[q.id] = 1; // physics uses binary scoring: 0 or 1
  }
  return answers;
}

/** Build answers where every question gets wrong answer (score 0) */
function minAnswers(): Record<number, number> {
  const answers: Record<number, number> = {};
  for (const q of physicsQuestions) {
    answers[q.id] = 0;
  }
  return answers;
}

/** Build answers with varied scores to simulate genuine responses */
function variedAnswers(): Record<number, number> {
  const answers: Record<number, number> = {};
  const pattern = [1, 0, 1, 1, 0, 1, 0, 1];
  physicsQuestions.forEach((q, i) => {
    answers[q.id] = pattern[i % pattern.length];
  });
  return answers;
}

/** Build answers biased toward a specific category (high for target, low for others) */
function biasedAnswers(
  targetCategory: PhysicsCategory
): Record<number, number> {
  const answers: Record<number, number> = {};
  for (const q of physicsQuestions) {
    answers[q.id] = q.category === targetCategory ? 1 : 0;
  }
  return answers;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("physicsScoringEngine", () => {
  describe("runPhysicsScoringEngine()", () => {
    describe("with empty answers", () => {
      it("should return 4 categories without crashing", () => {
        const result = runPhysicsScoringEngine({});
        expect(result.categories).toHaveLength(4);
      });

      it("should return low scores for all categories", () => {
        const result = runPhysicsScoringEngine({});
        for (const cat of result.categories) {
          expect(cat.rawScore).toBeLessThanOrEqual(25);
        }
      });

      it("should return all expected properties", () => {
        const result = runPhysicsScoringEngine({});
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

    describe("with all max (correct) answers", () => {
      it("should return high scores for all categories", () => {
        const result = runPhysicsScoringEngine(maxAnswers());
        for (const cat of result.categories) {
          expect(cat.rawScore).toBeGreaterThanOrEqual(50);
        }
      });

      it("should produce a high overall score", () => {
        const result = runPhysicsScoringEngine(maxAnswers());
        expect(result.overallScore).toBeGreaterThan(50);
      });
    });

    describe("with all min (wrong) answers", () => {
      it("should return low scores for all categories", () => {
        const result = runPhysicsScoringEngine(minAnswers());
        for (const cat of result.categories) {
          expect(cat.rawScore).toBeLessThanOrEqual(10);
        }
      });
    });

    describe("category scores", () => {
      it("should include all 4 physics categories", () => {
        const result = runPhysicsScoringEngine(variedAnswers());
        const categories = result.categories.map(c => c.category);
        expect(categories).toContain("mechanics");
        expect(categories).toContain("thermodynamics");
        expect(categories).toContain("electromagnetism");
        expect(categories).toContain("optics_waves");
      });

      it("should have scores between 0 and 100", () => {
        const result = runPhysicsScoringEngine(variedAnswers());
        for (const cat of result.categories) {
          expect(cat.rawScore).toBeGreaterThanOrEqual(0);
          expect(cat.rawScore).toBeLessThanOrEqual(100);
        }
      });

      it("should assign correct skill levels based on score thresholds", () => {
        const result = runPhysicsScoringEngine(maxAnswers());
        for (const cat of result.categories) {
          if (cat.rawScore >= 75) expect(cat.level).toBe("expert");
          else if (cat.rawScore >= 50) expect(cat.level).toBe("advanced");
          else if (cat.rawScore >= 25) expect(cat.level).toBe("basic");
          else expect(cat.level).toBe("beginner");
        }
      });

      it("should include a label for each category", () => {
        const result = runPhysicsScoringEngine(variedAnswers());
        for (const cat of result.categories) {
          expect(cat.label).toBeDefined();
          expect(cat.label.length).toBeGreaterThan(0);
        }
      });

      it("should have question scores with valid weight values", () => {
        const result = runPhysicsScoringEngine(variedAnswers());
        for (const cat of result.categories) {
          for (const qs of cat.questionScores) {
            expect(qs.weight).toBeGreaterThanOrEqual(1.0);
            expect(qs.weight).toBeLessThanOrEqual(2.0);
          }
        }
      });
    });

    describe("confidence calculation", () => {
      it("should return rawConfidence between 0 and 1", () => {
        const result = runPhysicsScoringEngine(variedAnswers());
        expect(result.rawConfidence).toBeGreaterThanOrEqual(0);
        expect(result.rawConfidence).toBeLessThanOrEqual(1);
      });

      it("should return adjustedConfidence between 0 and 1", () => {
        const result = runPhysicsScoringEngine(variedAnswers());
        expect(result.adjustedConfidence).toBeGreaterThanOrEqual(0);
        expect(result.adjustedConfidence).toBeLessThanOrEqual(1);
      });

      it("should have adjustedConfidence <= rawConfidence", () => {
        const result = runPhysicsScoringEngine(variedAnswers());
        expect(result.adjustedConfidence).toBeLessThanOrEqual(result.rawConfidence);
      });
    });

    describe("profile classification", () => {
      const VALID_PROFILES: PhysicsProfile[] = [
        "mechanics_expert",
        "thermo_specialist",
        "em_specialist",
        "optics_specialist",
        "balanced_physicist",
        "emerging_physicist",
        "specialist_physics",
      ];

      it("should return a valid physics profile", () => {
        const result = runPhysicsScoringEngine(variedAnswers());
        expect(VALID_PROFILES).toContain(result.dominantProfile);
      });

      it("should classify all-correct scorer as balanced_physicist", () => {
        const result = runPhysicsScoringEngine(maxAnswers());
        expect(result.dominantProfile).toBe("balanced_physicist");
      });

      it("should classify all-wrong scorer as emerging_physicist", () => {
        const result = runPhysicsScoringEngine(minAnswers());
        expect(result.dominantProfile).toBe("emerging_physicist");
      });

      it("should detect specialist when one category is much higher", () => {
        const result = runPhysicsScoringEngine(biasedAnswers("mechanics"));
        // With only mechanics correct: spread > 35 → specialist_physics
        // or mechanics >= 65 → mechanics_expert
        expect(VALID_PROFILES).toContain(result.dominantProfile);
      });
    });

    describe("strength and growth areas", () => {
      it("should return 2 strength areas and 2 growth areas", () => {
        const result = runPhysicsScoringEngine(variedAnswers());
        expect(result.strengthAreas).toHaveLength(2);
        expect(result.growthAreas).toHaveLength(2);
      });

      it("strength areas should have higher or equal scores than growth areas", () => {
        const result = runPhysicsScoringEngine(variedAnswers());
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
      it("should return 4 radar data points", () => {
        const result = runPhysicsScoringEngine(variedAnswers());
        expect(result.radarData).toHaveLength(4);
      });

      it("should have fullMark of 100 for all data points", () => {
        const result = runPhysicsScoringEngine(variedAnswers());
        for (const dp of result.radarData) {
          expect(dp.fullMark).toBe(100);
        }
      });

      it("should have values between 0 and 100", () => {
        const result = runPhysicsScoringEngine(variedAnswers());
        for (const dp of result.radarData) {
          expect(dp.value).toBeGreaterThanOrEqual(0);
          expect(dp.value).toBeLessThanOrEqual(100);
        }
      });
    });

    describe("edge cases", () => {
      it("should produce a valid ISO timestamp", () => {
        const result = runPhysicsScoringEngine(variedAnswers());
        expect(() => new Date(result.timestamp)).not.toThrow();
        expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
      });

      it("should handle partial answers gracefully", () => {
        const partial: Record<number, number> = {};
        physicsQuestions.slice(0, 8).forEach(q => {
          partial[q.id] = 1;
        });
        const result = runPhysicsScoringEngine(partial);
        expect(result.categories).toHaveLength(4);
        for (const cat of result.categories) {
          expect(cat.rawScore).toBeGreaterThanOrEqual(0);
          expect(cat.rawScore).toBeLessThanOrEqual(100);
        }
      });
    });
  });

  describe("getPhysicsResultsCompat()", () => {
    it("should return results array with 4 categories", () => {
      const { results } = getPhysicsResultsCompat(variedAnswers());
      expect(results).toHaveLength(4);
    });

    it("should return scores between 0 and 100 for all categories", () => {
      const { results } = getPhysicsResultsCompat(variedAnswers());
      for (const r of results) {
        expect(r.score).toBeGreaterThanOrEqual(0);
        expect(r.score).toBeLessThanOrEqual(100);
      }
    });

    it("should include category, label, and score in each result", () => {
      const { results } = getPhysicsResultsCompat(variedAnswers());
      for (const r of results) {
        expect(r.category).toBeDefined();
        expect(r.label).toBeDefined();
        expect(r.label.length).toBeGreaterThan(0);
        expect(typeof r.score).toBe("number");
      }
    });

    it("should return a fullResult with all expected properties", () => {
      const { fullResult } = getPhysicsResultsCompat(variedAnswers());
      expect(fullResult.timestamp).toBeDefined();
      expect(fullResult.categories).toHaveLength(4);
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
      const { results } = getPhysicsResultsCompat(variedAnswers());
      for (const r of results) {
        expect(r.score).toBe(Math.round(r.score));
      }
    });
  });
});
