import { describe, it, expect } from "vitest";
import {
  runAntiCheatDetection,
  applyAntiCheatPenalty,
} from "@/utils/antiCheatDetection";
import type { TimingData, AntiCheatReport } from "@/utils/antiCheatDetection";
import { questions } from "@/data/diagnosticsQuestions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a full answer set where every question gets the same score */
function uniformAnswers(score: number): Record<number, number> {
  const answers: Record<number, number> = {};
  for (const q of questions) {
    answers[q.id] = score;
  }
  return answers;
}

/** Build a "clean" varied answer set that should not trigger anti-cheat */
function cleanAnswers(): Record<number, number> {
  const answers: Record<number, number> = {};
  // Non-periodic, well-distributed answers that mimic genuine responses
  const pattern = [3, 2, 4, 3, 2, 3, 4, 2, 3, 4, 2, 3, 3, 2, 4, 3, 2, 4, 3, 2, 3, 4, 2, 3, 4, 2, 3, 3, 4];
  questions.forEach((q, i) => {
    answers[q.id] = pattern[i % pattern.length];
  });
  return answers;
}

/** Build a repeating periodic pattern: 1,2,3,4,1,2,3,4,... */
function periodicAnswers(): Record<number, number> {
  const answers: Record<number, number> = {};
  questions.forEach((q, i) => {
    answers[q.id] = (i % 4) + 1;
  });
  return answers;
}

