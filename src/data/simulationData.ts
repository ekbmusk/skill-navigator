// ============================================================
// Team Simulator: types, roles, and helper data
// ============================================================

export type SimRole = "leader" | "analyst" | "creative" | "presenter";

export interface SimPhase {
  name: string;
  nameKz: string;
  duration: number; // seconds
  description: string;
  descriptionKz: string;
  icon: string;
  tasks: string[];
  tasksKz: string[];
}

export interface ConflictOption {
  text: string;
  textKz: string;
  impact: string;
}

export interface ConflictEvent {
  key: string;
  phase: number;
  title: string;
  titleKz: string;
  description: string;
  descriptionKz: string;
  options: ConflictOption[];
}

export interface Participant {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  role: SimRole | "member";
}

export interface SimulationSession {
  id: string;
  case_id: string;
  status: "lobby" | "in_progress" | "completed";
  current_phase: number;
  phase_started_at: string | null;
  created_by: string;
  created_at: string;
  completed_at: string | null;
}

export interface PeerFeedbackData {
  reviewee_id: string;
  communication: number;
  teamwork: number;
  leadership: number;
  problem_solving: number;
  comment: string;
}

export interface FeedbackSummary {
  user_id: string;
  full_name: string;
  avg_communication: number;
  avg_teamwork: number;
  avg_leadership: number;
  avg_problem_solving: number;
  total_avg: number;
  count: number;
}

// Role definitions with descriptions and responsibilities
export const ROLE_DEFINITIONS: Record<
  SimRole,
  {
    icon: string;
    color: string;
    label: string;
    labelKz: string;
    description: string;
    descriptionKz: string;
    responsibilities: string[];
    responsibilitiesKz: string[];
  }
> = {
  leader: {
    icon: "crown",
    color: "text-yellow-500",
    label: "Тим-лидер",
    labelKz: "Тим-лидер",
    description: "Координирует работу команды, принимает ключевые решения",
    descriptionKz:
      "Команда жұмысын үйлестіреді, негізгі шешімдер қабылдайды",
    responsibilities: [
      "Распределение задач",
      "Контроль сроков",
      "Решение конфликтов",
    ],
    responsibilitiesKz: [
      "Тапсырмаларды бөлу",
      "Мерзімдерді бақылау",
      "Қақтығыстарды шешу",
    ],
  },
  analyst: {
    icon: "bar-chart",
    color: "text-blue-500",
    label: "Аналитик",
    labelKz: "Аналитик",
    description: "Анализирует данные, обосновывает решения фактами",
    descriptionKz: "Деректерді талдайды, шешімдерді фактілермен негіздейді",
    responsibilities: [
      "Сбор и анализ данных",
      "Подготовка отчётов",
      "Оценка рисков",
    ],
    responsibilitiesKz: [
      "Деректерді жинау және талдау",
      "Есептер дайындау",
      "Тәуекелдерді бағалау",
    ],
  },
  creative: {
    icon: "palette",
    color: "text-purple-500",
    label: "Креативщик",
    labelKz: "Креативші",
    description: "Генерирует идеи, предлагает нестандартные решения",
    descriptionKz:
      "Идеялар генерациялайды, стандартты емес шешімдер ұсынады",
    responsibilities: [
      "Генерация идей",
      "Визуализация концепций",
      "Креативные решения",
    ],
    responsibilitiesKz: [
      "Идеялар генерациясы",
      "Тұжырымдамаларды визуализациялау",
      "Креативті шешімдер",
    ],
  },
  presenter: {
    icon: "mic",
    color: "text-green-500",
    label: "Презентер",
    labelKz: "Презентер",
    description: "Оформляет и представляет результаты работы команды",
    descriptionKz:
      "Команда жұмысының нәтижелерін рәсімдейді және ұсынады",
    responsibilities: [
      "Оформление решения",
      "Подготовка презентации",
      "Защита проекта",
    ],
    responsibilitiesKz: [
      "Шешімді рәсімдеу",
      "Презентация дайындау",
      "Жобаны қорғау",
    ],
  },
};

export const PHASE_ICONS: Record<string, string> = {
  lightbulb: "Lightbulb",
  clipboard: "ClipboardList",
  cog: "Settings",
  presentation: "Presentation",
  search: "Search",
  target: "Target",
  layers: "Layers",
};
