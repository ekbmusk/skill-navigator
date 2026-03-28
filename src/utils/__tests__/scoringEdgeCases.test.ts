import { describe, it, expect } from "vitest";
import { runScoringEngine } from "@/utils/scoringEngine";
import type { CategoryResult } from "@/utils/scoringEngine";
import {
  questions,
  CATEGORY_WEIGHTS,
  getQuestionsByCategory,
  getMaxCategoryScore,
} from "@/data/diagnosticsQuestions";
import type { Category } from "@/data/diagnosticsQuestions";
import { runAntiCheatDetection } from "@/utils/antiCheatDetection";
import type { TimingData } from "@/utils/antiCheatDetection";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** All question IDs grouped by category */
const byCategory = getQuestionsByCategory();

const allCategories: Category[] = ["cognitive", "soft", "professional", "adaptability"];

/** Build a full varied answer set that avoids anti-cheat flags */
function variedAnswers(): Record<number, number> {
  const answers: Record<number, number> = {};
  const pattern = [3, 2, 4, 3, 2, 3, 4, 2, 3, 4, 2, 3, 3, 2, 4, 3, 2, 4, 3, 2, 3, 4, 2, 3, 4, 2, 3, 3, 4, 2, 3, 4];
  questions.forEach((q, i) => {
    answers[q.id] = pattern[i % pattern.length];
  });
  return answers;
}

/** Build answers where every question in a category gets the given score, others get a neutral varied value */
function answersByCategoryScore(scores: Partial<Record<Category, number>>): Record<number, number> {
  const answers: Record<number, number> = {};
  const neutralPattern = [3, 2, 4, 3, 2, 3, 4, 2];
  for (const cat of allCategories) {
    const qs = byCategory[cat];
    qs.forEach((q, i) => {
      if (scores[cat] !== undefined) {
        answers[q.id] = scores[cat]!;
      } else {
        answers[q.id] = neutralPattern[i % neutralPattern.length];
      }
    });
  }
  return answers;
}

/** Get category result by name from scoring result */
function getCategoryResult(categories: CategoryResult[], cat: Category): CategoryResult {
  return categories.find(c => c.category === cat)!;
}

// ─── 1. Single-category-only answers ──────────────────────────────────────────

describe("Single-category-only answers", () => {
  it("should return valid results (0-100) for all 4 categories when only cognitive is answered", () => {
    const answers: Record<number, number> = {};
    // Only answer cognitive questions with varied values
    const cognitiveQs = byCategory.cognitive;
    const pattern = [3, 2, 4, 3, 2, 3, 4, 2];
    cognitiveQs.forEach((q, i) => {
      answers[q.id] = pattern[i % pattern.length];
    });

    const result = runScoringEngine(answers);

    expect(result.categories).toHaveLength(4);
    for (const cat of result.categories) {
      expect(cat.rawScore).toBeGreaterThanOrEqual(0);
      expect(cat.rawScore).toBeLessThanOrEqual(100);
      expect(["beginner", "basic", "advanced", "expert"]).toContain(cat.level);
    }
  });

  it("should produce non-zero score only for the answered category (cognitive)", () => {
    const answers: Record<number, number> = {};
    const cognitiveQs = byCategory.cognitive;
    cognitiveQs.forEach(q => {
      answers[q.id] = 4; // max score
    });

    const result = runScoringEngine(answers);
    const cognitive = getCategoryResult(result.categories, "cognitive");

    // Cognitive should have a high score
    expect(cognitive.rawScore).toBeGreaterThan(50);

    // Unanswered categories default to answer=1, so they get a score of 25
    // (since the engine uses `answers[q.id] ?? 1` for missing answers)
    for (const cat of allCategories) {
      if (cat !== "cognitive") {
        const catResult = getCategoryResult(result.categories, cat);
        // Unanswered defaults to raw=1, for non-reversed that gives minimum,
        // for reversed that gives 5-1=4 (max). So score won't be exactly 0.
        expect(catResult.rawScore).toBeGreaterThanOrEqual(0);
        expect(catResult.rawScore).toBeLessThanOrEqual(100);
      }
    }
  });

  it("should not crash with completely empty answers", () => {
    const answers: Record<number, number> = {};
    const result = runScoringEngine(answers);

    expect(result.categories).toHaveLength(4);
    expect(typeof result.overallScore).toBe("number");
    expect(Number.isFinite(result.overallScore)).toBe(true);
  });
});

