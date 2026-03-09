// ─────────────────────────────────────────────────────────────────────────────
// diagnosticsQuestions.ts
// 32 вопроса · 4 категории · 8 вопросов на категорию
// Включает: weight, isReversed, difficulty, competencyTag
// ─────────────────────────────────────────────────────────────────────────────

export type Category = "cognitive" | "soft" | "professional" | "adaptability";

export interface DiagnosticsQuestion {
  id: number;
  text: string;
  category: Category;
  /** Вес вопроса в категории. 1.0 = стандартный, 1.5 = важный, 2.0 = ключевой */
  weight: number;
  /** true = обратный вопрос: при скоринге балл инвертируется (5 - score) */
  isReversed: boolean;
  /** Относительная сложность вопроса (используется в CAT-режиме) */
  difficulty: "easy" | "medium" | "hard";
  /** Тег компетенции для детальной аналитики */
  competencyTag: string;
  options: { label: string; score: number }[];
}

export const questions: DiagnosticsQuestion[] = [

  // ─── COGNITIVE (1–8) ────────────────────────────────────────────────────────

  {
    id: 1,
    text: "Как вы обычно подходите к решению сложной задачи, с которой раньше не сталкивались?",
    category: "cognitive",
    weight: 1.0,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "problem_solving",
    options: [
      { label: "Ищу готовое решение в интернете", score: 1 },
      { label: "Разбиваю задачу на части и решаю по очереди", score: 3 },
      { label: "Пытаюсь найти аналогию с известной задачей", score: 4 },
      { label: "Прошу помощи у коллег или однокурсников", score: 2 },
    ],
  },
  {
    id: 2,
    text: "При анализе данных или информации вы чаще всего:",
    category: "cognitive",
    weight: 1.0,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "critical_thinking",
    options: [
      { label: "Доверяю первому впечатлению", score: 1 },
      { label: "Проверяю информацию из нескольких источников", score: 4 },
      { label: "Строю гипотезы и проверяю их", score: 3 },
      { label: "Опираюсь на мнение экспертов", score: 2 },
    ],
  },
  {
    id: 3,
    text: "Когда вам нужно принять решение с неполной информацией, вы:",
    category: "cognitive",
    weight: 1.5,
    isReversed: false,
    difficulty: "hard",
    competencyTag: "decision_making",
    options: [
      { label: "Откладываю решение, пока не получу все данные", score: 1 },
      { label: "Принимаю решение на основе имеющихся фактов", score: 3 },
      { label: "Оцениваю риски и выбираю наименее опасный вариант", score: 4 },
      { label: "Полагаюсь на интуицию", score: 2 },
    ],
  },
  {
    id: 13,
    text: "Когда вы сталкиваетесь с противоречивыми данными, ваша первая реакция:",
    category: "cognitive",
    weight: 1.5,
    isReversed: false,
    difficulty: "hard",
    competencyTag: "critical_thinking",
    options: [
      { label: "Выбираю те данные, которые подтверждают мою гипотезу", score: 1 },
      { label: "Игнорирую противоречие, если общая картина ясна", score: 2 },
      { label: "Ищу дополнительные источники для разрешения противоречия", score: 3 },
      { label: "Признаю неопределённость и учитываю оба варианта", score: 4 },
    ],
  },
  {
    id: 14,
    text: "Как часто вы подвергаете сомнению собственные выводы?",
    category: "cognitive",
    weight: 1.0,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "metacognition",
    options: [
      { label: "Редко — если я что-то решил, значит это правильно", score: 1 },
      { label: "Только когда кто-то указывает на ошибку", score: 2 },
      { label: "Регулярно проверяю ключевые допущения", score: 3 },
      { label: "Всегда ищу слабые места в своих рассуждениях", score: 4 },
    ],
  },
  {
    id: 15,
    text: "При изучении новой темы вы предпочитаете:",
    category: "cognitive",
    weight: 1.0,
    isReversed: false,
    difficulty: "easy",
    competencyTag: "learning_strategy",
    options: [
      { label: "Читать краткое резюме или смотреть итоговое видео", score: 1 },
      { label: "Изучать примеры и потом разбираться в теории", score: 2 },
      { label: "Понимать базовые принципы, а потом строить на них", score: 4 },
      { label: "Практиковаться и учиться на ошибках", score: 3 },
    ],
  },
  {
    id: 16,
    text: "Если задача оказалась значительно сложнее, чем предполагалось изначально, вы:",
    category: "cognitive",
    weight: 1.5,
    isReversed: false,
    difficulty: "hard",
    competencyTag: "problem_solving",
    options: [
      { label: "Сдаюсь или передаю задачу кому-то другому", score: 1 },
      { label: "Прошу дать дополнительное время или ресурсы", score: 2 },
      { label: "Пересматриваю подход и ищу более простое решение", score: 3 },
      { label: "Декомпозирую задачу глубже и определяю минимально жизнеспособное решение", score: 4 },
    ],
  },
  {
    id: 17,
    text: "Когда вы решаете задачу, вы обычно стремитесь найти одно правильное решение и придерживаетесь его.",
    category: "cognitive",
    weight: 1.0,
    isReversed: true,
    difficulty: "medium",
    competencyTag: "problem_solving",
    options: [
      { label: "Полностью согласен", score: 1 },
      { label: "Скорее согласен", score: 2 },
      { label: "Скорее не согласен", score: 3 },
      { label: "Совершенно не согласен — рассматриваю несколько вариантов", score: 4 },
    ],
  },

  // ─── SOFT SKILLS (4–6, 18–23) ───────────────────────────────────────────────

  {
    id: 4,
    text: "Как вы ведёте себя при конфликте в команде?",
    category: "soft",
    weight: 1.5,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "conflict_resolution",
    options: [
      { label: "Стараюсь избежать конфликта", score: 1 },
      { label: "Выслушиваю все стороны и ищу компромисс", score: 4 },
      { label: "Настаиваю на своей точке зрения", score: 2 },
      { label: "Предлагаю привлечь нейтральную сторону", score: 3 },
    ],
  },
  {
    id: 5,
    text: "Как вы обычно представляете свои идеи группе?",
    category: "soft",
    weight: 1.0,
    isReversed: false,
    difficulty: "easy",
    competencyTag: "communication",
    options: [
      { label: "Кратко озвучиваю суть без подготовки", score: 2 },
      { label: "Готовлю структурированную презентацию", score: 4 },
      { label: "Объясняю на примерах и аналогиях", score: 3 },
      { label: "Жду, пока спросят моё мнение", score: 1 },
    ],
  },
  {
    id: 6,
    text: "Когда коллега допускает ошибку, вы:",
    category: "soft",
    weight: 1.0,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "feedback_culture",
    options: [
      { label: "Молча исправляю за него", score: 1 },
      { label: "Даю конструктивную обратную связь наедине", score: 4 },
      { label: "Указываю на ошибку при всех", score: 2 },
      { label: "Помогаю разобраться в причинах ошибки", score: 3 },
    ],
  },
  {
    id: 18,
    text: "Вы получили критику по своей работе на общем собрании. Как вы реагируете?",
    category: "soft",
    weight: 1.5,
    isReversed: false,
    difficulty: "hard",
    competencyTag: "emotional_intelligence",
    options: [
      { label: "Защищаюсь и объясняю, почему поступил именно так", score: 1 },
      { label: "Соглашаюсь публично, но внутренне не принимаю", score: 2 },
      { label: "Выслушиваю, задаю уточняющие вопросы", score: 3 },
      { label: "Воспринимаю как полезную информацию и благодарю за обратную связь", score: 4 },
    ],
  },
  {
    id: 19,
    text: "Насколько хорошо вы умеете слушать собеседника, не перебивая и не формулируя ответ заранее?",
    category: "soft",
    weight: 1.0,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "active_listening",
    options: [
      { label: "Часто ловлю себя на том, что думаю о своём ответе, пока говорит другой", score: 1 },
      { label: "Стараюсь слушать, но иногда перебиваю", score: 2 },
      { label: "Обычно выслушиваю до конца, потом отвечаю", score: 3 },
      { label: "Практикую активное слушание: перефразирую, уточняю, резюмирую", score: 4 },
    ],
  },
  {
    id: 20,
    text: "При работе в команде я предпочитаю действовать самостоятельно, не отвлекая других участников.",
    category: "soft",
    weight: 1.0,
    isReversed: true,
    difficulty: "easy",
    competencyTag: "teamwork",
    options: [
      { label: "Полностью согласен — самостоятельность эффективнее", score: 1 },
      { label: "Скорее согласен", score: 2 },
      { label: "Скорее не согласен — взаимодействие важно", score: 3 },
      { label: "Совершенно не согласен — регулярная синхронизация критична", score: 4 },
    ],
  },
  {
    id: 21,
    text: "Как вы выстраиваете доверие с новыми коллегами или партнёрами?",
    category: "soft",
    weight: 1.5,
    isReversed: false,
    difficulty: "hard",
    competencyTag: "relationship_building",
    options: [
      { label: "Жду, пока другие сделают первый шаг", score: 1 },
      { label: "Веду себя формально до установления рабочих отношений", score: 2 },
      { label: "Проявляю инициативу: знакомлюсь, делюсь контекстом о себе", score: 3 },
      { label: "Целенаправленно нахожу общие точки, предлагаю помощь, выполняю обещания", score: 4 },
    ],
  },

  // ─── PROFESSIONAL (7–9, 22–28) ──────────────────────────────────────────────

  {
    id: 7,
    text: "Как вы относитесь к изучению новых инструментов и технологий?",
    category: "professional",
    weight: 1.0,
    isReversed: false,
    difficulty: "easy",
    competencyTag: "continuous_learning",
    options: [
      { label: "Изучаю только когда это необходимо", score: 2 },
      { label: "Регулярно слежу за новинками и пробую их", score: 4 },
      { label: "Предпочитаю проверенные инструменты", score: 1 },
      { label: "Изучаю по рекомендации коллег", score: 3 },
    ],
  },
  {
    id: 8,
    text: "Как вы организуете свой рабочий процесс?",
    category: "professional",
    weight: 1.5,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "self_organization",
    options: [
      { label: "Работаю по вдохновению", score: 1 },
      { label: "Использую списки задач и приоритеты", score: 3 },
      { label: "Применяю методологии (Kanban, Pomodoro и т.д.)", score: 4 },
      { label: "Следую плану, составленному руководителем", score: 2 },
    ],
  },
  {
    id: 9,
    text: "Как вы оцениваете качество своей работы?",
    category: "professional",
    weight: 1.0,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "quality_mindset",
    options: [
      { label: "По отзывам преподавателей или начальства", score: 2 },
      { label: "Сравниваю с установленными стандартами", score: 3 },
      { label: "Провожу самоанализ и ищу области для улучшения", score: 4 },
      { label: "Считаю работу выполненной, если она сдана вовремя", score: 1 },
    ],
  },
  {
    id: 22,
    text: "Как вы расставляете приоритеты, когда у вас несколько срочных задач одновременно?",
    category: "professional",
    weight: 2.0,
    isReversed: false,
    difficulty: "hard",
    competencyTag: "prioritization",
    options: [
      { label: "Берусь за ту, которую быстрее сделаю", score: 1 },
      { label: "Решаю в порядке поступления", score: 2 },
      { label: "Оцениваю срочность и важность, применяю матрицу Эйзенхауэра", score: 4 },
      { label: "Согласую приоритеты с руководителем", score: 3 },
    ],
  },
  {
    id: 23,
    text: "Если вы видите, что процесс в команде неэффективен, вы:",
    category: "professional",
    weight: 1.5,
    isReversed: false,
    difficulty: "hard",
    competencyTag: "process_improvement",
    options: [
      { label: "Продолжаю работать по текущему процессу — это не моя ответственность", score: 1 },
      { label: "Жалуюсь коллегам, но ничего не предпринимаю", score: 2 },
      { label: "Предлагаю конкретное улучшение руководителю", score: 3 },
      { label: "Анализирую проблему, разрабатываю решение и инициирую его внедрение", score: 4 },
    ],
  },
  {
    id: 24,
    text: "Как вы документируете свою работу?",
    category: "professional",
    weight: 1.0,
    isReversed: false,
    difficulty: "easy",
    competencyTag: "documentation",
    options: [
      { label: "Не документирую — всё и так в голове", score: 1 },
      { label: "Документирую только если требуют", score: 2 },
      { label: "Пишу базовые заметки для себя", score: 3 },
      { label: "Веду структурированную документацию для себя и команды", score: 4 },
    ],
  },
  {
    id: 25,
    text: "Главное в работе — сдать задачу в срок, даже если качество немного пострадает.",
    category: "professional",
    weight: 1.0,
    isReversed: true,
    difficulty: "medium",
    competencyTag: "quality_mindset",
    options: [
      { label: "Полностью согласен — сроки важнее качества", score: 1 },
      { label: "Скорее согласен", score: 2 },
      { label: "Скорее не согласен — стараюсь балансировать", score: 3 },
      { label: "Совершенно не согласен — качество критично", score: 4 },
    ],
  },

  // ─── ADAPTABILITY (10–12, 26–32) ────────────────────────────────────────────

  {
    id: 10,
    text: "Как вы реагируете на неожиданные изменения в проекте?",
    category: "adaptability",
    weight: 1.5,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "change_management",
    options: [
      { label: "Это вызывает стресс и дискомфорт", score: 1 },
      { label: "Быстро перестраиваюсь и нахожу новые решения", score: 4 },
      { label: "Принимаю изменения, но нуждаюсь во времени на адаптацию", score: 2 },
      { label: "Вижу в изменениях новые возможности", score: 3 },
    ],
  },
  {
    id: 11,
    text: "Если привычный метод не работает, вы:",
    category: "adaptability",
    weight: 1.0,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "flexibility",
    options: [
      { label: "Пробую тот же метод ещё раз", score: 1 },
      { label: "Экспериментирую с альтернативными подходами", score: 4 },
      { label: "Консультируюсь с другими для поиска решения", score: 3 },
      { label: "Анализирую, почему метод не сработал", score: 2 },
    ],
  },
  {
    id: 12,
    text: "Как вы воспринимаете обратную связь и критику?",
    category: "adaptability",
    weight: 1.0,
    isReversed: false,
    difficulty: "easy",
    competencyTag: "growth_mindset",
    options: [
      { label: "Принимаю близко к сердцу, надолго выбивает из колеи", score: 1 },
      { label: "Воспринимаю как возможность для роста", score: 4 },
      { label: "Анализирую и беру только полезное", score: 3 },
      { label: "Реакция зависит от того, кто даёт обратную связь", score: 2 },
    ],
  },
  {
    id: 26,
    text: "Вам предложили перейти в другой отдел с новыми задачами, в которых у вас нет опыта. Ваша реакция:",
    category: "adaptability",
    weight: 2.0,
    isReversed: false,
    difficulty: "hard",
    competencyTag: "change_management",
    options: [
      { label: "Отказываюсь — слишком рискованно выходить из зоны комфорта", score: 1 },
      { label: "Соглашаюсь, но с большой тревогой", score: 2 },
      { label: "Принимаю предложение и составляю план освоения новых навыков", score: 3 },
      { label: "С энтузиазмом берусь — это шанс ускорить развитие", score: 4 },
    ],
  },
  {
    id: 27,
    text: "Как вы справляетесь с ситуацией, когда одновременно меняются правила, инструменты и команда?",
    category: "adaptability",
    weight: 1.5,
    isReversed: false,
    difficulty: "hard",
    competencyTag: "resilience",
    options: [
      { label: "Теряюсь и не знаю, с чего начать", score: 1 },
      { label: "Фокусируюсь на том, что контролирую, остальное откладываю", score: 2 },
      { label: "Приоритизирую изменения и адаптируюсь поэтапно", score: 3 },
      { label: "Рассматриваю как возможность переосмыслить подход к работе", score: 4 },
    ],
  },
  {
    id: 28,
    text: "Как часто вы выходите за рамки привычного рабочего контекста для получения новых знаний?",
    category: "adaptability",
    weight: 1.0,
    isReversed: false,
    difficulty: "easy",
    competencyTag: "growth_mindset",
    options: [
      { label: "Практически никогда — достаточно того, что знаю", score: 1 },
      { label: "Иногда, если вижу прямую практическую пользу", score: 2 },
      { label: "Регулярно читаю смежные темы и слежу за трендами", score: 3 },
      { label: "Целенаправленно изучаю области вне своей специализации", score: 4 },
    ],
  },
  {
    id: 29,
    text: "Я предпочитаю стабильную среду с предсказуемыми задачами, чем постоянно меняющуюся.",
    category: "adaptability",
    weight: 1.0,
    isReversed: true,
    difficulty: "easy",
    competencyTag: "flexibility",
    options: [
      { label: "Полностью согласен — стабильность продуктивнее", score: 1 },
      { label: "Скорее согласен", score: 2 },
      { label: "Скорее не согласен — мне нужен баланс", score: 3 },
      { label: "Совершенно не согласен — динамичная среда меня мотивирует", score: 4 },
    ],
  },
];

// ─── METADATA ────────────────────────────────────────────────────────────────

export const categoryLabels: Record<Category, string> = {
  cognitive: "Когнитивные навыки",
  soft: "Soft Skills",
  professional: "Профессиональные навыки",
  adaptability: "Адаптивность",
};

export const CATEGORY_WEIGHTS: Record<Category, number> = {
  cognitive: 0.30,
  soft: 0.25,
  professional: 0.25,
  adaptability: 0.20,
};

/** Максимально возможный сырой балл для категории (с учётом весов) */
export function getMaxCategoryScore(category: Category): number {
  return questions
    .filter(q => q.category === category)
    .reduce((sum, q) => sum + 4 * q.weight, 0);
}

/** Применить инверсию для reversed вопросов */
export function applyReversal(rawScore: number, isReversed: boolean): number {
  return isReversed ? 5 - rawScore : rawScore;
}

/** Группировка вопросов по категории */
export function getQuestionsByCategory(): Record<Category, DiagnosticsQuestion[]> {
  const result = {} as Record<Category, DiagnosticsQuestion[]>;
  for (const q of questions) {
    if (!result[q.category]) result[q.category] = [];
    result[q.category].push(q);
  }
  return result;
}
