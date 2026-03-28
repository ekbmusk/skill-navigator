import { motion } from "framer-motion";
import { TrendingUp, Users, FileText, Bell } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { OrbitalIcon, HexIcon, DiamondIcon, BlobIcon } from "@/components/BrandIcons";

const featureColors = [
  { bar: "bg-blue-500", barW: "w-3/4" },
  { bar: "bg-emerald-500", barW: "w-4/5" },
  { bar: "bg-violet-500", barW: "w-2/3" },
  { bar: "bg-amber-500", barW: "w-1/2" },
];

const springTransition = (i: number) => ({
  type: "spring" as const,
  stiffness: 260,
  damping: 22,
  delay: i * 0.12,
});

const TeachersSection = () => {
  const { t } = useLang();

  const items = [
    { icon: TrendingUp, title: t.teachersSection.analytics, desc: t.teachersSection.analyticsDesc },
    { icon: Users, title: t.teachersSection.groupReports, desc: t.teachersSection.groupReportsDesc },
    { icon: FileText, title: t.teachersSection.recommendations, desc: t.teachersSection.recommendationsDesc },
    { icon: Bell, title: t.teachersSection.notifications, desc: t.teachersSection.notificationsDesc },
  ];

  return (
    <section id="teachers" className="py-24 md:py-32 relative overflow-hidden section-alt">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      <div className="absolute inset-0 bg-noise pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[100px] pointer-events-none" />

      <div className="container px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side: text + dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
          >
            <span className="text-gradient text-xl md:text-2xl font-bold uppercase tracking-widest">{t.teachersSection.label}</span>
            <h2 className="font-display text-2xl md:text-3xl font-bold mt-3">
              {t.teachersSection.title} <span className="text-gradient">{t.teachersSection.titleHighlight}</span>
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">{t.teachersSection.subtitle}</p>

            {/* Dashboard mockup */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 24, delay: 0.2 }}
              className="mt-8 relative"
            >
              <div className="rounded-2xl p-[1px] bg-gradient-to-br from-primary/60 via-violet-500/40 to-emerald-500/30">
                <div className="rounded-2xl bg-card/95 backdrop-blur-sm p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">dashboard.tsx</div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Students", value: "247", color: "text-blue-400" },
                      { label: "Avg Score", value: "78%", color: "text-emerald-400" },
                      { label: "Growth", value: "+12%", color: "text-violet-400" },
                    ].map((stat, i) => (
                      <div key={i} className="rounded-lg bg-secondary/50 border border-border/50 p-3 text-center">
                        <div className={`text-lg font-bold font-display ${stat.color}`}>{stat.value}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-end gap-2 h-20 px-2">
                    {[45, 68, 82, 55, 73, 90, 60, 78].map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-t-sm bg-gradient-to-t from-primary/80 to-primary/40"
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.4 + i * 0.05 }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground px-2">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span><span>Avg</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right side: feature items */}
          <div className="space-y-4">
            {items.map((item, i) => {
              const color = featureColors[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={springTransition(i)}
                  whileHover={{ x: -4 }}
                  className="flex gap-4 p-5 rounded-xl bg-card-gradient border border-border hover:border-primary/30 transition-all duration-300 shadow-card hover:shadow-lg group"
                >
                  <div className="shrink-0">
                    {i === 0 && <OrbitalIcon gradient="from-blue-500 to-cyan-500" glow="bg-blue-500" size={48}><TrendingUp className="text-white" size={20} /></OrbitalIcon>}
                    {i === 1 && <HexIcon gradient="from-emerald-500 to-teal-500" glow="bg-emerald-500" size={48}><Users className="text-white" size={20} /></HexIcon>}
                    {i === 2 && <DiamondIcon gradient="from-violet-500 to-purple-500" glow="bg-violet-500" size={48}><FileText className="text-white" size={20} /></DiamondIcon>}
                    {i === 3 && <BlobIcon gradient="from-amber-500 to-orange-500" glow="bg-amber-500" size={48}><Bell className="text-white" size={20} /></BlobIcon>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{item.desc}</p>
                    <div className="h-1 rounded-full bg-secondary/60 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${color.bar} opacity-60`}
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.12, ease: "easeOut" }}
                      >
                        <div className={`h-full rounded-full ${color.barW}`} />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeachersSection;
