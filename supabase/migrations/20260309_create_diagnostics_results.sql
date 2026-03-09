-- Create diagnostics_results table
CREATE TABLE public.diagnostics_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Scores by category (0-100)
  cognitive_score INT NOT NULL CHECK (cognitive_score >= 0 AND cognitive_score <= 100),
  soft_score INT NOT NULL CHECK (soft_score >= 0 AND soft_score <= 100),
  professional_score INT NOT NULL CHECK (professional_score >= 0 AND professional_score <= 100),
  adaptability_score INT NOT NULL CHECK (adaptability_score >= 0 AND adaptability_score <= 100),
  
  -- Average score
  average_score INT NOT NULL CHECK (average_score >= 0 AND average_score <= 100),
  
  -- Detailed answers stored as JSON for analytics
  answers JSONB NOT NULL,
  
  -- Timestamps
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Metadata for future use
  version INT NOT NULL DEFAULT 1
);

-- Create index for faster queries
CREATE INDEX idx_diagnostics_results_user_id ON public.diagnostics_results(user_id);
CREATE INDEX idx_diagnostics_results_completed_at ON public.diagnostics_results(completed_at DESC);

-- Enable RLS
ALTER TABLE public.diagnostics_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Students can view only their own results
CREATE POLICY "Users can view own diagnostics results" ON public.diagnostics_results
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Teachers can view diagnostics results of their students
-- We'll assume teachers can see all students (can be refined later based on group assignment)
CREATE POLICY "Teachers can view student diagnostics results" ON public.diagnostics_results
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'teacher'));

-- Students can insert their own results
CREATE POLICY "Users can insert own diagnostics results" ON public.diagnostics_results
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Display results (for diagnostics page)
-- This policy allows authenticated users to see their own results when fetching
CREATE POLICY "Users can select own diagnostics results" ON public.diagnostics_results
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
