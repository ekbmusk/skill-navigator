import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrbitalIcon } from "@/components/BrandIcons";
import { useGroupMembers, type GroupMember } from "@/hooks/useGroupMembers";
import { useGroupRank } from "@/hooks/useGroupRank";
import { useLang } from "@/i18n/LanguageContext";
import { Trophy, Users, ArrowUpDown, Loader2 } from "lucide-react";

interface GroupTabProps {
  currentUserId: string;
  lang: "ru" | "kz";
}

type SortMetric = "total" | "cognitive" | "soft" | "professional" | "adaptability";

const MEDAL = ["🥇", "🥈", "🥉"];

const SORT_LABELS: Record<SortMetric, { ru: string; kz: string }> = {
  total: { ru: "Общий", kz: "Жалпы" },
  cognitive: { ru: "Когнитивные", kz: "Когнитивті" },
  soft: { ru: "Soft Skills", kz: "Soft Skills" },
  professional: { ru: "Профессиональные", kz: "Кәсіби" },
  adaptability: { ru: "Адаптивность", kz: "Бейімделгіштік" },
};

const CATEGORY_LABELS: Record<string, { ru: string; kz: string }> = {
  cognitive: { ru: "Когнитивные", kz: "Когнитивті" },
  soft: { ru: "Soft Skills", kz: "Soft Skills" },
  professional: { ru: "Профессиональные", kz: "Кәсіби" },
  adaptability: { ru: "Адаптивность", kz: "Бейімделгіштік" },
};

export default function GroupTab({ currentUserId, lang }: GroupTabProps) {
  const { t } = useLang();
  const { members, loading, groupName } = useGroupMembers();
  const { loadRank, rank, loading: rankLoading } = useGroupRank();
  const [sortBy, setSortBy] = useState<SortMetric>("total");

  useEffect(() => {
    loadRank();
  }, [loadRank]);

  const sorted = useMemo(() => {
    return [...members].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [members, sortBy]);

  const radarData = useMemo(() => {
    if (members.length === 0) return [];
    const me = members.find((m) => m.userId === currentUserId);
    const categories: (keyof typeof CATEGORY_LABELS)[] = [
      "cognitive",
      "soft",
      "professional",
      "adaptability",
    ];
    return categories.map((cat) => {
      const avg =
        members.reduce((sum, m) => sum + (m[cat as keyof GroupMember] as number), 0) /
        members.length;
      return {
        category: CATEGORY_LABELS[cat][lang],
        you: me ? (me[cat as keyof GroupMember] as number) : 0,
        groupAvg: Math.round(avg),
      };
    });
  }, [members, currentUserId, lang]);

  // --- Loading state ---
  if (loading || rankLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
      </div>
    );
  }

  // --- No group state ---
  if (!groupName || members.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <OrbitalIcon gradient="from-muted to-muted/60" size={72} className="mb-6 opacity-60">
          <Users className="h-8 w-8 text-muted-foreground" />
        </OrbitalIcon>
        <p className="text-muted-foreground text-lg max-w-sm leading-relaxed">
          {t.group.noGroup}
        </p>
      </motion.div>
    );
  }

  const maxScore = Math.max(...sorted.map((m) => m[sortBy]), 1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* A. Rank Hero Card */}
      {rank && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="py-8 flex flex-col sm:flex-row items-center gap-6">
              <OrbitalIcon
                gradient="from-primary to-primary/70"
                glow="bg-primary"
                size={80}
              >
                <Trophy className="h-9 w-9 text-primary-foreground" />
              </OrbitalIcon>
              <div className="text-center sm:text-left">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  {t.group.rank}
                </p>
                <motion.div
                  className="font-display text-5xl sm:text-6xl font-bold tracking-tight"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.25 }}
                >
                  <span className="text-gradient">{rank.position}</span>
                  <span className="text-muted-foreground/40 mx-2">/</span>
                  <span className="text-muted-foreground/60">{rank.total}</span>
                </motion.div>
                <p className="text-xs text-muted-foreground mt-1">
                  {rank.total} {t.group.members} &middot; {groupName}
                </p>
              </div>
              <div className="sm:ml-auto">
                <motion.span
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 text-accent px-4 py-2 text-sm font-semibold border border-accent/20"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  Top {100 - rank.percentile}%
                </motion.span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* B + C grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* B. Leaderboard */}
        <motion.div
          className="lg:col-span-7"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border bg-card h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="font-display text-xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary/70" />
                  {t.group.leaderboard}
                </CardTitle>
                <div className="relative">
                  <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortMetric)}
                    className="appearance-none bg-muted/50 border border-border rounded-lg pl-8 pr-4 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                  >
                    {(Object.keys(SORT_LABELS) as SortMetric[]).map((key) => (
                      <option key={key} value={key}>
                        {SORT_LABELS[key][lang]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5 pt-0">
              <AnimatePresence mode="popLayout">
                {sorted.map((member, idx) => {
                  const isMe = member.userId === currentUserId;
                  const score = member[sortBy] as number;
                  const barWidth = Math.max((score / maxScore) * 100, 4);

                  return (
                    <motion.div
                      key={member.userId}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ delay: idx * 0.04, duration: 0.3 }}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                        isMe
                          ? "bg-primary/8 border border-primary/25 shadow-[0_0_16px_-4px] shadow-primary/15"
                          : "hover:bg-muted/40"
                      }`}
                    >
                      {/* Position */}
                      <span className="w-7 text-center font-display font-bold text-sm shrink-0">
                        {idx < 3 ? MEDAL[idx] : (
                          <span className="text-muted-foreground">{idx + 1}</span>
                        )}
                      </span>

                      {/* Avatar initials */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isMe
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {member.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      {/* Name + bar */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-sm font-medium truncate ${
                              isMe ? "text-primary font-semibold" : "text-foreground"
                            }`}
                          >
                            {member.name}
                            {isMe && (
                              <span className="ml-1.5 text-xs text-primary/60 font-normal">
                                ({t.group.you})
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${
                              isMe
                                ? "bg-gradient-to-r from-primary to-primary/70"
                                : "bg-gradient-to-r from-muted-foreground/30 to-muted-foreground/15"
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${barWidth}%` }}
                            transition={{ duration: 0.6, delay: idx * 0.04 + 0.2 }}
                          />
                        </div>
                      </div>

                      {/* Score */}
                      <span
                        className={`font-display text-sm font-bold tabular-nums shrink-0 ${
                          isMe ? "text-primary" : "text-foreground/70"
                        }`}
                      >
                        {score}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* C. You vs Group Average */}
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border bg-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-xl">
                {t.group.vsAverage}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                    <PolarGrid
                      stroke="hsl(var(--border))"
                      strokeDasharray="3 3"
                      strokeOpacity={0.5}
                    />
                    <PolarAngleAxis
                      dataKey="category"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                      axisLine={false}
                    />
                    <Radar
                      name={t.group.you}
                      dataKey="you"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Radar
                      name={lang === "kz" ? "Топ орташа" : "Среднее группы"}
                      dataKey="groupAvg"
                      stroke="hsl(var(--accent))"
                      fill="hsl(var(--accent))"
                      fillOpacity={0.1}
                      strokeWidth={2}
                      strokeDasharray="5 3"
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                      iconType="circle"
                      iconSize={8}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-60 text-muted-foreground text-sm">
                  {t.group.noGroup}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
