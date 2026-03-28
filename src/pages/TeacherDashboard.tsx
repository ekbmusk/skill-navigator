import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area,
} from "recharts";
import { Users, TrendingUp, TrendingDown, Minus, Award, AlertTriangle, Loader2, Search, Download, BookOpen, ClipboardCheck, Star, Clock } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { useTeacherDashboard } from "@/hooks/useTeacherDashboard";
import { useDiagnostics } from "@/hooks/useDiagnostics";
import type { StudentWithScores, StudentCaseDetail } from "@/hooks/useTeacherDashboard";
import type { Tables } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ProgressChart from "@/components/ProgressChart";
import { useToast } from "@/hooks/use-toast";

const MONTH_NAMES_RU = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
const MONTH_NAMES_KZ = ["Қаң", "Ақп", "Нау", "Сәу", "Мам", "Мау", "Шіл", "Там", "Қыр", "Қаз", "Қар", "Жел"];

type DashboardTab = "diagnostics" | "cases";
type CasesSortKey = "casesCompleted" | "avgPeerFeedback" | "avgSolutionScore";

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>("diagnostics");
  const [sortKey, setSortKey] = useState<"total" | "cognitive" | "soft" | "professional" | "adaptability">("total");
  const [casesSortKey, setCasesSortKey] = useState<CasesSortKey>("casesCompleted");
  const [searchQuery, setSearchQuery] = useState("");
  const [casesSearchQuery, setCasesSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentWithScores | null>(null);
  const [studentResults, setStudentResults] = useState<Tables<"diagnostics_results">[]>([]);
  const [loadingStudentResults, setLoadingStudentResults] = useState(false);
  const [selectedCaseStudent, setSelectedCaseStudent] = useState<StudentWithScores | null>(null);
  const [studentCaseDetails, setStudentCaseDetails] = useState<StudentCaseDetail[]>([]);
  const [loadingCaseDetails, setLoadingCaseDetails] = useState(false);
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});
  const [savingScores, setSavingScores] = useState<Record<string, boolean>>({});
  const [expandedSolutions, setExpandedSolutions] = useState<Set<string>>(new Set());
  const { t, lang } = useLang();
  const { students, loading, error, groupName, scoreSolution, loadStudentCaseDetails } = useTeacherDashboard();
  const { loadStudentResults: fetchStudentResults, computeTrend } = useDiagnostics();
  const { toast } = useToast();
  const isKz = lang === "kz";

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

  const handleCaseStudentClick = async (student: StudentWithScores) => {
    setSelectedCaseStudent(student);
    setLoadingCaseDetails(true);
    setScoreInputs({});
    setSavingScores({});
    setExpandedSolutions(new Set());
    try {
      const details = await loadStudentCaseDetails(student.userId);
      setStudentCaseDetails(details);
    } catch {
      setStudentCaseDetails([]);
    } finally {
      setLoadingCaseDetails(false);
    }
  };

  const handleScoreSave = async (solutionId: string) => {
    const scoreStr = scoreInputs[solutionId];
    const score = parseInt(scoreStr, 10);
    if (isNaN(score) || score < 0 || score > 100) return;

    setSavingScores((prev) => ({ ...prev, [solutionId]: true }));
    const ok = await scoreSolution(solutionId, score);
    setSavingScores((prev) => ({ ...prev, [solutionId]: false }));

    if (ok) {
      toast({
        title: t.dashboardCases?.scoreSaved ?? "Оценка сохранена",
      });
      // Update local state
      setStudentCaseDetails((prev) =>
        prev.map((d) =>
          d.solutionId === solutionId ? { ...d, solutionScore: score } : d
        )
      );
    }
  };

  const toggleSolution = (sessionId: string) => {
    setExpandedSolutions((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) next.delete(sessionId);
      else next.add(sessionId);
      return next;
    });
  };

  const sorted = useMemo(() => {
    let list = [...students];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q));
    }
    return list.sort((a, b) => b[sortKey] - a[sortKey]);
  }, [students, sortKey, searchQuery]);

  const casesSorted = useMemo(() => {
    let list = [...students];
    if (casesSearchQuery.trim()) {
      const q = casesSearchQuery.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    return list.sort((a, b) => {
      const aVal = a[casesSortKey] ?? -1;
      const bVal = b[casesSortKey] ?? -1;
      return (bVal as number) - (aVal as number);
    });
  }, [students, casesSortKey, casesSearchQuery]);

  const exportCSV = () => {
    const header = "Name,Cognitive,Soft,Professional,Adaptability,Total\n";
    const rows = sorted.map(s => `"${s.name}",${s.cognitive},${s.soft},${s.professional},${s.adaptability},${s.total}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${groupName}_results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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

  // Compute stat cards for diagnostics
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

  // Compute stat cards for cases
  const casesStatCards = useMemo(() => {
    const totalCases = students.reduce((s, st) => s + st.casesCompleted, 0);
    const studentsWithCases = students.filter((s) => s.casesCompleted > 0);
    const avgCasesPerStudent =
      students.length > 0
        ? Math.round((totalCases / students.length) * 10) / 10
        : 0;
    const ungradedCount = students.filter(
      (s) => s.casesCompleted > 0 && s.avgSolutionScore === null
    ).length;
    const feedbackStudents = students.filter(
      (s) => s.avgPeerFeedback !== null
    );
    const avgFeedback =
      feedbackStudents.length > 0
        ? Math.round(
            (feedbackStudents.reduce((s, st) => s + (st.avgPeerFeedback ?? 0), 0) /
              feedbackStudents.length) *
              10
          ) / 10
        : 0;

    return [
      {
        icon: BookOpen,
        label: t.dashboardCases?.casesCompleted ?? "Кейсов пройдено",
        value: String(totalCases),
        sub: t.dashboard.inGroup,
        color: "text-primary",
      },
      {
        icon: ClipboardCheck,
        label: t.dashboardCases?.avgCasesPerStudent ?? "Кейсов на студента",
        value: String(avgCasesPerStudent),
        sub: `${studentsWithCases.length} ${isKz ? "студент" : "студентов"}`,
        color: "text-green-400",
      },
      {
        icon: Clock,
        label: t.dashboardCases?.pendingGrading ?? "Ожидают оценки",
        value: String(ungradedCount),
        sub: isKz ? "студент" : "студентов",
        color: "text-yellow-400",
      },
      {
        icon: Star,
        label: t.dashboardCases?.avgPeerFeedback ?? "Средняя оценка 360",
        value: avgFeedback > 0 ? String(avgFeedback) : "—",
        sub: isKz ? "5 балдан" : "из 5 баллов",
        color: "text-primary",
      },
    ];
  }, [students, t, isKz]);

  const ScoreBadge = ({ score }: { score: number }) => {
    const cls = score >= 80 ? "text-green-400" : score >= 60 ? "text-primary" : score >= 45 ? "text-yellow-400" : "text-destructive";
    return <span className={`font-medium ${cls}`}>{score}%</span>;
  };

  const FeedbackBar = ({
    label,
    value,
  }: {
    label: string;
    value: number | null;
  }) => {
    const pct = value != null ? (value / 5) * 100 : 0;
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium">
            {value != null ? value.toFixed(1) : "—"}/5
          </span>
        </div>
        <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
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
          <p className="text-muted-foreground mb-6">{t.dashboard.group} {groupName}</p>
        </motion.div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab("diagnostics")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "diagnostics"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border"
            }`}
          >
            {t.dashboardCases?.diagnosticsTab ?? "Диагностика"}
          </button>
          <button
            onClick={() => setActiveTab("cases")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "cases"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border"
            }`}
          >
            {t.dashboardCases?.tab ?? "Кейсы"}
          </button>
        </div>

        {/* ===== DIAGNOSTICS TAB ===== */}
        {activeTab === "diagnostics" && (
          <>
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
                  <div className="p-6 border-b border-border flex flex-wrap items-center justify-between gap-4">
                    <h3 className="font-display font-semibold">{t.dashboard.studentResults}</h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="relative">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={isKz ? "Студентті іздеу..." : "Поиск студента..."}
                          className="pl-8 pr-3 py-1.5 w-48 rounded-lg border border-border bg-secondary/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                        />
                      </div>
                      <button
                        onClick={exportCSV}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-secondary/50 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
                      >
                        <Download size={14} />
                        CSV
                      </button>
                    </div>
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
          </>
        )}

        {/* ===== CASES TAB ===== */}
        {activeTab === "cases" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {casesStatCards.map((s, i) => (
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
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl bg-card-gradient border border-border shadow-card overflow-hidden">
                <div className="p-6 border-b border-border flex flex-wrap items-center justify-between gap-4">
                  <h3 className="font-display font-semibold">
                    {t.dashboardCases?.casesCompleted ?? "Кейсы студентов"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={casesSearchQuery}
                        onChange={(e) => setCasesSearchQuery(e.target.value)}
                        placeholder={isKz ? "Студентті іздеу..." : "Поиск студента..."}
                        className="pl-8 pr-3 py-1.5 w-48 rounded-lg border border-border bg-secondary/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{t.dashboard.sortBy}</span>
                    <select
                      value={casesSortKey}
                      onChange={(e) => setCasesSortKey(e.target.value as CasesSortKey)}
                      className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="casesCompleted">
                        {t.dashboardCases?.casesCompleted ?? "Кейсов пройдено"}
                      </option>
                      <option value="avgPeerFeedback">
                        {t.dashboardCases?.avgPeerFeedback ?? "Оценка 360"}
                      </option>
                      <option value="avgSolutionScore">
                        {t.dashboardCases?.avgSolutionScore ?? "Балл решений"}
                      </option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                        <th className="text-left p-4 font-medium">{t.dashboard.student}</th>
                        <th className="text-center p-4 font-medium">
                          {t.dashboardCases?.casesCompleted ?? "Кейсов"}
                        </th>
                        <th className="text-center p-4 font-medium">
                          {t.dashboardCases?.avgPeerFeedback ?? "360 (1-5)"}
                        </th>
                        <th className="text-center p-4 font-medium">
                          {t.dashboardCases?.avgSolutionScore ?? "Балл (0-100)"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {casesSorted.map((s) => (
                        <tr
                          key={s.userId}
                          className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                          onClick={() => handleCaseStudentClick(s)}
                        >
                          <td className="p-4 font-medium text-sm">{s.name}</td>
                          <td className="p-4 text-center text-sm font-medium">
                            {s.casesCompleted}
                          </td>
                          <td className="p-4 text-center text-sm">
                            {s.avgPeerFeedback != null ? (
                              <span className="font-medium text-primary">
                                {s.avgPeerFeedback.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-4 text-center text-sm">
                            {s.avgSolutionScore != null ? (
                              <ScoreBadge score={s.avgSolutionScore} />
                            ) : s.casesCompleted > 0 ? (
                              <span className="text-yellow-400 text-xs">
                                {t.dashboardCases?.ungraded ?? "Не оценено"}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Student Drill-Down Dialog (Diagnostics) */}
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

        {/* Student Case Details Dialog */}
        <Dialog
          open={!!selectedCaseStudent}
          onOpenChange={(open) => {
            if (!open) setSelectedCaseStudent(null);
          }}
        >
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {selectedCaseStudent?.name} — {t.dashboardCases?.tab ?? "Кейсы"}
              </DialogTitle>
              <DialogDescription>
                {t.dashboardCases?.casesCompleted ?? "Кейсов пройдено"}:{" "}
                {selectedCaseStudent?.casesCompleted ?? 0}
              </DialogDescription>
            </DialogHeader>

            {loadingCaseDetails ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary mr-3" size={24} />
              </div>
            ) : studentCaseDetails.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t.dashboardCases?.noCasesData ?? "Нет данных по кейсам"}
              </div>
            ) : (
              <div className="space-y-4">
                {studentCaseDetails.map((detail) => (
                  <div
                    key={detail.sessionId}
                    className="p-4 rounded-lg bg-secondary/20 border border-border space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-sm">
                          {isKz ? detail.caseTitleKz : detail.caseTitle}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>
                            {isKz ? "Рөл" : "Роль"}: {detail.role}
                          </span>
                          <span>
                            {new Date(detail.completedAt).toLocaleDateString(
                              isKz ? "kk-KZ" : "ru-RU"
                            )}
                          </span>
                        </div>
                      </div>
                      {detail.peerAvg != null && (
                        <div className="text-right">
                          <div className="text-sm font-bold text-primary">
                            {detail.peerAvg.toFixed(1)}/5
                          </div>
                          <div className="text-xs text-muted-foreground">360</div>
                        </div>
                      )}
                    </div>

                    {/* Peer Feedback Bars */}
                    {detail.peerAvg != null && (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <FeedbackBar
                          label={isKz ? "Коммуникация" : "Коммуникация"}
                          value={detail.peerCommunication}
                        />
                        <FeedbackBar
                          label={isKz ? "Командалық жұмыс" : "Работа в команде"}
                          value={detail.peerTeamwork}
                        />
                        <FeedbackBar
                          label={isKz ? "Лидерлік" : "Лидерство"}
                          value={detail.peerLeadership}
                        />
                        <FeedbackBar
                          label={
                            isKz
                              ? "Мәселе шешу"
                              : "Решение проблем"
                          }
                          value={detail.peerProblemSolving}
                        />
                      </div>
                    )}

                    {/* Solution */}
                    {detail.solutionText && (
                      <div>
                        <button
                          onClick={() => toggleSolution(detail.sessionId)}
                          className="text-xs text-primary hover:underline"
                        >
                          {expandedSolutions.has(detail.sessionId)
                            ? (isKz ? "Шешімді жасыру" : "Скрыть решение")
                            : (isKz ? "Шешімді көрсету" : "Показать решение")}
                        </button>
                        {expandedSolutions.has(detail.sessionId) && (
                          <div className="mt-2 p-3 rounded bg-secondary/30 border border-border text-xs text-foreground whitespace-pre-wrap max-h-40 overflow-y-auto">
                            {detail.solutionText}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Score Input */}
                    {detail.solutionId && (
                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-xs text-muted-foreground">
                          {t.dashboardCases?.scoreLabel ?? "Балл (0-100)"}:
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={
                            scoreInputs[detail.solutionId] ??
                            (detail.solutionScore != null
                              ? String(detail.solutionScore)
                              : "")
                          }
                          onChange={(e) =>
                            setScoreInputs((prev) => ({
                              ...prev,
                              [detail.solutionId!]: e.target.value,
                            }))
                          }
                          className="w-20 px-2 py-1 rounded border border-border bg-secondary/50 text-sm text-foreground focus:outline-none focus:border-primary/50"
                        />
                        <button
                          onClick={() => handleScoreSave(detail.solutionId!)}
                          disabled={savingScores[detail.solutionId] ?? false}
                          className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
                        >
                          {savingScores[detail.solutionId]
                            ? "..."
                            : (t.dashboardCases?.scoreSolution ?? "Оценить")}
                        </button>
                        {detail.solutionScore != null && (
                          <span className="text-xs font-medium text-green-400">
                            {detail.solutionScore}/100
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TeacherDashboard;
