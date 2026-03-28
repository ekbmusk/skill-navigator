import type { Tables } from "@/integrations/supabase/types";
import type { CaseHistoryItem } from "@/hooks/useCaseHistory";

export interface Badge {
  id: string;
  icon: string;
  titleRu: string;
  titleKz: string;
  descriptionRu: string;
  descriptionKz: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export function computeAchievements(
  diagnosticsResults: Tables<"diagnostics_results">[],
  trainerAttempts: { trainer_type: string; score: number; max_score: number; completed_at: string }[],
  caseHistory: CaseHistoryItem[]
): Badge[] {
  // Guard against undefined/null inputs
  if (!Array.isArray(diagnosticsResults)) diagnosticsResults = [];
  if (!Array.isArray(trainerAttempts)) trainerAttempts = [];
  if (!Array.isArray(caseHistory)) caseHistory = [];
  // Helper to get test type from answers
  const getTestType = (r: Tables<"diagnostics_results">) => (r.answers as any)?._test_type || "general";

  // 1. First Step
  const hasAnyTest = diagnosticsResults.length >= 1;
  const firstTestDate = hasAnyTest
    ? [...diagnosticsResults].sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime())[0].completed_at
    : null;

  // 2. Researcher — all 3 test types
  const testTypes = new Set(diagnosticsResults.map(getTestType));
  const hasAllTypes = testTypes.has("general") && testTypes.has("physics") && testTypes.has("infocomm");
  const researcherDate = hasAllTypes
    ? [...diagnosticsResults].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0].completed_at
    : null;

  // 3. Top Result — any test >= 80%
  const topResult = diagnosticsResults.find(r => r.average_score >= 80);

  // 4. Team Player — first case
  const hasCase = caseHistory.length >= 1;
  const firstCaseDate = hasCase
    ? [...caseHistory].sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())[0].completedAt
    : null;

  // 5. Trainer Master — all 3 types
  const trainerTypes = new Set(trainerAttempts.map(a => a.trainer_type));
  const hasAllTrainers = trainerTypes.has("sbi_feedback") && trainerTypes.has("conflict_resolution") && trainerTypes.has("public_speaking");
  const trainerMasterDate = hasAllTrainers
    ? [...trainerAttempts].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0].completed_at
    : null;

  // 6. Progress — improvement >= 10% on general tests
  const generalResults = diagnosticsResults
    .filter(r => getTestType(r) === "general")
    .sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime());
  const hasProgress = generalResults.length >= 2 &&
    generalResults[generalResults.length - 1].average_score - generalResults[0].average_score >= 10;

  // 7. Advanced — avg of latest per type >= 70
  const latestByType = new Map<string, Tables<"diagnostics_results">>();
  for (const r of [...diagnosticsResults].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())) {
    const type = getTestType(r);
    if (!latestByType.has(type)) latestByType.set(type, r);
  }
  const latestScores = [...latestByType.values()].map(r => r.average_score);
  const avgLatest = latestScores.length > 0 ? latestScores.reduce((a, b) => a + b, 0) / latestScores.length : 0;
  const isAdvanced = avgLatest >= 70;

  return [
    {
      id: "first_step", icon: "🎯",
      titleRu: "Первый шаг", titleKz: "Бірінші қадам",
      descriptionRu: "Пройдите первый тест", descriptionKz: "Бірінші тестті тапсырыңыз",
      unlocked: hasAnyTest, unlockedAt: firstTestDate,
    },
    {
      id: "researcher", icon: "🧪",
      titleRu: "Исследователь", titleKz: "Зерттеуші",
      descriptionRu: "Пройдите все 3 типа диагностики", descriptionKz: "Диагностиканың 3 түрін де тапсырыңыз",
      unlocked: hasAllTypes, unlockedAt: researcherDate,
    },
    {
      id: "top_result", icon: "🏆",
      titleRu: "Лучший результат", titleKz: "Үздік нәтиже",
      descriptionRu: "Наберите 80%+ на любом тесте", descriptionKz: "Кез келген тестте 80%+ жинаңыз",
      unlocked: !!topResult, unlockedAt: topResult?.completed_at || null,
    },
    {
      id: "team_player", icon: "👥",
      titleRu: "Командный игрок", titleKz: "Командашы",
      descriptionRu: "Завершите первую симуляцию", descriptionKz: "Бірінші симуляцияны аяқтаңыз",
      unlocked: hasCase, unlockedAt: firstCaseDate,
    },
    {
      id: "trainer_master", icon: "🎓",
      titleRu: "Мастер тренажёров", titleKz: "Тренер шебері",
      descriptionRu: "Пройдите все 3 тренажёра", descriptionKz: "3 тренажерді де аяқтаңыз",
      unlocked: hasAllTrainers, unlockedAt: trainerMasterDate,
    },
    {
      id: "progress", icon: "📈",
      titleRu: "Прогресс", titleKz: "Прогресс",
      descriptionRu: "Улучшите результат на 10%+", descriptionKz: "Нәтижені 10%+ жақсартыңыз",
      unlocked: hasProgress,
      unlockedAt: hasProgress ? generalResults[generalResults.length - 1].completed_at : null,
    },
    {
      id: "advanced", icon: "⭐",
      titleRu: "Продвинутый", titleKz: "Жетілдірілген",
      descriptionRu: "Средний балл 70%+ по тестам", descriptionKz: "Тесттер бойынша орташа балл 70%+",
      unlocked: isAdvanced,
      unlockedAt: isAdvanced && latestByType.size > 0 ? [...latestByType.values()][0].completed_at : null,
    },
  ];
}
