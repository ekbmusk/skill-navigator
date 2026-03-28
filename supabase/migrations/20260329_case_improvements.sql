-- ============================================================
-- Case improvements: self-assessment + teacher scoring
-- ============================================================

-- Allow self-assessment in peer_feedback (reviewer_id = reviewee_id)
DROP POLICY IF EXISTS "Auth users can submit feedback" ON public.peer_feedback;
CREATE POLICY "Auth users can submit feedback" ON public.peer_feedback
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Allow teachers to read all solutions (not just the student's own)
DROP POLICY IF EXISTS "Teachers see all solutions" ON public.case_solutions;
CREATE POLICY "Teachers see all solutions" ON public.case_solutions
  FOR SELECT USING (public.has_role(auth.uid(), 'teacher'));

-- Allow teachers to score solutions
CREATE POLICY "Teachers can score solutions" ON public.case_solutions
  FOR UPDATE USING (public.has_role(auth.uid(), 'teacher'));

-- Drop the unique constraint and recreate to allow self-reviews
ALTER TABLE public.peer_feedback DROP CONSTRAINT IF EXISTS peer_feedback_session_id_reviewer_id_reviewee_id_key;
ALTER TABLE public.peer_feedback ADD CONSTRAINT peer_feedback_session_id_reviewer_id_reviewee_id_key
  UNIQUE (session_id, reviewer_id, reviewee_id);
