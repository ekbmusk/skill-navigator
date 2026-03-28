import { useState } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, Send, Award, Users2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrbitalIcon } from "@/components/BrandIcons";
import type { Participant, PeerFeedbackData, FeedbackSummary } from "@/data/simulationData";
import { ROLE_DEFINITIONS, type SimRole } from "@/data/simulationData";

interface PeerFeedbackProps {
  participants: Participant[];
  currentUserId: string;
  lang: "ru" | "kz";
  onSubmit: (feedbacks: PeerFeedbackData[]) => Promise<void>;
  summaries: FeedbackSummary[] | null;
  submitted: boolean;
}

const CRITERIA = [
  { key: "communication", labelRu: "Коммуникация", labelKz: "Коммуникация" },
  { key: "teamwork", labelRu: "Командная работа", labelKz: "Командалық жұмыс" },
  { key: "leadership", labelRu: "Лидерство", labelKz: "Көшбасшылық" },
  {
    key: "problem_solving",
    labelRu: "Решение проблем",
    labelKz: "Мәселелерді шешу",
  },
] as const;

const PeerFeedback = ({
  participants,
  currentUserId,
  lang,
  onSubmit,
  summaries,
  submitted,
}: PeerFeedbackProps) => {
  const isKz = lang === "kz";
  const others = participants.filter((p) => p.user_id !== currentUserId);

  const [ratings, setRatings] = useState<
    Record<string, Record<string, number>>
  >(() => {
    const init: Record<string, Record<string, number>> = {};
    for (const p of others) {
      init[p.user_id] = {
        communication: 3,
        teamwork: 3,
        leadership: 3,
        problem_solving: 3,
      };
    }
    return init;
  });

  const [comments, setComments] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const p of others) init[p.user_id] = "";
    return init;
  });

  const [selfRatings, setSelfRatings] = useState<Record<string, number>>({
    communication: 3, teamwork: 3, leadership: 3, problem_solving: 3,
  });

  const [selfComment, setSelfComment] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const setRating = (userId: string, criterion: string, value: number) => {
    setRatings((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [criterion]: value },
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const feedbacks: PeerFeedbackData[] = others.map((p) => ({
      reviewee_id: p.user_id,
      communication: ratings[p.user_id].communication,
      teamwork: ratings[p.user_id].teamwork,
      leadership: ratings[p.user_id].leadership,
      problem_solving: ratings[p.user_id].problem_solving,
      comment: comments[p.user_id] || "",
    }));
    feedbacks.push({
      reviewee_id: currentUserId,
      communication: selfRatings.communication,
      teamwork: selfRatings.teamwork,
      leadership: selfRatings.leadership,
      problem_solving: selfRatings.problem_solving,
      comment: selfComment,
    });
    await onSubmit(feedbacks);
    setSubmitting(false);
  };

  // Show results if submitted and summaries available
  if (submitted && summaries && summaries.length > 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Award size={16} />
            {isKz ? "360° кері байланыс нәтижелері" : "Результаты 360° обратной связи"}
          </div>
          <h2 className="font-display text-2xl font-bold">
            {isKz ? "Команда бағалауы" : "Оценка команды"}
          </h2>
        </div>

        <div className="space-y-4">
          {summaries.map((s, i) => (
            <motion.div
              key={s.user_id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card-gradient p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {s.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold">{s.full_name}</h4>
                    <span className="text-xs text-muted-foreground">
                      {s.count} {isKz ? "бағалау" : "оценок"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {s.total_avg}
                  </div>
                  <div className="text-xs text-muted-foreground">/ 5.0</div>
                </div>
              </div>

              <div className={s.user_id === currentUserId && s.self_communication !== undefined ? "space-y-3" : "grid grid-cols-2 gap-3"}>
                {CRITERIA.map((c) => {
                  const peerVal =
                    s[`avg_${c.key}` as keyof FeedbackSummary] as number;
                  const peerPercent = (peerVal / 5) * 100;

                  // Gap analysis for current user with self-assessment
                  if (s.user_id === currentUserId && s.self_communication !== undefined) {
                    const selfVal =
                      s[`self_${c.key}` as keyof FeedbackSummary] as number;
                    const selfPercent = (selfVal / 5) * 100;
                    const gap = selfVal - peerVal;
                    const absGap = Math.abs(gap);
                    const gapColor =
                      absGap <= 0.5
                        ? "text-green-400"
                        : absGap <= 1.0
                        ? "text-yellow-400"
                        : "text-red-400";

                    return (
                      <div key={c.key}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground font-medium">
                            {isKz ? c.labelKz : c.labelRu}
                          </span>
                          <div className="flex gap-3 text-xs">
                            <span>
                              {isKz ? "Өзі" : "Сам"}: <span className="font-medium text-amber-400">{selfVal.toFixed(1)}</span>
                            </span>
                            <span>
                              {isKz ? "Құрдастар" : "Коллеги"}: <span className="font-medium text-primary">{peerVal.toFixed(1)}</span>
                            </span>
                            <span className={gapColor}>
                              {isKz ? "Алшақтық" : "Разрыв"}: {gap > 0 ? "+" : ""}{gap.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-700"
                              style={{ width: `${peerPercent}%` }}
                            />
                          </div>
                          <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full rounded-full bg-amber-500 transition-all duration-700"
                              style={{ width: `${selfPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Default display for peers
                  return (
                    <div key={c.key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          {isKz ? c.labelKz : c.labelRu}
                        </span>
                        <span className="font-medium">{peerVal}</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-700"
                          style={{ width: `${peerPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Feedback form
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Users2 size={16} />
          {isKz ? "360° кері байланыс" : "360° обратная связь"}
        </div>
        <h2 className="font-display text-2xl font-bold">
          {isKz
            ? "Командадастарыңызды бағалаңыз"
            : "Оцените работу команды"}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          {isKz
            ? "Әр қатысушының жұмысын 1-ден 5-ке дейін бағалаңыз"
            : "Оцените работу каждого участника от 1 до 5"}
        </p>
      </div>

      {/* Self-assessment card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
        className="rounded-xl border border-amber-500/30 bg-card-gradient p-5"
      >
        <div className="flex items-center gap-3 mb-4">
          <OrbitalIcon size={44} gradient="from-amber-500 to-orange-500">
            <User size={20} className="text-white" />
          </OrbitalIcon>
          <div>
            <h4 className="font-semibold">
              {isKz ? "Командадағы өз жұмысыңызды бағалаңыз" : "Оцените свою работу в команде"}
            </h4>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium">
              {isKz ? "Өзін-өзі бағалау" : "Самооценка"}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {CRITERIA.map((c) => (
            <div key={c.key}>
              <div className="flex justify-between text-sm mb-2">
                <span>{isKz ? c.labelKz : c.labelRu}</span>
                <span className="font-medium text-amber-500">
                  {selfRatings[c.key]}/5
                </span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() =>
                      setSelfRatings((prev) => ({ ...prev, [c.key]: val }))
                    }
                    className="flex-1 group"
                  >
                    <Star
                      size={24}
                      className={`mx-auto transition-all ${
                        val <= selfRatings[c.key]
                          ? "fill-amber-500 text-amber-500"
                          : "text-muted-foreground/30 group-hover:text-amber-500/50"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Comment */}
          <div>
            <label className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
              <MessageSquare size={14} />
              {isKz ? "Пікір (міндетті емес)" : "Комментарий (необязательно)"}
            </label>
            <textarea
              value={selfComment}
              onChange={(e) => setSelfComment(e.target.value)}
              rows={2}
              placeholder={
                isKz ? "Пікіріңізді жазыңыз..." : "Напишите комментарий..."
              }
              className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
            />
          </div>
        </div>
      </motion.div>

      {others.map((p, idx) => (
        <motion.div
          key={p.user_id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (idx + 1) * 0.15 }}
          className="rounded-xl border border-border bg-card-gradient p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              {p.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="font-semibold">{p.full_name}</h4>
              {p.role !== "member" && ROLE_DEFINITIONS[p.role as SimRole] && (
                <span className="text-xs text-muted-foreground">
                  {isKz
                    ? ROLE_DEFINITIONS[p.role as SimRole].labelKz
                    : ROLE_DEFINITIONS[p.role as SimRole].label}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {CRITERIA.map((c) => (
              <div key={c.key}>
                <div className="flex justify-between text-sm mb-2">
                  <span>{isKz ? c.labelKz : c.labelRu}</span>
                  <span className="font-medium text-primary">
                    {ratings[p.user_id]?.[c.key] || 3}/5
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => setRating(p.user_id, c.key, val)}
                      className="flex-1 group"
                    >
                      <Star
                        size={24}
                        className={`mx-auto transition-all ${
                          val <= (ratings[p.user_id]?.[c.key] || 0)
                            ? "fill-primary text-primary"
                            : "text-muted-foreground/30 group-hover:text-primary/50"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Comment */}
            <div>
              <label className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
                <MessageSquare size={14} />
                {isKz ? "Пікір (міндетті емес)" : "Комментарий (необязательно)"}
              </label>
              <textarea
                value={comments[p.user_id] || ""}
                onChange={(e) =>
                  setComments((prev) => ({
                    ...prev,
                    [p.user_id]: e.target.value,
                  }))
                }
                rows={2}
                placeholder={
                  isKz ? "Пікіріңізді жазыңыз..." : "Напишите комментарий..."
                }
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
          </div>
        </motion.div>
      ))}

      <div className="text-center pt-4">
        <Button
          size="lg"
          className="gap-2 px-8"
          onClick={handleSubmit}
          disabled={submitting}
        >
          <Send size={16} />
          {isKz ? "Бағалауды жіберу" : "Отправить оценку"}
        </Button>
      </div>
    </div>
  );
};

export default PeerFeedback;