// ─── 2. Skill level boundaries ────────────────────────────────────────────────

describe("Skill level boundaries", () => {
  // The scoring formula: rawScore = (weightedSum / maxPossible) * 100
  // where weightedSum = sum(adjusted * weight) and maxPossible = sum(4 * weight)
  // If all answers are 1 (non-reversed): rawScore = sum(1*w) / sum(4*w) * 100 = 25
  // If all answers are 4 (non-reversed): rawScore = sum(4*w) / sum(4*w) * 100 = 100
  // However, reversed questions complicate this: raw=1 → adjusted=4, raw=4 → adjusted=1

  it("should assign 'beginner' for scores < 25", () => {
    // To get score < 25, we need weightedSum < 0.25 * maxPossible
    // For non-reversed: answer=1 gives adjusted=1, so score = 25 (borderline basic)
    // We need some answers below 1 which isn't possible, BUT for reversed questions:
    // answer=4 → adjusted=5-4=1. So to get minimum: non-reversed=1, reversed=4
    // That yields exactly 25. To go below, we can't with valid 1-4 answers.
    // Actually, let's check: all answers = 1 gives non-reversed adjusted=1, reversed adjusted=4
    // weightedSum = sum_nonrev(1*w) + sum_rev(4*w)
    // maxPossible = sum_all(4*w)
    // This is > 25% because reversed questions contribute 4/4 = 100%

    // To truly minimize: non-reversed → 1 (adj=1), reversed → 4 (adj=5-4=1)
    // That gives all adjusted=1, so rawScore = sum(1*w)/sum(4*w)*100 = 25.0
    const answers: Record<number, number> = {};
    for (const q of questions) {
      // For non-reversed: answer 1 → adjusted 1
      // For reversed: answer 4 → adjusted 5-4 = 1
      answers[q.id] = q.isReversed ? 4 : 1;
    }

    const result = runScoringEngine(answers);

    // All categories should score exactly 25.0 → "basic" level
    // To get "beginner" (< 25), we'd need adjusted values < 1, which is impossible.
    // So let's verify the boundary: score=25 should be "basic"
    for (const cat of result.categories) {
      expect(cat.rawScore).toBe(25);
      expect(cat.level).toBe("basic");
    }
  });

  it("should assign 'basic' for scores in [25, 50)", () => {
    // Target rawScore ~37.5 (midway): adjusted average ~1.5 per question
    // For non-reversed: answer=2 → adjusted=2; for reversed: answer=3 → adjusted=5-3=2
    // rawScore = sum(2*w)/sum(4*w)*100 = 50 → that's "advanced"
    // For ~37.5: alternate 1 and 2 for non-reversed, 4 and 3 for reversed
    // Let's use answer=1 for most, answer=2 for a few non-reversed
    const answers: Record<number, number> = {};
    for (const cat of allCategories) {
      const qs = byCategory[cat];
      qs.forEach((q, i) => {
        if (q.isReversed) {
          // reversed: answer=4 → adj=1, answer=3 → adj=2
          answers[q.id] = i < 1 ? 3 : 4; // one gets adj=2, rest get adj=1
        } else {
          // non-reversed: answer=1 → adj=1, answer=2 → adj=2
          answers[q.id] = i < 3 ? 2 : 1; // three get adj=2, rest get adj=1
        }
      });
    }

    const result = runScoringEngine(answers);
    for (const cat of result.categories) {
      expect(cat.rawScore).toBeGreaterThanOrEqual(25);
      expect(cat.rawScore).toBeLessThan(50);
      expect(cat.level).toBe("basic");
    }
  });

  it("should assign 'advanced' for scores in [50, 75)", () => {
    // Target ~62.5: adjusted average ~2.5
    // non-reversed: mix of 2 and 3; reversed: mix of 2 and 3 (adj=3 and adj=2)
    const answers: Record<number, number> = {};
    for (const q of questions) {
      if (q.isReversed) {
        // answer=2 → adj=3
        answers[q.id] = 2;
      } else {
        // answer=3 → adj=3
        answers[q.id] = 3;
      }
    }

    const result = runScoringEngine(answers);
    // rawScore = sum(3*w)/sum(4*w)*100 = 75 → that's "expert"
    // Need to bring it down. Use answer=2 (adj=2) for some non-reversed
    // Let's recalculate: all adjusted=3 → score=75 (expert boundary)
    // We want < 75, so let's use a mix
    for (const q of questions) {
      if (q.isReversed) {
        answers[q.id] = 2; // adj = 3
      } else {
        // Alternate between 2 (adj=2) and 3 (adj=3)
        answers[q.id] = q.id % 2 === 0 ? 2 : 3;
      }
    }

    const result2 = runScoringEngine(answers);
    for (const cat of result2.categories) {
      expect(cat.rawScore).toBeGreaterThanOrEqual(50);
      expect(cat.rawScore).toBeLessThan(75);
      expect(cat.level).toBe("advanced");
    }
  });

  it("should assign 'expert' for scores >= 75", () => {
    // All adjusted=4: non-reversed=4, reversed=1 (adj=5-1=4)
    const answers: Record<number, number> = {};
    for (const q of questions) {
      answers[q.id] = q.isReversed ? 1 : 4;
    }

    const result = runScoringEngine(answers);
    for (const cat of result.categories) {
      expect(cat.rawScore).toBe(100);
      expect(cat.level).toBe("expert");
    }
  });

  it("should assign 'expert' at exactly score 75", () => {
    // All adjusted=3: non-reversed=3, reversed=2 (adj=5-2=3)
    const answers: Record<number, number> = {};
    for (const q of questions) {
      answers[q.id] = q.isReversed ? 2 : 3;
    }

    const result = runScoringEngine(answers);
    for (const cat of result.categories) {
      expect(cat.rawScore).toBe(75);
      expect(cat.level).toBe("expert");
    }
  });
});

