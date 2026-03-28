# Implementation Plan: Grant Criteria Improvements

## Context

The Skill Navigator platform has gaps in 4 grant criteria (2.6, 2.9, 2.10, 2.11). The Notion page "НЕДОСТАТКИ" identifies coverage: 2.10 LMS at ~35% (weakest), 2.6 Multimedia at ~40%, 2.9 Trainers at ~55%, 2.11 Simulators at ~65% (strongest). The "ЗАДАЧИ" database has 18 tasks to close these gaps. This plan implements all 18 tasks in 6 phases, prioritizing by dependencies and grant impact, using the simplest viable approach (variant A) for each.

## Current State Summary

**Exists**: 3 diagnostics with scoring, team simulator (phases/conflicts/roles/peer feedback), 3 cases (marketing/management/IT — NOT education-themed), teacher dashboard (view-only), student profile with progress charts, PDF export, i18n (ru/kz), generic text recommendations.

**Missing**: video/QR/multimedia, skill trainers, gamification, task assignments, learning paths, diagnostics→trainer linkage.

---

## Phase 1: Resource Library + Enriched Recommendations (~3 days)
**Tasks**: ID9 (Библиотека ресурсов 🟡), ID14 (Расширить рекомендации 🔴)
**Criteria**: 2.10 + 2.6 — foundation for everything else

### Database
New migration `supabase/migrations/20260326_resources.sql`:
- Table `resources`: id, title, title_kz, description, description_kz, category (`cognitive`|`soft`|`professional`|`adaptability`|`physics`|`infocomm`), resource_type (`article`|`video`|`exercise`|`book`), url, difficulty, duration_minutes, tags (jsonb)
- RLS: authenticated SELECT, teacher INSERT/UPDATE/DELETE
- Seed 15-20 resources across categories (YouTube links, articles, books)

### New Files
| File | Purpose |
|------|---------|
| `src/pages/ResourcesPage.tsx` | Filterable grid — category tabs + type filter, renders ResourceCard |
| `src/hooks/useResources.ts` | `loadResources(filters?)`, `loadResourcesByCategory(cat)` |
| `src/components/ResourceCard.tsx` | Card: title, type icon, duration badge, link |

### Modified Files
| File | Change |
|------|--------|
| `src/App.tsx` | Lazy route `/resources` (ProtectedRoute) |
| `src/components/Navbar.tsx` | Add "Ресурсы" nav link |
| `src/components/DiagnosticsResults.tsx` | Below `getRecommendation()` text, add `<RecommendedResources>` section: for categories with score < 70, fetch 3 resources matching category, render ResourceCards |
| `src/components/PhysicsDiagnosticsResults.tsx` | Same — show physics-category resources |
| `src/components/InfoCommResults.tsx` | Same — show infocomm-category resources |
| `src/i18n/ru.ts`, `kz.ts` | `resources` key block |

---

## Phase 2: Education-Themed Cases ✅ DONE (2026-03-28)
**Tasks**: ID8 (Школьный проект по физике ✅), ID20 (Лабораторная работа ✅), ID10 (Адаптация первокурсника ✅), ID5 (Межкультурный конфликт ✅), ID6 (Хакатон ✅)
**Criteria**: 2.11 — data-only, no new code needed

### Database
New migration `supabase/migrations/20260327_education_cases.sql`:
- 5 INSERT statements into `cases` with JSONB `phases` and `conflicts` columns
- Follows existing structure from `SimPhase` and `ConflictEvent` interfaces in `src/data/simulationData.ts`
- New categories: `education`, `physics_ed`, `social`

### Cases
1. **Школьный проект по физике** — 4 roles (руководитель/исследователь/экспериментатор/докладчик), 4 phases, 4 conflicts
2. **Лабораторная работа** — 4 roles (руководитель/оператор/аналитик/оформитель), 4 phases, 4 conflicts
3. **Адаптация первокурсника** — 4 roles (куратор/одногруппник/представитель деканата/психолог), 4 phases, 4 conflicts
4. **Межкультурный конфликт** — 4 roles (классрук/медиатор/друг/родитель), 4 phases, 4 conflicts
5. **Университетский хакатон** — 4 roles (координатор/финансист/PR/техорг), 4 phases, 4 conflicts

