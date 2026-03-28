import { useState } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, Send, Award, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

              <div className="grid grid-cols-2 gap-3">
                {CRITERIA.map((c) => {
                  const val =
                    s[`avg_${c.key}` as keyof FeedbackSummary] as number;
                  const percent = (val / 5) * 100;
                  return (
                    <div key={c.key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          {isKz ? c.labelKz : c.labelRu}
                        </span>
                        <span className="font-medium">{val}</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-700"
                          style={{ width: `${percent}%` }}
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

      {others.map((p, idx) => (
        <motion.div
          key={p.user_id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.15 }}
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
