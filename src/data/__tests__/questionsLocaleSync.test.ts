import { describe, it, expect } from "vitest";
import { questions } from "@/data/diagnosticsQuestions";
import { ru } from "@/i18n/ru";
import { kz } from "@/i18n/kz";

describe("ru locale sync with diagnosticsQuestions", () => {
  it("has the same number of questions", () => {
    expect(ru.questions.length).toBe(questions.length);
  });

  it("has matching id at every index", () => {
    for (let i = 0; i < questions.length; i++) {
      expect(ru.questions[i].id, `index ${i}: expected id ${questions[i].id}`).toBe(
        questions[i].id,
      );
    }
  });

  it("has matching category at every index", () => {
    for (let i = 0; i < questions.length; i++) {
      expect(
        ru.questions[i].category,
        `index ${i} (id ${questions[i].id}): expected category "${questions[i].category}"`,
      ).toBe(questions[i].category);
    }
  });

  it("has the same number of options at every index", () => {
    for (let i = 0; i < questions.length; i++) {
      expect(
        ru.questions[i].options.length,
        `index ${i} (id ${questions[i].id}): option count mismatch`,
      ).toBe(questions[i].options.length);
    }
  });

  it("has matching option scores in the same order at every index", () => {
    for (let i = 0; i < questions.length; i++) {
      const srcScores = questions[i].options.map((o) => o.score);
      const localeScores = ru.questions[i].options.map((o) => o.score);
      expect(
        localeScores,
        `index ${i} (id ${questions[i].id}): option scores mismatch`,
      ).toEqual(srcScores);
    }
  });
});

describe("kz locale sync with diagnosticsQuestions", () => {
  it("has the same number of questions", () => {
    expect(kz.questions.length).toBe(questions.length);
  });

  it("has matching id at every index", () => {
    for (let i = 0; i < questions.length; i++) {
      expect(kz.questions[i].id, `index ${i}: expected id ${questions[i].id}`).toBe(
        questions[i].id,
      );
    }
  });

  it("has matching category at every index", () => {
    for (let i = 0; i < questions.length; i++) {
      expect(
        kz.questions[i].category,
        `index ${i} (id ${questions[i].id}): expected category "${questions[i].category}"`,
      ).toBe(questions[i].category);
    }
  });

  it("has the same number of options at every index", () => {
    for (let i = 0; i < questions.length; i++) {
      expect(
        kz.questions[i].options.length,
        `index ${i} (id ${questions[i].id}): option count mismatch`,
      ).toBe(questions[i].options.length);
    }
  });

  it("has matching option scores in the same order at every index", () => {
    for (let i = 0; i < questions.length; i++) {
      const srcScores = questions[i].options.map((o) => o.score);
      const localeScores = kz.questions[i].options.map((o) => o.score);
      expect(
        localeScores,
        `index ${i} (id ${questions[i].id}): option scores mismatch`,
      ).toEqual(srcScores);
    }
  });
});
