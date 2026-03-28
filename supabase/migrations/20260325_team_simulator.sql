-- ============================================================
-- Team Simulator: sessions, roles, phases, peer feedback
-- ============================================================

-- Simulation sessions (one per case per team)
CREATE TABLE public.simulation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'lobby', -- lobby | in_progress | completed
  current_phase int NOT NULL DEFAULT 0,
  phase_started_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.simulation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can read sessions" ON public.simulation_sessions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can create sessions" ON public.simulation_sessions FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Participants can update sessions" ON public.simulation_sessions FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Session participants with roles
CREATE TABLE public.simulation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.simulation_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'member', -- leader | analyst | creative | presenter | member
  joined_at timestamptz DEFAULT now(),
  UNIQUE(session_id, user_id)
);

ALTER TABLE public.simulation_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can read participants" ON public.simulation_participants FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can join" ON public.simulation_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own role" ON public.simulation_participants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can leave" ON public.simulation_participants FOR DELETE USING (auth.uid() = user_id);

-- Conflict events triggered during simulation
CREATE TABLE public.simulation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.simulation_sessions(id) ON DELETE CASCADE NOT NULL,
  event_key text NOT NULL, -- references front-end conflict key
  phase int NOT NULL,
  response jsonb, -- team's chosen response
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.simulation_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can read events" ON public.simulation_events FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can insert events" ON public.simulation_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update events" ON public.simulation_events FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Peer feedback (360°)
CREATE TABLE public.peer_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.simulation_sessions(id) ON DELETE CASCADE NOT NULL,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reviewee_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  communication int NOT NULL CHECK (communication >= 1 AND communication <= 5),
  teamwork int NOT NULL CHECK (teamwork >= 1 AND teamwork <= 5),
  leadership int NOT NULL CHECK (leadership >= 1 AND leadership <= 5),
  problem_solving int NOT NULL CHECK (problem_solving >= 1 AND problem_solving <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id, reviewer_id, reviewee_id)
);

ALTER TABLE public.peer_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can read feedback" ON public.peer_feedback FOR SELECT USING (
  auth.uid() = reviewee_id
  OR auth.uid() = reviewer_id
  OR public.has_role(auth.uid(), 'teacher')
);
CREATE POLICY "Auth users can submit feedback" ON public.peer_feedback FOR INSERT WITH CHECK (auth.uid() = reviewer_id AND reviewer_id != reviewee_id);

-- Update case_messages to include session_id (nullable for backwards compat)
ALTER TABLE public.case_messages ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES public.simulation_sessions(id) ON DELETE CASCADE;
ALTER TABLE public.case_messages ADD COLUMN IF NOT EXISTS phase int;

-- Indexes
CREATE INDEX idx_sim_sessions_case ON public.simulation_sessions(case_id);
CREATE INDEX idx_sim_participants_session ON public.simulation_participants(session_id);
CREATE INDEX idx_sim_participants_user ON public.simulation_participants(user_id);
CREATE INDEX idx_sim_events_session ON public.simulation_events(session_id);
CREATE INDEX idx_peer_feedback_session ON public.peer_feedback(session_id);
CREATE INDEX idx_peer_feedback_reviewee ON public.peer_feedback(reviewee_id);

-- Update cases table: add phases and conflicts JSONB columns
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS phases jsonb NOT NULL DEFAULT '[]';
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS conflicts jsonb NOT NULL DEFAULT '[]';
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS roles jsonb NOT NULL DEFAULT '["leader","analyst","creative","presenter"]';

