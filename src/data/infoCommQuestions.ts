// ─────────────────────────────────────────────────────────────────────────────
// infoCommQuestions.ts
// Ақпараттық-коммуникативтік құзыреттілік диагностикасы
// 40 сұрақ · 5 компонент · 8 сұрақ на компонент
// ─────────────────────────────────────────────────────────────────────────────

export type InfoCommCategory =
  | "motivational"
  | "cognitive_info"
  | "activity"
  | "reflective"
  | "outcome";

export type QuestionType = "single_choice" | "ranking" | "scenario";

export interface InfoCommQuestion {
  id: number;
  text: string;
  textKz: string;
  category: InfoCommCategory;
  questionType: QuestionType;
  weight: number;
  isReversed: boolean;
  difficulty: "easy" | "medium" | "hard";
  competencyTag: string;
  options: { label: string; labelKz: string; score: number }[];
  scenario?: string;
  scenarioKz?: string;
  idealOrder?: number[];
}

export const infoCommQuestions: InfoCommQuestion[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // МОТИВАЦИЯЛЫҚ КОМПОНЕНТ (1–8)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 1,
    text: "Как часто вы самостоятельно ищете дополнительную информацию по интересующей вас теме?",
    textKz: "Сізді қызықтыратын тақырып бойынша қосымша ақпаратты қаншалықты жиі өз бетіңізше іздейсіз?",
    category: "motivational",
    questionType: "single_choice",
    weight: 1.0,
    isReversed: false,
    difficulty: "easy",
    competencyTag: "info_interest",
    options: [
      { label: "Только когда задают", labelKz: "Тек тапсырғанда ғана", score: 1 },
      { label: "Иногда, если тема интересна", labelKz: "Кейде, тақырып қызықты болса", score: 2 },
      { label: "Регулярно ищу в разных источниках", labelKz: "Түрлі көздерден тұрақты іздеймін", score: 3 },
      { label: "Постоянно — это часть моей ежедневной рутины", labelKz: "Үнемі — бұл менің күнделікті әдетім", score: 4 },
    ],
  },
  {
    id: 2,
    text: "Что вас мотивирует изучать новые источники информации?",
    textKz: "Сізді жаңа ақпарат көздерін зерттеуге не ынталандырады?",
    category: "motivational",
    questionType: "single_choice",
    weight: 1.0,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "knowledge_drive",
    options: [
      { label: "Ничего — использую только знакомые источники", labelKz: "Ештеңе — тек таныс көздерді қолданамын", score: 1 },
      { label: "Требования учебной программы", labelKz: "Оқу бағдарламасының талаптары", score: 2 },
      { label: "Желание расширить кругозор", labelKz: "Көзқарасымды кеңейту тілегі", score: 3 },
      { label: "Стремление быть экспертом в своей области", labelKz: "Өз саламда сарапшы болу ұмтылысы", score: 4 },
    ],
  },
  {
    id: 3,
    text: "Насколько вы открыты к общению с незнакомыми людьми в учебной/рабочей среде?",
    textKz: "Оқу/жұмыс ортасында бейтаныс адамдармен қарым-қатынасқа қаншалықты ашықсыз?",
    category: "motivational",
    questionType: "single_choice",
    weight: 1.5,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "communication_openness",
    options: [
      { label: "Избегаю общения с незнакомыми", labelKz: "Бейтаныстармен қарым-қатынастан қашамын", score: 1 },
      { label: "Общаюсь только по необходимости", labelKz: "Тек қажет болғанда сөйлесемін", score: 2 },
      { label: "С удовольствием общаюсь, если есть общая тема", labelKz: "Ортақ тақырып болса, қуана сөйлесемін", score: 3 },
      { label: "Активно инициирую общение и нетворкинг", labelKz: "Белсенді түрде қарым-қатынас бастаймын", score: 4 },
    ],
  },
  {
    id: 4,
    text: "Когда вам нужно выразить свою мысль, вы обычно:",
    textKz: "Өз ойыңызды білдіру керек болғанда, сіз әдетте:",
    category: "motivational",
    questionType: "single_choice",
    weight: 1.0,
    isReversed: false,
    difficulty: "easy",
    competencyTag: "expression_motivation",
    options: [
      { label: "Предпочитаю промолчать", labelKz: "Үндемей қалуды жөн көремін", score: 1 },
      { label: "Говорю, если спросят", labelKz: "Сұраса ғана айтамын", score: 2 },
      { label: "Стараюсь высказаться чётко и аргументированно", labelKz: "Анық және дәлелді айтуға тырысамын", score: 3 },
      { label: "Активно участвую в дискуссиях и делюсь идеями", labelKz: "Талқылауларға белсенді қатысып, идеялармен бөлісемін", score: 4 },
    ],
  },
  {
    id: 5,
    text: "Как вы относитесь к совместной работе над проектами?",
    textKz: "Жобалар бойынша бірлескен жұмысқа қалай қарайсыз?",
    category: "motivational",
    questionType: "single_choice",
    weight: 1.5,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "collaboration_interest",
    options: [
      { label: "Предпочитаю работать один", labelKz: "Жалғыз жұмыс істеуді жөн көремін", score: 1 },
      { label: "Соглашаюсь, если требуется", labelKz: "Қажет болса, келісемін", score: 2 },
      { label: "Нравится работать в команде — это продуктивнее", labelKz: "Командада жұмыс істеу ұнайды — бұл нәтижелірек", score: 3 },
      { label: "Активно ищу возможности для коллаборации", labelKz: "Ынтымақтастық мүмкіндіктерін белсенді іздеймін", score: 4 },
    ],
  },
  {
    id: 6,
    text: "Мне неинтересно узнавать что-то новое, если это не связано с моей учёбой/работой.",
    textKz: "Оқуыма/жұмысыма қатысы жоқ болса, жаңа нәрсе білу маған қызықты емес.",
    category: "motivational",
    questionType: "single_choice",
    weight: 1.0,
    isReversed: true,
    difficulty: "easy",
    competencyTag: "curiosity",
    options: [
      { label: "Полностью согласен", labelKz: "Толығымен келісемін", score: 1 },
      { label: "Скорее согласен", labelKz: "Негізінен келісемін", score: 2 },
      { label: "Скорее не согласен", labelKz: "Негізінен келіспеймін", score: 3 },
      { label: "Совершенно не согласен — мне всё интересно", labelKz: "Мүлде келіспеймін — маған бәрі қызық", score: 4 },
    ],
  },
  {
    id: 7,
    text: "Вы чувствуете потребность делиться найденной информацией с другими?",
    textKz: "Тапқан ақпаратыңызбен басқалармен бөлісу қажеттілігін сезесіз бе?",
    category: "motivational",
    questionType: "single_choice",
    weight: 1.0,
    isReversed: false,
    difficulty: "easy",
    competencyTag: "sharing_drive",
    options: [
      { label: "Нет, информация — для личного пользования", labelKz: "Жоқ, ақпарат — жеке пайдалану үшін", score: 1 },
      { label: "Иногда, если считаю информацию полезной", labelKz: "Кейде, ақпаратты пайдалы деп санасам", score: 2 },
      { label: "Часто обсуждаю найденное с коллегами", labelKz: "Тапқанымды әріптестерімен жиі талқылаймын", score: 3 },
      { label: "Всегда — создаю общие ресурсы и делюсь", labelKz: "Әрқашан — ортақ ресурстар жасаймын және бөлісемін", score: 4 },
    ],
  },
  {
    id: 8,
    text: "Расставьте факторы мотивации к обучению от наиболее важного к наименее важному:",
    textKz: "Оқуға деген мотивация факторларын маңыздылығы бойынша орналастырыңыз:",
    category: "motivational",
    questionType: "ranking",
    weight: 1.5,
    isReversed: false,
    difficulty: "hard",
    competencyTag: "motivation_priorities",
    options: [
      { label: "Внутренний интерес и любопытство", labelKz: "Ішкі қызығушылық пен білуге құмарлық", score: 4 },
      { label: "Карьерный рост и конкурентоспособность", labelKz: "Мансаптық өсу және бәсекеге қабілеттілік", score: 3 },
      { label: "Требования программы/руководителя", labelKz: "Бағдарлама/басшылық талаптары", score: 2 },
      { label: "Оценки и формальные результаты", labelKz: "Бағалар мен ресми нәтижелер", score: 1 },
    ],
    idealOrder: [0, 1, 2, 3],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // КОГНИТИВТІ КОМПОНЕНТ (9–16)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 9,
    text: "Как вы определяете надёжность источника информации?",
    textKz: "Ақпарат көзінің сенімділігін қалай анықтайсыз?",
    category: "cognitive_info",
    questionType: "single_choice",
    weight: 1.5,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "source_evaluation",
    options: [
      { label: "Не задумываюсь об этом", labelKz: "Бұл туралы ойланбаймын", score: 1 },
      { label: "Доверяю популярным сайтам", labelKz: "Танымал сайттарға сенемін", score: 2 },
      { label: "Проверяю автора и дату публикации", labelKz: "Авторды және жарияланған күнді тексеремін", score: 3 },
      { label: "Кросс-проверяю из нескольких источников, оцениваю методологию", labelKz: "Бірнеше көзден кросс-тексеремін, әдіснаманы бағалаймын", score: 4 },
    ],
  },
  {
    id: 10,
    text: "Какие методы поиска информации вы используете?",
    textKz: "Ақпарат іздеудің қандай әдістерін қолданасыз?",
    category: "cognitive_info",
    questionType: "single_choice",
    weight: 1.0,
    isReversed: false,
    difficulty: "easy",
    competencyTag: "search_methods",
    options: [
      { label: "Только Google/Яндекс — первая страница", labelKz: "Тек Google/Яндекс — бірінші бет", score: 1 },
      { label: "Использую несколько поисковиков", labelKz: "Бірнеше іздеу жүйесін қолданамын", score: 2 },
      { label: "Комбинирую поисковики, базы данных и библиотеки", labelKz: "Іздеу жүйелерін, деректер базаларын және кітапханаларды біріктіремін", score: 3 },
      { label: "Применяю продвинутые операторы поиска, API, специализированные БД", labelKz: "Іздеудің кеңейтілген операторларын, API, мамандандырылған ДБ қолданамын", score: 4 },
    ],
  },
  {
    id: 11,
    text: "Знаете ли вы разницу между первичными и вторичными источниками информации?",
    textKz: "Ақпараттың бастапқы және қайталама көздерінің айырмашылығын білесіз бе?",
    category: "cognitive_info",
    questionType: "single_choice",
    weight: 1.0,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "info_types",
    options: [
      { label: "Нет, не задумывался", labelKz: "Жоқ, ойланбаппын", score: 1 },
      { label: "Слышал, но не могу объяснить", labelKz: "Естігенмін, бірақ түсіндіре алмаймын", score: 2 },
      { label: "Знаю и использую это в работе", labelKz: "Білемін және жұмыста қолданамын", score: 3 },
      { label: "Свободно классифицирую и критически оцениваю оба типа", labelKz: "Екі типті еркін жіктеймін және сыни бағалаймын", score: 4 },
    ],
  },
  {
    id: 12,
    text: "Как вы оцениваете свои знания о видах коммуникации (вербальная, невербальная, письменная)?",
    textKz: "Коммуникация түрлері туралы (вербалды, бейвербалды, жазбаша) білімдеріңізді қалай бағалайсыз?",
    category: "cognitive_info",
    questionType: "single_choice",
    weight: 1.5,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "comm_types_knowledge",
    options: [
      { label: "Не различаю типы коммуникации", labelKz: "Коммуникация типтерін ажыратпаймын", score: 1 },
      { label: "Знаю основные виды, но не углублялся", labelKz: "Негізгі түрлерін білемін, бірақ тереңдемедім", score: 2 },
      { label: "Хорошо понимаю и сознательно использую разные виды", labelKz: "Жақсы түсінемін және саналы түрде әр түрлі нысандарды қолданамын", score: 3 },
      { label: "Владею теорией коммуникации и применяю на практике", labelKz: "Коммуникация теориясын меңгеремін және тәжірибеде қолданамын", score: 4 },
    ],
  },
  {
    id: 13,
    text: "Насколько хорошо вы знаете нормы академического/делового письма?",
    textKz: "Академиялық/іскерлік жазу нормаларын қаншалықты жақсы білесіз?",
    category: "cognitive_info",
    questionType: "single_choice",
    weight: 1.0,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "writing_norms",
    options: [
      { label: "Не знаком с правилами оформления", labelKz: "Рәсімдеу ережелерімен таныс емеспін", score: 1 },
      { label: "Знаю базовые правила", labelKz: "Негізгі ережелерді білемін", score: 2 },
      { label: "Свободно применяю стандарты оформления", labelKz: "Рәсімдеу стандарттарын еркін қолданамын", score: 3 },
      { label: "Помогаю другим с оформлением и рецензирую тексты", labelKz: "Басқаларға рәсімдеуде көмектесемін және мәтіндерді рецензиялаймын", score: 4 },
    ],
  },
  {
    id: 14,
    text: "Какие цифровые инструменты вы знаете и используете для обработки информации?",
    textKz: "Ақпаратты өңдеу үшін қандай цифрлық құралдарды білесіз және қолданасыз?",
    category: "cognitive_info",
    questionType: "single_choice",
    weight: 1.0,
    isReversed: false,
    difficulty: "easy",
    competencyTag: "digital_tools_knowledge",
    options: [
      { label: "Только текстовый редактор (Word)", labelKz: "Тек мәтіндік редактор (Word)", score: 1 },
      { label: "Текстовый редактор + таблицы + презентации", labelKz: "Мәтіндік редактор + кестелер + презентациялар", score: 2 },
      { label: "Плюс облачные сервисы, системы управления задачами", labelKz: "Плюс бұлттық сервистер, тапсырмаларды басқару жүйелері", score: 3 },
      { label: "Полный стек: аналитика, автоматизация, BI-инструменты, ИИ", labelKz: "Толық стек: аналитика, автоматтандыру, BI-құралдар, ЖИ", score: 4 },
    ],
  },
  {
    id: 15,
    text: "Мне достаточно знаний, которые дают на занятиях, искать дополнительно не нужно.",
    textKz: "Сабақтарда берілетін білім маған жеткілікті, қосымша іздеудің қажеті жоқ.",
    category: "cognitive_info",
    questionType: "single_choice",
    weight: 1.0,
    isReversed: true,
    difficulty: "easy",
    competencyTag: "learning_sufficiency",
    options: [
      { label: "Полностью согласен", labelKz: "Толығымен келісемін", score: 1 },
      { label: "Скорее согласен", labelKz: "Негізінен келісемін", score: 2 },
      { label: "Скорее не согласен", labelKz: "Негізінен келіспеймін", score: 3 },
      { label: "Совершенно не согласен — всегда ищу дополнительно", labelKz: "Мүлде келіспеймін — әрқашан қосымша іздеймін", score: 4 },
    ],
  },
  {
    id: 16,
    text: "Расставьте навыки работы с информацией от самого важного к менее важному:",
    textKz: "Ақпаратпен жұмыс істеу дағдыларын маңыздылығы бойынша орналастырыңыз:",
    category: "cognitive_info",
    questionType: "ranking",
    weight: 1.5,
    isReversed: false,
    difficulty: "hard",
    competencyTag: "info_skills_priority",
    options: [
      { label: "Критическая оценка достоверности", labelKz: "Сенімділікті сыни бағалау", score: 4 },
      { label: "Эффективный поиск и фильтрация", labelKz: "Тиімді іздеу және сүзу", score: 3 },
      { label: "Структурирование и систематизация", labelKz: "Құрылымдау және жүйелеу", score: 2 },
      { label: "Быстрое чтение и извлечение сути", labelKz: "Жылдам оқу және мәнді бөліп алу", score: 1 },
    ],
    idealOrder: [0, 1, 2, 3],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ІСКЕРЛІК КОМПОНЕНТ (17–24)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 17,
    text: "Как вы собираете информацию для учебного проекта или задания?",
    textKz: "Оқу жобасы немесе тапсырма үшін ақпаратты қалай жинайсыз?",
    category: "activity",
    questionType: "single_choice",
    weight: 1.0,
    isReversed: false,
    difficulty: "easy",
    competencyTag: "info_gathering",
    options: [
      { label: "Беру первое, что нахожу", labelKz: "Тапқан бірінші нәрсені аламын", score: 1 },
      { label: "Ищу в нескольких источниках, но не систематизирую", labelKz: "Бірнеше көзден іздеймін, бірақ жүйелемеймін", score: 2 },
      { label: "Собираю, фильтрую и структурирую по критериям", labelKz: "Жинаймын, сүземін және критерийлер бойынша құрылымдаймын", score: 3 },
      { label: "Применяю методологию исследования: план → сбор → анализ → синтез", labelKz: "Зерттеу әдіснамасын қолданамын: жоспар → жинау → талдау → синтез", score: 4 },
    ],
  },
  {
    id: 18,
    text: "Как вы анализируете и обрабатываете найденную информацию?",
    textKz: "Тапқан ақпаратты қалай талдайсыз және өңдейсіз?",
    category: "activity",
    questionType: "single_choice",
    weight: 1.5,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "info_processing",
    options: [
      { label: "Копирую и вставляю без изменений", labelKz: "Өзгеріссіз көшіремін", score: 1 },
      { label: "Пересказываю своими словами", labelKz: "Өз сөзіммен айтып беремін", score: 2 },
      { label: "Анализирую, сравниваю источники, делаю выводы", labelKz: "Талдаймын, көздерді салыстырамын, қорытынды жасаймын", score: 3 },
      { label: "Создаю собственные модели, визуализации и аналитические отчёты", labelKz: "Өз модельдерімді, визуализацияларымды және аналитикалық есептерді жасаймын", score: 4 },
    ],
  },
  {
    id: 19,
    text: "Как вы используете электронные ресурсы и цифровые платформы в обучении?",
    textKz: "Оқуда электрондық ресурстар мен цифрлық платформаларды қалай пайдаланасыз?",
    category: "activity",
    questionType: "single_choice",
    weight: 1.0,
    isReversed: false,
    difficulty: "easy",
    competencyTag: "digital_platforms",
    options: [
      { label: "Практически не использую", labelKz: "Іс жүзінде қолданбаймын", score: 1 },
      { label: "Использую для поиска и чтения", labelKz: "Іздеу және оқу үшін қолданамын", score: 2 },
      { label: "Активно использую LMS, облачные документы, чаты", labelKz: "LMS, бұлттық құжаттарды, чаттарды белсенді қолданамын", score: 3 },
      { label: "Создаю контент на платформах, веду блог/канал, автоматизирую", labelKz: "Платформаларда контент жасаймын, блог/канал жүргіземін, автоматтандырамын", score: 4 },
    ],
  },
  {
    id: 20,
    text: "Как вы выражаете свои мысли устно?",
    textKz: "Ойларыңызды ауызша қалай жеткізесіз?",
    category: "activity",
    questionType: "single_choice",
    weight: 1.5,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "oral_expression",
    options: [
      { label: "С трудом формулирую мысли", labelKz: "Ойларымды қиындықпен тұжырымдаймын", score: 1 },
      { label: "Могу объяснить, но не всегда чётко", labelKz: "Түсіндіре аламын, бірақ әрқашан анық емес", score: 2 },
      { label: "Чётко и логично излагаю позицию", labelKz: "Ұстанымымды анық және логикалы баяндаймын", score: 3 },
      { label: "Убедительно выступаю, адаптирую речь под аудиторию", labelKz: "Сенімді сөйлеймін, сөзімді аудиторияға бейімдеймін", score: 4 },
    ],
  },
  {
    id: 21,
    text: "Как вы участвуете в групповых обсуждениях и дискуссиях?",
    textKz: "Топтық талқылаулар мен пікірталастарға қалай қатысасыз?",
    category: "activity",
    questionType: "single_choice",
    weight: 1.0,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "group_discussion",
    options: [
      { label: "Стараюсь не участвовать", labelKz: "Қатыспауға тырысамын", score: 1 },
      { label: "Слушаю, но редко высказываюсь", labelKz: "Тыңдаймын, бірақ сирек пікір білдіремін", score: 2 },
      { label: "Активно участвую и аргументирую свою позицию", labelKz: "Белсенді қатысамын және ұстанымымды дәлелдеймін", score: 3 },
      { label: "Модерирую дискуссию, помогаю структурировать обсуждение", labelKz: "Пікірталасты басқарамын, талқылауды құрылымдауға көмектесемін", score: 4 },
    ],
  },
  {
    id: 22,
    text: "Как вы устанавливаете эффективную коммуникацию в различных ситуациях?",
    textKz: "Әртүрлі жағдайларда тиімді коммуникацияны қалай орнатасыз?",
    category: "activity",
    questionType: "scenario",
    weight: 2.0,
    isReversed: false,
    difficulty: "hard",
    competencyTag: "adaptive_communication",
    scenario: "Вам нужно представить результаты проекта: сначала техническому специалисту, затем руководителю без технического бэкграунда, а потом — однокурсникам.",
    scenarioKz: "Жобаның нәтижелерін ұсыну керек: алдымен техникалық маманға, содан кейін техникалық білімі жоқ басшыға, содан кейін — курстастарыңызға.",
    options: [
      { label: "Использую одну и ту же презентацию для всех", labelKz: "Барлығына бір презентацияны қолданамын", score: 1 },
      { label: "Немного меняю подачу, но содержание одинаковое", labelKz: "Ұсынуды аздап өзгертемін, бірақ мазмұн бірдей", score: 2 },
      { label: "Адаптирую уровень детализации и терминологию", labelKz: "Егжей-тегжейлілік деңгейін және терминологияны бейімдеймін", score: 3 },
      { label: "Полностью перестраиваю подачу: стиль, визуализацию, аргументацию", labelKz: "Ұсынуды толық өзгертемін: стиль, визуализация, дәлелдеу", score: 4 },
    ],
  },
  {
    id: 23,
    text: "Как вы выражаете свои мысли в письменной форме?",
    textKz: "Ойларыңызды жазбаша түрде қалай жеткізесіз?",
    category: "activity",
    questionType: "single_choice",
    weight: 1.0,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "written_expression",
    options: [
      { label: "Пишу с ошибками и без структуры", labelKz: "Қателіктермен және құрылымсыз жазамын", score: 1 },
      { label: "Базовая грамотность, но стиль не отточен", labelKz: "Негізгі сауаттылық, бірақ стиль жетілдірілмеген", score: 2 },
      { label: "Грамотно, структурированно и по сути", labelKz: "Сауатты, құрылымды және мәні бойынша", score: 3 },
      { label: "Профессиональный уровень: чётко, стилистически адаптировано", labelKz: "Кәсіби деңгей: анық, стилистикалық бейімделген", score: 4 },
    ],
  },
  {
    id: 24,
    text: "Мне проще работать с информацией одному, чем делиться и обсуждать.",
    textKz: "Ақпаратпен жалғыз жұмыс істеу маған бөлісіп, талқылаудан оңайырақ.",
    category: "activity",
    questionType: "single_choice",
    weight: 1.0,
    isReversed: true,
    difficulty: "easy",
    competencyTag: "collaborative_info_work",
    options: [
      { label: "Полностью согласен", labelKz: "Толығымен келісемін", score: 1 },
      { label: "Скорее согласен", labelKz: "Негізінен келісемін", score: 2 },
      { label: "Скорее не согласен", labelKz: "Негізінен келіспеймін", score: 3 },
      { label: "Совершенно не согласен — совместная работа эффективнее", labelKz: "Мүлде келіспеймін — бірлескен жұмыс тиімдірек", score: 4 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // РЕФЛЕКСИВТІ КОМПОНЕНТ (25–32)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 25,
    text: "Как часто вы оцениваете эффективность своего поиска информации?",
    textKz: "Ақпарат іздеуіңіздің тиімділігін қаншалықты жиі бағалайсыз?",
    category: "reflective",
    questionType: "single_choice",
    weight: 1.0,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "search_self_eval",
    options: [
      { label: "Никогда — нашёл и ладно", labelKz: "Ешқашан — таптым және жеткілікті", score: 1 },
      { label: "Редко задумываюсь", labelKz: "Сирек ойланамын", score: 2 },
      { label: "Периодически анализирую, где теряю время", labelKz: "Уақытымды қайда жоғалтатынымды мезгіл-мезгіл талдаймын", score: 3 },
      { label: "Регулярно оптимизирую свои стратегии поиска", labelKz: "Іздеу стратегияларымды тұрақты оңтайландырамын", score: 4 },
    ],
  },
  {
    id: 26,
    text: "Умеете ли вы определять свои сильные и слабые стороны в коммуникации?",
    textKz: "Коммуникациядағы күшті және әлсіз жақтарыңызды анықтай аласыз ба?",
    category: "reflective",
    questionType: "single_choice",
    weight: 1.5,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "comm_self_awareness",
    options: [
      { label: "Не задумывался об этом", labelKz: "Бұл туралы ойланбаппын", score: 1 },
      { label: "Знаю примерно, но не анализировал", labelKz: "Шамамен білемін, бірақ талдамаппын", score: 2 },
      { label: "Чётко осознаю свои плюсы и минусы", labelKz: "Плюстар мен минустарымды анық білемін", score: 3 },
      { label: "Регулярно работаю над улучшением слабых сторон", labelKz: "Әлсіз жақтарымды жақсарту үшін тұрақты жұмыс істеймін", score: 4 },
    ],
  },
  {
    id: 27,
    text: "После публичного выступления или презентации вы обычно:",
    textKz: "Көпшілік алдында сөйлеген немесе презентациядан кейін сіз әдетте:",
    category: "reflective",
    questionType: "single_choice",
    weight: 1.0,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "speech_reflection",
    options: [
      { label: "Не анализирую — главное, что выступил", labelKz: "Талдамаймын — бастысы, сөйледім", score: 1 },
      { label: "Вспоминаю только если что-то пошло не так", labelKz: "Бірдеңе дұрыс болмаса ғана еске алдамын", score: 2 },
      { label: "Анализирую, что получилось, а что нет", labelKz: "Не болды, не болмады деп талдаймын", score: 3 },
      { label: "Собираю обратную связь и составляю план улучшения", labelKz: "Кері байланыс жинаймын және жақсарту жоспарын құрамын", score: 4 },
    ],
  },
  {
    id: 28,
    text: "Как вы реагируете на обнаруженные ошибки в своей работе?",
    textKz: "Жұмысыңыздағы табылған қателіктерге қалай жауап бересіз?",
    category: "reflective",
    questionType: "single_choice",
    weight: 1.5,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "error_correction",
    options: [
      { label: "Расстраиваюсь и стараюсь забыть", labelKz: "Қиналамын және ұмытуға тырысамын", score: 1 },
      { label: "Исправляю, но не анализирую причину", labelKz: "Түзетемін, бірақ себебін талдамаймын", score: 2 },
      { label: "Анализирую причину и исправляю системно", labelKz: "Себебін талдаймын және жүйелі түзетемін", score: 3 },
      { label: "Создаю чек-листы и методы предотвращения повторения", labelKz: "Қайталанудың алдын алу үшін чек-листтер мен әдістер жасаймын", score: 4 },
    ],
  },
  {
    id: 29,
    text: "Стремитесь ли вы к саморазвитию в области коммуникации и работы с информацией?",
    textKz: "Коммуникация және ақпаратпен жұмыс саласында өзін-өзі дамытуға ұмтыласыз ба?",
    category: "reflective",
    questionType: "single_choice",
    weight: 1.0,
    isReversed: false,
    difficulty: "easy",
    competencyTag: "self_development",
    options: [
      { label: "Нет, мне достаточно текущих навыков", labelKz: "Жоқ, қазіргі дағдыларым жеткілікті", score: 1 },
      { label: "Иногда, если вижу конкретную пользу", labelKz: "Кейде, нақты пайдасын көрсем", score: 2 },
      { label: "Да, регулярно читаю книги и проходу курсы", labelKz: "Иә, тұрақты кітаптар оқимын және курстар өтемін", score: 3 },
      { label: "Это мой приоритет — у меня есть план развития", labelKz: "Бұл менің басымдығым — менде даму жоспары бар", score: 4 },
    ],
  },
  {
    id: 30,
    text: "Я редко задумываюсь о качестве своего общения с другими.",
    textKz: "Мен басқалармен қарым-қатынасымның сапасы туралы сирек ойланамын.",
    category: "reflective",
    questionType: "single_choice",
    weight: 1.0,
    isReversed: true,
    difficulty: "easy",
    competencyTag: "comm_quality_reflection",
    options: [
      { label: "Полностью согласен", labelKz: "Толығымен келісемін", score: 1 },
      { label: "Скорее согласен", labelKz: "Негізінен келісемін", score: 2 },
      { label: "Скорее не согласен", labelKz: "Негізінен келіспеймін", score: 3 },
      { label: "Совершенно не согласен — постоянно анализирую", labelKz: "Мүлде келіспеймін — үнемі талдаймын", score: 4 },
    ],
  },
  {
    id: 31,
    text: "Как вы оцениваете качество выражения своих мыслей?",
    textKz: "Ойларыңызды жеткізу сапасын қалай бағалайсыз?",
    category: "reflective",
    questionType: "single_choice",
    weight: 1.0,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "thought_expression_quality",
    options: [
      { label: "Не задумываюсь об этом", labelKz: "Бұл туралы ойланбаймын", score: 1 },
      { label: "Понимаю, что есть проблемы, но не работаю над ними", labelKz: "Мәселелердің бар екенін түсінемін, бірақ олармен жұмыс істемеймін", score: 2 },
      { label: "Регулярно прошу обратную связь и улучшаюсь", labelKz: "Тұрақты кері байланыс сұраймын және жетілемін", score: 3 },
      { label: "Записываю выступления, анализирую и тренируюсь", labelKz: "Сөздерді жазамын, талдаймын және жаттығамын", score: 4 },
    ],
  },
  {
    id: 32,
    text: "Расставьте навыки рефлексии от самого важного к менее важному:",
    textKz: "Рефлексия дағдыларын маңыздылығы бойынша орналастырыңыз:",
    category: "reflective",
    questionType: "ranking",
    weight: 1.5,
    isReversed: false,
    difficulty: "hard",
    competencyTag: "reflection_priorities",
    options: [
      { label: "Анализ своих ошибок и их причин", labelKz: "Қателіктерімді және олардың себептерін талдау", score: 4 },
      { label: "Осознание своих сильных сторон", labelKz: "Күшті жақтарымды түсіну", score: 3 },
      { label: "Сбор обратной связи от других", labelKz: "Басқалардан кері байланыс жинау", score: 2 },
      { label: "Составление плана саморазвития", labelKz: "Өзін-өзі дамыту жоспарын құру", score: 1 },
    ],
    idealOrder: [0, 1, 2, 3],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // НӘТИЖЕЛІК КОМПОНЕНТ (33–40)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 33,
    text: "Можете ли вы самостоятельно найти, обработать и представить информацию по заданной теме?",
    textKz: "Берілген тақырып бойынша ақпаратты өз бетіңізше тауып, өңдеп, ұсына аласыз ба?",
    category: "outcome",
    questionType: "single_choice",
    weight: 1.5,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "independent_info_work",
    options: [
      { label: "Нет, нужна помощь на каждом этапе", labelKz: "Жоқ, әр кезеңде көмек керек", score: 1 },
      { label: "Могу найти, но трудно обработать и представить", labelKz: "Таба аламын, бірақ өңдеу мен ұсыну қиын", score: 2 },
      { label: "Да, могу выполнить весь цикл самостоятельно", labelKz: "Иә, бүкіл циклді өз бетімше орындай аламын", score: 3 },
      { label: "Свободно — могу обучить этому других", labelKz: "Еркін — басқаларды да үйрете аламын", score: 4 },
    ],
  },
  {
    id: 34,
    text: "Насколько уверенно вы используете информационные технологии?",
    textKz: "Ақпараттық технологияларды қаншалықты сенімді қолданасыз?",
    category: "outcome",
    questionType: "single_choice",
    weight: 1.0,
    isReversed: false,
    difficulty: "easy",
    competencyTag: "it_competency",
    options: [
      { label: "Базовый уровень — только основные приложения", labelKz: "Негізгі деңгей — тек негізгі қосымшалар", score: 1 },
      { label: "Уверенно использую стандартный набор инструментов", labelKz: "Стандартты құралдар жиынтығын сенімді қолданамын", score: 2 },
      { label: "Продвинутый пользователь — автоматизирую рутину", labelKz: "Озық пайдаланушы — тұрақты жұмысты автоматтандырамын", score: 3 },
      { label: "Эксперт — разрабатываю решения и обучаю других", labelKz: "Сарапшы — шешімдер жасаймын және басқаларды оқытамын", score: 4 },
    ],
  },
  {
    id: 35,
    text: "Как вы оцениваете ясность и системность изложения своих мыслей?",
    textKz: "Ойларыңызды баяндаудың анықтығы мен жүйелілігін қалай бағалайсыз?",
    category: "outcome",
    questionType: "single_choice",
    weight: 1.5,
    isReversed: false,
    difficulty: "medium",
    competencyTag: "clarity_of_thought",
    options: [
      { label: "Часто путаюсь и теряю нить", labelKz: "Жиі шатасамын және ойымнан адасамын", score: 1 },
      { label: "Могу изложить, но не всегда логично", labelKz: "Баяндай аламын, бірақ әрқашан логикалы емес", score: 2 },
      { label: "Излагаю чётко и последовательно", labelKz: "Анық және дәйекті баяндаймын", score: 3 },
      { label: "Мои тексты и выступления ставят в пример", labelKz: "Менің мәтіндерім мен сөздерімді үлгі ретінде көрсетеді", score: 4 },
    ],
  },
  {
    id: 36,
    text: "Насколько активно вы участвуете во взаимодействии с другими людьми?",
    textKz: "Басқа адамдармен өзара әрекеттесуде қаншалықты белсендісіз?",
    category: "outcome",
    questionType: "single_choice",
    weight: 1.0,
    isReversed: false,
    difficulty: "easy",
    competencyTag: "interaction_activity",
    options: [
      { label: "Минимально — предпочитаю работать один", labelKz: "Ең аз — жалғыз жұмыс істеуді жөн көремін", score: 1 },
      { label: "Участвую, когда требуется", labelKz: "Қажет болғанда қатысамын", score: 2 },
      { label: "Активно участвую в обсуждениях и проектах", labelKz: "Талқылаулар мен жобаларға белсенді қатысамын", score: 3 },
      { label: "Инициирую взаимодействие и создаю коллаборации", labelKz: "Өзара әрекеттесуді бастаймын және ынтымақтастық құрамын", score: 4 },
    ],
  },
  {
    id: 37,
    text: "Как вы устанавливаете коммуникацию в профессиональной среде?",
    textKz: "Кәсіби ортада коммуникацияны қалай орнатасыз?",
    category: "outcome",
    questionType: "scenario",
    weight: 2.0,
    isReversed: false,
    difficulty: "hard",
    competencyTag: "professional_communication",
    scenario: "Вас назначили координатором межфакультетского проекта. Участники не знают друг друга и находятся в разных городах.",
    scenarioKz: "Сізді факультетаралық жобаның үйлестірушісі етіп тағайындады. Қатысушылар бір-бірін білмейді және әр түрлі қалаларда.",
    options: [
      { label: "Жду, пока кто-то другой организует коммуникацию", labelKz: "Басқа біреу коммуникацияны ұйымдастырғанша күтемін", score: 1 },
      { label: "Отправляю общее письмо с информацией", labelKz: "Ақпаратпен ортақ хат жіберемін", score: 2 },
      { label: "Создаю чат, ставлю онлайн-встречу для знакомства", labelKz: "Чат құрамын, танысу үшін онлайн-кездесу белгілеймін", score: 3 },
      { label: "Строю полную коммуникационную систему: чат + доска задач + регулярные встречи + документация", labelKz: "Толық коммуникация жүйесін құрамын: чат + тапсырмалар тақтасы + тұрақты кездесулер + құжаттама", score: 4 },
    ],
  },
  {
    id: 38,
    text: "Способны ли вы адаптировать стиль коммуникации под разную аудиторию?",
    textKz: "Коммуникация стилін әр түрлі аудиторияға бейімдей аласыз ба?",
    category: "outcome",
    questionType: "single_choice",
    weight: 1.5,
    isReversed: false,
    difficulty: "hard",
    competencyTag: "adaptive_style",
    options: [
      { label: "Нет, общаюсь всегда одинаково", labelKz: "Жоқ, әрқашан бірдей сөйлесемін", score: 1 },
      { label: "Пытаюсь, но не всегда успешно", labelKz: "Тырысамын, бірақ әрқашан сәтті бола бермейді", score: 2 },
      { label: "Да, меняю стиль в зависимости от ситуации", labelKz: "Иә, жағдайға байланысты стильді өзгертемін", score: 3 },
      { label: "Свободно переключаюсь между стилями и форматами", labelKz: "Стильдер мен форматтар арасында еркін ауысамын", score: 4 },
    ],
  },
  {
    id: 39,
    text: "Мне сложно работать с информацией самостоятельно без пошаговых инструкций.",
    textKz: "Қадам-қадам нұсқаулықсыз ақпаратпен өз бетімше жұмыс істеу маған қиын.",
    category: "outcome",
    questionType: "single_choice",
    weight: 1.0,
    isReversed: true,
    difficulty: "easy",
    competencyTag: "independence",
    options: [
      { label: "Полностью согласен", labelKz: "Толығымен келісемін", score: 1 },
      { label: "Скорее согласен", labelKz: "Негізінен келісемін", score: 2 },
      { label: "Скорее не согласен", labelKz: "Негізінен келіспеймін", score: 3 },
      { label: "Совершенно не согласен — я полностью самостоятелен", labelKz: "Мүлде келіспеймін — мен толығымен дербеспін", score: 4 },
    ],
  },
  {
    id: 40,
    text: "Расставьте результаты формирования информационно-коммуникативной компетентности от наиболее значимого к менее значимому:",
    textKz: "Ақпараттық-коммуникативтік құзыреттіліктің қалыптасу нәтижелерін маңыздылығы бойынша орналастырыңыз:",
    category: "outcome",
    questionType: "ranking",
    weight: 1.5,
    isReversed: false,
    difficulty: "hard",
    competencyTag: "competency_outcomes",
    options: [
      { label: "Эффективная коммуникация в профессиональной среде", labelKz: "Кәсіби ортада тиімді коммуникация", score: 4 },
      { label: "Самостоятельная работа с информацией", labelKz: "Ақпаратпен дербес жұмыс", score: 3 },
      { label: "Грамотное использование цифровых технологий", labelKz: "Цифрлық технологияларды сауатты қолдану", score: 2 },
      { label: "Чёткое и системное выражение мыслей", labelKz: "Ойларды анық және жүйелі жеткізу", score: 1 },
    ],
    idealOrder: [0, 1, 2, 3],
  },
];

// ─── METADATA ────────────────────────────────────────────────────────────────

export const infoCommCategoryLabels: Record<InfoCommCategory, string> = {
  motivational: "Мотивациялық",
  cognitive_info: "Когнитивтік",
  activity: "Іс-әрекеттік",
  reflective: "Рефлексивтік",
  outcome: "Нәтижелік",
};

export const infoCommCategoryLabelsRu: Record<InfoCommCategory, string> = {
  motivational: "Мотивационный",
  cognitive_info: "Когнитивный",
  activity: "Деятельностный",
  reflective: "Рефлексивный",
  outcome: "Результативный",
};

export const INFOCOMM_CATEGORY_WEIGHTS: Record<InfoCommCategory, number> = {
  motivational: 0.20,
  cognitive_info: 0.20,
  activity: 0.25,
  reflective: 0.15,
  outcome: 0.20,
};

export function getInfoCommMaxCategoryScore(category: InfoCommCategory): number {
  return infoCommQuestions
    .filter(q => q.category === category)
    .reduce((sum, q) => sum + 4 * q.weight, 0);
}

export function applyInfoCommReversal(rawScore: number, isReversed: boolean): number {
  return isReversed ? 5 - rawScore : rawScore;
}

export function getInfoCommQuestionsByCategory(): Record<InfoCommCategory, InfoCommQuestion[]> {
  const result = {} as Record<InfoCommCategory, InfoCommQuestion[]>;
  for (const q of infoCommQuestions) {
    if (!result[q.category]) result[q.category] = [];
    result[q.category].push(q);
  }
  return result;
}
