import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area,
} from "recharts";
import { Users, TrendingUp, TrendingDown, Minus, Award, AlertTriangle, Loader2 } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { useTeacherDashboard } from "@/hooks/useTeacherDashboard";
import { useDiagnostics } from "@/hooks/useDiagnostics";
import type { StudentWithScores } from "@/hooks/useTeacherDashboard";
import type { Tables } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ProgressChart from "@/components/ProgressChart";

const MONTH_NAMES_RU = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
const MONTH_NAMES_KZ = ["Қаң", "Ақп", "Нау", "Сәу", "Мам", "Мау", "Шіл", "Там", "Қыр", "Қаз", "Қар", "Жел"];

const TeacherDashboard = () => {
  const [sortKey, setSortKey] = useState<"total" | "cognitive" | "soft" | "professional" | "adaptability">("total");
  const [selectedStudent, setSelectedStudent] = useState<StudentWithScores | null>(null);
  const [studentResults, setStudentResults] = useState<Tables<"diagnostics_results">[]>([]);
  const [loadingStudentResults, setLoadingStudentResults] = useState(false);
  const { t, lang } = useLang();
  const { students, loading, error, groupName } = useTeacherDashboard();
  const { loadStudentResults: fetchStudentResults, computeTrend } = useDiagnostics();

  const handleStudentClick = async (student: StudentWithScores) => {
    setSelectedStudent(student);
    setLoadingStudentResults(true);
    try {
      const results = await fetchStudentResults(student.userId);
      setStudentResults(results);
    } catch {
      setStudentResults([]);
    } finally {
      setLoadingStudentResults(false);
    }
  };

  const sorted = useMemo(
    () => [...students].sort((a, b) => b[sortKey] - a[sortKey]),
    [students, sortKey]
  );

  const monthNames = lang === "kz" ? MONTH_NAMES_KZ : MONTH_NAMES_RU;

  // Compute progress data: group completed results by month
  const progressData = useMemo(() => {
    const byMonth = new Map<string, { sum: number; count: number }>();
    for (const s of students) {
      if (!s.completedAt) continue;
      const d = new Date(s.completedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      const entry = byMonth.get(key) ?? { sum: 0, count: 0 };
      entry.sum += s.total;
      entry.count += 1;
      byMonth.set(key, entry);
    }
    return Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, { sum, count }]) => ({
        month: monthNames[parseInt(key.split("-")[1], 10)],
        avg: Math.round(sum / count),
      }));
  }, [students, monthNames]);

  // Compute score distribution
  const distributionData = useMemo(() => {
    const buckets = [
      { range: "0-25%", count: 0 },
      { range: "26-50%", count: 0 },
      { range: "51-75%", count: 0 },
      { range: "76-100%", count: 0 },
    ];
    for (const s of students) {
      if (s.total <= 25) buckets[0].count++;
      else if (s.total <= 50) buckets[1].count++;
      else if (s.total <= 75) buckets[2].count++;
      else buckets[3].count++;
    }
    return buckets;
  }, [students]);

  // Compute group average for radar chart
  const groupAvg = useMemo(() => {
    const n = students.length || 1;
    const sums = { cognitive: 0, soft: 0, professional: 0, adaptability: 0 };
    for (const s of students) {
      sums.cognitive += s.cognitive;
      sums.soft += s.soft;
      sums.professional += s.professional;
      sums.adaptability += s.adaptability;
    }
    return [
      { skill: t.dashboard.cognitive, score: Math.round(sums.cognitive / n) },
      { skill: t.dashboard.softSkills, score: Math.round(sums.soft / n) },
      { skill: t.dashboard.professional, score: Math.round(sums.professional / n) },
      { skill: t.dashboard.adaptability, score: Math.round(sums.adaptability / n) },
    ];
  }, [students, t]);

  // Compute stat cards
  const statCards = useMemo(() => {
    const total = students.length;
    const avgScore = total > 0 ? Math.round(students.reduce((s, st) => s + st.total, 0) / total) : 0;
    const leaders = students.filter((s) => s.total > 80).length;
    const attention = students.filter((s) => s.total < 50).length;

    return [
      { icon: Users, label: t.dashboard.students, value: String(total), sub: t.dashboard.inGroup, color: "text-primary" },
      { icon: TrendingUp, label: t.dashboard.avgScore, value: `${avgScore}%`, sub: t.dashboard.perMonth, color: "text-green-400" },
      { icon: Award, label: t.dashboard.leaders, value: String(leaders), sub: t.dashboard.above80, color: "text-primary" },
      { icon: AlertTriangle, label: t.dashboard.attention, value: String(attention), sub: t.dashboard.below50, color: "text-yellow-400" },
    ];
  }, [students, t]);

  const ScoreBadge = ({ score }: { score: number }) => {
    const cls = score >= 80 ? "text-green-400" : score >= 60 ? "text-primary" : score >= 45 ? "text-yellow-400" : "text-destructive";
    return <span className={`font-medium ${cls}`}>{score}%</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <Loader2 className="animate-spin text-primary mr-3" size={28} />
          <span className="text-muted-foreground text-lg">{t.dashboard.loading}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <p className="text-destructive text-lg">{t.dashboard.errorLoading}</p>
        </div>
      </div>
    );
  }

  if (!groupName) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <p className="text-muted-foreground text-lg">{t.dashboard.noGroup}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 pt-24 pb-16 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            {t.dashboard.title} <span className="text-gradient">{t.dashboard.titleHighlight}</span>
          </h1>
          <p className="text-muted-foreground mb-8">{t.dashboard.group} {groupName}</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-5 rounded-xl bg-card-gradient border border-border shadow-card">
              <s.icon className={`${s.color} mb-3`} size={22} />
              <div className="text-2xl font-display font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label} · {s.sub}</div>
            </motion.div>
          ))}
        </div>

        {students.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-12 rounded-xl bg-card-gradient border border-border shadow-card text-center">
            <p className="text-muted-foreground text-lg">{t.dashboard.noStudents}</p>
          </motion.div>
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-xl bg-card-gradient border border-border shadow-card">
                <h3 className="font-display font-semibold mb-4">{t.dashboard.avgDynamics}</h3>
                <div className="h-[240px]">
                  {progressData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={progressData}>
                        <defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(38, 92%, 55%)" stopOpacity={0.3} /><stop offset="100%" stopColor="hsl(38, 92%, 55%)" stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid stroke="hsl(222, 25%, 18%)" strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: "hsl(222, 40%, 10%)", border: "1px solid hsl(222, 25%, 18%)", borderRadius: 8 }} labelStyle={{ color: "hsl(210, 20%, 92%)" }} itemStyle={{ color: "hsl(38, 92%, 55%)" }} />
                        <Area type="monotone" dataKey="avg" stroke="hsl(38, 92%, 55%)" fill="url(#areaGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">{t.dashboard.noResults}</div>
                  )}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="p-6 rounded-xl bg-card-gradient border border-border shadow-card">
                <h3 className="font-display font-semibold mb-4">{t.dashboard.groupProfile}</h3>
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

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 rounded-xl bg-card-gradient border border-border shadow-card mb-8">
              <h3 className="font-display font-semibold mb-4">{t.dashboard.distribution}</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData}>
                    <CartesianGrid stroke="hsl(222, 25%, 18%)" strokeDasharray="3 3" />
                    <XAxis dataKey="range" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }} />
                    <YAxis tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "hsl(222, 40%, 10%)", border: "1px solid hsl(222, 25%, 18%)", borderRadius: 8 }} labelStyle={{ color: "hsl(210, 20%, 92%)" }} itemStyle={{ color: "hsl(38, 92%, 55%)" }} />
                    <Bar dataKey="count" fill="hsl(38, 92%, 55%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="rounded-xl bg-card-gradient border border-border shadow-card overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="font-display font-semibold">{t.dashboard.studentResults}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{t.dashboard.sortBy}</span>
                  <select value={sortKey} onChange={(e) => setSortKey(e.target.value as typeof sortKey)} className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="total">{t.dashboard.totalScore}</option>
                    <option value="cognitive">{t.dashboard.cognitive}</option>
                    <option value="soft">{t.dashboard.softSkills}</option>
                    <option value="professional">{t.dashboard.professional}</option>
                    <option value="adaptability">{t.dashboard.adaptability}</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                      <th className="text-left p-4 font-medium">{t.dashboard.student}</th>
                      <th className="text-center p-4 font-medium">{t.dashboard.cognitive}</th>
                      <th className="text-center p-4 font-medium">{t.dashboard.softSkills}</th>
                      <th className="text-center p-4 font-medium">{t.dashboard.professional}</th>
                      <th className="text-center p-4 font-medium">{t.dashboard.adaptability}</th>
                      <th className="text-center p-4 font-medium">{t.dashboard.total}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((s) => (
                      <tr
                        key={s.userId}
                        className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                        onClick={() => handleStudentClick(s)}
                      >
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
          </>
        )}

        {/* Student Drill-Down Dialog */}
        <Dialog open={!!selectedStudent} onOpenChange={(open) => { if (!open) setSelectedStudent(null); }}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {selectedStudent?.name}
              </DialogTitle>
              <DialogDescription>
                {t.progress.trend}: {(() => {
                  if (loadingStudentResults || studentResults.length < 2) return t.progress.stable;
                  const trend = computeTrend(studentResults);
                  return trend === "improving" ? t.progress.improving : trend === "declining" ? t.progress.declining : t.progress.stable;
                })()}
              </DialogDescription>
            </DialogHeader>

            {loadingStudentResults ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary mr-3" size={24} />
              </div>
            ) : studentResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t.dashboard.noResults}
              </div>
            ) : (
              <div className="space-y-5">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border text-center">
                    <div className="text-lg font-bold">{studentResults.length}</div>
                    <div className="text-xs text-muted-foreground">{t.progress.attempts}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border text-center">
                    {(() => {
                      const trend = computeTrend(studentResults);
                      const icon = trend === "improving"
                        ? <TrendingUp className="h-4 w-4 text-green-400 mx-auto mb-1" />
                        : trend === "declining"
                          ? <TrendingDown className="h-4 w-4 text-destructive mx-auto mb-1" />
                          : <Minus className="h-4 w-4 text-yellow-400 mx-auto mb-1" />;
                      const text = trend === "improving" ? t.progress.improving : trend === "declining" ? t.progress.declining : t.progress.stable;
                      const color = trend === "improving" ? "text-green-400" : trend === "declining" ? "text-destructive" : "text-yellow-400";
                      return (
                        <>
                          {icon}
                          <div className={`text-sm font-semibold ${color}`}>{text}</div>
                          <div className="text-xs text-muted-foreground">{t.progress.trend}</div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border text-center">
                    {(() => {
                      const sorted = [...studentResults].sort(
                        (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
                      );
                      const first = sorted[0];
                      const last = sorted[sorted.length - 1];
                      const diff = Math.round(last.average_score - first.average_score);
                      return (
                        <>
                          <div className={`text-lg font-bold ${diff >= 0 ? "text-green-400" : "text-destructive"}`}>
                            {diff >= 0 ? "+" : ""}{diff}%
                          </div>
                          <div className="text-xs text-muted-foreground">{t.progress.scoreChange}</div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Chart */}
                <ProgressChart results={studentResults} />

                {/* First vs Last comparison */}
                {studentResults.length >= 2 && (() => {
                  const sorted = [...studentResults].sort(
                    (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
                  );
                  const first = sorted[0];
                  const last = sorted[sorted.length - 1];
                  return (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground">
                        {t.progress.firstAttempt} → {t.progress.lastAttempt}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {(["cognitive_score", "soft_score", "professional_score", "adaptability_score"] as const).map((key) => {
                          const catKey = key.replace("_score", "") as "cognitive" | "soft" | "professional" | "adaptability";
                          const diff = Math.round(last[key] - first[key]);
                          return (
                            <div key={key} className="flex items-center justify-between p-2 rounded bg-secondary/20 border border-border text-xs">
                              <span className="font-medium">{t.categories[catKey]}</span>
                              <span className={diff >= 0 ? "text-green-400" : "text-destructive"}>
                                {Math.round(first[key])}→{Math.round(last[key])} ({diff >= 0 ? "+" : ""}{diff})
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TeacherDashboard;
