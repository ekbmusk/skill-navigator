# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Prerequisites

Node.js 18+, Docker Desktop (for local Supabase), Supabase CLI (`brew install supabase/tap/supabase`).

## Commands

```bash
# Start local development
npx supabase start        # Start Supabase local stack (requires Docker)
npm run dev               # Start Vite dev server (http://localhost:8080)

# Build
npm run build             # Production build
npm run build:dev         # Dev-mode build

# Test (Vitest + jsdom + @testing-library/react)
npm run test              # Run tests once
npm run test:watch        # Watch mode
npx vitest run src/path/to/file.test.ts  # Run a single test file

# Lint & Format
npm run lint
npm run format            # Prettier format all src files
npm run format:check      # Check formatting without writing

# Supabase management
npx supabase stop         # Stop local Supabase
npx supabase db reset     # Reset database (re-runs migrations + seed)

# Regenerate Supabase DB types after schema changes
npx supabase gen types typescript --local > src/integrations/supabase/types.ts
```

Test setup file: `src/test/setup.ts`. Tests use `@testing-library/react` with jsdom environment and Vitest globals enabled.

Environment variables needed (`.env.local`):
```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=<anon key from `supabase start` output>
```

## Architecture

**Stack:** React 18 + TypeScript + Vite (SWC) + TailwindCSS + shadcn/ui + Supabase + React Query + React Router v6

**Path alias:** `@/` → `src/`

**Typography:** Syne (display, weight 600-800) + Outfit (body, weight 300-500). Defined as CSS variables `--font-display` and `--font-body` in `src/index.css`.

**Color system:** Warm gold primary (`hsl(42, 88%, 56%)`), deep teal accent (`hsl(175, 60%, 42%)`). Dark mode = warm charcoal, light mode = warm sand/ivory. All via CSS custom properties.

### Routing (`src/App.tsx`)

All pages except Index are lazy-loaded with `React.lazy` + `Suspense`.

```
/                             → Index (public landing)
/auth                         → AuthPage (login/signup, email + Google OAuth)
/tests                        → TestsListPage (protected) — hub for all 3 diagnostics
/diagnostics                  → DiagnosticsPage (protected) — general skills
/diagnostics/physics          → PhysicsDiagnosticsPage (protected)
/diagnostics/infocomm         → InfoCommDiagnosticsPage (protected)
/trainers                     → TrainersListPage (protected) — hub for skill trainers
/trainers/sbi-feedback        → SbiFeedbackTrainer (protected)
/trainers/conflict-resolution → ConflictResolutionTrainer (protected)
/trainers/public-speaking     → PublicSpeakingTrainer (protected)
/dashboard                    → TeacherDashboard (protected, teacher role only)
/cases                        → CasesListPage (protected)
/case/:id                     → CasePage (protected)
/resources                    → ResourcesPage (protected)
/profile                      → ProfilePage (protected)
```

`ProtectedRoute` wraps authenticated routes and optionally accepts `requiredRole` for role-based access.

### Provider Hierarchy

`QueryClientProvider` → `ThemeProvider` → `LanguageProvider` → `TooltipProvider` → `BrowserRouter` → `AuthProvider` → `Routes`

Note: `react`, `react-dom`, and `@tanstack/react-query` are deduped in `vite.config.ts` to prevent duplicate instance issues.

### Auth & State (`src/hooks/useAuth.tsx`)

`AuthContext` provides `user`, `session`, `role`, `profile`, `loading`, `signOut()`. Role and profile are fetched from Supabase on session change. New users get a "student" role assigned automatically via a database trigger.

### Theme (`src/hooks/useTheme.tsx`)

`ThemeProvider` provides `theme` (dark|light), `setTheme()`, `toggleTheme()`. Persisted to localStorage. Applies `dark`/`light` class to `<html>`. Light mode uses warm sand/ivory palette; dark mode uses warm charcoal. CSS overrides for light mode glassmorphism patterns are in `src/index.css`.

### Supabase (`src/integrations/supabase/`)

- `client.ts` — initializes the Supabase client from env vars
- `types.ts` — auto-generated DB types (do not edit manually)
- Migrations live in `supabase/migrations/`

**Core tables:**
- `profiles` — user profile data (full_name, avatar_url, group_name)
- `user_roles` — role per user (`student` | `teacher`)
- `diagnostics_results` — test results with JSONB answers and 4 category scores

**Cases & Simulator tables:**
- `cases` — case studies with phases, conflicts, and roles (JSONB columns)
- `case_solutions` — user-submitted solutions per case (scored 0–100)
- `case_messages` — chat messages within cases/simulation sessions
- `simulation_sessions` — team simulation sessions (status: lobby → in_progress → completed)
- `simulation_participants` — users in a session with roles (leader, analyst, creative, presenter)
- `simulation_events` — conflict events triggered during simulation phases
- `peer_feedback` — 360° peer reviews (communication, teamwork, leadership, problem_solving scores 1–5)

