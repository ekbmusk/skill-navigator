import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Loader2, Search, Download, BookOpen, ClipboardCheck, Star, Clock, MessageCircle, Swords, Mic } from "lucide-react";
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
import { OrbitalIcon, HexIcon, DiamondIcon, BlobIcon } from "@/components/BrandIcons";

const MONTH_NAMES_RU = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
const MONTH_NAMES_KZ = ["Қаң", "Ақп", "Нау", "Сәу", "Мам", "Мау", "Шіл", "Там", "Қыр", "Қаз", "Қар", "Жел"];

type DashboardTab = "diagnostics" | "cases";
type CasesSortKey = "casesCompleted" | "avgPeerFeedback" | "avgSolutionScore";
type FilterChip = "all" | "leaders" | "average" | "attention";

const CATEGORY_BAR_COLORS = {
  cognitive: "bg-blue-500",
  soft: "bg-emerald-500",
  professional: "bg-amber-500",
  adaptability: "bg-violet-500",
};

const cardEntrance = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 24,
      delay: i * 0.06,
    },
  }),
};

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>("diagnostics");
  const [sortKey, setSortKey] = useState<"total" | "cognitive" | "soft" | "professional" | "adaptability">("total");
  const [casesSortKey, setCasesSortKey] = useState<CasesSortKey>("casesCompleted");
  const [searchQuery, setSearchQuery] = useState("");
  const [casesSearchQuery, setCasesSearchQuery] = useState("");
  const [filterChip, setFilterChip] = useState<FilterChip>("all");
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
    // Apply filter chip
    if (filterChip === "leaders") list = list.filter(s => s.total >= 80);
    else if (filterChip === "average") list = list.filter(s => s.total >= 50 && s.total < 80);
    else if (filterChip === "attention") list = list.filter(s => s.total < 50);
    return list.sort((a, b) => b[sortKey] - a[sortKey]);
  }, [students, sortKey, searchQuery, filterChip]);

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

  const statCards = useMemo(() => {
    const total = students.length;
    const avgScore = total > 0 ? Math.round(students.reduce((s, st) => s + st.total, 0) / total) : 0;
    const leaders = students.filter((s) => s.total > 80).length;
    const attention = students.filter((s) => s.total < 50).length;

    return { total, avgScore, leaders, attention };
  }, [students]);

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

    return { totalCases, studentsWithCases: studentsWithCases.length, avgCasesPerStudent, ungradedCount, avgFeedback };
  }, [students]);

  const ScoreBadge = ({ score }: { score: number }) => {
    const cls = score >= 80 ? "text-green-400" : score >= 60 ? "text-primary" : score >= 45 ? "text-yellow-400" : "text-destructive";
    return <span className={`font-medium ${cls}`}>{score}%</span>;
  };

  const ScorePill = ({ score, label }: { score: number; label: string }) => {
    if (score === 0) return null;
    const bg = score >= 80 ? "bg-green-500/15 text-green-400 border-green-500/20" : score >= 60 ? "bg-amber-500/15 text-amber-400 border-amber-500/20" : "bg-rose-500/15 text-rose-400 border-rose-500/20";
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${bg}`}>
        {label} {score}%
      </span>
    );
  };

  const CategoryBar = ({ value, color }: { value: number; color: string }) => (
    <div className="h-1 w-full bg-secondary/40 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );

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

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "from-green-500/20 to-green-600/5 border-green-500/20";
    if (score >= 60) return "from-amber-500/15 to-amber-600/5 border-amber-500/15";
    if (score >= 45) return "from-yellow-500/15 to-yellow-600/5 border-yellow-500/15";
    return "from-rose-500/15 to-rose-600/5 border-rose-500/15";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (score >= 60) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    if (score >= 45) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-rose-500/20 text-rose-400 border-rose-500/30";
  };

  const filterChips: { key: FilterChip; label: string }[] = [
    { key: "all", label: isKz ? "Барлығы" : "Все" },
    { key: "leaders", label: `${isKz ? "Лидерлер" : "Лидеры"} (80+)` },
    { key: "average", label: `${isKz ? "Орташа" : "Средние"} (50-79)` },
    { key: "attention", label: `${isKz ? "Назар" : "Внимание"} (<50)` },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background bg-noise">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <Loader2 className="animate-spin text-primary mr-3" size={28} />
          <span className="text-muted-foreground font-light text-lg">{t.dashboard.loading}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background bg-noise">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <p className="text-destructive font-light text-lg">{t.dashboard.errorLoading}</p>
        </div>
      </div>
    );
  }

  if (!groupName) {
    return (
      <div className="min-h-screen bg-background bg-noise">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <p className="text-muted-foreground font-light text-lg">{t.dashboard.noGroup}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-noise">
      <Navbar />
      <div className="container px-4 pt-24 pb-16 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-[-0.03em] mb-1">
            {t.dashboard.title}{" "}
            <span className="text-gradient">{t.dashboard.titleHighlight}</span>
          </h1>
          <p className="text-muted-foreground font-light tracking-wide">
            {t.dashboard.group} {groupName}
          </p>
        </motion.div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab("diagnostics")}
            className={`px-5 py-2 rounded-full text-sm font-medium tracking-wide transition-all ${
              activeTab === "diagnostics"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-border/50"
            }`}
          >
            {t.dashboardCases?.diagnosticsTab ?? "Диагностика"}
          </button>
          <button
            onClick={() => setActiveTab("cases")}
            className={`px-5 py-2 rounded-full text-sm font-medium tracking-wide transition-all ${
              activeTab === "cases"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-border/50"
            }`}
          >
            {t.dashboardCases?.tab ?? "Кейсы"}
          </button>
        </div>

        {/* ===== DIAGNOSTICS TAB ===== */}
        {activeTab === "diagnostics" && (
          <>
            {/* Asymmetric Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {/* Hero card - Total Students */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="col-span-2 lg:col-span-1 lg:row-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(175,60%,42%)]/10 via-card to-card border border-[hsl(175,60%,42%)]/20 shadow-card p-6 flex flex-col justify-between"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(175,60%,42%)] to-[hsl(175,60%,42%)]/30" />
                <div>
                  <OrbitalIcon gradient="from-[hsl(175,60%,42%)] to-[hsl(175,50%,32%)]" glow="bg-[hsl(175,60%,42%)]" size={52} className="mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  </OrbitalIcon>
                  <p className="text-xs uppercase tracking-[0.15em] text-[hsl(175,60%,42%)] font-medium mb-1">{t.dashboard.students}</p>
                </div>
                <div>
                  <div className="text-5xl lg:text-6xl font-display font-bold tracking-[-0.03em]">{statCards.total}</div>
                  <div className="text-xs text-muted-foreground font-light mt-1">{t.dashboard.inGroup}</div>
                </div>
              </motion.div>

              {/* Avg Score */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.06 }}
                className="relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-card p-5"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-green-500/20" />
                <HexIcon gradient="from-green-500 to-green-700" glow="bg-green-500" size={40} className="mb-3">
                  <TrendingUp className="w-5 h-5 text-white" />
                </HexIcon>
                <div className="text-2xl font-display font-bold tracking-[-0.03em]">{statCards.avgScore}%</div>
                <p className="text-xs text-muted-foreground font-light">{t.dashboard.avgScore}</p>
              </motion.div>

              {/* Leaders */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.12 }}
                className="relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-card p-5"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary/20" />
                <DiamondIcon gradient="from-primary to-amber-700" glow="bg-primary" size={36} className="mb-3">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228M12 12.75a2.25 2.25 0 002.248-2.354M12 12.75a2.25 2.25 0 01-2.248-2.354M12 12.75V14.25m0-1.5a2.25 2.25 0 002.248-2.354M12 12.75a2.25 2.25 0 01-2.248-2.354m4.496 0a18.023 18.023 0 01-2.248.14c-.776 0-1.534-.051-2.248-.14m4.496 0c.18-.63.309-1.282.385-1.95M9.752 10.396c-.18-.63-.309-1.282-.385-1.95M7.73 9.728a18.022 18.022 0 002.022 1.668M16.27 9.728a18.022 18.022 0 01-2.022 1.668" />
                  </svg>
                </DiamondIcon>
                <div className="text-2xl font-display font-bold tracking-[-0.03em]">{statCards.leaders}</div>
                <p className="text-xs text-muted-foreground font-light">{t.dashboard.leaders} · {t.dashboard.above80}</p>
              </motion.div>

              {/* Attention */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.18 }}
                className="relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-card p-5"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-500 to-yellow-500/20" />
                <BlobIcon gradient="from-yellow-500 to-orange-600" glow="bg-yellow-500" size={40} className="mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </BlobIcon>
                <div className="text-2xl font-display font-bold tracking-[-0.03em]">{statCards.attention}</div>
                <p className="text-xs text-muted-foreground font-light">{t.dashboard.attention} · {t.dashboard.below50}</p>
              </motion.div>
            </div>

            {students.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-16 rounded-2xl bg-card border border-border/50 shadow-card text-center">
                <p className="text-muted-foreground font-light text-lg">{t.dashboard.noStudents}</p>
              </motion.div>
            ) : (
              <>
                {/* Charts */}
                <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-10">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-3 sm:p-6 rounded-2xl bg-card border border-border/50 shadow-card">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[hsl(175,60%,42%)] font-medium mb-1">{isKz ? "Аналитика" : "Аналитика"}</p>
                    <h3 className="font-display font-semibold tracking-[-0.03em] mb-5">{t.dashboard.avgDynamics}</h3>
                    <div className="h-[240px] min-h-[200px] overflow-hidden">
                      {progressData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={progressData}>
                            <defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(42, 88%, 56%)" stopOpacity={0.25} /><stop offset="100%" stopColor="hsl(42, 88%, 56%)" stopOpacity={0} /></linearGradient></defs>
                            <CartesianGrid stroke="hsl(222, 25%, 18%)" strokeDasharray="3 3" />
                            <XAxis dataKey="month" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 10 }} />
                            <YAxis domain={[0, 100]} tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 10 }} width={30} />
                            <Tooltip contentStyle={{ background: "hsl(222, 40%, 10%)", border: "1px solid hsl(222, 25%, 18%)", borderRadius: 12, fontSize: 12 }} labelStyle={{ color: "hsl(210, 20%, 92%)" }} itemStyle={{ color: "hsl(42, 88%, 56%)" }} />
                            <Area type="monotone" dataKey="avg" stroke="hsl(42, 88%, 56%)" fill="url(#areaGrad)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground font-light">{t.dashboard.noResults}</div>
                      )}
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="p-3 sm:p-6 rounded-2xl bg-card border border-border/50 shadow-card">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[hsl(175,60%,42%)] font-medium mb-1">{isKz ? "Профиль" : "Профиль"}</p>
                    <h3 className="font-display font-semibold tracking-[-0.03em] mb-5">{t.dashboard.groupProfile}</h3>
                    <div className="h-[240px] min-h-[200px] overflow-hidden">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={groupAvg.map(g => ({ subject: g.skill, score: g.score, fullMark: 100 }))}>
                          <PolarGrid stroke="hsl(222, 25%, 18%)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 10 }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 10 }} />
                          <Radar dataKey="score" stroke="hsl(175, 60%, 42%)" fill="hsl(175, 60%, 42%)" fillOpacity={0.15} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </div>

                {/* Distribution Chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-3 sm:p-6 rounded-2xl bg-card border border-border/50 shadow-card mb-10">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[hsl(175,60%,42%)] font-medium mb-1">{isKz ? "Таралу" : "Распределение"}</p>
                  <h3 className="font-display font-semibold tracking-[-0.03em] mb-5">{t.dashboard.distribution}</h3>
                  <div className="h-[200px] min-h-[200px] overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={distributionData}>
                        <CartesianGrid stroke="hsl(222, 25%, 18%)" strokeDasharray="3 3" />
                        <XAxis dataKey="range" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 10 }} />
                        <YAxis tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 10 }} width={30} />
                        <Tooltip contentStyle={{ background: "hsl(222, 40%, 10%)", border: "1px solid hsl(222, 25%, 18%)", borderRadius: 12, fontSize: 12 }} labelStyle={{ color: "hsl(210, 20%, 92%)" }} itemStyle={{ color: "hsl(42, 88%, 56%)" }} />
                        <Bar dataKey="count" fill="hsl(42, 88%, 56%)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Search + Filters + Sort */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-6 space-y-4">
                  {/* Full-width search */}
                  <div className="relative group">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={isKz ? "Студентті іздеу..." : "Поиск студента..."}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-border/60 bg-card text-foreground font-light placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 focus:shadow-[0_0_20px_-4px_hsl(42,88%,56%,0.15)] transition-all"
                    />
                  </div>

                  {/* Filter chips + Sort + CSV */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {filterChips.map((chip) => (
                        <button
                          key={chip.key}
                          onClick={() => setFilterChip(chip.key)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all ${
                            filterChip === chip.key
                              ? "bg-[hsl(175,60%,42%)]/15 text-[hsl(175,60%,42%)] border border-[hsl(175,60%,42%)]/30"
                              : "bg-secondary/30 text-muted-foreground border border-border/40 hover:text-foreground hover:border-border"
                          }`}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-light">{t.dashboard.sortBy}</span>
                        <select value={sortKey} onChange={(e) => setSortKey(e.target.value as typeof sortKey)} className="bg-card border border-border/60 rounded-lg px-3 py-1.5 text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/30">
                          <option value="total">{t.dashboard.totalScore}</option>
                          <option value="cognitive">{t.dashboard.cognitive}</option>
                          <option value="soft">{t.dashboard.softSkills}</option>
                          <option value="professional">{t.dashboard.professional}</option>
                          <option value="adaptability">{t.dashboard.adaptability}</option>
                        </select>
                      </div>
                      <button
                        onClick={exportCSV}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 bg-card text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
                      >
                        <Download size={13} />
                        CSV
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Student section label */}
                <div className="mb-5">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[hsl(175,60%,42%)] font-medium mb-1">{isKz ? "Студенттер" : "Студенты"}</p>
                  <h3 className="font-display font-semibold tracking-[-0.03em]">{t.dashboard.studentResults}</h3>
                  <p className="text-xs text-muted-foreground font-light mt-1">
                    {sorted.length} {isKz ? "студент табылды" : "студентов найдено"}
                  </p>
                </div>

                {/* Student Card Grid */}
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
                  initial="hidden"
                  animate="visible"
                >
                  <AnimatePresence mode="popLayout">
                    {sorted.map((s, i) => (
                      <motion.div
                        key={s.userId}
                        custom={i}
                        variants={cardEntrance}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, scale: 0.95 }}
                        layout
                        onClick={() => handleStudentClick(s)}
                        className={`relative group cursor-pointer rounded-2xl bg-gradient-to-br ${getScoreColor(s.total)} border backdrop-blur-sm p-5 hover:shadow-lg hover:shadow-primary/5 transition-shadow`}
                      >
                        {/* Top row: avatar + name + total score */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary/60 border border-border/50 flex items-center justify-center text-sm font-display font-bold text-foreground/80">
                              {getInitials(s.name)}
                            </div>
                            <div>
                              <h4 className="font-display font-semibold text-sm tracking-[-0.02em] leading-tight">{s.name}</h4>
                              {s.latestTestType && (
                                <p className="text-[10px] text-muted-foreground font-light mt-0.5">{s.latestTestType}</p>
                              )}
                            </div>
                          </div>
                          <div className={`px-2.5 py-1 rounded-lg border text-sm font-display font-bold ${getScoreBadgeColor(s.total)}`}>
                            {s.total}%
                          </div>
                        </div>

                        {/* Category score bars */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground w-20 shrink-0 font-light">{t.dashboard.cognitive}</span>
                            <CategoryBar value={s.cognitive} color={CATEGORY_BAR_COLORS.cognitive} />
                            <span className="text-[10px] font-medium w-8 text-right">{s.cognitive}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground w-20 shrink-0 font-light">{t.dashboard.softSkills}</span>
                            <CategoryBar value={s.soft} color={CATEGORY_BAR_COLORS.soft} />
                            <span className="text-[10px] font-medium w-8 text-right">{s.soft}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground w-20 shrink-0 font-light">{t.dashboard.professional}</span>
                            <CategoryBar value={s.professional} color={CATEGORY_BAR_COLORS.professional} />
                            <span className="text-[10px] font-medium w-8 text-right">{s.professional}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground w-20 shrink-0 font-light">{t.dashboard.adaptability}</span>
                            <CategoryBar value={s.adaptability} color={CATEGORY_BAR_COLORS.adaptability} />
                            <span className="text-[10px] font-medium w-8 text-right">{s.adaptability}</span>
                          </div>
                        </div>

                        {/* Bottom badges row: trainer pills + cases */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <ScorePill score={s.trainerBestSbi} label="SBI" />
                          <ScorePill score={s.trainerBestConflict} label={isKz ? "Жанжал" : "Конфл."} />
                          <ScorePill score={s.trainerBestSpeaking} label={isKz ? "Сөйлеу" : "Речь"} />
                          {s.casesCompleted > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[hsl(175,60%,42%)]/10 text-[hsl(175,60%,42%)] border border-[hsl(175,60%,42%)]/20">
                              <BookOpen className="w-2.5 h-2.5" />
                              {s.casesCompleted} {isKz ? "кейс" : "кейс."}
                            </span>
                          )}
                        </div>

                        {/* Hover indicator */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/20 transition-all pointer-events-none" />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </>
            )}
          </>
        )}

        {/* ===== CASES TAB ===== */}
        {activeTab === "cases" && (
          <>
            {/* Cases Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {/* Cases Completed - Hero */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="col-span-2 lg:col-span-1 lg:row-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(175,60%,42%)]/10 via-card to-card border border-[hsl(175,60%,42%)]/20 shadow-card p-6 flex flex-col justify-between"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(175,60%,42%)] to-[hsl(175,60%,42%)]/30" />
                <div>
                  <OrbitalIcon gradient="from-[hsl(175,60%,42%)] to-[hsl(175,50%,32%)]" glow="bg-[hsl(175,60%,42%)]" size={52} className="mb-4">
                    <BookOpen className="w-6 h-6 text-white" />
                  </OrbitalIcon>
                  <p className="text-xs uppercase tracking-[0.15em] text-[hsl(175,60%,42%)] font-medium mb-1">{t.dashboardCases?.casesCompleted ?? "Кейсов пройдено"}</p>
                </div>
                <div>
                  <div className="text-5xl lg:text-6xl font-display font-bold tracking-[-0.03em]">{casesStatCards.totalCases}</div>
                  <div className="text-xs text-muted-foreground font-light mt-1">{t.dashboard.inGroup}</div>
                </div>
              </motion.div>

              {/* Avg Cases Per Student */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.06 }}
                className="relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-card p-5"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-green-500/20" />
                <HexIcon gradient="from-green-500 to-green-700" glow="bg-green-500" size={40} className="mb-3">
                  <ClipboardCheck className="w-5 h-5 text-white" />
                </HexIcon>
                <div className="text-2xl font-display font-bold tracking-[-0.03em]">{casesStatCards.avgCasesPerStudent}</div>
                <p className="text-xs text-muted-foreground font-light">{t.dashboardCases?.avgCasesPerStudent ?? "Кейсов на студента"}</p>
              </motion.div>

              {/* Pending Grading */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.12 }}
                className="relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-card p-5"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-500 to-yellow-500/20" />
                <DiamondIcon gradient="from-yellow-500 to-orange-600" glow="bg-yellow-500" size={36} className="mb-3">
                  <Clock className="w-4 h-4 text-white" />
                </DiamondIcon>
                <div className="text-2xl font-display font-bold tracking-[-0.03em]">{casesStatCards.ungradedCount}</div>
                <p className="text-xs text-muted-foreground font-light">{t.dashboardCases?.pendingGrading ?? "Ожидают оценки"}</p>
              </motion.div>

              {/* Avg Peer Feedback */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.18 }}
                className="relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-card p-5"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary/20" />
                <BlobIcon gradient="from-primary to-amber-700" glow="bg-primary" size={40} className="mb-3">
                  <Star className="w-5 h-5 text-white" />
                </BlobIcon>
                <div className="text-2xl font-display font-bold tracking-[-0.03em]">{casesStatCards.avgFeedback > 0 ? casesStatCards.avgFeedback : "—"}</div>
                <p className="text-xs text-muted-foreground font-light">{t.dashboardCases?.avgPeerFeedback ?? "Средняя оценка 360"}</p>
              </motion.div>
            </div>

            {students.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-16 rounded-2xl bg-card border border-border/50 shadow-card text-center">
                <p className="text-muted-foreground font-light text-lg">{t.dashboard.noStudents}</p>
              </motion.div>
            ) : (
              <>
                {/* Cases Search + Sort */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 space-y-4">
                  <div className="relative group">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      value={casesSearchQuery}
                      onChange={(e) => setCasesSearchQuery(e.target.value)}
                      placeholder={isKz ? "Студентті іздеу..." : "Поиск студента..."}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-border/60 bg-card text-foreground font-light placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 focus:shadow-[0_0_20px_-4px_hsl(42,88%,56%,0.15)] transition-all"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-[hsl(175,60%,42%)] font-medium mb-1">{isKz ? "Студенттер" : "Студенты"}</p>
                      <h3 className="font-display font-semibold tracking-[-0.03em]">{t.dashboardCases?.casesCompleted ?? "Кейсы студентов"}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-light">{t.dashboard.sortBy}</span>
                      <select
                        value={casesSortKey}
                        onChange={(e) => setCasesSortKey(e.target.value as CasesSortKey)}
                        className="bg-card border border-border/60 rounded-lg px-3 py-1.5 text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                      >
                        <option value="casesCompleted">{t.dashboardCases?.casesCompleted ?? "Кейсов пройдено"}</option>
                        <option value="avgPeerFeedback">{t.dashboardCases?.avgPeerFeedback ?? "Оценка 360"}</option>
                        <option value="avgSolutionScore">{t.dashboardCases?.avgSolutionScore ?? "Балл решений"}</option>
                      </select>
                    </div>
                  </div>
                </motion.div>

                {/* Cases Student Card Grid */}
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
                  initial="hidden"
                  animate="visible"
                >
                  <AnimatePresence mode="popLayout">
                    {casesSorted.map((s, i) => (
                      <motion.div
                        key={s.userId}
                        custom={i}
                        variants={cardEntrance}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, scale: 0.95 }}
                        layout
                        onClick={() => handleCaseStudentClick(s)}
                        className="relative group cursor-pointer rounded-2xl bg-card border border-border/60 backdrop-blur-sm p-5 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary/60 border border-border/50 flex items-center justify-center text-sm font-display font-bold text-foreground/80">
                              {getInitials(s.name)}
                            </div>
                            <div>
                              <h4 className="font-display font-semibold text-sm tracking-[-0.02em]">{s.name}</h4>
                              <p className="text-[10px] text-muted-foreground font-light">
                                {s.casesCompleted} {isKz ? "кейс аяқталды" : "кейсов завершено"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {s.avgPeerFeedback != null ? (
                              <div className="px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-sm font-display font-bold text-primary">
                                {s.avgPeerFeedback.toFixed(1)}<span className="text-[10px] font-light text-muted-foreground">/5</span>
                              </div>
                            ) : (
                              <div className="px-2 py-1 rounded-lg bg-secondary/30 border border-border/30 text-sm font-display text-muted-foreground">—</div>
                            )}
                          </div>
                        </div>

                        {/* Solution score bar */}
                        {s.avgSolutionScore != null ? (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="text-muted-foreground font-light">{t.dashboardCases?.avgSolutionScore ?? "Балл решений"}</span>
                              <ScoreBadge score={s.avgSolutionScore} />
                            </div>
                            <div className="h-1 w-full bg-secondary/40 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${s.avgSolutionScore}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        ) : s.casesCompleted > 0 ? (
                          <div className="mb-3 flex items-center gap-1.5">
                            <span className="text-[10px] text-yellow-400 font-medium">{t.dashboardCases?.ungraded ?? "Не оценено"}</span>
                          </div>
                        ) : null}

                        {/* Trainer pills */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <ScorePill score={s.trainerBestSbi} label="SBI" />
                          <ScorePill score={s.trainerBestConflict} label={isKz ? "Жанжал" : "Конфл."} />
                          <ScorePill score={s.trainerBestSpeaking} label={isKz ? "Сөйлеу" : "Речь"} />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </>
            )}
          </>
        )}

        {/* ===== Student Drill-Down Dialog (Diagnostics) ===== */}
        <Dialog open={!!selectedStudent} onOpenChange={(open) => { if (!open) setSelectedStudent(null); }}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/50">
            <DialogHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-lg font-display font-bold text-primary">
                  {selectedStudent ? getInitials(selectedStudent.name) : ""}
                </div>
                <div>
                  <DialogTitle className="font-display text-xl tracking-[-0.03em]">
                    {selectedStudent?.name}
                  </DialogTitle>
                  <DialogDescription className="font-light">
                    {t.dashboard.totalScore}: <span className="font-semibold text-foreground">{selectedStudent?.total}%</span>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {loadingStudentResults ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary mr-3" size={24} />
              </div>
            ) : studentResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground font-light">
                {t.dashboard.noResults}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-secondary/20 border border-border/50 text-center">
                    <div className="text-lg font-display font-bold">{studentResults.length}</div>
                    <div className="text-[10px] text-muted-foreground font-light">{t.progress.attempts}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/20 border border-border/50 text-center">
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
                          <div className="text-[10px] text-muted-foreground font-light">{t.progress.trend}</div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/20 border border-border/50 text-center">
                    {(() => {
                      const sortedR = [...studentResults].sort(
                        (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
                      );
                      const first = sortedR[0];
                      const last = sortedR[sortedR.length - 1];
                      const diff = Math.round(last.average_score - first.average_score);
                      return (
                        <>
                          <div className={`text-lg font-display font-bold ${diff >= 0 ? "text-green-400" : "text-destructive"}`}>
                            {diff >= 0 ? "+" : ""}{diff}%
                          </div>
                          <div className="text-[10px] text-muted-foreground font-light">{t.progress.scoreChange}</div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Radar Chart for student's latest scores */}
                {selectedStudent && (
                  <div className="p-4 rounded-xl bg-secondary/10 border border-border/40">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[hsl(175,60%,42%)] font-medium mb-2">{isKz ? "Профиль" : "Профиль"}</p>
                    <div className="h-[220px] min-h-[200px] overflow-hidden">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={[
                          { subject: t.dashboard.cognitive, score: selectedStudent.cognitive, fullMark: 100 },
                          { subject: t.dashboard.softSkills, score: selectedStudent.soft, fullMark: 100 },
                          { subject: t.dashboard.professional, score: selectedStudent.professional, fullMark: 100 },
                          { subject: t.dashboard.adaptability, score: selectedStudent.adaptability, fullMark: 100 },
                        ]}>
                          <PolarGrid stroke="hsl(222, 25%, 18%)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 10 }} />
                          <Radar dataKey="score" stroke="hsl(42, 88%, 56%)" fill="hsl(42, 88%, 56%)" fillOpacity={0.2} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Trainer Scores */}
                {selectedStudent && (selectedStudent.trainerBestSbi > 0 || selectedStudent.trainerBestConflict > 0 || selectedStudent.trainerBestSpeaking > 0) && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[hsl(175,60%,42%)] font-medium mb-3">{isKz ? "Тренажер" : "Тренажер"}</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-secondary/10 border border-border/40 text-center">
                        <HexIcon gradient="from-blue-500 to-blue-700" glow="bg-blue-500" size={36} className="mx-auto mb-2">
                          <MessageCircle className="w-4 h-4 text-white" />
                        </HexIcon>
                        <div className="text-lg font-display font-bold">{selectedStudent.trainerBestSbi || "—"}%</div>
                        <div className="text-[10px] text-muted-foreground font-light">SBI</div>
                      </div>
                      <div className="p-3 rounded-xl bg-secondary/10 border border-border/40 text-center">
                        <DiamondIcon gradient="from-rose-500 to-rose-700" glow="bg-rose-500" size={32} className="mx-auto mb-2">
                          <Swords className="w-4 h-4 text-white" />
                        </DiamondIcon>
                        <div className="text-lg font-display font-bold">{selectedStudent.trainerBestConflict || "—"}%</div>
                        <div className="text-[10px] text-muted-foreground font-light">{isKz ? "Жанжал" : "Конфликт"}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-secondary/10 border border-border/40 text-center">
                        <BlobIcon gradient="from-violet-500 to-violet-700" glow="bg-violet-500" size={36} className="mx-auto mb-2">
                          <Mic className="w-4 h-4 text-white" />
                        </BlobIcon>
                        <div className="text-lg font-display font-bold">{selectedStudent.trainerBestSpeaking || "—"}%</div>
                        <div className="text-[10px] text-muted-foreground font-light">{isKz ? "Сөйлеу" : "Речь"}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cases count */}
                {selectedStudent && selectedStudent.casesCompleted > 0 && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[hsl(175,60%,42%)]/8 border border-[hsl(175,60%,42%)]/15">
                    <BookOpen className="w-4 h-4 text-[hsl(175,60%,42%)]" />
                    <span className="text-sm font-light">
                      {isKz ? "Кейстер аяқталды" : "Кейсов завершено"}: <span className="font-display font-bold">{selectedStudent.casesCompleted}</span>
                    </span>
                  </div>
                )}

                {/* Progress Chart */}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[hsl(175,60%,42%)] font-medium mb-3">{isKz ? "Прогресс" : "Прогресс"}</p>
                  <ProgressChart results={studentResults} />
                </div>

                {/* First vs Last comparison */}
                {studentResults.length >= 2 && (() => {
                  const sortedR = [...studentResults].sort(
                    (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
                  );
                  const first = sortedR[0];
                  const last = sortedR[sortedR.length - 1];
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
                            <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-secondary/15 border border-border/40 text-xs">
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

        {/* ===== Student Case Details Dialog ===== */}
        <Dialog
          open={!!selectedCaseStudent}
          onOpenChange={(open) => {
            if (!open) setSelectedCaseStudent(null);
          }}
        >
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/50">
            <DialogHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(175,60%,42%)]/20 to-[hsl(175,60%,42%)]/5 border border-[hsl(175,60%,42%)]/20 flex items-center justify-center text-lg font-display font-bold text-[hsl(175,60%,42%)]">
                  {selectedCaseStudent ? getInitials(selectedCaseStudent.name) : ""}
                </div>
                <div>
                  <DialogTitle className="font-display text-xl tracking-[-0.03em]">
                    {selectedCaseStudent?.name}
                  </DialogTitle>
                  <DialogDescription className="font-light">
                    {t.dashboardCases?.casesCompleted ?? "Кейсов пройдено"}:{" "}
                    <span className="font-semibold text-foreground">{selectedCaseStudent?.casesCompleted ?? 0}</span>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {loadingCaseDetails ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary mr-3" size={24} />
              </div>
            ) : studentCaseDetails.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground font-light">
                {t.dashboardCases?.noCasesData ?? "Нет данных по кейсам"}
              </div>
            ) : (
              <div className="space-y-4">
                {studentCaseDetails.map((detail, idx) => (
                  <motion.div
                    key={detail.sessionId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 rounded-xl bg-secondary/10 border border-border/40 space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-display font-semibold text-sm tracking-[-0.02em]">
                          {isKz ? detail.caseTitleKz : detail.caseTitle}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground font-light">
                          <span>
                            {isKz ? "Рөл" : "Роль"}: <span className="font-medium text-foreground/70">{detail.role}</span>
                          </span>
                          <span>
                            {new Date(detail.completedAt).toLocaleDateString(
                              isKz ? "kk-KZ" : "ru-RU"
                            )}
                          </span>
                        </div>
                      </div>
                      {detail.peerAvg != null && (
                        <div className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-right">
                          <div className="text-sm font-display font-bold text-primary">
                            {detail.peerAvg.toFixed(1)}/5
                          </div>
                          <div className="text-[9px] text-muted-foreground font-light">360</div>
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
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          {expandedSolutions.has(detail.sessionId)
                            ? (isKz ? "Шешімді жасыру" : "Скрыть решение")
                            : (isKz ? "Шешімді көрсету" : "Показать решение")}
                        </button>
                        {expandedSolutions.has(detail.sessionId) && (
                          <div className="mt-2 p-3 rounded-lg bg-secondary/20 border border-border/30 text-xs text-foreground/90 font-light whitespace-pre-wrap max-h-40 overflow-y-auto">
                            {detail.solutionText}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Score Input */}
                    {detail.solutionId && (
                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-[10px] text-muted-foreground font-light">
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
                          className="w-20 px-2 py-1 rounded-lg border border-border/50 bg-secondary/30 text-sm text-foreground focus:outline-none focus:border-primary/50"
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
                  </motion.div>
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
