import { motion } from "framer-motion";
import { Brain, Target, BarChart3, Zap } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Когнитивные навыки",
    description: "Оценка критического мышления, анализа и способности решать сложные задачи",
  },
  {
    icon: Target,
    title: "Soft Skills",
    description: "Коммуникация, лидерство, работа в команде и эмоциональный интеллект",
  },
  {
    icon: BarChart3,
    title: "Профессиональные навыки",
    description: "Технические компетенции и специализированные знания по направлению",
  },
  {
    icon: Zap,
    title: "Адаптивность",
    description: "Гибкость мышления, скорость обучения и реакция на изменения",
  },
];

const DiagnosticsSection = () => {
  return (
    <section id="diagnostics" className="py-24 md:py-32">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-wider">Диагностика</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3">
            Выявите <span className="text-gradient">скрытые навыки</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Комплексная диагностика через интерактивные задания, тесты и симуляции
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative p-6 rounded-xl bg-card-gradient border border-border hover:border-primary/40 transition-all duration-300 shadow-card hover:shadow-glow"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="text-primary" size={24} />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DiagnosticsSection;