**Resources & Trainers:**
- `resources` — learning materials library (articles, videos, exercises, books) categorized by skill area
- `trainer_attempts` — trainer exercise results (trainer_type, score, max_score, level, answers jsonb)

RLS is enabled on all tables. Helper function `has_role()` is used in policies for teacher access. Note: `user_roles` RLS restricts students to see only their own role — use profiles.group_name for group member queries instead.

**Note:** `types.ts` may lag behind the actual schema. Run the type generation command above after applying migrations.

### i18n (`src/i18n/`)

`LanguageContext` provides `lang` (ru|kz), `setLang()`, and `t` (translations object). Language is persisted to localStorage. All UI strings come from `ru.ts` / `kz.ts` — always use `t.key` rather than hardcoded strings. UI language is Russian and Kazakh (not English).

### Diagnostics

Three independent diagnostics, each with its own question set, scoring engine, and results component:

| Diagnostic | Questions | Scoring | Results |
|---|---|---|---|
| General skills | `src/data/diagnosticsQuestions.ts` | `src/utils/scoringEngine.ts` | `DiagnosticsResults.tsx` |
| Physics | `src/data/physicsQuestions.ts` | `src/utils/physicsScoringEngine.ts` | `PhysicsDiagnosticsResults.tsx` |
| InfoComm | `src/data/infoCommQuestions.ts` | `src/utils/infoCommScoringEngine.ts` | `InfoCommResults.tsx` |

Common patterns:
- Questions have weights (1.0–2.0) and some are reverse-scored
- Shared utilities in `src/utils/scoringHelpers.ts` (getSkillLevel, variance, average, calculateRawConfidenceWithDiversity)
- `src/utils/antiCheatDetection.ts` checks for straight-lining, pattern responses, fast timing — stores report in answers JSONB as `_anti_cheat`
- `src/utils/liveAntiCheat.ts` runs lightweight checks during test-taking (shows toast warnings)
- Results saved via `src/hooks/useDiagnostics.ts` → `diagnostics_results` table

### Skill Trainers

Three interactive trainers for soft skills practice:

| Trainer | Data | Page |
|---|---|---|
| SBI Feedback | `src/data/trainers/sbiFeedbackData.ts` | `src/pages/trainers/SbiFeedbackTrainer.tsx` |
| Conflict Resolution | `src/data/trainers/conflictDialogData.ts` | `src/pages/trainers/ConflictResolutionTrainer.tsx` |
| Public Speaking | `src/data/trainers/publicSpeakingData.ts` | `src/pages/trainers/PublicSpeakingTrainer.tsx` |

- `src/hooks/useTrainers.ts` — saveAttempt, loadAttempts, loadBestScores
- `src/components/trainers/TrainerLayout.tsx` — shared wrapper with progress bar, step counter, restart
- Results saved to `trainer_attempts` table

### Cases & Team Simulator

Cases are collaborative problem-solving exercises with phased simulation:
- `src/hooks/useCases.ts` — case data fetching and solution submission
- `src/hooks/useSimulator.ts` — simulation session management (lobby, phases, events)
- `src/data/simulationData.ts` — simulation phase/conflict definitions
- `src/components/simulator/` — PhaseManager, RoleAssignment, ConflictModal, PeerFeedback
- `src/components/case/` — CaseLobby, CaseSimulation, CaseSolution, CaseFeedback, CaseResults (split from CasePage)

Each case has 4 timed phases with tasks, and random conflict events that the team must resolve collaboratively.

### UI Components

- shadcn/ui primitives: `src/components/ui/`
- Custom branded icons: `src/components/BrandIcons.tsx` — HexIcon, DiamondIcon, OrbitalIcon, BlobIcon, LayeredIcon (gradient containers with hover animations, used throughout the app instead of plain icon wrappers)
- Profile sub-components: `src/components/profile/` — DashboardOverview, GroupTab, AchievementBadges, SkillRadarChart, ProfileEditDialog
- Page components: `src/pages/`
- Shared layout: `src/components/` — Navbar (glassmorphism + scroll detection), HeroSection, Footer, etc.

### Group Features

- `src/hooks/useGroupMembers.ts` — loads all students in same group_name with latest scores
- `src/hooks/useGroupRank.ts` — calculates student's rank within group (position, total, percentile)
- GroupTab in profile shows leaderboard + "You vs Group Average" radar chart

### PDF Export

`src/utils/pdfExport.ts` — generates PDF reports of diagnostics results for download.

## Notes

- `recharts` is used for data visualization (progress charts, radar charts in results).
- `framer-motion` is used for page transitions and UI animations.
- Seed data is in `supabase/seed.sql` — includes 6 mock students in group CS-101 with varied diagnostics, trainer attempts, and case solutions. Used by `supabase db reset`.
- Prettier config in `.prettierrc` — 120 char width, double quotes, es5 trailing commas.
