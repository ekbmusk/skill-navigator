import { motion } from "framer-motion";
import { Brain, Target, BarChart3, Zap } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { HexIcon, BlobIcon, DiamondIcon, OrbitalIcon } from "@/components/BrandIcons";

const categoryStyles = [
  {
    icon: Brain,
    accent: "from-blue-500 to-blue-600",
    accentBorder: "group-hover:border-blue-500/50",
    glowShadow: "group-hover:shadow-[0_8px_40px_rgba(59,130,246,0.15)]",
    iconBg: "bg-blue-500/10 group-hover:bg-blue-500/20",
    iconColor: "text-blue-500",
    watermarkColor: "text-blue-500/[0.04]",
    stripColor: "bg-gradient-to-r from-blue-500 to-blue-400",
  },
  {
    icon: Target,
    accent: "from-pink-500 to-rose-500",
    accentBorder: "group-hover:border-pink-500/50",
    glowShadow: "group-hover:shadow-[0_8px_40px_rgba(236,72,153,0.15)]",
    iconBg: "bg-pink-500/10 group-hover:bg-pink-500/20",
    iconColor: "text-pink-500",
    watermarkColor: "text-pink-500/[0.04]",
    stripColor: "bg-gradient-to-r from-pink-500 to-rose-400",
  },
  {
    icon: BarChart3,
    accent: "from-emerald-500 to-emerald-600",
    accentBorder: "group-hover:border-emerald-500/50",
    glowShadow: "group-hover:shadow-[0_8px_40px_rgba(16,185,129,0.15)]",
    iconBg: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
    iconColor: "text-emerald-500",
    watermarkColor: "text-emerald-500/[0.04]",
    stripColor: "bg-gradient-to-r from-emerald-500 to-teal-400",
  },
  {
    icon: Zap,
    accent: "from-amber-500 to-amber-600",
    accentBorder: "group-hover:border-amber-500/50",
    glowShadow: "group-hover:shadow-[0_8px_40px_rgba(245,158,11,0.15)]",
    iconBg: "bg-amber-500/10 group-hover:bg-amber-500/20",
    iconColor: "text-amber-500",
    watermarkColor: "text-amber-500/[0.04]",
    stripColor: "bg-gradient-to-r from-amber-500 to-yellow-400",
  },
];

const DiagnosticsSection = () => {
  const { t } = useLang();

  const features = [
    { title: t.diagSection.cognitive, description: t.diagSection.cognitiveDesc },
    { title: t.diagSection.soft, description: t.diagSection.softDesc },
    { title: t.diagSection.professional, description: t.diagSection.professionalDesc },
    { title: t.diagSection.adaptability, description: t.diagSection.adaptabilityDesc },
  ];

  return (
    <section id="diagnostics" className="py-24 md:py-32 relative overflow-hidden">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-wider">
            {t.diagSection.label}
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3">
            {t.diagSection.title}{" "}
            <span className="text-gradient">{t.diagSection.titleHighlight}</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            {t.diagSection.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const style = categoryStyles[i];
            const WatermarkIcon = style.icon;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.12,
                  type: "spring",
                  stiffness: 120,
                  damping: 14,
                }}
                className={`group relative rounded-xl bg-card-gradient border border-border ${style.accentBorder} ${style.glowShadow} transition-all duration-500 hover:-translate-y-2 overflow-hidden`}
              >
                {/* Colored top accent strip */}
                <div className={`h-1 w-full ${style.stripColor}`} />

                {/* Large faded watermark icon */}
                <div className="absolute -bottom-4 -right-4 pointer-events-none">
                  <WatermarkIcon
                    className={`${style.watermarkColor} transition-all duration-500`}
                    size={120}
                    strokeWidth={1}
                  />
                </div>

                <div className="relative p-6">
                  {/* Icon */}
                  <div className="mb-4">
                    {i === 0 && (
                      <HexIcon gradient="from-blue-500 to-blue-600" glow="bg-blue-500" size={56}>
                        <Brain className="text-white" size={24} />
                      </HexIcon>
                    )}
                    {i === 1 && (
                      <BlobIcon gradient="from-pink-500 to-rose-500" glow="bg-pink-500" size={56}>
                        <Target className="text-white" size={24} />
                      </BlobIcon>
                    )}
                    {i === 2 && (
                      <DiamondIcon gradient="from-emerald-500 to-teal-500" glow="bg-emerald-500" size={56}>
                        <BarChart3 className="text-white" size={24} />
                      </DiamondIcon>
                    )}
                    {i === 3 && (
                      <OrbitalIcon gradient="from-amber-500 to-orange-500" glow="bg-amber-500" size={56}>
                        <Zap className="text-white" size={24} />
                      </OrbitalIcon>
                    )}
                  </div>

                  <h3 className="font-display text-lg font-semibold mb-2 relative z-10">
                    {f.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed relative z-10">
                    {f.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DiagnosticsSection;
