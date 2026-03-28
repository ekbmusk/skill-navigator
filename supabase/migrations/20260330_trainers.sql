-- Trainer attempts table
CREATE TABLE public.trainer_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trainer_type text NOT NULL CHECK (trainer_type IN ('sbi_feedback', 'conflict_resolution', 'public_speaking')),
  score int NOT NULL DEFAULT 0,
  max_score int NOT NULL DEFAULT 100,
  level int NOT NULL DEFAULT 1,
  answers jsonb NOT NULL DEFAULT '{}',
  completed_at timestamptz DEFAULT now()
);

ALTER TABLE public.trainer_attempts ENABLE ROW LEVEL SECURITY;

-- Students see own attempts
CREATE POLICY "Users see own trainer attempts"
  ON public.trainer_attempts FOR SELECT
  USING (auth.uid() = user_id);

-- Students insert own attempts
CREATE POLICY "Users insert own trainer attempts"
  ON public.trainer_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Teachers see all attempts
CREATE POLICY "Teachers see all trainer attempts"
  ON public.trainer_attempts FOR SELECT
  USING (public.has_role(auth.uid(), 'teacher'));

-- Indexes
CREATE INDEX idx_trainer_attempts_user_id ON public.trainer_attempts(user_id);
CREATE INDEX idx_trainer_attempts_type ON public.trainer_attempts(trainer_type);
CREATE INDEX idx_trainer_attempts_user_type ON public.trainer_attempts(user_id, trainer_type, completed_at DESC);
