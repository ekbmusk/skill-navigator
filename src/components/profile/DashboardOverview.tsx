import { motion } from "framer-motion";
import {
  Edit3, FileText, Users, Dumbbell, BarChart3, Star, Trophy, Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeAchievements } from "@/hooks/useAchievements";
import AchievementBadges from "./AchievementBadges";
import SkillRadarChart from "./SkillRadarChart";
import type { Tables } from "@/integrations/supabase/types";
import type { CaseHistoryItem } from "@/hooks/useCaseHistory";

interface Props {
  user: any;
  profile: { full_name: string; avatar_url: string; group_name: string } | null;
  testResults: Tables<"diagnostics_results">[];
  caseHistory: CaseHistoryItem[];
  trainerAttempts: { trainer_type: string; score: number; max_score: number; completed_at: string }[];
  lang: "ru" | "kz";
  onEditProfile: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 150, damping: 20 } },
};

const DashboardOverview = ({
  user, profile, testResults, caseHistory, trainerAttempts, lang, onEditProfile,
}: Props) => {
  const isKz = lang === "kz";

  const badges = computeAchievements(testResults, trainerAttempts, caseHistory);
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  // Compute stats
  const latestByType = new Map<string, Tables<"diagnostics_results">>();
  const sortedResults = [...testResults].sort(
    (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  );
  for (const r of sortedResults) {
    const type = (r.answers as any)?._test_type || "general";
    if (!latestByType.has(type)) latestByType.set(type, r);
  }

  const latestScores = Array.from(latestByType.values()).map((r) => r.average_score);
  const avgScore = latestScores.length > 0
    ? Math.round(latestScores.reduce((a, b) => a + b, 0) / latestScores.length)
    : 0;
  const bestScore = testResults.length > 0
    ? Math.round(Math.max(...testResults.map((r) => r.average_score)))
    : 0;

  const peerAvgs = caseHistory.map((c) => c.peerAvg).filter((v): v is number => v != null);
  const feedbackAvg = peerAvgs.length > 0
    ? (peerAvgs.reduce((a, b) => a + b, 0) / peerAvgs.length).toFixed(1)
    : "-";

  const stats = [
    { icon: BarChart3, color: "text-primary", bg: "bg-primary/10", value: `${avgScore}%`, label: isKz ? "Орташа балл" : "Средний балл" },
    { icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-500/10", value: `${bestScore}%`, label: isKz ? "Үздік балл" : "Лучший балл" },
    { icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10", value: testResults.length, label: isKz ? "Тесттер" : "Тестов" },
    { icon: Users, color: "text-green-400", bg: "bg-green-500/10", value: caseHistory.length, label: isKz ? "Кейстер" : "Кейсов" },
    { icon: Dumbbell, color: "text-purple-400", bg: "bg-purple-500/10", value: trainerAttempts.length, label: isKz ? "Тренажерлер" : "Тренажёров" },
    { icon: Star, color: "text-orange-400", bg: "bg-orange-500/10", value: feedbackAvg, label: isKz ? "360° баға" : "360° оценка" },
  ];

  return (
    <motion.div
      className="space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Row 1: Profile Header */}
      <motion.div variants={item} className="flex items-center gap-5">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Avatar className="h-20 w-20 border-3 border-primary/30 shadow-lg shadow-primary/10">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt="Avatar" />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-display font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </motion.div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-display font-bold text-foreground truncate">
            {profile?.full_name || user?.email || ""}
          </h2>
          {profile?.group_name && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm px-3 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {profile.group_name}
              </span>
            </div>
          )}
        </div>
        <Button variant="outline" size="default" onClick={onEditProfile} className="gap-2 shrink-0">
          <Edit3 className="h-4 w-4" />
          {isKz ? "Өзгерту" : "Изменить"}
        </Button>
      </motion.div>

      {/* Row 2: Stats Grid */}
      <motion.div variants={item}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.06, type: "spring", stiffness: 200 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
              >
                <Card className="border-border bg-card hover:border-primary/30 transition-all h-full">
                  <CardContent className="p-5 text-center">
                    <motion.div
                      className={`w-10 h-10 mx-auto rounded-xl ${stat.bg} flex items-center justify-center mb-3`}
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.4 }}
                    >
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </motion.div>
                    <div className="text-2xl font-display font-bold text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Row 3: Achievement Badges */}
      <motion.div variants={item}>
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2.5">
              <motion.div
                className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Award className="h-4 w-4 text-primary" />
              </motion.div>
              {isKz ? "Жетістіктер" : "Достижения"}
              <span className="text-sm text-muted-foreground font-normal ml-1">
                {unlockedCount}/{badges.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AchievementBadges badges={badges} lang={lang} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Row 4: Skill Radar Chart */}
      <motion.div variants={item}>
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2.5">
              <motion.div
                className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <BarChart3 className="h-4 w-4 text-primary" />
              </motion.div>
              {isKz ? "Дағды картасы" : "Карта навыков"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SkillRadarChart testResults={testResults} lang={lang} />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default DashboardOverview;
