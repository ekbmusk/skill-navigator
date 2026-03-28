import { motion } from "framer-motion";
import { Target, FlaskConical, Trophy, Users, GraduationCap, TrendingUp, Sparkles } from "lucide-react";
import type { Badge } from "@/hooks/useAchievements";

const BADGE_ICONS: Record<string, { icon: typeof Target; color: string; bg: string }> = {
  first_step: { icon: Target, color: "text-blue-400", bg: "bg-blue-500/10" },
  researcher: { icon: FlaskConical, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  top_result: { icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  team_player: { icon: Users, color: "text-green-400", bg: "bg-green-500/10" },
  trainer_master: { icon: GraduationCap, color: "text-purple-400", bg: "bg-purple-500/10" },
  progress: { icon: TrendingUp, color: "text-orange-400", bg: "bg-orange-500/10" },
  advanced: { icon: Sparkles, color: "text-primary", bg: "bg-primary/10" },
};

interface Props {
  badges: Badge[];
  lang: "ru" | "kz";
}

const AchievementBadges = ({ badges, lang }: Props) => {
  const isKz = lang === "kz";
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {badges.map((badge, i) => {
        const config = BADGE_ICONS[badge.id] || { icon: Target, color: "text-primary", bg: "bg-primary/10" };
        const Icon = config.icon;
        return (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              delay: i * 0.08,
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            whileHover={badge.unlocked ? { scale: 1.08, y: -4 } : undefined}
            whileTap={badge.unlocked ? { scale: 0.95 } : undefined}
            className={`relative p-4 rounded-2xl border text-center transition-all cursor-default ${
              badge.unlocked
                ? "bg-card-gradient border-border hover:border-primary/40 hover:shadow-glow"
                : "bg-card/30 border-border/50 opacity-35 grayscale"
            }`}
            title={isKz ? badge.descriptionKz : badge.descriptionRu}
          >
            {/* Animated icon container */}
            <motion.div
              className={`w-12 h-12 mx-auto rounded-xl ${config.bg} flex items-center justify-center mb-3`}
              animate={badge.unlocked ? {
                boxShadow: [
                  "0 0 0px rgba(var(--primary), 0)",
                  "0 0 15px rgba(var(--primary), 0.15)",
                  "0 0 0px rgba(var(--primary), 0)",
                ],
              } : undefined}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Icon className={`h-6 w-6 ${config.color}`} strokeWidth={1.8} />
            </motion.div>

            <div className="text-xs font-semibold leading-tight mb-1">
              {isKz ? badge.titleKz : badge.titleRu}
            </div>
            <div className="text-[10px] text-muted-foreground leading-tight">
              {isKz ? badge.descriptionKz : badge.descriptionRu}
            </div>

            {/* Unlocked checkmark */}
            {badge.unlocked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.08 + 0.3, type: "spring", stiffness: 300 }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default AchievementBadges;
