import { motion } from "framer-motion";
import { Users2, Lightbulb, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

const cases = [
  {
    tag: "Маркетинг",
    title: "Запуск нового продукта",
    desc: "Разработайте стратегию выхода на рынок для инновационного продукта в условиях высокой конкуренции",
    players: "3-5",
    difficulty: "Средний",
  },
  {
    tag: "Управление",
    title: "Кризис в компании",
    desc: "Примите серию управленческих решений для вывода компании из финансового кризиса",
    players: "4-6",
    difficulty: "Сложный",
  },
  {
    tag: "IT",
    title: "Цифровая трансформация",
    desc: "Спланируйте цифровую трансформацию традиционного бизнеса с ограниченным бюджетом",
    players: "3-4",
    difficulty: "Средний",
  },
];

const CasesSection = () => {
  return (
    <section id="cases" className="py-24 md:py-32">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-wider">Кейсы</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3">
            Решайте задачи <span className="text-gradient">вместе</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Командные кейсы из реального бизнеса — развивайте навыки через практику
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {cases.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative p-6 rounded-xl bg-card-gradient border border-border hover:border-primary/40 transition-all duration-300 shadow-card hover:shadow-glow flex flex-col"
            >
              <span className="inline-block self-start px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                {c.tag}
              </span>
              <h3 className="font-display text-xl font-semibold mb-2">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{c.desc}</p>

              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
                <div className="flex items-center gap-1.5">
                  <Users2 size={14} className="text-primary" />
                  <span>{c.players} игроков</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Trophy size={14} className="text-primary" />
                  <span>{c.difficulty}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button size="lg" variant="outline" className="gap-2">
            <Lightbulb size={18} /> Смотреть все кейсы
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CasesSection;
