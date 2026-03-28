import { describe, it, expect } from "vitest";
import {
  questions,
  categoryLabels,
  CATEGORY_WEIGHTS,
  getMaxCategoryScore,
  applyReversal,
  getQuestionsByCategory,
} from "@/data/diagnosticsQuestions";
import type { Category } from "@/data/diagnosticsQuestions";

const ALL_CATEGORIES: Category[] = ["cognitive", "soft", "professional", "adaptability"];

describe("diagnosticsQuestions", () => {
  describe("questions array", () => {
    it("should contain exactly 32 questions", () => {
      expect(questions).toHaveLength(32);
    });

    it("should have all unique question IDs", () => {
      const ids = questions.map((q) => q.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(questions.length);
    });

    it("should have the expected number of questions per category", () => {
      const expectedCounts: Record<Category, number> = {
        cognitive: 8,
        soft: 8,
        professional: 8,
        adaptability: 8,
      };
      for (const cat of ALL_CATEGORIES) {
        const count = questions.filter((q) => q.category === cat).length;
        expect(
          count,
          `Expected ${expectedCounts[cat]} questions for ${cat}, got ${count}`
        ).toBe(expectedCounts[cat]);
      }
    });

    it("should have exactly 4 options per question", () => {
      for (const q of questions) {
        expect(
          q.options,
          `Question ${q.id} should have 4 options`
        ).toHaveLength(4);
      }
    });

    it("should have option scores in range 1-4", () => {
      for (const q of questions) {
        for (const opt of q.options) {
          expect(opt.score).toBeGreaterThanOrEqual(1);
          expect(opt.score).toBeLessThanOrEqual(4);
        }
      }
    });

    it("should have valid weight values (1.0, 1.5, or 2.0)", () => {
      for (const q of questions) {
        expect([1.0, 1.5, 2.0]).toContain(q.weight);
      }
    });

    it("should have valid difficulty values", () => {
      for (const q of questions) {
        expect(["easy", "medium", "hard"]).toContain(q.difficulty);
      }
    });

    it("should have non-empty text and competencyTag for every question", () => {
      for (const q of questions) {
        expect(q.text.length).toBeGreaterThan(0);
        expect(q.competencyTag.length).toBeGreaterThan(0);
      }
    });
  });

  describe("categoryLabels", () => {
    it("should have labels for all 4 categories", () => {
      for (const cat of ALL_CATEGORIES) {
        expect(categoryLabels[cat]).toBeDefined();
        expect(categoryLabels[cat].length).toBeGreaterThan(0);
      }
    });
  });

  describe("CATEGORY_WEIGHTS", () => {
    it("should have weights for all 4 categories", () => {
      for (const cat of ALL_CATEGORIES) {
        expect(CATEGORY_WEIGHTS[cat]).toBeDefined();
        expect(CATEGORY_WEIGHTS[cat]).toBeGreaterThan(0);
      }
    });

    it("should have weights that sum to 1.0", () => {
      const sum = Object.values(CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0);
    });
  });

  describe("getMaxCategoryScore()", () => {
    it("should return a positive number for each category", () => {
      for (const cat of ALL_CATEGORIES) {
        const max = getMaxCategoryScore(cat);
        expect(max).toBeGreaterThan(0);
      }
    });

    it("should equal sum of (4 * weight) for each question in category", () => {
      for (const cat of ALL_CATEGORIES) {
        const expected = questions
          .filter((q) => q.category === cat)
          .reduce((sum, q) => sum + 4 * q.weight, 0);
        expect(getMaxCategoryScore(cat)).toBe(expected);
      }
    });

    it("should return correct value for cognitive category", () => {
      // cognitive has weights: 1.0, 1.0, 1.5, 1.5, 1.0, 1.0, 1.5, 1.0 = 9.5 total weight
      // max = 9.5 * 4 (max score per question) = 38
      const cognitiveQuestions = questions.filter((q) => q.category === "cognitive");
      const expectedMax = cognitiveQuestions.reduce((sum, q) => sum + 4 * q.weight, 0);
      expect(getMaxCategoryScore("cognitive")).toBe(expectedMax);
    });
  });

  describe("applyReversal()", () => {
    it("should return the same score for non-reversed questions", () => {
      expect(applyReversal(1, false)).toBe(1);
      expect(applyReversal(2, false)).toBe(2);
      expect(applyReversal(3, false)).toBe(3);
      expect(applyReversal(4, false)).toBe(4);
    });

    it("should invert the score for reversed questions (5 - rawScore)", () => {
      expect(applyReversal(1, true)).toBe(4);
      expect(applyReversal(2, true)).toBe(3);
      expect(applyReversal(3, true)).toBe(2);
      expect(applyReversal(4, true)).toBe(1);
    });
  });

  describe("getQuestionsByCategory()", () => {
    it("should return an object with all 4 categories as keys", () => {
      const grouped = getQuestionsByCategory();
      for (const cat of ALL_CATEGORIES) {
        expect(grouped[cat]).toBeDefined();
        expect(Array.isArray(grouped[cat])).toBe(true);
      }
    });

    it("should have the expected number of questions in each category group", () => {
      const grouped = getQuestionsByCategory();
      const expectedCounts: Record<Category, number> = {
        cognitive: 8,
        soft: 8,
        professional: 8,
        adaptability: 8,
      };
      for (const cat of ALL_CATEGORIES) {
        expect(grouped[cat]).toHaveLength(expectedCounts[cat]);
      }
    });

    it("should only contain questions belonging to that category", () => {
      const grouped = getQuestionsByCategory();
      for (const cat of ALL_CATEGORIES) {
        for (const q of grouped[cat]) {
          expect(q.category).toBe(cat);
        }
      }
    });

    it("should include all 32 questions across all categories", () => {
      const grouped = getQuestionsByCategory();
      const totalQuestions = ALL_CATEGORIES.reduce(
        (sum, cat) => sum + grouped[cat].length,
        0
      );
      expect(totalQuestions).toBe(32);
    });
  });
});
