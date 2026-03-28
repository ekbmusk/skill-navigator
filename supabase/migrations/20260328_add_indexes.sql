-- Performance indexes for common query patterns

-- Teacher dashboard: filter students by group
CREATE INDEX IF NOT EXISTS idx_profiles_group_name ON public.profiles(group_name);

-- Profile/dashboard: latest results per user
CREATE INDEX IF NOT EXISTS idx_diagnostics_results_user_completed ON public.diagnostics_results(user_id, completed_at DESC);

-- Case solutions: temporal queries
CREATE INDEX IF NOT EXISTS idx_case_solutions_submitted_at ON public.case_solutions(submitted_at);

-- Simulation: filter active sessions
CREATE INDEX IF NOT EXISTS idx_simulation_sessions_status ON public.simulation_sessions(status);

-- Peer feedback: recent feedback queries
CREATE INDEX IF NOT EXISTS idx_peer_feedback_created_at ON public.peer_feedback(created_at);
