import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, AreaChart, Area,
} from "recharts";
import { Users, TrendingUp, Award, AlertTriangle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data
const groupAvg = [
  { skill: "Когнитивные", score: 72 },
  { skill: "Soft Skills", score: 65 },
  { skill: "Профессиональные", score: 58 },
  { skill: "Адаптивность", score: 70 },
];

const progressData = [
  { month: "Сен", avg: 45 },
  { month: "Окт", avg: 52 },
  { month: "Ноя", avg: 58 },
  { month: "Дек", avg: 61 },
  { month: "Янв", avg: 64 },
  { month: "Фев", avg: 68 },
  { month: "Мар", avg: 72 },
];

const distributionData = [
  { range: "0-25%", count: 3 },
  { range: "26-50%", count: 8 },
  { range: "51-75%", count: 18 },
  { range: "76-100%", count: 11 },
];

const students = [
  { name: "Иванов А.", cognitive: 85, soft: 72, professional: 68, adaptability: 90, total: 79 },
  { name: "Петрова М.", cognitive: 78, soft: 88, professional: 75, adaptability: 82, total: 81 },
  { name: "Сидоров К.", cognitive: 62, soft: 55, professional: 48, adaptability: 58, total: 56 },
  { name: "Козлова Е.", cognitive: 92, soft: 80, professional: 85, adaptability: 78, total: 84 },
  { name: "Николаев Д.", cognitive: 45, soft: 60, professional: 52, adaptability: 40, total: 49 },
  { name: "Антонова В.", cognitive: 70, soft: 75, professional: 82, adaptability: 68, total: 74 },
  { name: "Морозов И.", cognitive: 88, soft: 65, professional: 72, adaptability: 85, total: 78 },
  { name: "Белова О.", cognitive: 55, soft: 48, professional: 42, adaptability: 52, total: 49 },
];

const statCards = [
  { icon: Users, label: "Студентов", value: "40", sub: "в группе", color: "text-primary" },
  { icon: TrendingUp, label: "Средний балл", value: "68%", sub: "+6% за месяц", color: "text-green-400" },
  { icon: Award, label: "Лидеров", value: "8", sub: "выше 80%", color: "text-primary" },
  { icon: AlertTriangle, label: "Внимание", value: "5", sub: "ниже 50%", color: "text-yellow-400" },
];

const TeacherDashboard = () => {
  const [sortKey, setSortKey] = useState<"total" | "cognitive" | "soft" | "professional" | "adaptability">("total");
  const sorted = [...students].sort((a, b) => b[sortKey] - a[sortKey]);

  const ScoreBadge = ({ score }: { score: number }) => {
    const cls = score >= 80 ? "text-green-400" : score >= 60 ? "text-primary" : score >= 45 ? "text-yellow-400" : "text-destructive";
    return <span className={`font-medium ${cls}`}>{score}%</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 pt-24 pb-16 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Дашборд <span className="text-gradient">преподавателя</span>
          </h1>
          <p className="text-muted-foreground mb-8">Группа ИТ-201 · Весенний семестр 2026</p>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl bg-card-gradient border border-border shadow-card"
            >
              <s.icon className={`${s.color} mb-3`} size={22} />
              <div className="text-2xl font-display font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label} · {s.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Progress over time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl bg-card-gradient border border-border shadow-card"
          >
            <h3 className="font-display font-semibold mb-4">Динамика среднего балла</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(38, 92%, 55%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(38, 92%, 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="hsl(222, 25%, 18%)" strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(222, 40%, 10%)", border: "1px solid hsl(222, 25%, 18%)", borderRadius: 8 }}
                    labelStyle={{ color: "hsl(210, 20%, 92%)" }}
                    itemStyle={{ color: "hsl(38, 92%, 55%)" }}
                  />
                  <Area type="monotone" dataKey="avg" stroke="hsl(38, 92%, 55%)" fill="url(#areaGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Skills radar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-6 rounded-xl bg-card-gradient border border-border shadow-card"
          >
            <h3 className="font-display font-semibold mb-4">Средний профиль группы</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={groupAvg.map(g => ({ subject: g.skill, score: g.score, fullMark: 100 }))}>
                  <PolarGrid stroke="hsl(222, 25%, 18%)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 10 }} />
                  <Radar dataKey="score" stroke="hsl(38, 92%, 55%)" fill="hsl(38, 92%, 55%)" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-card-gradient border border-border shadow-card mb-8"
        >
          <h3 className="font-display font-semibold mb-4">Распределение по баллам</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <CartesianGrid stroke="hsl(222, 25%, 18%)" strokeDasharray="3 3" />
                <XAxis dataKey="range" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "hsl(222, 40%, 10%)", border: "1px solid hsl(222, 25%, 18%)", borderRadius: 8 }}
                  labelStyle={{ color: "hsl(210, 20%, 92%)" }}
                  itemStyle={{ color: "hsl(38, 92%, 55%)" }}
                />
                <Bar dataKey="count" fill="hsl(38, 92%, 55%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Students table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl bg-card-gradient border border-border shadow-card overflow-hidden"
        >
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="font-display font-semibold">Результаты студентов</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Сортировка:</span>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
                className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="total">Общий балл</option>
                <option value="cognitive">Когнитивные</option>
                <option value="soft">Soft Skills</option>
                <option value="professional">Профессиональные</option>
                <option value="adaptability">Адаптивность</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="text-left p-4 font-medium">Студент</th>
                  <th className="text-center p-4 font-medium">Когнитивные</th>
                  <th className="text-center p-4 font-medium">Soft Skills</th>
                  <th className="text-center p-4 font-medium">Профессиональные</th>
                  <th className="text-center p-4 font-medium">Адаптивность</th>
                  <th className="text-center p-4 font-medium">Общий</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((s, i) => (
                  <tr key={s.name} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="p-4 font-medium text-sm">{s.name}</td>
                    <td className="p-4 text-center text-sm"><ScoreBadge score={s.cognitive} /></td>
                    <td className="p-4 text-center text-sm"><ScoreBadge score={s.soft} /></td>
                    <td className="p-4 text-center text-sm"><ScoreBadge score={s.professional} /></td>
                    <td className="p-4 text-center text-sm"><ScoreBadge score={s.adaptability} /></td>
                    <td className="p-4 text-center text-sm font-bold"><ScoreBadge score={s.total} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