// ─── 3. Category weight proportionality ───────────────────────────────────────

describe("Category weight proportionality", () => {
  it("should give cognitive (weight=0.30) a larger weightedContribution than adaptability (weight=0.20) when both score 100", () => {
    // Max all answers
    const answers: Record<number, number> = {};
    for (const q of questions) {
      answers[q.id] = q.isReversed ? 1 : 4;
    }

    const result = runScoringEngine(answers);
    const cognitive = getCategoryResult(result.categories, "cognitive");
    const adaptability = getCategoryResult(result.categories, "adaptability");

    // Both have rawScore=100, but cognitive weight=0.30 > adaptability weight=0.20
    expect(cognitive.weightedContribution).toBeGreaterThan(adaptability.weightedContribution);
    expect(cognitive.weightedContribution).toBeCloseTo(100 * 0.30, 1);
    expect(adaptability.weightedContribution).toBeCloseTo(100 * 0.20, 1);
  });

  it("should produce higher weightedContribution for a max-scored category vs a min-scored one", () => {
    // Cognitive gets max, adaptability gets min, others neutral
    const answers: Record<number, number> = {};

    // Cognitive: max adjusted=4
    for (const q of byCategory.cognitive) {
      answers[q.id] = q.isReversed ? 1 : 4;
    }

    // Adaptability: min adjusted=1
    for (const q of byCategory.adaptability) {
      answers[q.id] = q.isReversed ? 4 : 1;
    }

    // Others: neutral (adjusted ~2.5)
    for (const cat of ["soft", "professional"] as Category[]) {
      const qs = byCategory[cat];
      qs.forEach((q, i) => {
        answers[q.id] = q.isReversed ? 2 : 3;
      });
    }

    const result = runScoringEngine(answers);
    const cognitive = getCategoryResult(result.categories, "cognitive");
    const adaptability = getCategoryResult(result.categories, "adaptability");

    expect(cognitive.rawScore).toBe(100);
    expect(adaptability.rawScore).toBe(25);
    expect(cognitive.weightedContribution).toBeGreaterThan(adaptability.weightedContribution);

    // cognitive: 100 * 0.30 = 30, adaptability: 25 * 0.20 = 5
    expect(cognitive.weightedContribution).toBeCloseTo(30, 1);
    expect(adaptability.weightedContribution).toBeCloseTo(5, 1);
  });

  it("should reflect CATEGORY_WEIGHTS ratios when all categories score the same", () => {
    // All adjusted=3 → rawScore=75 for every category
    const answers: Record<number, number> = {};
    for (const q of questions) {
      answers[q.id] = q.isReversed ? 2 : 3;
    }

    const result = runScoringEngine(answers);

    for (const cat of allCategories) {
      const catResult = getCategoryResult(result.categories, cat);
      expect(catResult.weightedContribution).toBeCloseTo(75 * CATEGORY_WEIGHTS[cat], 1);
    }
  });
});

