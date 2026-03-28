import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Vote, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiamondIcon } from "@/components/BrandIcons";
import type { ConflictEvent, ConflictOption } from "@/data/simulationData";

interface ConflictModalProps {
  conflict: ConflictEvent;
  lang: "ru" | "kz";
  onResolve: (optionIndex: number) => void;
  isLeader: boolean;
  votes: Record<number, string[]>; // optionIndex → userId[]
  onVote: (optionIndex: number) => void;
  currentUserId: string;
  participantNames: Record<string, string>;
}

const ConflictModal = ({
  conflict,
  lang,
  onResolve,
  isLeader,
  votes,
  onVote,
  currentUserId,
  participantNames,
}: ConflictModalProps) => {
  const isKz = lang === "kz";
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const hasVoted = Object.values(votes).some((ids) =>
    ids.includes(currentUserId)
  );

  const totalVotes = Object.values(votes).reduce(
    (sum, ids) => sum + ids.length,
    0
  );

  const impactColors: Record<string, string> = {
    safe: "border-green-500/30 hover:border-green-500/60",
    risky: "border-yellow-500/30 hover:border-yellow-500/60",
    bold: "border-purple-500/30 hover:border-purple-500/60",
    democratic: "border-blue-500/30 hover:border-blue-500/60",
    authoritative: "border-orange-500/30 hover:border-orange-500/60",
    compromise: "border-teal-500/30 hover:border-teal-500/60",
    pragmatic: "border-cyan-500/30 hover:border-cyan-500/60",
    intensive: "border-red-500/30 hover:border-red-500/60",
    negotiation: "border-indigo-500/30 hover:border-indigo-500/60",
    harsh: "border-red-500/30 hover:border-red-500/60",
    moderate: "border-yellow-500/30 hover:border-yellow-500/60",
    humane: "border-green-500/30 hover:border-green-500/60",
    tactical: "border-orange-500/30 hover:border-orange-500/60",
    strategic: "border-blue-500/30 hover:border-blue-500/60",
    balanced: "border-teal-500/30 hover:border-teal-500/60",
    educational: "border-blue-500/30 hover:border-blue-500/60",
    social: "border-purple-500/30 hover:border-purple-500/60",
    personal: "border-green-500/30 hover:border-green-500/60",
    cautious: "border-yellow-500/30 hover:border-yellow-500/60",
    thorough: "border-indigo-500/30 hover:border-indigo-500/60",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-lg rounded-2xl border border-destructive/30 bg-background shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-destructive/10 px-6 py-4 flex items-center gap-3">
          <DiamondIcon size={44} gradient="from-red-500 to-orange-500">
            <AlertTriangle size={20} className="text-white" />
          </DiamondIcon>
          <div>
            <h3 className="font-display font-bold text-lg">
              {isKz ? conflict.titleKz : conflict.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isKz ? "Команда шешім қабылдауы керек!" : "Команда должна принять решение!"}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="px-6 py-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isKz ? conflict.descriptionKz : conflict.description}
          </p>
        </div>

        {/* Options */}
        <div className="px-6 pb-4 space-y-3">
          {conflict.options.map((opt, i) => {
            const optVotes = votes[i] || [];
            const isMyVote = optVotes.includes(currentUserId);
            const votePercent =
              totalVotes > 0 ? Math.round((optVotes.length / totalVotes) * 100) : 0;

            return (
              <button
                key={i}
                disabled={hasVoted}
                onClick={() => {
                  setSelectedOption(i);
                  onVote(i);
                }}
                className={`relative w-full text-left p-4 rounded-xl border-2 transition-all ${
                  isMyVote
                    ? "border-primary bg-primary/5"
                    : impactColors[opt.impact] || "border-border hover:border-primary/40"
                } ${hasVoted ? "cursor-default" : "cursor-pointer"}`}
              >
                {/* Vote progress bar */}
                {hasVoted && totalVotes > 0 && (
                  <div
                    className="absolute inset-0 rounded-xl bg-primary/5 transition-all duration-700"
                    style={{ width: `${votePercent}%` }}
                  />
                )}

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isMyVote
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {isMyVote && (
                        <Zap size={12} className="text-primary-foreground" />
                      )}
                    </div>
                    <span className="text-sm font-medium">
                      {isKz ? opt.textKz : opt.text}
                    </span>
                  </div>

                  {hasVoted && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {optVotes.length} {isKz ? "дауыс" : "гол."}
                      </span>
                      <span className="text-xs font-bold text-primary">
                        {votePercent}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Voter names */}
                {hasVoted && optVotes.length > 0 && (
                  <div className="relative z-10 mt-2 flex flex-wrap gap-1">
                    {optVotes.map((uid) => (
                      <span
                        key={uid}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
                      >
                        {participantNames[uid] || "?"}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Leader decision */}
        {isLeader && hasVoted && (
          <div className="px-6 pb-6 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">
              {isKz
                ? "Тим-лидер ретінде соңғы шешімді сіз қабылдайсыз"
                : "Как тим-лидер, вы принимаете окончательное решение"}
            </p>
            <div className="flex gap-2">
              {conflict.options.map((opt, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={selectedOption === i ? "default" : "outline"}
                  onClick={() => onResolve(i)}
                  className="flex-1 text-xs"
                >
                  {isKz ? opt.textKz : opt.text}
                </Button>
              ))}
            </div>
          </div>
        )}

        {!isLeader && hasVoted && (
          <div className="px-6 pb-6 text-center">
            <p className="text-xs text-muted-foreground">
              {isKz
                ? "Тим-лидердің шешімін күтіңіз..."
                : "Ожидайте решения тим-лидера..."}
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ConflictModal;
