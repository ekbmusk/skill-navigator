import { describe, it, expect } from "vitest";
import {
  getSkillLevel,
  variance,
  average,
  calculateRawConfidence,
  calculateRawConfidenceWithDiversity,
} from "@/utils/scoringHelpers";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("scoringHelpers", () => {
  describe("getSkillLevel()", () => {
    it("should return 'expert' for scores >= 75", () => {
      expect(getSkillLevel(75)).toBe("expert");
      expect(getSkillLevel(100)).toBe("expert");
      expect(getSkillLevel(99.9)).toBe("expert");
    });

    it("should return 'advanced' for scores >= 50 and < 75", () => {
      expect(getSkillLevel(50)).toBe("advanced");
      expect(getSkillLevel(74.9)).toBe("advanced");
      expect(getSkillLevel(60)).toBe("advanced");
    });

    it("should return 'basic' for scores >= 25 and < 50", () => {
      expect(getSkillLevel(25)).toBe("basic");
      expect(getSkillLevel(49.9)).toBe("basic");
      expect(getSkillLevel(35)).toBe("basic");
    });

    it("should return 'beginner' for scores < 25", () => {
      expect(getSkillLevel(0)).toBe("beginner");
      expect(getSkillLevel(24.9)).toBe("beginner");
      expect(getSkillLevel(10)).toBe("beginner");
    });

    it("should handle exact boundary values", () => {
      expect(getSkillLevel(25)).toBe("basic");
      expect(getSkillLevel(50)).toBe("advanced");
      expect(getSkillLevel(75)).toBe("expert");
    });
  });

  describe("variance()", () => {
    it("should return 0 for empty array", () => {
      expect(variance([])).toBe(0);
    });

    it("should return 0 for single element array", () => {
      expect(variance([5])).toBe(0);
    });

    it("should return 0 for array of identical values", () => {
      expect(variance([3, 3, 3, 3])).toBe(0);
    });

    it("should compute correct population variance for a normal array", () => {
      // [1, 2, 3, 4, 5] → mean=3, var = ((4+1+0+1+4)/5) = 2
      expect(variance([1, 2, 3, 4, 5])).toBe(2);
    });

    it("should compute correct variance for two elements", () => {
      // [1, 3] → mean=2, var = ((1+1)/2) = 1
      expect(variance([1, 3])).toBe(1);
    });

    it("should handle negative numbers", () => {
      // [-2, 2] → mean=0, var = (4+4)/2 = 4
      expect(variance([-2, 2])).toBe(4);
    });
  });

  describe("average()", () => {
    it("should return 0 for empty array", () => {
      expect(average([])).toBe(0);
    });

    it("should return the element for single element array", () => {
      expect(average([7])).toBe(7);
    });

    it("should compute correct average", () => {
      expect(average([1, 2, 3, 4, 5])).toBe(3);
    });

    it("should handle decimal results", () => {
      expect(average([1, 2])).toBe(1.5);
    });
  });

  describe("calculateRawConfidence()", () => {
    it("should return a value between 0 and 1", () => {
      const result = calculateRawConfidence(20, 30, [
        { internalVariance: 1.0 },
        { internalVariance: 0.8 },
      ]);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    it("should increase with higher completeness", () => {
      const low = calculateRawConfidence(5, 30, [{ internalVariance: 1.0 }]);
      const high = calculateRawConfidence(30, 30, [{ internalVariance: 1.0 }]);
      expect(high).toBeGreaterThan(low);
    });

    it("should increase with higher variance (up to saturation)", () => {
      const lowVar = calculateRawConfidence(30, 30, [{ internalVariance: 0 }]);
      const highVar = calculateRawConfidence(30, 30, [{ internalVariance: 1.2 }]);
      expect(highVar).toBeGreaterThan(lowVar);
    });
  });

  describe("calculateRawConfidenceWithDiversity()", () => {
    it("should return a value between 0 and 1", () => {
      const result = calculateRawConfidenceWithDiversity(
        10, 30,
        [{ internalVariance: 1.0 }],
        { 1: 2, 2: 3, 3: 4 }
      );
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    it("should be higher with full completeness than partial", () => {
      const partial = calculateRawConfidenceWithDiversity(
        5, 30,
        [{ internalVariance: 1.0 }],
        { 1: 2, 2: 3 }
      );
      const full = calculateRawConfidenceWithDiversity(
        30, 30,
        [{ internalVariance: 1.0 }],
        { 1: 2, 2: 3 }
      );
      expect(full).toBeGreaterThan(partial);
    });

    it("should account for diversity factor based on unique answer values", () => {
      // Only 1 unique value → diversity = 0.25
      const lowDiversity = calculateRawConfidenceWithDiversity(
        4, 4,
        [{ internalVariance: 0 }],
        { 1: 3, 2: 3, 3: 3, 4: 3 }
      );
      // 4 unique values → diversity = 1.0
      const highDiversity = calculateRawConfidenceWithDiversity(
        4, 4,
        [{ internalVariance: 0 }],
        { 1: 1, 2: 2, 3: 3, 4: 4 }
      );
      expect(highDiversity).toBeGreaterThan(lowDiversity);
    });

    it("should cap at 1 even with maximum inputs", () => {
      const result = calculateRawConfidenceWithDiversity(
        100, 100,
        [{ internalVariance: 5.0 }],
        { 1: 1, 2: 2, 3: 3, 4: 4 }
      );
      expect(result).toBeLessThanOrEqual(1);
    });

    it("should incorporate variance factor", () => {
      const noVar = calculateRawConfidenceWithDiversity(
        10, 10,
        [{ internalVariance: 0 }],
        { 1: 1, 2: 2, 3: 3, 4: 4 }
      );
      const highVar = calculateRawConfidenceWithDiversity(
        10, 10,
        [{ internalVariance: 1.5 }],
        { 1: 1, 2: 2, 3: 3, 4: 4 }
      );
      expect(highVar).toBeGreaterThan(noVar);
    });
  });
});