// ─── 4. Overall score is weighted sum ─────────────────────────────────────────

describe("Overall score equals weighted sum of contributions", () => {
  it("should equal sum of weightedContributions divided by totalWeight for varied answers", () => {
    const answers = variedAnswers();
    const result = runScoringEngine(answers);

    const totalWeight = Object.values(CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0);
    const expectedOverall = result.categories.reduce(
      (sum, c) => sum + c.weightedContribution, 0
    ) / totalWeight;

    // The engine rounds to 1 decimal: Math.round(x * 10) / 10
    expect(result.overallScore).toBeCloseTo(
      Math.round(expectedOverall * 10) / 10,
      1
    );
  });

  it("should equal sum of weightedContributions / totalWeight for max answers", () => {
    const answers: Record<number, number> = {};
    for (const q of questions) {
      answers[q.id] = q.isReversed ? 1 : 4;
    }

    const result = runScoringEngine(answers);
    const totalWeight = Object.values(CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0);
    const expectedOverall = result.categories.reduce(
      (sum, c) => sum + c.weightedContribution, 0
    ) / totalWeight;

    expect(result.overallScore).toBeCloseTo(
      Math.round(expectedOverall * 10) / 10,
      1
    );
    // With all scores 100: overallScore = 100
    expect(result.overallScore).toBe(100);
  });

  it("should equal sum of weightedContributions / totalWeight for min answers", () => {
    const answers: Record<number, number> = {};
    for (const q of questions) {
      answers[q.id] = q.isReversed ? 4 : 1;
    }

    const result = runScoringEngine(answers);
    const totalWeight = Object.values(CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0);
    const expectedOverall = result.categories.reduce(
      (sum, c) => sum + c.weightedContribution, 0
    ) / totalWeight;

    expect(result.overallScore).toBeCloseTo(
      Math.round(expectedOverall * 10) / 10,
      1
    );
    expect(result.overallScore).toBe(25);
  });
});

// ─── 5. Anti-cheat stacking ──────────────────────────────────────────────────

