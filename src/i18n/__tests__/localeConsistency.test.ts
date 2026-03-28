import { describe, it, expect } from "vitest";
import { ru } from "@/i18n/ru";
import { kz } from "@/i18n/kz";

const EXPECTED_TOP_LEVEL_KEYS = [
  "nav",
  "hero",
  "diagSection",
  "teachersSection",
  "casesSection",
  "footer",
  "diagnosticsPage",
  "results",
  "auth",
  "profile",
  "casePage",
  "dashboard",
  "categories",
  "questions",
] as const;

describe("Locale consistency between ru and kz", () => {
  describe("top-level keys", () => {
    it("ru has all expected top-level keys", () => {
      for (const key of EXPECTED_TOP_LEVEL_KEYS) {
        expect(ru).toHaveProperty(key);
      }
    });

    it("kz has all expected top-level keys", () => {
      for (const key of EXPECTED_TOP_LEVEL_KEYS) {
        expect(kz).toHaveProperty(key);
      }
    });

    it("ru and kz have the same top-level keys", () => {
      const ruKeys = Object.keys(ru).sort();
      const kzKeys = Object.keys(kz).sort();
      expect(ruKeys).toEqual(kzKeys);
    });
  });

  describe("nested object keys match between ru and kz", () => {
    const nestedSections = EXPECTED_TOP_LEVEL_KEYS.filter(
      (key) => key !== "questions"
    );

    for (const section of nestedSections) {
      it(`ru.${section} and kz.${section} have the same sub-keys`, () => {
        const ruSection = ru[section] as Record<string, unknown>;
        const kzSection = kz[section] as Record<string, unknown>;

        const ruSubKeys = Object.keys(ruSection).sort();
        const kzSubKeys = Object.keys(kzSection).sort();

        expect(ruSubKeys).toEqual(kzSubKeys);
      });
    }
  });

  describe("questions array", () => {
    it("ru.questions and kz.questions have the same length", () => {
      expect(ru.questions.length).toBe(kz.questions.length);
    });

    it("each question has matching id at the same index", () => {
      for (let i = 0; i < ru.questions.length; i++) {
        expect(kz.questions[i].id).toBe(ru.questions[i].id);
      }
    });

    it("each question has matching category at the same index", () => {
      for (let i = 0; i < ru.questions.length; i++) {
        expect(kz.questions[i].category).toBe(ru.questions[i].category);
      }
    });

    it("each question has the same number of options", () => {
      for (let i = 0; i < ru.questions.length; i++) {
        expect(kz.questions[i].options.length).toBe(
          ru.questions[i].options.length
        );
      }
    });

    it("option scores are identical between languages for each question", () => {
      for (let i = 0; i < ru.questions.length; i++) {
        const ruScores = ru.questions[i].options.map((o) => o.score);
        const kzScores = kz.questions[i].options.map((o) => o.score);

        expect(kzScores).toEqual(ruScores);
      }
    });
  });
});