/** Build timing data */
function makeTiming(totalMs: number, perQuestionMs?: number): TimingData {
  const now = Date.now();
  const perQ = perQuestionMs ?? totalMs / questions.length;
  const perQuestionRecord: Record<number, number> = {};
  for (const q of questions) {
    perQuestionRecord[q.id] = perQ;
  }
  return {
    startTime: now - totalMs,
    endTime: now,
    perQuestionMs: perQuestionRecord,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("antiCheatDetection", () => {
  describe("checkStraightLining (via runAntiCheatDetection)", () => {
    it("should flag when all answers are the same value", () => {
      const report = runAntiCheatDetection(uniformAnswers(3));
      const straightLine = report.violations.find(
        (v) => v.code === "STRAIGHT_LINE"
      );
      expect(straightLine).toBeDefined();
      expect(straightLine!.severity).toBe("critical");
    });

    it("should not flag straight-lining for varied answers", () => {
      const report = runAntiCheatDetection(cleanAnswers());
      const straightLine = report.violations.find(
        (v) => v.code === "STRAIGHT_LINE" || v.code === "NEAR_STRAIGHT_LINE"
      );
      expect(straightLine).toBeUndefined();
    });
  });

  describe("checkPatternResponses (via runAntiCheatDetection)", () => {
    it("should detect periodic pattern 1,2,3,4,1,2,3,4,...", () => {
      const report = runAntiCheatDetection(periodicAnswers());
      const pattern = report.violations.find(
        (v) => v.code === "PERIODIC_PATTERN"
      );
      expect(pattern).toBeDefined();
      expect(pattern!.severity).toBe("high");
    });
  });

  describe("checkReversedInconsistency (via runAntiCheatDetection)", () => {
    it("should flag contradictory answers on normal vs reversed questions", () => {
      // Give high raw scores (4) to all questions.
      // For reversed questions, raw=4 -> adjusted=1 (5-4), while normal raw=4.
      // Gap = |1 - 4| = 3, which triggers the check.
      const answers = uniformAnswers(4);
      const report = runAntiCheatDetection(answers);
      const reversed = report.violations.find(
        (v) =>
          v.code === "REVERSED_INCONSISTENCY" ||
          v.code === "REVERSED_INCONSISTENCY_MINOR"
      );
      // With all-4 answers, reversed questions produce adjusted=1 vs normal=4, gap=3
      expect(reversed).toBeDefined();
    });

    it("should not flag when answers are consistent between normal and reversed", () => {
      // Use score 3 for normal, 2 for reversed (adjusted: 5-2=3), gap=0
      const answers: Record<number, number> = {};
      for (const q of questions) {
        answers[q.id] = q.isReversed ? 2 : 3; // both adjusted to 3
      }
      const report = runAntiCheatDetection(answers);
      const reversed = report.violations.find(
        (v) =>
          v.code === "REVERSED_INCONSISTENCY" ||
          v.code === "REVERSED_INCONSISTENCY_MINOR"
      );
      expect(reversed).toBeUndefined();
    });
  });

  describe("checkExtremeResponseStyle (via runAntiCheatDetection)", () => {
    it("should flag when only extreme values (1 or 4) are used", () => {
      const answers: Record<number, number> = {};
      questions.forEach((q, i) => {
        answers[q.id] = i % 2 === 0 ? 1 : 4;
      });
      const report = runAntiCheatDetection(answers);
      const ers = report.violations.find(
        (v) => v.code === "EXTREME_RESPONSE_STYLE"
      );
      expect(ers).toBeDefined();
      expect(ers!.severity).toBe("medium");
    });

    it("should not flag when moderate values are used", () => {
      const answers: Record<number, number> = {};
      questions.forEach((q, i) => {
        answers[q.id] = (i % 2) + 2; // alternating 2 and 3
      });
      const report = runAntiCheatDetection(answers);
      const ers = report.violations.find(
        (v) => v.code === "EXTREME_RESPONSE_STYLE"
      );
      expect(ers).toBeUndefined();
    });
  });

  describe("checkSpeedAbuse (via runAntiCheatDetection)", () => {
    it("should flag critical when total time < 90 seconds", () => {
      const timing = makeTiming(60_000); // 60 seconds total
      const report = runAntiCheatDetection(cleanAnswers(), timing);
      const speed = report.violations.find(
        (v) => v.code === "SPEED_TOO_FAST_TOTAL"
      );
      expect(speed).toBeDefined();
      expect(speed!.severity).toBe("critical");
    });

    it("should not flag speed when time is adequate", () => {
      const timing = makeTiming(5 * 60_000, 8_000); // 5 minutes, 8s per question
      const report = runAntiCheatDetection(cleanAnswers(), timing);
      const speed = report.violations.find(
        (v) =>
          v.code === "SPEED_TOO_FAST_TOTAL" ||
          v.code === "SPEED_TOO_FAST_QUESTIONS"
      );
      expect(speed).toBeUndefined();
    });

    it("should flag when too many individual questions answered too fast", () => {
      const timing = makeTiming(3 * 60_000, 1_000); // 3 min total, 1s per question
      const report = runAntiCheatDetection(cleanAnswers(), timing);
      const speed = report.violations.find(
        (v) => v.code === "SPEED_TOO_FAST_QUESTIONS"
      );
      expect(speed).toBeDefined();
      expect(speed!.severity).toBe("high");
    });
  });

  describe("checkCompleteness (via runAntiCheatDetection)", () => {
    it("should flag critical when many questions are missing", () => {
      const answers: Record<number, number> = {};
      // Only answer first 10 questions
      questions.slice(0, 10).forEach((q) => {
        answers[q.id] = 3;
      });
      const report = runAntiCheatDetection(answers);
      const incomplete = report.violations.find(
        (v) => v.code === "INCOMPLETE_CRITICAL"
      );
      expect(incomplete).toBeDefined();
      expect(incomplete!.severity).toBe("critical");
    });

    it("should flag minor when a few questions are missing", () => {
      const answers: Record<number, number> = {};
      // Answer all but 2
      questions.slice(0, questions.length - 2).forEach((q) => {
        answers[q.id] = 3;
      });
      const report = runAntiCheatDetection(answers);
      const incomplete = report.violations.find(
        (v) => v.code === "INCOMPLETE_MINOR"
      );
      expect(incomplete).toBeDefined();
      expect(incomplete!.severity).toBe("low");
    });

    it("should not flag when all questions are answered", () => {
      const report = runAntiCheatDetection(cleanAnswers());
      const incomplete = report.violations.find(
        (v) =>
          v.code === "INCOMPLETE_CRITICAL" || v.code === "INCOMPLETE_MINOR"
      );
      expect(incomplete).toBeUndefined();
    });
  });

  describe("runAntiCheatDetection() overall", () => {
    it("should pass with clean, varied answers", () => {
      const report = runAntiCheatDetection(cleanAnswers());
      expect(report.passed).toBe(true);
      expect(report.recommendation).toBe("valid");
      expect(report.suspicionScore).toBeLessThan(0.45);
    });

    it("should fail with all-same answers (straight-lining)", () => {
      const report = runAntiCheatDetection(uniformAnswers(2));
      expect(report.passed).toBe(false);
      expect(report.suspicionScore).toBeGreaterThanOrEqual(0.45);
    });

    it("should return suspicionScore between 0 and 1", () => {
      const report = runAntiCheatDetection(cleanAnswers());
      expect(report.suspicionScore).toBeGreaterThanOrEqual(0);
      expect(report.suspicionScore).toBeLessThanOrEqual(1);
    });

    it("should return confidencePenalty between 0 and 1", () => {
      const report = runAntiCheatDetection(cleanAnswers());
      expect(report.confidencePenalty).toBeGreaterThanOrEqual(0);
      expect(report.confidencePenalty).toBeLessThanOrEqual(1);
    });

    it("should recommend 'valid' when suspicionScore < 0.45", () => {
      const report = runAntiCheatDetection(cleanAnswers());
      if (report.suspicionScore < 0.45) {
        expect(report.recommendation).toBe("valid");
      }
    });

    it("should recommend 'invalidate' or 'flag_for_review' for highly suspicious answers", () => {
      // All same + fast timing = critical violations stacked
      const timing = makeTiming(30_000); // 30 seconds
      const report = runAntiCheatDetection(uniformAnswers(1), timing);
      expect(report.passed).toBe(false);
      expect(["invalidate", "flag_for_review"]).toContain(
        report.recommendation
      );
    });

    it("should include a non-empty summary string", () => {
      const report = runAntiCheatDetection(cleanAnswers());
      expect(report.summary.length).toBeGreaterThan(0);
    });
  });

  describe("applyAntiCheatPenalty()", () => {
    it("should not reduce confidence when penalty is 0", () => {
      const report: AntiCheatReport = {
        passed: true,
        suspicionScore: 0,
        confidencePenalty: 0,
        violations: [],
        summary: "",
        recommendation: "valid",
      };
      expect(applyAntiCheatPenalty(0.85, report)).toBe(0.85);
    });

    it("should reduce confidence proportionally to penalty", () => {
      const report: AntiCheatReport = {
        passed: false,
        suspicionScore: 0.5,
        confidencePenalty: 0.5,
        violations: [],
        summary: "",
        recommendation: "flag_for_review",
      };
      // 0.85 * (1 - 0.5) = 0.425 → rounded to 0.43
      expect(applyAntiCheatPenalty(0.85, report)).toBeCloseTo(0.43, 2);
    });

    it("should return 0 when penalty is 1", () => {
      const report: AntiCheatReport = {
        passed: false,
        suspicionScore: 1,
        confidencePenalty: 1,
        violations: [],
        summary: "",
        recommendation: "invalidate",
      };
      expect(applyAntiCheatPenalty(0.9, report)).toBe(0);
    });

    it("should never return a negative value", () => {
      const report: AntiCheatReport = {
        passed: false,
        suspicionScore: 1,
        confidencePenalty: 1,
        violations: [],
        summary: "",
        recommendation: "invalidate",
      };
      expect(applyAntiCheatPenalty(0, report)).toBeGreaterThanOrEqual(0);
    });
  });
});
