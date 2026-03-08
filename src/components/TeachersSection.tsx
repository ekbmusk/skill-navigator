import { motion } from "framer-motion";
import { TrendingUp, Users, FileText, Bell } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";

const TeachersSection = () => {
  const { t } = useLang();

  const items = [
    { icon: TrendingUp, title: t.teachersSection.analytics, desc: t.teachersSection.analyticsDesc },
    { icon: Users, title: t.teachersSection.groupReports, desc: t.teachersSection.groupReportsDesc },
    { icon: FileText, title: t.teachersSection.recommendations, desc: t.teachersSection.recommendationsDesc },
    { icon: Bell, title: t.teachersSection.notifications, desc: t.teachersSection.notificationsDesc },
  ];

  return (
    <section id="teachers" className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      <div className="container px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="text-primary text-sm font-medium uppercase tracking-wider">{t.teachersSection.label}</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-3">
              {t.teachersSection.title} <span className="text-gradient">{t.teachersSection.titleHighlight}</span>
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">{t.teachersSection.subtitle}</p>
          </motion.div>

          <div className="space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 p-5 rounded-xl bg-card-gradient border border-border hover:border-primary/30 transition-all shadow-card"
              >
                <div className="w-10 h-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="text-primary" size={20} />
                </div>
                <div>
                  <h3 className="font-display font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeachersSection;
