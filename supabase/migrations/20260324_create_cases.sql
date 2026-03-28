-- Cases table
CREATE TABLE public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  difficulty text NOT NULL DEFAULT 'medium',
  objectives jsonb NOT NULL DEFAULT '[]',
  materials jsonb NOT NULL DEFAULT '[]',
  team_size int NOT NULL DEFAULT 4,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read cases" ON public.cases FOR SELECT USING (true);
CREATE POLICY "Teachers can manage cases" ON public.cases FOR ALL USING (public.has_role(auth.uid(), 'teacher'));

-- Case solutions
CREATE TABLE public.case_solutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  solution_text text NOT NULL,
  score int CHECK (score >= 0 AND score <= 100),
  submitted_at timestamptz DEFAULT now()
);

ALTER TABLE public.case_solutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own solutions" ON public.case_solutions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own solutions" ON public.case_solutions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Teachers see all solutions" ON public.case_solutions FOR SELECT USING (public.has_role(auth.uid(), 'teacher'));

-- Case messages (chat)
CREATE TABLE public.case_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.case_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read case messages" ON public.case_messages FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can send messages" ON public.case_messages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Indexes
CREATE INDEX idx_case_solutions_case_id ON public.case_solutions(case_id);
CREATE INDEX idx_case_solutions_user_id ON public.case_solutions(user_id);
CREATE INDEX idx_case_messages_case_id ON public.case_messages(case_id);
CREATE INDEX idx_case_messages_created_at ON public.case_messages(created_at);