### Modified Files
| File | Change |
|------|--------|
| `src/pages/CasesListPage.tsx` | Add `education`, `physics_ed`, `social` to `categoryColorMap` and `getCategoryLabel()` |
| `src/pages/CasePage.tsx` | Same category additions |
| `src/i18n/ru.ts`, `kz.ts` | Case category labels + case titles/descriptions |

---

## Phase 3: Skill Trainers (~5 days)
**Tasks**: ID2 (Конструктивная обратная связь 🔴), ID12 (Разрешение конфликтов 🔴), ID15 (Публичное выступление 🟡)
**Criteria**: 2.9

### Database
New migration `supabase/migrations/20260328_trainers.sql`:
- Table `trainer_attempts`: id, user_id, trainer_type (`sbi_feedback`|`conflict_resolution`|`public_speaking`), score, max_score, level, answers (jsonb), completed_at
- RLS: users see own, teachers see all

### New Files — Shared
| File | Purpose |
|------|---------|
| `src/pages/TrainersListPage.tsx` | Grid of trainer cards with icon, description, best score |
| `src/hooks/useTrainers.ts` | `saveAttempt()`, `loadAttempts()`, `loadBestScores()` |
| `src/components/trainers/TrainerLayout.tsx` | Shared wrapper: progress bar, score, restart, back link |

### New Files — SBI Feedback Trainer (ID2)
| File | Purpose |
|------|---------|
| `src/pages/trainers/SbiFeedbackTrainer.tsx` | Show situation → user fills S/B/I fields → score via keyword matching → show model answer. 5 scenarios. |
| `src/data/trainers/sbiFeedbackData.ts` | Scenarios with situations, model SBI, keywords |

### New Files — Conflict Resolution Trainer (ID12)
| File | Purpose |
|------|---------|
| `src/pages/trainers/ConflictResolutionTrainer.tsx` | Branching dialog: read scenario → pick option → next node → accumulate points → final feedback. 3 scenarios, 4 steps each. |
| `src/data/trainers/conflictDialogData.ts` | Dialog tree: `{ id, text, textKz, options: [{ text, textKz, nextId, points }] }` |

### New Files — Public Speaking Trainer (ID15)
| File | Purpose |
|------|---------|
| `src/pages/trainers/PublicSpeakingTrainer.tsx` | Get topic → fill outline (hook, 3 points, conclusion) → self-assessment checklist (10 items) → score + tips |
| `src/data/trainers/publicSpeakingData.ts` | Topics + rubric criteria |

### Modified Files
| File | Change |
|------|--------|
| `src/App.tsx` | Lazy routes: `/trainers`, `/trainers/sbi-feedback`, `/trainers/conflict-resolution`, `/trainers/public-speaking` |
| `src/components/Navbar.tsx` | Add "Тренажёры" nav link |
| `src/pages/ProfilePage.tsx` | Show trainer attempt history (new tab or section) |
| `src/i18n/ru.ts`, `kz.ts` | All trainer strings (names, instructions, scenario texts, rubric items) |

---

## Phase 4: Levels + Videos + Mini-Lessons (~4 days)
**Tasks**: ID13 (Система уровней 🔴), ID17 (Обучающие видео 🔴), ID18 (Мини-уроки 🟡)
**Criteria**: 2.9 + 2.6

### ID13 — Progressive Levels for Trainers
- Add `level` field to trainer data files (2-3 scenarios per level, 3 levels)
- `useTrainers.ts`: add `getCurrentLevel()`, unlock next at score >= 70
- `TrainerLayout.tsx`: level indicator bar with lock icons
- Each trainer page: show level selector, filter scenarios by level

### ID17 — Video Intros Before Diagnostics
- New: `src/components/DiagnosticsIntro.tsx` — modal with YouTube iframe + "Start" button
- Modify: `DiagnosticsPage.tsx`, `PhysicsDiagnosticsPage.tsx`, `InfoCommDiagnosticsPage.tsx` — show intro before questions (dismiss stored in localStorage)
- 3 YouTube embed videos (one per diagnostic)

