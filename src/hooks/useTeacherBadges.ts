import type { Badge } from "@/hooks/useAchievements";
import type { TeacherProfileData } from "@/hooks/useTeacherProfile";

export function computeTeacherBadges(data: TeacherProfileData | null): Badge[] {
  if (!data) {
    return getEmptyBadges();
  }

  return [
    {
      id: "first_class",
      icon: "👨‍🏫",
      titleRu: "Первый класс",
      titleKz: "Бірінші сынып",
      descriptionRu: "В группе есть студенты",
      descriptionKz: "Топта студенттер бар",
      unlocked: data.studentCount >= 1,
      unlockedAt: null,
    },
    {
      id: "analyst",
      icon: "📊",
      titleRu: "Аналитик",
      titleKz: "Аналитик",
      descriptionRu: "Используйте дашборд",
      descriptionKz: "Дашбордты пайдаланыңыз",
      unlocked: true, // teacher exists = has access
      unlockedAt: null,
    },
    {
      id: "grader",
      icon: "✅",
      titleRu: "Оценщик",
      titleKz: "Бағалаушы",
      descriptionRu: "Все решения оценены",
      descriptionKz: "Барлық шешімдер бағаланған",
      unlocked: data.ungradedSolutions === 0 && data.casesCompleted > 0,
      unlockedAt: null,
    },
    {
      id: "motivator",
      icon: "🏆",
      titleRu: "Мотиватор",
      titleKz: "Мотиватор",
      descriptionRu: "Средний балл группы ≥70%",
      descriptionKz: "Топтың орташа балы ≥70%",
      unlocked: data.avgScore >= 70,
      unlockedAt: null,
    },
    {
      id: "growth",
      icon: "📈",
      titleRu: "Рост группы",
      titleKz: "Топ өсімі",
      descriptionRu: "Группа показывает прогресс",
      descriptionKz: "Топ прогресс көрсетеді",
      unlocked: false, // future feature
      unlockedAt: null,
    },
    {
      id: "full_coverage",
      icon: "🌟",
      titleRu: "Полный охват",
      titleKz: "Толық қамту",
      descriptionRu: "Все студенты прошли тест",
      descriptionKz: "Барлық студенттер тест тапсырды",
      unlocked: data.allStudentsTested && data.studentCount > 0,
      unlockedAt: null,
    },
  ];
}

function getEmptyBadges(): Badge[] {
  return computeTeacherBadges({
    studentCount: 0, avgScore: 0, topStudent: null,
    recentActivity: [], testsCompleted: 0, casesCompleted: 0,
    trainerAttempts: 0, ungradedSolutions: 0, allStudentsTested: false,
  });
}
