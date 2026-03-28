// ─────────────────────────────────────────────────────────────────────────────
// physicsQuestions.ts
// 32 вопроса · 4 категории · 8 вопросов на категорию
// Концептуальная физика: механика, термодинамика, электромагнетизм, оптика и волны
// ─────────────────────────────────────────────────────────────────────────────

import type { DiagnosticsQuestion } from "./diagnosticsQuestions";

export type PhysicsCategory = "mechanics" | "thermodynamics" | "electromagnetism" | "optics_waves";

export interface PhysicsQuestion extends Omit<DiagnosticsQuestion, "category"> {
  category: PhysicsCategory;
}

export const physicsQuestions: PhysicsQuestion[] = [

  // ─── MECHANICS (1–8) ────────────────────────────────────────────────────────

  {
    id: 1,
    text: "Что произойдёт с мячом, если убрать все силы трения?",
    category: "mechanics",
    weight: 1.0,
    isReversed: false,
    difficulty: "easy",
    competencyTag: "newtons_laws",
    options: [
      { label: "Мяч остановится через некоторое время", score: 0 },
      { label: "Мяч будет замедляться постепенно", score: 0 },
      { label: "Мяч будет двигаться с постоянной скоростью бесконечно", score: 1 },
      { label: "Мяч ускорится, потому что ничто не мешает", score: 0 },
    ],
  },
  {
    id: 2,
    text: "Почему космонавты на МКС находятся в состоянии невесомости?",
    category: "mechanics",
    weight: 1.5,
    isReversed: false,
    difficulty: "hard",
    competencyTag: "gravity",
    options: [
      { label: "Потому что там нет гравитации", score: 0 },
      { label: "Потому что они слишком далеко от Земли", score: 0 },
      { label: "Потому что МКС и космонавты находятся в свободном падении вокруг Земли", score: 1 },
      { label: "Потому что скорость МКС компенсирует гравитацию", score: 0 },
    ],
  },
  {
    id: 3,
    text: "Если бросить тяжёлый и лёгкий мяч одновременно с одной высоты (без учёта воздуха), какой упадёт первым?",
    category: "mechanics",
    weight: 1.0,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "free_fall",
    options: [
      { label: "Тяжёлый мяч упадёт быстрее", score: 0 },
      { label: "Лёгкий мяч упадёт быстрее", score: 0 },
      { label: "Оба упадут одновременно", score: 1 },
      { label: "Зависит от формы мячей", score: 0 },
    ],
  },
  {
    id: 4,
    text: "Почему при резком торможении автобуса пассажиры наклоняются вперёд?",
    category: "mechanics",
    weight: 1.0,
    isReversed: false,
    difficulty: "easy",
    competencyTag: "inertia",
    options: [
      { label: "Их толкает какая-то сила вперёд", score: 0 },
      { label: "Из-за инерции — тело продолжает движение по инерции", score: 1 },
      { label: "Из-за гравитации, которая тянет их вниз и вперёд", score: 0 },
      { label: "Из-за давления воздуха в автобусе", score: 0 },
    ],
  },
  {
    id: 5,
    text: "Мяч бросают строго вверх. В верхней точке траектории его ускорение равно:",
    category: "mechanics",
    weight: 1.5,
    isReversed: false,
    difficulty: "hard",
    competencyTag: "kinematics",
    options: [
      { label: "Нулю, потому что мяч на мгновение остановился", score: 0 },
      { label: "Максимальному значению", score: 0 },
      { label: "Ускорению свободного падения (g), направленному вниз", score: 1 },
      { label: "Зависит от начальной скорости броска", score: 0 },
    ],
  },
  {
    id: 6,
    text: "Какой закон физики объясняет, почему ракета может двигаться в вакууме?",
    category: "mechanics",
    weight: 1.5,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "newtons_laws",
    options: [
      { label: "Закон всемирного тяготения", score: 0 },
      { label: "Третий закон Ньютона — действие и противодействие", score: 1 },
      { label: "Закон сохранения энергии", score: 0 },
      { label: "Ракета отталкивается от воздуха у поверхности Земли", score: 0 },
    ],
  },
  {
    id: 7,
    text: "Тяжёлый предмет сложнее разогнать, потому что у него большая масса. Это означает, что масса и вес — это одно и то же.",
    category: "mechanics",
    weight: 1.0,
    isReversed: true,
    difficulty: "medium",
    competencyTag: "mass_weight",
    options: [
      { label: "Полностью согласен — масса и вес это одно и то же", score: 0 },
      { label: "Скорее согласен", score: 0 },
      { label: "Скорее не согласен — они связаны, но отличаются", score: 0 },
      { label: "Совершенно не согласен — масса это мера инертности, вес это сила", score: 1 },
    ],
  },
  {
    id: 8,
    text: "Почему фигурист вращается быстрее, когда прижимает руки к телу?",
    category: "mechanics",
    weight: 2.0,
    isReversed: false,
    difficulty: "hard",
    competencyTag: "angular_momentum",
    options: [
      { label: "Уменьшается сопротивление воздуха", score: 0 },
      { label: "Сохраняется момент импульса — при уменьшении момента инерции растёт скорость вращения", score: 1 },
      { label: "Центр масс смещается и вращение ускоряется", score: 0 },
      { label: "Мышцы создают дополнительный крутящий момент", score: 0 },
    ],
  },

  // ─── THERMODYNAMICS (9–16) ─────────────────────────────────────────────────

  {
    id: 9,
    text: "Почему металлическая ложка в горячем чае нагревается быстрее деревянной?",
    category: "thermodynamics",
    weight: 1.0,
    isReversed: false,
    difficulty: "easy",
    competencyTag: "heat_transfer",
    options: [
      { label: "Металл легче дерева", score: 0 },
      { label: "Металл имеет более высокую теплопроводность", score: 1 },
      { label: "Дерево отталкивает тепло", score: 0 },
      { label: "Металл поглощает больше тепла из воздуха", score: 0 },
    ],
  },
  {
    id: 10,
    text: "Почему при накачивании велосипедного насоса его корпус нагревается?",
    category: "thermodynamics",
    weight: 1.5,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "gas_laws",
    options: [
      { label: "Из-за трения поршня о стенки", score: 0 },
      { label: "При сжатии газа его температура повышается — работа переходит в тепло", score: 1 },
      { label: "Тепло рук передаётся насосу", score: 0 },
      { label: "Воздух внутри разогревается от давления шины", score: 0 },
    ],
  },
  {
    id: 11,
    text: "Почему зимой мы видим пар изо рта, а летом — нет?",
    category: "thermodynamics",
    weight: 1.0,
    isReversed: false,
    difficulty: "easy",
    competencyTag: "phase_transitions",
    options: [
      { label: "Зимой мы дышим другим газом", score: 0 },
      { label: "Водяной пар в выдыхаемом воздухе конденсируется при контакте с холодным воздухом", score: 1 },
      { label: "Зимой кислород становится видимым", score: 0 },
      { label: "Тёплый воздух из лёгких создаёт дым", score: 0 },
    ],
  },
  {
    id: 12,
    text: "Можно ли нагреть воду выше 100°C при нормальном атмосферном давлении (без крышки)?",
    category: "thermodynamics",
    weight: 1.5,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "boiling_point",
    options: [
      { label: "Да, если нагревать очень сильным пламенем", score: 0 },
      { label: "Нет — при 100°C вся энергия уходит на испарение, температура не растёт", score: 1 },
      { label: "Да, но только на несколько градусов", score: 0 },
      { label: "Зависит от объёма воды", score: 0 },
    ],
  },
  {
    id: 13,
    text: "Почему в скороварке еда готовится быстрее?",
    category: "thermodynamics",
    weight: 1.0,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "pressure_temperature",
    options: [
      { label: "Пар внутри горячее обычного", score: 0 },
      { label: "При повышенном давлении температура кипения воды возрастает", score: 1 },
      { label: "Металл скороварки лучше проводит тепло", score: 0 },
      { label: "Еда готовится под давлением, которое размягчает волокна", score: 0 },
    ],
  },
  {
    id: 14,
    text: "Термос сохраняет тепло горячего чая и холод мороженого. Как он работает?",
    category: "thermodynamics",
    weight: 1.5,
    isReversed: false,
    difficulty: "hard",
    competencyTag: "heat_transfer",
    options: [
      { label: "Термос генерирует тепло или холод по необходимости", score: 0 },
      { label: "Двойные стенки с вакуумом минимизируют все три вида теплопередачи", score: 1 },
      { label: "Специальное покрытие отражает температуру обратно", score: 0 },
      { label: "Толстые стенки термоса плохо проводят тепло", score: 0 },
    ],
  },
  {
    id: 15,
    text: "Если открыть дверцу работающего холодильника и оставить её открытой, температура в комнате:",
    category: "thermodynamics",
    weight: 2.0,
    isReversed: false,
    difficulty: "hard",
    competencyTag: "thermodynamics_laws",
    options: [
      { label: "Понизится — холодильник охлаждает комнату", score: 0 },
      { label: "Не изменится — холод и тепло уравновесятся", score: 0 },
      { label: "Повысится — компрессор выделяет больше тепла, чем забирает", score: 1 },
      { label: "Сначала понизится, потом повысится", score: 0 },
    ],
  },
  {
    id: 16,
    text: "Невозможно создать вечный двигатель, потому что это нарушало бы законы термодинамики.",
    category: "thermodynamics",
    weight: 1.0,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "thermodynamics_laws",
    options: [
      { label: "Не согласен — при достаточном развитии технологий это станет возможно", score: 0 },
      { label: "Скорее не согласен — нужно просто минимизировать потери", score: 0 },
      { label: "Скорее согласен — потери энергии неизбежны", score: 0 },
      { label: "Полностью согласен — второй закон термодинамики запрещает КПД 100%", score: 1 },
    ],
  },

  // ─── ELECTROMAGNETISM (17–24) ──────────────────────────────────────────────

  {
    id: 17,
    text: "Почему магнит притягивает железо, но не алюминий?",
    category: "electromagnetism",
    weight: 1.0,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "magnetism",
    options: [
      { label: "Алюминий слишком лёгкий для притяжения", score: 0 },
      { label: "Железо является ферромагнетиком — его атомы образуют магнитные домены", score: 1 },
      { label: "Алюминий покрыт оксидной плёнкой, которая блокирует магнитное поле", score: 0 },
      { label: "Магнит притягивает только тяжёлые металлы", score: 0 },
    ],
  },
  {
    id: 18,
    text: "Что произойдёт, если разрезать магнит пополам?",
    category: "electromagnetism",
    weight: 1.0,
    isReversed: false,
    difficulty: "easy",
    competencyTag: "magnetism",
    options: [
      { label: "Одна половина станет северным полюсом, другая — южным", score: 0 },
      { label: "Обе половины потеряют магнитные свойства", score: 0 },
      { label: "Каждая половина станет полноценным магнитом с двумя полюсами", score: 1 },
      { label: "Магнитное поле исчезнет", score: 0 },
    ],
  },
  {
    id: 19,
    text: "Почему птицы могут сидеть на высоковольтных проводах и не получать удар током?",
    category: "electromagnetism",
    weight: 1.5,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "electric_current",
    options: [
      { label: "Перья птиц являются изоляторами", score: 0 },
      { label: "Напряжение в проводах недостаточно для поражения птицы", score: 0 },
      { label: "Птица не создаёт разности потенциалов — обе лапы на одном проводе", score: 1 },
      { label: "Ток обходит птицу, потому что провод имеет меньшее сопротивление", score: 0 },
    ],
  },
  {
    id: 20,
    text: "Как работает электромагнит и чем он отличается от постоянного магнита?",
    category: "electromagnetism",
    weight: 1.5,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "electromagnet",
    options: [
      { label: "Электромагнит — просто более сильный магнит", score: 0 },
      { label: "Электромагнит создаёт магнитное поле при прохождении тока через катушку — его можно включать и выключать", score: 1 },
      { label: "Разницы нет — оба работают одинаково", score: 0 },
      { label: "Электромагнит притягивает только определённые металлы", score: 0 },
    ],
  },
  {
    id: 21,
    text: "Почему при грозе мы сначала видим молнию, а потом слышим гром?",
    category: "electromagnetism",
    weight: 1.0,
    isReversed: false,
    difficulty: "easy",
    competencyTag: "electromagnetic_waves",
    options: [
      { label: "Молния возникает раньше грома", score: 0 },
      { label: "Скорость света намного больше скорости звука", score: 1 },
      { label: "Звук задерживается облаками", score: 0 },
      { label: "Глаза быстрее реагируют, чем уши", score: 0 },
    ],
  },
  {
    id: 22,
    text: "Что является источником электромагнитных волн?",
    category: "electromagnetism",
    weight: 1.5,
    isReversed: false,
    difficulty: "hard",
    competencyTag: "electromagnetic_waves",
    options: [
      { label: "Любой неподвижный заряд", score: 0 },
      { label: "Только специальные антенны и передатчики", score: 0 },
      { label: "Любой ускоренно движущийся электрический заряд", score: 1 },
      { label: "Магнитное поле Земли", score: 0 },
    ],
  },
  {
    id: 23,
    text: "Почему мобильный телефон может работать без проводного подключения к сети?",
    category: "electromagnetism",
    weight: 1.0,
    isReversed: false,
    difficulty: "easy",
    competencyTag: "electromagnetic_waves",
    options: [
      { label: "Телефон подключён к спутнику напрямую", score: 0 },
      { label: "Телефон обменивается данными с базовой станцией через электромагнитные волны", score: 1 },
      { label: "Сигнал передаётся через воздух как звуковая волна", score: 0 },
      { label: "Батарея телефона содержит встроенный передатчик, не использующий волны", score: 0 },
    ],
  },
  {
    id: 24,
    text: "Статическое электричество — это просто слабый вариант обычного тока, и оно не представляет серьёзного интереса для физики.",
    category: "electromagnetism",
    weight: 1.0,
    isReversed: true,
    difficulty: "medium",
    competencyTag: "electrostatics",
    options: [
      { label: "Полностью согласен — это незначительное явление", score: 0 },
      { label: "Скорее согласен", score: 0 },
      { label: "Скорее не согласен — статическое электричество основано на накоплении зарядов и имеет свои законы", score: 0 },
      { label: "Совершенно не согласен — это фундаментальное явление, лежащее в основе электростатики", score: 1 },
    ],
  },

  // ─── OPTICS & WAVES (25–32) ────────────────────────────────────────────────

  {
    id: 25,
    text: "Почему небо голубое днём, но красное на закате?",
    category: "optics_waves",
    weight: 1.0,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "light_scattering",
    options: [
      { label: "Небо отражает цвет океанов", score: 0 },
      { label: "Молекулы атмосферы рассеивают коротковолновый (синий) свет сильнее; на закате свет проходит длинный путь и остаётся красный", score: 1 },
      { label: "Солнце меняет цвет в течение дня", score: 0 },
      { label: "Это оптическая иллюзия, связанная с нашим зрением", score: 0 },
    ],
  },
  {
    id: 26,
    text: "Почему ложка в стакане воды выглядит «сломанной»?",
    category: "optics_waves",
    weight: 1.0,
    isReversed: false,
    difficulty: "easy",
    competencyTag: "refraction",
    options: [
      { label: "Вода искажает форму предметов", score: 0 },
      { label: "Свет преломляется на границе воды и воздуха, меняя направление", score: 1 },
      { label: "Стекло стакана действует как линза", score: 0 },
      { label: "Это связано с давлением воды на ложку", score: 0 },
    ],
  },
  {
    id: 27,
    text: "Как работает оптоволокно для передачи интернет-сигнала?",
    category: "optics_waves",
    weight: 1.5,
    isReversed: false,
    difficulty: "hard",
    competencyTag: "total_internal_reflection",
    options: [
      { label: "Электрический ток передаётся по стеклянному волокну", score: 0 },
      { label: "Свет многократно отражается внутри волокна благодаря полному внутреннему отражению", score: 1 },
      { label: "Радиоволны проходят через стекло", score: 0 },
      { label: "Световой сигнал проходит прямо, как по трубе", score: 0 },
    ],
  },
  {
    id: 28,
    text: "Почему мы слышим звук приближающейся машины скорой помощи выше, чем удаляющейся?",
    category: "optics_waves",
    weight: 1.5,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "doppler_effect",
    options: [
      { label: "Водитель увеличивает громкость сирены при приближении", score: 0 },
      { label: "Эффект Доплера: звуковые волны сжимаются при приближении и растягиваются при удалении", score: 1 },
      { label: "Звук отражается от зданий при приближении", score: 0 },
      { label: "Наши уши по-разному воспринимают звук спереди и сзади", score: 0 },
    ],
  },
  {
    id: 29,
    text: "Почему белый свет разлагается в радугу при прохождении через призму?",
    category: "optics_waves",
    weight: 1.0,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "dispersion",
    options: [
      { label: "Призма окрашивает свет", score: 0 },
      { label: "Разные длины волн (цвета) преломляются под разными углами — дисперсия", score: 1 },
      { label: "Свет отражается от граней призмы", score: 0 },
      { label: "Призма фильтрует белый свет, пропуская только некоторые цвета", score: 0 },
    ],
  },
  {
    id: 30,
    text: "Почему в концертном зале звук со сцены достигает всех мест?",
    category: "optics_waves",
    weight: 1.0,
    isReversed: false,
    difficulty: "easy",
    competencyTag: "wave_properties",
    options: [
      { label: "Благодаря мощным динамикам", score: 0 },
      { label: "Звуковые волны распространяются во все стороны и отражаются от стен, обеспечивая равномерное покрытие", score: 1 },
      { label: "Зал построен из специального звукопроводящего материала", score: 0 },
      { label: "Звук передаётся через пол и сиденья", score: 0 },
    ],
  },
  {
    id: 31,
    text: "Можно ли услышать звук в открытом космосе?",
    category: "optics_waves",
    weight: 2.0,
    isReversed: false,
    difficulty: "hard",
    competencyTag: "sound_medium",
    options: [
      { label: "Да, если звук достаточно громкий", score: 0 },
      { label: "Нет — звуку нужна среда (газ, жидкость, твёрдое тело) для распространения, а в космосе вакуум", score: 1 },
      { label: "Да, но звук будет очень тихим", score: 0 },
      { label: "Зависит от расстояния между источником и слушателем", score: 0 },
    ],
  },
  {
    id: 32,
    text: "Свет — это только волна, и его поведение полностью описывается волновой теорией.",
    category: "optics_waves",
    weight: 1.0,
    isReversed: true,
    difficulty: "hard",
    competencyTag: "wave_particle_duality",
    options: [
      { label: "Полностью согласен — свет это волна", score: 0 },
      { label: "Скорее согласен", score: 0 },
      { label: "Скорее не согласен — свет проявляет и корпускулярные свойства", score: 0 },
      { label: "Совершенно не согласен — свет обладает корпускулярно-волновым дуализмом", score: 1 },
    ],
  },
];

