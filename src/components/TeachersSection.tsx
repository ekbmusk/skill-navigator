import { motion } from "framer-motion";
import { TrendingUp, Users, FileText, Bell } from "lucide-react";

const items = [
  { icon: TrendingUp, title: "Аналитика в реальном времени", desc: "Отслеживайте прогресс каждого студента и группы с интерактивными дашбордами" },
  { icon: Users, title: "Групповые отчёты", desc: "Сравнительный анализ навыков внутри группы для выявления сильных и слабых сторон" },
  { icon: FileText, title: "Рекомендации", desc: "Персонализированные рекомендации по методикам обучения на основе диагностики" },
  { icon: Bell, title: "Уведомления", desc: "Автоматические оповещения о критических изменениях в показателях студентов" },
];

const TeachersSection = () => {
  return (
    <section id="teachers" className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      <div className="container px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary text-sm font-medium uppercase tracking-wider">Для преподавателей</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-3">
              Данные для <span className="text-gradient">лучших решений</span>
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Получайте глубокую аналитику о навыках ваших студентов и персонализированные рекомендации по методам обучения
            </p>
          </motion.div>

          <div className="space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={item.title}
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
