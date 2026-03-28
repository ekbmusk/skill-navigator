import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, MessageCircle, Lightbulb, Crown, BarChart3, Palette, Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PhaseManager from "@/components/simulator/PhaseManager";
import { ROLE_DEFINITIONS } from "@/data/simulationData";
import type { SimPhase, SimRole, Participant, SimulationSession } from "@/data/simulationData";

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  phase: number | null;
  author_name: string | null;
}

interface CaseSimulationProps {
  session: SimulationSession;
  participants: Participant[];
  phases: SimPhase[];
  messages: ChatMessage[];
  input: string;
  sending: boolean;
  activeTab: "chat" | "solution";
  isLeader: boolean;
  isKz: boolean;
  lang: "ru" | "kz";
  completedTasks: Set<string>;
  currentUserId: string;
  currentUserName: string;
  chatEndRef: React.RefObject<HTMLDivElement>;
  onSetInput: (value: string) => void;
  onSetActiveTab: (tab: "chat" | "solution") => void;
  onSendMessage: () => void;
  onAdvancePhase: () => void;
  onTimeUp: () => void;
  onToggleTask: (taskKey: string) => void;
}

const getAuthorInitial = (name: string | null | undefined) =>
  name ? name.charAt(0).toUpperCase() : "?";

const ROLE_ICONS: Record<string, React.ReactNode> = {
  leader: <Crown size={12} />,
  analyst: <BarChart3 size={12} />,
  creative: <Palette size={12} />,
  presenter: <Mic size={12} />,
};

const CaseSimulation = ({
  session,
  participants,
  phases,
  messages,
  input,
  sending,
  activeTab,
  isLeader,
  isKz,
  lang,
  completedTasks,
  currentUserId,
  currentUserName,
  chatEndRef,
  onSetInput,
  onSetActiveTab,
  onSendMessage,
  onAdvancePhase,
  onTimeUp,
  onToggleTask,
}: CaseSimulationProps) => {
  return (
    <>
      {/* Tabs */}
      <div className="border-b border-border px-4 flex gap-1">
        <button
          onClick={() => onSetActiveTab("chat")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "chat"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageCircle size={16} /> {isKz ? "Талқылау" : "Обсуждение"}
        </button>
        <button
          onClick={() => onSetActiveTab("solution")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "solution"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Lightbulb size={16} /> {isKz ? "Кезең" : "Этап"}
        </button>
      </div>

      {activeTab === "chat" ? (
        <>
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const own = msg.user_id === currentUserId;
                const authorName = own
                  ? currentUserName
                  : msg.author_name || "";
                const avatar = getAuthorInitial(authorName);
                const time = new Date(msg.created_at).toLocaleTimeString("ru", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const participant = participants.find(
                  (p) => p.user_id === msg.user_id
                );
                const roleLabel =
                  participant?.role && participant.role !== "member"
                    ? isKz
                      ? ROLE_DEFINITIONS[participant.role as SimRole]?.labelKz
                      : ROLE_DEFINITIONS[participant.role as SimRole]?.label
                    : null;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
                        own
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary"
                      }`}
                    >
                      {avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {authorName}
                        </span>
                        {roleLabel && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            {roleLabel}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {time}
                        </span>
                      </div>
                      <div
                        className={`inline-block max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          own
                            ? "bg-primary text-primary-foreground rounded-tl-sm"
                            : "bg-secondary rounded-tl-sm"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => onSetInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && onSendMessage()
                }
                placeholder={
                  isKz ? "Хабарлама жазыңыз..." : "Напишите сообщение..."
                }
                className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button
                onClick={onSendMessage}
                size="icon"
                className="h-[46px] w-[46px] rounded-xl shrink-0"
                disabled={sending}
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto p-6">
          <PhaseManager
            phases={phases}
            currentPhase={session.current_phase}
            phaseStartedAt={session.phase_started_at || null}
            lang={lang}
            onAdvancePhase={onAdvancePhase}
            onTimeUp={onTimeUp}
            isLeader={isLeader}
            completedTasks={completedTasks}
            onToggleTask={onToggleTask}
          />
        </div>
      )}
    </>
  );
};

export default CaseSimulation;
