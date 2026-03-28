# SkillMap

Platform for diagnosing and developing student skills with analytics for teachers.

## Features

- **3 Diagnostics** — General skills, Physics, and InfoComm assessments with weighted scoring, confidence analysis, and anti-cheat detection
- **Team Simulator** — Collaborative case studies with phased simulation, role assignment, conflict events, and 360° peer feedback
- **8 Cases** — Business and education-themed scenarios (marketing, management, IT, physics, social, hackathon)
- **Resource Library** — Filterable collection of articles, videos, exercises, and books linked to skill categories
- **Teacher Dashboard** — Student analytics, group reports, and diagnostics overview
- **Student Profile** — Progress charts, test history, and PDF report export
- **Bilingual UI** — Full Russian and Kazakh localization

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, TypeScript, Vite (SWC), TailwindCSS, shadcn/ui |
| State | React Query, React Context |
| Backend | Supabase (PostgreSQL, Auth, RLS, Realtime) |
| Routing | React Router v6 (lazy-loaded pages) |
| Animation | Framer Motion |
| Charts | Recharts |

## Getting Started

### Prerequisites

- Node.js 18+
- Docker Desktop
- Supabase CLI (`brew install supabase/tap/supabase`)

### Setup

```bash
# Clone and install
git clone https://github.com/ekbmusk/skill-navigator.git
cd skill-navigator
npm install

# Start Supabase (requires Docker)
npx supabase start

# Create .env.local with values from supabase start output
echo "VITE_SUPABASE_URL=http://127.0.0.1:54321" > .env.local
echo "VITE_SUPABASE_PUBLISHABLE_KEY=<anon key>" >> .env.local

# Start dev server
npm run dev
```

The app will be available at `http://localhost:8080`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run test` | Run tests (Vitest) |
| `npm run lint` | Lint code |
| `npx supabase db reset` | Reset database with migrations + seed |

## Project Structure

```
src/
├── components/       # Shared UI components
│   ├── ui/           # shadcn/ui primitives
│   └── simulator/    # Team simulator components
├── data/             # Question sets and simulation data
├── hooks/            # Custom hooks (auth, cases, diagnostics, etc.)
├── i18n/             # Translations (ru.ts, kz.ts)
├── integrations/     # Supabase client and types
├── pages/            # Route pages
└── utils/            # Scoring engines, PDF export, anti-cheat
supabase/
├── migrations/       # Database schema migrations
└── seed.sql          # Test data
```

## Database

PostgreSQL via Supabase with Row Level Security on all tables:

- `profiles` — User profiles
- `user_roles` — Student/teacher roles
- `diagnostics_results` — Test scores and answers
- `cases` — Case studies with phases and conflicts
- `case_solutions` / `case_messages` — Solutions and chat
- `simulation_sessions` / `simulation_participants` — Team sessions
- `simulation_events` / `peer_feedback` — Events and reviews
- `resources` — Learning materials library

## License

MIT