// ─── METADATA ────────────────────────────────────────────────────────────────

export const physicsCategoryLabels: Record<PhysicsCategory, string> = {
  mechanics: "Механика",
  thermodynamics: "Термодинамика",
  electromagnetism: "Электромагнетизм",
  optics_waves: "Оптика и волны",
};

export const PHYSICS_CATEGORY_WEIGHTS: Record<PhysicsCategory, number> = {
  mechanics: 0.25,
  thermodynamics: 0.25,
  electromagnetism: 0.25,
  optics_waves: 0.25,
};

/** Максимально возможный сырой балл для категории (с учётом весов) */
export function getPhysicsMaxCategoryScore(category: PhysicsCategory): number {
  return physicsQuestions
    .filter(q => q.category === category)
    .reduce((sum, q) => sum + 1 * q.weight, 0);
}

/** Применить инверсию для reversed вопросов (binary scoring — no reversal needed, correct answer is already score 1) */
export function applyPhysicsReversal(rawScore: number, _isReversed: boolean): number {
  return rawScore;
}

/** Группировка вопросов по категории */
export function getPhysicsQuestionsByCategory(): Record<PhysicsCategory, PhysicsQuestion[]> {
  const result = {} as Record<PhysicsCategory, PhysicsQuestion[]>;
  for (const q of physicsQuestions) {
    if (!result[q.category]) result[q.category] = [];
    result[q.category].push(q);
  }
  return result;
}