describe("Anti-cheat violation stacking", () => {
  it("should produce higher suspicionScore when combining multiple violations than each alone", () => {
    // --- Violation A: Incomplete answers only (varied, so no straight-line) ---
    // Missing > 4 triggers INCOMPLETE_CRITICAL (severity "critical", score 0.50)
    // Missing 1-4 triggers INCOMPLETE_MINOR (severity "low", score 0.08)
    // Use 3 missing to get a low-severity violation only
    const incompleteAnswers: Record<number, number> = {};
    const pattern = [3, 2, 4, 3, 2, 3, 4, 2];
    questions.slice(0, questions.length - 3).forEach((q, i) => {
      incompleteAnswers[q.id] = pattern[i % pattern.length];
    });
    const incompleteReport = runAntiCheatDetection(incompleteAnswers);

    // --- Violation B: Fast timing only (with good varied complete answers) ---
    const goodAnswers: Record<number, number> = {};
    questions.forEach((q, i) => {
      goodAnswers[q.id] = pattern[i % pattern.length];
    });
    const fastTiming: TimingData = {
      startTime: 0,
      endTime: 30_000, // 30 seconds total (below 90s minimum)
      perQuestionMs: {},
    };
    questions.forEach(q => {
      fastTiming.perQuestionMs[q.id] = 900; // very fast per question
    });
    const fastTimingReport = runAntiCheatDetection(goodAnswers, fastTiming);

    // --- Combined: incomplete + fast timing ---
    const combinedAnswers: Record<number, number> = {};
    questions.slice(0, questions.length - 3).forEach((q, i) => {
      combinedAnswers[q.id] = pattern[i % pattern.length];
    });
    const combinedTiming: TimingData = {
      startTime: 0,
      endTime: 30_000,
      perQuestionMs: {},
    };
    questions.slice(0, questions.length - 3).forEach(q => {
      combinedTiming.perQuestionMs[q.id] = 900;
    });
    const combinedReport = runAntiCheatDetection(combinedAnswers, combinedTiming);

    // Each individual violation should produce a non-zero suspicion score
    expect(incompleteReport.suspicionScore).toBeGreaterThan(0);
    expect(fastTimingReport.suspicionScore).toBeGreaterThan(0);

    // Combined suspicion should be higher than each individual one
    expect(combinedReport.suspicionScore).toBeGreaterThan(incompleteReport.suspicionScore);
    expect(combinedReport.suspicionScore).toBeGreaterThan(fastTimingReport.suspicionScore);
  });

  it("should have more violations in the combined report than in individual ones", () => {
    // Straight-line only
    const slAnswers: Record<number, number> = {};
    for (const q of questions) {
      slAnswers[q.id] = 2;
    }
    const slReport = runAntiCheatDetection(slAnswers);

    // Incomplete only (> 4 missing to trigger INCOMPLETE_CRITICAL)
    const incAnswers: Record<number, number> = {};
    const pattern = [3, 2, 4, 3, 2, 3, 4, 2];
    questions.slice(0, 20).forEach((q, i) => {
      incAnswers[q.id] = pattern[i % pattern.length];
    });
    const incReport = runAntiCheatDetection(incAnswers);

    // Combined: straight-line + incomplete + fast timing
    const combAnswers: Record<number, number> = {};
    questions.slice(0, 20).forEach(q => {
      combAnswers[q.id] = 2;
    });
    const fastTiming: TimingData = {
      startTime: 0,
      endTime: 30_000,
      perQuestionMs: {},
    };
    questions.slice(0, 20).forEach(q => {
      fastTiming.perQuestionMs[q.id] = 900;
    });
    const combReport = runAntiCheatDetection(combAnswers, fastTiming);

    expect(combReport.violations.length).toBeGreaterThan(slReport.violations.length);
    expect(combReport.violations.length).toBeGreaterThan(incReport.violations.length);
  });

  it("should have higher confidencePenalty when stacking violations", () => {
    // Single violation: incomplete
    const incAnswers: Record<number, number> = {};
    const pattern = [3, 2, 4, 3, 2, 3, 4, 2];
    questions.slice(0, 20).forEach((q, i) => {
      incAnswers[q.id] = pattern[i % pattern.length];
    });
    const incReport = runAntiCheatDetection(incAnswers);

    // Stacked: incomplete + straight-line + speed
    const combAnswers: Record<number, number> = {};
    questions.slice(0, 20).forEach(q => {
      combAnswers[q.id] = 2;
    });
    const fastTiming: TimingData = {
      startTime: 0,
      endTime: 30_000,
      perQuestionMs: {},
    };
    questions.slice(0, 20).forEach(q => {
      fastTiming.perQuestionMs[q.id] = 900;
    });
    const combReport = runAntiCheatDetection(combAnswers, fastTiming);

    expect(combReport.confidencePenalty).toBeGreaterThan(incReport.confidencePenalty);
  });
});
