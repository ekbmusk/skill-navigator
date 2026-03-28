import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Users2, ChevronLeft, FileText, Target,
  Crown, BarChart3, Palette, Mic,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useCases, type Case } from "@/hooks/useCases";
import { useSimulator } from "@/hooks/useSimulator";
import { useToast } from "@/hooks/use-toast";
import ConflictModal from "@/components/simulator/ConflictModal";
import CaseLobby from "@/components/case/CaseLobby";
import CaseSimulation from "@/components/case/CaseSimulation";
import CaseSolution from "@/components/case/CaseSolution";
import CaseFeedback from "@/components/case/CaseFeedback";
import CaseResults from "@/components/case/CaseResults";
import { ROLE_DEFINITIONS } from "@/data/simulationData";
import type {
  SimPhase, ConflictEvent, Participant, SimulationSession,
  SimRole, PeerFeedbackData, FeedbackSummary,
} from "@/data/simulationData";

// ── Color maps ────────────────────────────────────────────────
const difficultyColorMap: Record<string, string> = {
  easy: "bg-green-500/10 text-green-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  hard: "bg-destructive/10 text-destructive",
};
const categoryColorMap: Record<string, string> = {
  marketing: "bg-blue-500/10 text-blue-500",
  management: "bg-orange-500/10 text-orange-500",
  it: "bg-emerald-500/10 text-emerald-500",
  education: "bg-violet-500/10 text-violet-500",
  physics_ed: "bg-cyan-500/10 text-cyan-500",
  social: "bg-pink-500/10 text-pink-500",
};

type SimStage = "loading" | "lobby" | "simulation" | "solution" | "feedback" | "results";

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  phase: number | null;
  author_name: string | null;
}

const CasePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const { t, lang } = useLang();
  const { toast } = useToast();
  const casesHook = useCases();
  const sim = useSimulator();

  // ── Core state ──────────────────────────────────────────────
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [session, setSession] = useState<SimulationSession | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [stage, setStage] = useState<SimStage>("loading");
  const [pageError, setPageError] = useState<string | null>(null);

  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Phases
  const [phases, setPhases] = useState<SimPhase[]>([]);
  const [conflicts, setConflicts] = useState<ConflictEvent[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  // Conflicts
  const [activeConflict, setActiveConflict] = useState<ConflictEvent | null>(null);
  const [conflictVotes, setConflictVotes] = useState<Record<number, string[]>>({});
  const [triggeredConflicts, setTriggeredConflicts] = useState<Set<string>>(new Set());

  // Solution
  const [solution, setSolution] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "solution">("chat");

  // Feedback
  const [feedbackSummaries, setFeedbackSummaries] = useState<FeedbackSummary[] | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const isKz = lang === "kz";

  // ── Derived ─────────────────────────────────────────────────
  const myParticipant = participants.find((p) => p.user_id === user?.id);
  const isLeader = myParticipant?.role === "leader";
  const isCreator = session?.created_by === user?.id;

  // ── Load data ───────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setStage("loading");

    casesHook.loadCase(id).then((fetchedCase) => {
      if (!fetchedCase) {
        setPageError(t.casePage.notFound);
        return;
      }
      setCaseData(fetchedCase);

      // Parse phases and conflicts from case data
      const rawPhases = (fetchedCase as any).phases;
      const rawConflicts = (fetchedCase as any).conflicts;
      if (Array.isArray(rawPhases)) setPhases(rawPhases);
      if (Array.isArray(rawConflicts)) setConflicts(rawConflicts);

      // Find or prepare session
      sim.findActiveSession(id).then((existingSession) => {
        if (existingSession) {
          setSession(existingSession);
          sim.loadParticipants(existingSession.id).then(setParticipants);
          sim.loadMessages(id, existingSession.id).then((msgs) => setMessages(msgs as ChatMessage[]));

          if (existingSession.status === "completed") {
            setStage("feedback");
            sim.loadFeedbackSummary(existingSession.id).then((s) => {
              if (s.length > 0) {
                setFeedbackSummaries(s);
                setFeedbackSubmitted(true);
                setStage("results");
              }
            });
          } else if (existingSession.status === "in_progress") {
            setStage("simulation");
          } else {
            setStage("lobby");
          }

          // Auto-join
          if (user) sim.joinSession(existingSession.id);
        } else {
          setStage("lobby");
        }
      });
    });
  }, [id]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Conflict trigger check
  useEffect(() => {
    if (stage !== "simulation" || !session) return;
    const currentPhaseConflicts = conflicts.filter(
      (c) => c.phase === session.current_phase && !triggeredConflicts.has(c.key)
    );
    // Random chance to trigger a conflict (30% on phase entry)
    if (currentPhaseConflicts.length > 0 && Math.random() < 0.3) {
      const conflict = currentPhaseConflicts[Math.floor(Math.random() * currentPhaseConflicts.length)];
      setActiveConflict(conflict);
      setConflictVotes({});
      setTriggeredConflicts((prev) => new Set([...prev, conflict.key]));
      if (session) sim.triggerConflict(session.id, conflict.key, session.current_phase);
    }
  }, [session?.current_phase, stage]);

  // ── Handlers ────────────────────────────────────────────────

  const handleCreateSession = async () => {
    if (!id || !user) return;
    const newSession = await sim.createSession(id);
    if (newSession) {
      setSession(newSession);
      const parts = await sim.loadParticipants(newSession.id);
      setParticipants(parts);
      setStage("lobby");
    }
  };

  const handleAssignRole = async (userId: string, role: SimRole) => {
    if (!session) return;
    await sim.assignRole(session.id, userId, role);
    const parts = await sim.loadParticipants(session.id);
    setParticipants(parts);
  };

  const handleStartSimulation = async () => {
    if (!session) return;
    const ok = await sim.startSimulation(session.id);
    if (ok) {
      setSession((prev) =>
        prev
          ? {
              ...prev,
              status: "in_progress",
              current_phase: 0,
              phase_started_at: new Date().toISOString(),
            }
          : prev
      );
      setStage("simulation");
    }
  };

  const handleAdvancePhase = async () => {
    if (!session) return;
    const nextPhase = session.current_phase + 1;
    const ok = await sim.advancePhase(session.id, nextPhase, phases.length);
    if (ok) {
      if (nextPhase >= phases.length) {
        setSession((prev) =>
          prev ? { ...prev, status: "completed", current_phase: nextPhase } : prev
        );
        setStage("solution");
      } else {
        setSession((prev) =>
          prev
            ? {
                ...prev,
                current_phase: nextPhase,
                phase_started_at: new Date().toISOString(),
              }
            : prev
        );
      }
    }
  };

  const handleTimeUp = useCallback(() => {
    toast({
      title: isKz ? "Уақыт бітті!" : "Время вышло!",
      description: isKz
        ? "Келесі кезеңге өтіңіз"
        : "Переходите к следующему этапу",
    });
  }, [isKz, toast]);

  const handleToggleTask = (taskKey: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      next.has(taskKey) ? next.delete(taskKey) : next.add(taskKey);
      return next;
    });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !id || sending) return;
    setSending(true);
    const sent = await sim.sendMessage(
      id,
      input.trim(),
      session?.id,
      session?.current_phase
    );
    if (sent) {
      setMessages((prev) => [
        ...prev,
        {
          ...sent,
          author_name: profile?.full_name || user?.email || null,
        },
      ]);
      setInput("");
    }
    setSending(false);
  };

  const handleConflictVote = (optionIndex: number) => {
    if (!user) return;
    setConflictVotes((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        next[Number(key)] = (next[Number(key)] || []).filter(
          (uid) => uid !== user.id
        );
      }
      next[optionIndex] = [...(next[optionIndex] || []), user.id];
      return next;
    });
  };

  const handleConflictResolve = (optionIndex: number) => {
    setActiveConflict(null);
    toast({
      title: isKz ? "Шешім қабылданды" : "Решение принято",
      description: activeConflict
        ? isKz
          ? activeConflict.options[optionIndex]?.textKz
          : activeConflict.options[optionIndex]?.text
        : "",
    });
  };

  const handleSubmitSolution = async () => {
    if (!solution.trim() || !id) return;
    const ok = await sim.submitSolution(id, solution.trim());
    if (ok) {
      toast({ title: isKz ? "Шешім жіберілді!" : "Решение отправлено!" });
      setStage("feedback");
    }
  };

  const handleSubmitFeedback = async (feedbacks: PeerFeedbackData[]) => {
    if (!session) return;
    const ok = await sim.submitFeedback(session.id, feedbacks);
    if (ok) {
      setFeedbackSubmitted(true);
      const summaries = await sim.loadFeedbackSummary(session.id);
      setFeedbackSummaries(summaries);
      setStage("results");
      toast({ title: isKz ? "Бағалау жіберілді!" : "Оценка отправлена!" });
    }
  };

  // ── Helpers ─────────────────────────────────────────────────
  const getCategoryLabel = (category: string) => {
    const map: Record<string, string> = {
      marketing: t.casesSection.marketing,
      management: t.casesSection.management,
      it: t.casesSection.it,
      education: t.casesSection.education,
      physics_ed: t.casesSection.physics_ed,
      social: t.casesSection.social,
    };
    return map[category] || category;
  };
  const getDifficultyLabel = (difficulty: string) => {
    const map: Record<string, string> = {
      medium: t.casesSection.medium,
      hard: t.casesSection.hard,
    };
    return map[difficulty] || difficulty;
  };
  const getAuthorInitial = (name: string | null | undefined) =>
    name ? name.charAt(0).toUpperCase() : "?";

  const participantNames: Record<string, string> = {};
  participants.forEach((p) => {
    participantNames[p.user_id] = p.full_name;
  });

  const ROLE_ICONS: Record<string, React.ReactNode> = {
    leader: <Crown size={12} />,
    analyst: <BarChart3 size={12} />,
    creative: <Palette size={12} />,
    presenter: <Mic size={12} />,
  };

  const currentUserName = profile?.full_name || user?.email || "";

  // ── Loading state ───────────────────────────────────────────
  if (stage === "loading") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">{t.casePage.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  if (pageError || !caseData) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-destructive text-lg">{pageError || t.casePage.notFound}</p>
            <Link to="/cases">
              <Button variant="outline" className="gap-2">
                <ChevronLeft size={16} /> {t.casePage.backToCases}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Stage badges ────────────────────────────────────────────
  const stageLabels: Record<SimStage, string> = {
    loading: "",
    lobby: isKz ? "Лобби" : "Лобби",
    simulation: isKz ? "Симуляция" : "Симуляция",
    solution: isKz ? "Шешім" : "Решение",
    feedback: isKz ? "Кері байланыс" : "Обратная связь",
    results: isKz ? "Нәтижелер" : "Результаты",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Conflict Modal */}
      <AnimatePresence>
        {activeConflict && (
          <ConflictModal
            conflict={activeConflict}
            lang={lang}
            onResolve={handleConflictResolve}
            isLeader={isLeader}
            votes={conflictVotes}
            onVote={handleConflictVote}
            currentUserId={user?.id || ""}
            participantNames={participantNames}
          />
        )}
      </AnimatePresence>

      <div className="flex-1 pt-16 flex flex-col lg:flex-row">
        {/* ── Sidebar ──────────────────────────────────────── */}
        <aside className="w-full lg:w-80 xl:w-96 border-b lg:border-b-0 lg:border-r border-border bg-card/50 overflow-y-auto shrink-0">
          <div className="p-6 space-y-6">
            {/* Nav + badges */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link
                  to="/cases"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft size={18} />
                </Link>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    stage === "simulation"
                      ? "bg-primary/10 text-primary animate-pulse"
                      : stage === "results"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {stageLabels[stage]}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    categoryColorMap[caseData.category] || "bg-primary/10 text-primary"
                  }`}
                >
                  {getCategoryLabel(caseData.category)}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    difficultyColorMap[caseData.difficulty] ||
                    "bg-secondary text-muted-foreground"
                  }`}
                >
                  {getDifficultyLabel(caseData.difficulty)}
                </span>
              </div>
              <h1 className="font-display text-xl font-bold leading-tight">
                {isKz ? caseData.title_kz || caseData.title : caseData.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {isKz ? caseData.description_kz || caseData.description : caseData.description}
              </p>
            </div>

            {/* Team */}
            <div>
              <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2">
                <Users2 size={16} className="text-primary" />
                {isKz ? "Команда" : "Команда"} ({participants.length}/{caseData.team_size})
              </h3>
              <div className="space-y-2">
                {participants.map((p) => (
                  <div
                    key={p.user_id}
                    className="flex items-center gap-2.5 py-1.5"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                        p.user_id === user?.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary"
                      }`}
                    >
                      {getAuthorInitial(p.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm truncate block">
                        {p.full_name}
                      </span>
                    </div>
                    {p.role !== "member" && ROLE_DEFINITIONS[p.role as SimRole] && (
                      <span
                        className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          ROLE_DEFINITIONS[p.role as SimRole].color
                        }`}
                      >
                        {ROLE_ICONS[p.role]}
                        {isKz
                          ? ROLE_DEFINITIONS[p.role as SimRole].labelKz
                          : ROLE_DEFINITIONS[p.role as SimRole].label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Objectives */}
            <div>
              <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2">
                <Target size={16} className="text-primary" /> {t.casePage.objectives}
              </h3>
              <div className="space-y-2">
                {(isKz && caseData.objectives_kz.length > 0 ? caseData.objectives_kz : caseData.objectives).map((obj, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    {obj}
                  </div>
                ))}
              </div>
            </div>

            {/* Materials */}
            {caseData.materials.length > 0 && (
              <div>
                <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileText size={16} className="text-primary" /> {t.casePage.materials}
                </h3>
                <div className="space-y-2">
                  {(isKz && caseData.materials_kz.length > 0 ? caseData.materials_kz : caseData.materials).map((m) => (
                    <div
                      key={m}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border"
                    >
                      <span className="text-sm">{m}</span>
                      <span className="text-xs text-muted-foreground">
                        {m.split(".").pop()?.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ── Main Content ─────────────────────────────────── */}
        <main className="flex-1 flex flex-col min-h-0">
          {stage === "lobby" && (
            <CaseLobby
              session={session}
              participants={participants}
              phases={phases}
              conflicts={conflicts}
              currentUserId={user?.id || ""}
              isCreator={isCreator}
              isKz={isKz}
              lang={lang}
              onCreateSession={handleCreateSession}
              onAssignRole={handleAssignRole}
              onStartSimulation={handleStartSimulation}
            />
          )}

          {stage === "simulation" && session && (
            <CaseSimulation
              session={session}
              participants={participants}
              phases={phases}
              messages={messages}
              input={input}
              sending={sending}
              activeTab={activeTab}
              isLeader={isLeader}
              isKz={isKz}
              lang={lang}
              completedTasks={completedTasks}
              currentUserId={user?.id || ""}
              currentUserName={currentUserName}
              chatEndRef={chatEndRef}
              onSetInput={setInput}
              onSetActiveTab={setActiveTab}
              onSendMessage={handleSendMessage}
              onAdvancePhase={handleAdvancePhase}
              onTimeUp={handleTimeUp}
              onToggleTask={handleToggleTask}
            />
          )}

          {stage === "solution" && (
            <CaseSolution
              solution={solution}
              isKz={isKz}
              onSetSolution={setSolution}
              onSubmitSolution={handleSubmitSolution}
            />
          )}

          {stage === "feedback" && (
            <CaseFeedback
              participants={participants}
              currentUserId={user?.id || ""}
              lang={lang}
              feedbackSummaries={feedbackSummaries}
              feedbackSubmitted={feedbackSubmitted}
              onSubmitFeedback={handleSubmitFeedback}
            />
          )}

          {stage === "results" && (
            <CaseResults
              participants={participants}
              currentUserId={user?.id || ""}
              lang={lang}
              isKz={isKz}
              feedbackSummaries={feedbackSummaries}
              onSubmitFeedback={handleSubmitFeedback}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default CasePage;
