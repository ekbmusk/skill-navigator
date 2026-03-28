-- Resources table: library of learning materials linked to skill categories
CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_kz text NOT NULL,
  description text NOT NULL,
  description_kz text NOT NULL,
  category text NOT NULL,          -- cognitive | soft | professional | adaptability | physics | infocomm
  resource_type text NOT NULL,     -- article | video | exercise | book
  url text,
  difficulty text DEFAULT 'medium', -- easy | medium | hard
  duration_minutes int,
  tags jsonb DEFAULT '[]',
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read resources"
  ON public.resources FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can manage resources"
  ON public.resources FOR ALL
  USING (public.has_role(auth.uid(), 'teacher'));

CREATE INDEX idx_resources_category ON public.resources(category);
CREATE INDEX idx_resources_type ON public.resources(resource_type);

-- Seed initial resources (15-20 across all categories)
INSERT INTO public.resources (title, title_kz, description, description_kz, category, resource_type, url, difficulty, duration_minutes, sort_order) VALUES
-- Cognitive
('Критическое мышление: основы', 'Сыни ойлау: негіздері', 'Введение в методы критического мышления и анализа информации', 'Сыни ойлау және ақпаратты талдау әдістеріне кіріспе', 'cognitive', 'article', 'https://ru.wikipedia.org/wiki/Критическое_мышление', 'easy', 15, 1),
('Логические задачи для развития мышления', 'Ойлауды дамытуға арналған логикалық есептер', 'Подборка логических задач разного уровня сложности', 'Әр түрлі күрделілік деңгейіндегі логикалық есептер жинағы', 'cognitive', 'exercise', 'https://logiclike.com/ru', 'medium', 30, 2),
('Как принимать решения: метод SWOT', 'Шешім қабылдау: SWOT әдісі', 'Видеоурок по использованию SWOT-анализа для принятия решений', 'Шешім қабылдау үшін SWOT-талдауды пайдалану бойынша бейнесабақ', 'cognitive', 'video', 'https://www.youtube.com/watch?v=JXXHqM6RzZQ', 'easy', 10, 3),
('Искусство аргументации', 'Дәлелдеу өнері', 'Книга о построении убедительных аргументов и логических цепочек', 'Сенімді дәлелдер мен логикалық тізбектер құру туралы кітап', 'cognitive', 'book', 'https://www.litres.ru/book/nensi-etkison/iskusstvo-argumentacii-64050487/', 'hard', 120, 4),

-- Soft Skills
('Эффективная коммуникация', 'Тиімді коммуникация', 'Основные принципы эффективного общения и активного слушания', 'Тиімді қарым-қатынас пен белсенді тыңдаудың негізгі қағидалары', 'soft', 'article', 'https://www.psychologos.ru/articles/view/effektivnaya-kommunikaciya', 'easy', 15, 1),
('Работа в команде: 5 дисфункций', 'Командалық жұмыс: 5 дисфункция', 'Видеообзор модели Ленсиони о командных дисфункциях', 'Командалық дисфункциялар туралы Ленсиони моделіне бейнешолу', 'soft', 'video', 'https://www.youtube.com/watch?v=w2s2T_bfKvU', 'medium', 12, 2),
('Практика обратной связи (SBI)', 'Кері байланыс практикасы (SBI)', 'Упражнение на развитие навыка конструктивной обратной связи по модели SBI', 'SBI моделі бойынша конструктивті кері байланыс дағдысын дамыту жаттығуы', 'soft', 'exercise', NULL, 'medium', 20, 3),
('Эмоциональный интеллект', 'Эмоционалдық интеллект', 'Книга Дэниела Гоулмана об управлении эмоциями и эмпатии', 'Дэниел Гоулманның эмоцияларды басқару мен эмпатия туралы кітабы', 'soft', 'book', 'https://www.litres.ru/book/deniel-goulman/emocionalnyy-intellekt-56254456/', 'medium', 180, 4),

-- Professional
('Основы управления проектами', 'Жобаларды басқару негіздері', 'Введение в методологии управления проектами (Agile, Waterfall)', 'Жобаларды басқару әдіснамаларына кіріспе (Agile, Waterfall)', 'professional', 'article', 'https://habr.com/ru/articles/459380/', 'easy', 20, 1),
('Тайм-менеджмент для студентов', 'Студенттерге арналған тайм-менеджмент', 'Практические техники планирования времени', 'Уақытты жоспарлаудың практикалық техникалары', 'professional', 'video', 'https://www.youtube.com/watch?v=oTugjssqOT0', 'easy', 15, 2),
('Презентация данных: визуализация', 'Деректерді ұсыну: визуализация', 'Упражнение по созданию наглядных презентаций и инфографики', 'Көрнекі презентациялар мен инфографика жасау жаттығуы', 'professional', 'exercise', NULL, 'medium', 25, 3),

-- Adaptability
('Гибкое мышление: Growth Mindset', 'Икемді ойлау: Growth Mindset', 'Статья о развитии установки на рост по Кэрол Дуэк', 'Кэрол Дуэк бойынша өсу ойлау қалпын дамыту туралы мақала', 'adaptability', 'article', 'https://hbr-russia.ru/karera/professionalnyy-i-lichnostnyy-rost/p29055', 'easy', 10, 1),
('Стресс-менеджмент', 'Стрессті басқару', 'Видеоурок по техникам управления стрессом и адаптации', 'Стрессті басқару және бейімделу техникалары бойынша бейнесабақ', 'adaptability', 'video', 'https://www.youtube.com/watch?v=TLm0C5GjTIw', 'easy', 12, 2),
('Адаптация к переменам', 'Өзгерістерге бейімделу', 'Практические упражнения на развитие гибкости и адаптивности', 'Икемділік пен бейімділікті дамытуға арналған практикалық жаттығулар', 'adaptability', 'exercise', NULL, 'medium', 20, 3),

-- Physics
('Законы Ньютона: просто о сложном', 'Ньютон заңдары: күрделі нәрсе туралы қарапайым', 'Видеоурок с визуализацией трёх законов Ньютона', 'Ньютонның үш заңын визуализациялау бейнесабағы', 'physics', 'video', 'https://www.youtube.com/watch?v=kKKM8Y-u7ds', 'easy', 15, 1),
('Интерактивные задачи по механике', 'Механика бойынша интерактивті есептер', 'Сборник задач с пошаговыми решениями по классической механике', 'Классикалық механика бойынша қадамдық шешімдері бар есептер жинағы', 'physics', 'exercise', NULL, 'medium', 30, 2),

-- InfoComm
('Цифровая грамотность: основы', 'Сандық сауаттылық: негіздері', 'Курс по основам цифровой грамотности и информационной безопасности', 'Сандық сауаттылық пен ақпараттық қауіпсіздік негіздері бойынша курс', 'infocomm', 'article', 'https://digital-likbez.datalesson.ru/', 'easy', 20, 1),
('Информационная безопасность в интернете', 'Интернеттегі ақпараттық қауіпсіздік', 'Видеоурок по защите личных данных и безопасному поведению в сети', 'Жеке деректерді қорғау және желіде қауіпсіз мінез-құлық бейнесабағы', 'infocomm', 'video', 'https://www.youtube.com/watch?v=LHhbr4r3KO4', 'easy', 10, 2);
