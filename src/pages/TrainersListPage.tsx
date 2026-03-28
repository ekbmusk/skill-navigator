import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, GitBranch, Mic, ArrowRight, Trophy, Sparkles, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLang } from "@/i18n/LanguageContext";
import { useTrainers, type TrainerType } from "@/hooks/useTrainers";
import Navbar from "@/components/Navbar";
import { LayeredIcon, DiamondIcon, BlobIcon } from "@/components/BrandIcons";

const TrainersListPage = () => {
  const { t } = useLang();
  const { loadBestScores } = useTrainers();
  const [bestScores, setBestScores] = useState<Record<TrainerType, number>>({
    sbi_feedback: 0, conflict_resolution: 0, public_speaking: 0,
  });

  useEffect(() => {
    loadBestScores().then(setBestScores);
  }, []);

  const trainers = [
    {
      type: "sbi_feedback" as TrainerType,
      icon: MessageSquare,
      featureIcon: Target,
      title: t.trainers.sbiTitle,
      desc: t.trainers.sbiDesc,
      href: "/trainers/sbi-feedback",
      gradient: "from-blue-600 to-cyan-500",
      bgGlow: "bg-blue-500/5",
      iconBg: "bg-blue-500/15",
      iconColor: "text-blue-400",
      scenarios: 5,
    },
    {
      type: "conflict_resolution" as TrainerType,
      icon: GitBranch,
      featureIcon: Zap,
      title: t.trainers.conflictTitle,
      desc: t.trainers.conflictDesc,
      href: "/trainers/conflict-resolution",
      gradient: "from-red-500 to-orange-500",
      bgGlow: "bg-red-500/5",
      iconBg: "bg-red-500/15",
      iconColor: "text-red-400",
      scenarios: 3,
    },
    {
      type: "public_speaking" as TrainerType,
      icon: Mic,
      featureIcon: Sparkles,
      title: t.trainers.speakingTitle,
      desc: t.trainers.speakingDesc,
      href: "/trainers/public-speaking",
      gradient: "from-violet-500 to-purple-500",
      bgGlow: "bg-violet-500/5",
      iconBg: "bg-violet-500/15",
      iconColor: "text-violet-400",
      scenarios: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 pt-28 pb-20">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16 relative">
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/5 blur-3xl"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <span className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
            <Sparkles size={14} />
            {t.trainers.title}
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold relative">
            {t.trainers.title} <span className="text-gradient">{t.trainers.titleHighlight}</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">{t.trainers.subtitle}</p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {trainers.map((tr, i) => {
            const hasScore = bestScores[tr.type] > 0;
            return (
              <motion.div
                key={tr.type}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className={`group relative rounded-2xl border border-border hover:border-primary/30 transition-all duration-500 shadow-card hover:shadow-glow overflow-hidden flex flex-col ${tr.bgGlow}`}
              >
                {/* Gradient header */}
                <div className="relative">
                  <div className={`relative h-28 bg-gradient-to-br ${tr.gradient} overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20" />
                    <motion.div
                      className="absolute right-4 top-4 opacity-20"
                      animate={{ y: [0, -5, 0], rotate: [0, 5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <tr.icon size={60} className="text-white" />
                    </motion.div>
                    {hasScore && (
                      <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold">
                        <Trophy size={13} />
                        {bestScores[tr.type]}%
                      </div>
                    )}
                  </div>
                  {/* BrandIcon — outside overflow-hidden */}
                  <div className="absolute -bottom-6 left-6 z-10">
                    {i === 0 && (
                      <LayeredIcon
                        main={<MessageSquare className="text-white" size={24} />}
                        accent={<Target className="text-white" size={14} />}
                        gradient="from-blue-500 to-cyan-500"
                        accentGradient="from-cyan-400 to-blue-500"
                        glow="bg-blue-500/40"
                        size={56}
                      />
                    )}
                    {i === 1 && (
                      <DiamondIcon
                        gradient="from-red-500 to-orange-500"
                        glow="bg-red-500/40"
                        size={56}
                      >
                        <GitBranch className="text-white" size={24} />
                      </DiamondIcon>
                    )}
                    {i === 2 && (
                      <BlobIcon
                        gradient="from-violet-500 to-purple-500"
                        glow="bg-violet-500/40"
                        size={56}
                      >
                        <Mic className="text-white" size={24} />
                      </BlobIcon>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 pt-10 flex flex-col flex-1">
                  <h2 className="font-display text-lg font-bold mb-2">{tr.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{tr.desc}</p>

                  {/* Meta chips */}
                  <div className="flex items-center gap-2 mb-5">
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary text-[11px] text-muted-foreground">
                      <tr.featureIcon size={11} />
                      {tr.scenarios} {t.trainers.scenarios || "scenarios"}
                    </span>
                    {hasScore && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-500/10 text-[11px] text-green-400">
                        <Zap size={11} />
                        {t.trainers.completed}
                      </span>
                    )}
                  </div>

                  <Button className="w-full gap-2 group-hover:shadow-glow transition-shadow" asChild>
                    <Link to={tr.href}>
                      {hasScore ? t.trainers.tryAgain : t.trainers.start}
                      <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrainersListPage;
