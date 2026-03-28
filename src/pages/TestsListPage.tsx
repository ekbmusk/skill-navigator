import { motion } from "framer-motion";
import { Brain, Atom, Wifi, Clock, HelpCircle, ArrowRight, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLang } from "@/i18n/LanguageContext";
import Navbar from "@/components/Navbar";
import { LayeredIcon, OrbitalIcon, HexIcon } from "@/components/BrandIcons";

const TestsListPage = () => {
  const { t } = useLang();

  const tests = [
    {
      icon: Brain,
      featureIcon: Zap,
      title: t.testsPage.generalTitle,
      desc: t.testsPage.generalDesc,
      questions: 30,
      minutes: 15,
      href: "/diagnostics",
      gradient: "from-amber-500 to-orange-500",
      bgGlow: "bg-amber-500/5",
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-400",
    },
    {
      icon: Atom,
      featureIcon: Sparkles,
      title: t.testsPage.physicsTitle,
      desc: t.testsPage.physicsDesc,
      questions: 30,
      minutes: 20,
      href: "/diagnostics/physics",
      gradient: "from-violet-500 to-purple-500",
      bgGlow: "bg-violet-500/5",
      iconBg: "bg-violet-500/15",
      iconColor: "text-violet-400",
    },
    {
      icon: Wifi,
      featureIcon: Zap,
      title: t.testsPage.infoCommTitle,
      desc: t.testsPage.infoCommDesc,
      questions: 40,
      minutes: 25,
      href: "/diagnostics/infocomm",
      gradient: "from-cyan-500 to-blue-500",
      bgGlow: "bg-cyan-500/5",
      iconBg: "bg-cyan-500/15",
      iconColor: "text-cyan-400",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 pt-28 pb-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 relative"
        >
          {/* Glowing orb */}
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/5 blur-3xl"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          {/* Sparkle badge */}
          <span className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
            <Sparkles size={14} />
            {t.testsPage.title}
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold relative">
            {t.testsPage.title}{" "}
            <span className="text-gradient">{t.testsPage.titleHighlight}</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            {t.testsPage.subtitle}
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tests.map((test, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className={`group relative rounded-2xl border border-border hover:border-primary/30 transition-all duration-500 shadow-card hover:shadow-glow overflow-hidden flex flex-col ${test.bgGlow}`}
            >
              {/* Gradient header */}
              <div className="relative">
                <div className={`relative h-28 bg-gradient-to-br ${test.gradient} overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20" />
                  <motion.div
                    className="absolute right-4 top-4 opacity-20"
                    animate={{ y: [0, -5, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <test.icon size={60} className="text-white" />
                  </motion.div>
                </div>
                {/* BrandIcon popping out — outside overflow-hidden */}
                <div className="absolute -bottom-6 left-6 z-10">
                  {i === 0 && (
                    <LayeredIcon
                      main={<Brain className="text-white" size={24} />}
                      accent={<Zap className="text-white" size={14} />}
                      gradient="from-amber-500 to-orange-500"
                      accentGradient="from-yellow-400 to-amber-500"
                      glow="bg-amber-500/40"
                      size={56}
                    />
                  )}
                  {i === 1 && (
                    <OrbitalIcon
                      gradient="from-violet-500 to-purple-500"
                      glow="bg-violet-500/40"
                      size={56}
                    >
                      <Atom className="text-white" size={24} />
                    </OrbitalIcon>
                  )}
                  {i === 2 && (
                    <HexIcon
                      gradient="from-cyan-500 to-blue-500"
                      glow="bg-cyan-500/40"
                      size={56}
                    >
                      <Wifi className="text-white" size={24} />
                    </HexIcon>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 pt-10 flex flex-col flex-1">
                <h2 className="font-display text-lg font-bold mb-2">{test.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                  {test.desc}
                </p>

                {/* Meta chips */}
                <div className="flex items-center gap-2 mb-5">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary text-[11px] text-muted-foreground">
                    <HelpCircle size={11} />
                    {test.questions} {t.testsPage.questions}
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary text-[11px] text-muted-foreground">
                    <Clock size={11} />
                    ~{test.minutes} {t.testsPage.minutes}
                  </span>
                </div>

                <Button className="w-full gap-2 h-11 text-sm font-semibold group-hover:shadow-glow transition-shadow" asChild>
                  <Link to={test.href}>
                    {t.testsPage.start}
                    <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestsListPage;
