-- Allow students to view diagnostics_results for users in their same group
CREATE POLICY "Students see group diagnostics"
  ON public.diagnostics_results FOR SELECT
  USING (
    user_id IN (
      SELECT p2.user_id FROM public.profiles p2
      WHERE p2.group_name = (
        SELECT p1.group_name FROM public.profiles p1
        WHERE p1.user_id = auth.uid()
      )
    )
  );
