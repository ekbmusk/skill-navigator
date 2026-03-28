import { motion } from "framer-motion";
import { Brain, Atom, Wifi, Clock, HelpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLang } from "@/i18n/LanguageContext";
import Navbar from "@/components/Navbar";

const TestsListPage = () => {
  const { t } = useLang();

  const tests = [
    {
      icon: Brain,
      title: t.testsPage.generalTitle,
      desc: t.testsPage.generalDesc,
      questions: 30,
      minutes: 15,
      href: "/diagnostics",
      color: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-400",
    },
    {
      icon: Atom,
      title: t.testsPage.physicsTitle,
      desc: t.testsPage.physicsDesc,
      questions: 30,
      minutes: 20,
      href: "/diagnostics/physics",
      color: "from-violet-500/20 to-purple-500/20",
      iconColor: "text-violet-400",
    },
    {
      icon: Wifi,
      title: t.testsPage.infoCommTitle,
      desc: t.testsPage.infoCommDesc,
      questions: 40,
      minutes: 25,
      href: "/diagnostics/infocomm",
      color: "from-cyan-500/20 to-blue-500/20",
      iconColor: "text-cyan-400",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-3xl md:text-5xl font-bold">
            {t.testsPage.title}{" "}
            <span className="text-gradient">{t.testsPage.titleHighlight}</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            {t.testsPage.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tests.map((test, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              className="group relative rounded-2xl bg-card-gradient border border-border hover:border-primary/40 transition-all duration-300 shadow-card hover:shadow-glow overflow-hidden flex flex-col"
            >
              {/* Gradient accent top */}
              <div className={`h-1.5 bg-gradient-to-r ${test.color}`} />

              <div className="p-7 flex flex-col flex-1">
                <div className="w-14 h-14 rounded-xl bg-secondary/60 flex items-center justify-center mb-5">
                  <test.icon className={test.iconColor} size={28} />
                </div>

                <h2 className="font-display text-xl font-semibold mb-2">{test.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{test.desc}</p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle size={14} className="text-primary" />
                    <span>{test.questions} {t.testsPage.questions}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-primary" />
                    <span>~{test.minutes} {t.testsPage.minutes}</span>
                  </div>
                </div>

                <Button className="w-full gap-2" asChild>
                  <Link to={test.href}>
                    {t.testsPage.start} <ArrowRight size={16} />
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
