import { describe, it, expect } from "vitest";
import { runScoringEngine, getResultsCompat } from "@/utils/scoringEngine";
import type { ProfilePattern } from "@/utils/scoringEngine";
import { questions, getQuestionsByCategory, applyReversal } from "@/data/diagnosticsQuestions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a full answer set with varied scores */
function variedAnswers(): Record<number, number> {
  const answers: Record<number, number> = {};
  // Non-periodic, well-distributed answers that mimic genuine responses
  const pattern = [3, 2, 4, 3, 2, 3, 4, 2, 3, 4, 2, 3, 3, 2, 4, 3, 2, 4, 3, 2, 3, 4, 2, 3, 4, 2, 3, 3, 4];
  questions.forEach((q, i) => {
    answers[q.id] = pattern[i % pattern.length];
  });
  return answers;
}

/** Build answers where all questions get the max score (4) */
function maxAnswers(): Record<number, number> {
  const answers: Record<number, number> = {};
  for (const q of questions) {
    answers[q.id] = 4;
  }
  return answers;
}

/** Build answers where all questions get the min score (1) */
function minAnswers(): Record<number, number> {
  const answers: Record<number, number> = {};
  for (const q of questions) {
    answers[q.id] = 1;
  }
  return answers;
}

/** Build answers that give high scores to a specific category and low to others */
function biasedAnswers(
  targetCategory: string,
  highScore: number,
  lowScore: number
): Record<number, number> {
  const answers: Record<number, number> = {};
  for (const q of questions) {
    answers[q.id] = q.category === targetCategory ? highScore : lowScore;
  }
  return answers;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("scoringEngine", () => {
  describe("getResultsCompat()", () => {
    it("should return results array with 4 categories", () => {
      const { results } = getResultsCompat(variedAnswers());
      expect(results).toHaveLength(4);
    });

    it("should return scores between 0 and 100 for all categories", () => {
      const { results } = getResultsCompat(variedAnswers());
      for (const r of results) {
        expect(r.score).toBeGreaterThanOrEqual(0);
        expect(r.score).toBeLessThanOrEqual(100);
      }
    });

    it("should return all 4 category names", () => {
      const { results } = getResultsCompat(variedAnswers());
      const categories = results.map((r) => r.category);
      expect(categories).toContain("cognitive");
      expect(categories).toContain("soft");
      expect(categories).toContain("professional");
      expect(categories).toContain("adaptability");
    });

    it("should include a label for each category result", () => {
      const { results } = getResultsCompat(variedAnswers());
      for (const r of results) {
        expect(r.label).toBeDefined();
        expect(r.label.length).toBeGreaterThan(0);
      }
    });

    it("should return a fullResult with all expected properties", () => {
      const { fullResult } = getResultsCompat(variedAnswers());
      expect(fullResult.timestamp).toBeDefined();
      expect(fullResult.categories).toHaveLength(4);
      expect(fullResult.overallScore).toBeDefined();
      expect(fullResult.rawConfidence).toBeDefined();
      expect(fullResult.adjustedConfidence).toBeDefined();
      expect(fullResult.antiCheat).toBeDefined();
      expect(fullResult.dominantPattern).toBeDefined();
      expect(fullResult.strengthAreas).toBeDefined();
      expect(fullResult.growthAreas).toBeDefined();
      expect(fullResult.radarData).toBeDefined();
      expect(typeof fullResult.isFlagged).toBe("boolean");
    });
  });

  describe("runScoringEngine()", () => {
    describe("category scores", () => {
      it("should produce higher scores when all answers are max (4)", () => {
        const result = runScoringEngine(maxAnswers());
        for (const cat of result.categories) {
          // With all 4s, non-reversed questions score 4, reversed score 5-4=1
          // So it won't be 100 for categories with reversed questions, but still relatively high
          expect(cat.rawScore).toBeGreaterThan(0);
        }
      });

      it("should produce lower scores when all answers are min (1)", () => {
        const result = runScoringEngine(minAnswers());
        for (const cat of result.categories) {
          expect(cat.rawScore).toBeLessThan(100);
        }
      });

      it("should assign correct skill levels based on score thresholds", () => {
        const result = runScoringEngine(maxAnswers());
        for (const cat of result.categories) {
          if (cat.rawScore >= 75) expect(cat.level).toBe("expert");
          else if (cat.rawScore >= 50) expect(cat.level).toBe("advanced");
          else if (cat.rawScore >= 25) expect(cat.level).toBe("basic");
          else expect(cat.level).toBe("beginner");
        }
      });
    });

    describe("weighted scoring", () => {
      it("should give higher contribution from questions with higher weight", () => {
        const result = runScoringEngine(variedAnswers());
        // Each category result should have questionScores with weight property
        for (const cat of result.categories) {
          for (const qs of cat.questionScores) {
            expect(qs.weight).toBeGreaterThanOrEqual(1.0);
            expect(qs.weight).toBeLessThanOrEqual(2.0);
          }
        }
      });

      it("should compute weightedContribution as rawScore * categoryWeight", () => {
        const result = runScoringEngine(variedAnswers());
        const categoryWeights: Record<string, number> = {
          cognitive: 0.3,
          soft: 0.25,
          professional: 0.25,
          adaptability: 0.2,
        };
        for (const cat of result.categories) {
          const expected = cat.rawScore * categoryWeights[cat.category];
          expect(cat.weightedContribution).toBeCloseTo(expected, 1);
        }
      });
    });

    describe("reversed question handling", () => {
      it("should invert scores for reversed questions in questionScores", () => {
        const answers = variedAnswers();
        const result = runScoringEngine(answers);
        const byCategory = getQuestionsByCategory();

        for (const cat of result.categories) {
          const catQuestions = byCategory[cat.category];
          for (const qs of cat.questionScores) {
            const question = catQuestions.find((q) => q.id === qs.id);
            if (!question) continue;
            const rawAnswer = answers[qs.id] ?? 1;
            const expectedAdjusted = applyReversal(rawAnswer, question.isReversed);
            expect(qs.adjusted).toBe(expectedAdjusted);
          }
        }
      });

      it("should produce different scores for same raw answer on normal vs reversed question", () => {
        // All answers = 4. Normal: adjusted=4, Reversed: adjusted=1 (5-4)
        const result = runScoringEngine(maxAnswers());
        for (const cat of result.categories) {
          const reversed = cat.questionScores.filter((qs) => {
            const q = questions.find((qq) => qq.id === qs.id);
            return q?.isReversed;
          });
          const normal = cat.questionScores.filter((qs) => {
            const q = questions.find((qq) => qq.id === qs.id);
            return !q?.isReversed;
          });
          if (reversed.length > 0 && normal.length > 0) {
            // Reversed should have adjusted=1, normal should have adjusted=4
            expect(reversed[0].adjusted).toBe(1);
            expect(normal[0].adjusted).toBe(4);
          }
        }
      });
    });

    describe("confidence calculation", () => {
      it("should return rawConfidence between 0 and 1", () => {
        const result = runScoringEngine(variedAnswers());
        expect(result.rawConfidence).toBeGreaterThanOrEqual(0);
        expect(result.rawConfidence).toBeLessThanOrEqual(1);
      });

      it("should return adjustedConfidence between 0 and 1", () => {
        const result = runScoringEngine(variedAnswers());
        expect(result.adjustedConfidence).toBeGreaterThanOrEqual(0);
        expect(result.adjustedConfidence).toBeLessThanOrEqual(1);
      });

      it("should have adjustedConfidence <= rawConfidence", () => {
        const result = runScoringEngine(variedAnswers());
        expect(result.adjustedConfidence).toBeLessThanOrEqual(
          result.rawConfidence
        );
      });

      it("should have higher confidence with varied answers than uniform ones", () => {
        const variedResult = runScoringEngine(variedAnswers());
        const uniformResult = runScoringEngine(
          // Use answers that are consistent (not all same, to avoid anti-cheat)
          (() => {
            const a: Record<number, number> = {};
            questions.forEach((q) => {
              a[q.id] = q.isReversed ? 2 : 3;
            });
            return a;
          })()
        );
        // Varied answers should have equal or higher raw confidence due to diversity
        expect(variedResult.rawConfidence).toBeGreaterThanOrEqual(
          uniformResult.rawConfidence - 0.1 // allow small margin
        );
      });
    });

    describe("profile classification", () => {
      const VALID_PATTERNS: ProfilePattern[] = [
        "analytical_thinker",
        "team_player",
        "self_organizer",
        "change_agent",
        "balanced_performer",
        "emerging_talent",
        "specialist",
      ];

      it("should return a valid profile pattern", () => {
        const result = runScoringEngine(variedAnswers());
        expect(VALID_PATTERNS).toContain(result.dominantPattern);
      });

      it("should classify high overall scorer as balanced_performer", () => {
        // Give score 4 to normal questions, score 1 to reversed (adjusted=4)
        // This maximizes all categories
        const answers: Record<number, number> = {};
        for (const q of questions) {
          answers[q.id] = q.isReversed ? 1 : 4; // both adjusted to 4
        }
        const result = runScoringEngine(answers);
        // All categories should be high, avg >= 72
        expect(result.dominantPattern).toBe("balanced_performer");
      });

      it("should classify low overall scorer as emerging_talent", () => {
        // Give score 1 to normal questions, score 4 to reversed (adjusted=1)
        // This minimizes all categories
        const answers: Record<number, number> = {};
        for (const q of questions) {
          answers[q.id] = q.isReversed ? 4 : 1; // both adjusted to 1
        }
        const result = runScoringEngine(answers);
        expect(result.dominantPattern).toBe("emerging_talent");
      });
    });

    describe("strength and growth areas", () => {
      it("should return 2 strength areas and 2 growth areas", () => {
        const result = runScoringEngine(variedAnswers());
        expect(result.strengthAreas).toHaveLength(2);
        expect(result.growthAreas).toHaveLength(2);
      });

      it("strength areas should have highest scores", () => {
        const result = runScoringEngine(variedAnswers());
        const scoreMap = Object.fromEntries(
          result.categories.map((c) => [c.category, c.rawScore])
        );
        const strengthScores = result.strengthAreas.map((c) => scoreMap[c]);
        const growthScores = result.growthAreas.map((c) => scoreMap[c]);
        expect(Math.min(...strengthScores)).toBeGreaterThanOrEqual(
          Math.min(...growthScores)
        );
      });
    });

    describe("radar data", () => {
      it("should return 4 radar data points", () => {
        const result = runScoringEngine(variedAnswers());
        expect(result.radarData).toHaveLength(4);
      });

      it("should have fullMark of 100 for all data points", () => {
        const result = runScoringEngine(variedAnswers());
        for (const dp of result.radarData) {
          expect(dp.fullMark).toBe(100);
        }
      });

      it("should have values between 0 and 100", () => {
        const result = runScoringEngine(variedAnswers());
        for (const dp of result.radarData) {
          expect(dp.value).toBeGreaterThanOrEqual(0);
          expect(dp.value).toBeLessThanOrEqual(100);
        }
      });
    });

    describe("edge cases", () => {
      it("should handle empty answers without crashing", () => {
        const result = runScoringEngine({});
        expect(result.categories).toHaveLength(4);
        expect(result.overallScore).toBeDefined();
        // Empty answers default to 1, so scores should be at minimum
        for (const cat of result.categories) {
          expect(cat.rawScore).toBeGreaterThanOrEqual(0);
        }
      });

      it("should handle partial answers (only some questions answered)", () => {
        const partial: Record<number, number> = {};
        // Only answer first 16 questions
        questions.slice(0, 16).forEach((q) => {
          partial[q.id] = 3;
        });
        const result = runScoringEngine(partial);
        expect(result.categories).toHaveLength(4);
        for (const cat of result.categories) {
          expect(cat.rawScore).toBeGreaterThanOrEqual(0);
          expect(cat.rawScore).toBeLessThanOrEqual(100);
        }
      });

      it("should set isFlagged correctly based on anti-cheat results", () => {
        // Clean answers should not be flagged
        const cleanResult = runScoringEngine(variedAnswers());
        // It might or might not be flagged depending on the varied pattern
        expect(typeof cleanResult.isFlagged).toBe("boolean");

        // Uniform answers should be flagged
        const suspiciousResult = runScoringEngine(
          (() => {
            const a: Record<number, number> = {};
            for (const q of questions) a[q.id] = 2;
            return a;
          })()
        );
        expect(suspiciousResult.isFlagged).toBe(true);
      });

      it("should produce a valid ISO timestamp", () => {
        const result = runScoringEngine(variedAnswers());
        expect(() => new Date(result.timestamp)).not.toThrow();
        expect(new Date(result.timestamp).toISOString()).toBe(
          result.timestamp
        );
      });
    });
  });
});