### ID18 — Interactive Mini-Lessons
- New: `src/pages/MiniLessonsPage.tsx` (list), `src/pages/MiniLessonPage.tsx` (viewer)
- New: `src/data/miniLessonsData.ts` — 3 lessons, 4-5 steps each with text + inline quiz
- New: `src/components/lessons/LessonStep.tsx`, `InlineQuiz.tsx`
- Routes: `/lessons`, `/lessons/:id`
- Progress in localStorage (no DB table needed for v1)

---

## Phase 5: LMS — Task Assignment + Learning Paths (~5 days)
**Tasks**: ID3 (Модуль назначения заданий 🔴), ID11 (Learning Path 🔴)
**Criteria**: 2.10 (weakest) — depends on Phases 1 + 3

### ID3 — Task Assignment
**Database** (migration `supabase/migrations/20260329_assignments.sql`):
- Table `assignments`: id, teacher_id, title, description, assignment_type (`diagnostic`|`trainer`|`resource`|`case`|`custom`), target_id, due_date, group_name, created_at
- Table `assignment_students`: id, assignment_id, student_id, status (`pending`|`in_progress`|`completed`), completed_at, result_id
- RLS: teachers CRUD assignments, students read own assignment_students

**New files**:
| File | Purpose |
|------|---------|
| `src/components/dashboard/AssignmentCreator.tsx` | Form: type dropdown, target selector, due date, group |
| `src/components/dashboard/AssignmentList.tsx` | Table with completion progress bars |
| `src/hooks/useAssignments.ts` | `createAssignment()`, `loadTeacherAssignments()`, `loadStudentAssignments()`, `markComplete()` |
| `src/components/profile/StudentAssignments.tsx` | Student's pending/completed assignments list |

**Modified files**: `TeacherDashboard.tsx` (add Assignments tab), `ProfilePage.tsx` (add Assignments tab for students)

### ID11 — Automatic Learning Path
**No new DB tables** — computed client-side from existing data.

**New files**:
| File | Purpose |
|------|---------|
| `src/pages/LearningPathPage.tsx` | Vertical timeline of recommended steps |
| `src/hooks/useLearningPath.ts` | Algorithm: load latest diagnostics → for weak categories (< 60): video → lesson → trainer → resources → retake. For medium (60-79): trainer → resources. |
| `src/components/learning/PathStep.tsx` | Step card with icon, title, type badge, completion status |

**Modified files**: `App.tsx` (route `/learning-path`), `Navbar.tsx` (student nav link), `DiagnosticsResults.tsx` (CTA "View your learning path")

---

## Phase 6: Multiplayer Mode (~3 days, optional)
**Task**: ID7 (Мультиплеер через Supabase Realtime 🟡)
**Criteria**: 2.11 — already strong after Phase 2

- Enable Realtime on `simulation_sessions`, `simulation_participants`, `case_messages`
- Modify `useSimulator.ts`: add `supabase.channel()` subscriptions for live session updates
- Modify `CasePage.tsx`: replace polling with realtime, show live participant list
- Modify `PhaseManager.tsx`: real-time phase sync
- Modify `RoleAssignment.tsx`: real-time role claiming

---

## Verification Plan

After each phase:
1. `npm run build` — must pass with no TS errors
2. `npm run lint` — clean
3. `npm run test` — existing tests must pass
4. `npx supabase db reset` — migrations apply cleanly
5. `npx supabase gen types typescript --local > src/integrations/supabase/types.ts` — types match schema
6. Manual check: navigate to new pages, verify i18n works in both ru/kz

Phase-specific checks:
- **Phase 1**: Diagnostics results page shows resource cards for weak categories; `/resources` page loads with filters
- **Phase 2**: `/cases` page shows 8 cases (3 old + 5 new); new cases playable through all 4 phases
- **Phase 3**: `/trainers` lists 3 trainers; each trainer completes full flow and saves attempt to DB
- **Phase 4**: Level progression locks/unlocks work; video modal shows before diagnostics; `/lessons` shows 3 lessons with inline quizzes
- **Phase 5**: Teacher can create assignment in dashboard; student sees it in profile; learning path generates correctly from diagnostics results
- **Phase 6**: Two browser tabs can join same session and see real-time updates

## Notion Status Updates

After completing each task, update its status in the Notion database from "Not started" → "In progress" → "Done".
