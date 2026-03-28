import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Save, User, Download, Printer, ArrowLeft, TrendingUp, TrendingDown, Minus, Trophy, BarChart3, Target, Brain, Shield, ShieldAlert, Briefcase, Users, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/i18n/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDiagnostics } from "@/hooks/useDiagnostics";
import { useCaseHistory, type CaseHistoryItem } from "@/hooks/useCaseHistory";
import { ROLE_DEFINITIONS, type SimRole } from "@/data/simulationData";
import type { Tables } from "@/integrations/supabase/types";
import { runScoringEngine } from "@/utils/scoringEngine";
import { runPhysicsScoringEngine } from "@/utils/physicsScoringEngine";
import { runInfoCommScoringEngine } from "@/utils/infoCommScoringEngine";
import type { DiagnosticsResult as FullScoringResult, ProfilePattern, SkillLevel } from "@/utils/scoringEngine";
import { questions as generalQuestions } from "@/data/diagnosticsQuestions";
import { physicsQuestions } from "@/data/physicsQuestions";
import { infoCommQuestions } from "@/data/infoCommQuestions";
import { printReport, printBasicReport } from "@/utils/pdfExport";
import { useTrainers, type TrainerAttempt, type TrainerType } from "@/hooks/useTrainers";
import { rubricItems } from "@/data/trainers/publicSpeakingData";
import { motion } from "framer-motion";
import ProgressChart from "@/components/ProgressChart";
import DashboardOverview from "@/components/profile/DashboardOverview";
import ProfileEditDialog from "@/components/profile/ProfileEditDialog";

const ProfilePage = () => {
  const { user, profile, role } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, lang } = useLang();
  const isKz = lang === "kz";
  const { loadAllResults, downloadAsCSV, computeTrend } = useDiagnostics();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [groupName, setGroupName] = useState(profile?.group_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Test history states
  const [testResults, setTestResults] = useState<Tables<"diagnostics_results">[]>([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Tables<"diagnostics_results"> | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Case history states
  const { loadCaseHistory, computeStats, loading: casesLoading } = useCaseHistory();
  const [caseHistory, setCaseHistory] = useState<CaseHistoryItem[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseHistoryItem | null>(null);

  const { loadAttempts, loading: trainersLoading } = useTrainers();
  const [trainerAttempts, setTrainerAttempts] = useState<TrainerAttempt[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerType | null>(null);

  // Load test results and case history on component mount
  useEffect(() => {
    if (role === "student") {
      loadTestResults();
      loadCaseHistory().then(setCaseHistory);
      loadAttempts().then(setTrainerAttempts);
    }
  }, [role]);

  const loadTestResults = async () => {
    setLoadingTests(true);
    try {
      const results = await loadAllResults();
      setTestResults(results);
    } catch (error) {
      toast({
        variant: "destructive",
        title: t.profile.saveError,
        description: t.profileErrors.loadTestsError,
      });
    } finally {
      setLoadingTests(false);
    }
  };

  const getLevel = (score: number) => {
    if (score >= 80) return { text: t.results.excellent, color: "text-green-400" };
    if (score >= 60) return { text: t.results.good, color: "text-primary" };
    if (score >= 40) return { text: t.results.average, color: "text-yellow-400" };
    return { text: t.results.needsWork, color: "text-destructive" };
  };

  const getRecommendation = (category: string, score: number) => {
    if (score >= 70) return t.results.recExcellent;
    const recs: Record<string, string> = {
      cognitive: t.results.recCognitive,
      soft: t.results.recSoft,
      professional: t.results.recProfessional,
      adaptability: t.results.recAdaptability,
    };
    return recs[category] || "";
  };

  const getProfileLabel = (pattern: ProfilePattern): string => {
    const labels = t.results.profilePatterns as Record<string, string>;
    return labels[pattern] || pattern;
  };

  const getSkillLevelLabel = (level: SkillLevel): string => {
    const labels = t.results.skillLevels as Record<string, string>;
    return labels[level] || level;
  };

  const getFullResultForTest = (test: Tables<"diagnostics_results">): FullScoringResult | null => {
    if (!test.answers || typeof test.answers !== "object") return null;
    try {
      const answers = test.answers as Record<string, any>;
      const testType = answers._test_type || "general";
      if (testType === "physics") {
        const r = runPhysicsScoringEngine(answers as Record<number, number>);
        const physicsCats = (t as any).physicsCategories as Record<string, string> | undefined;
        return {
          ...r,
          categories: r.categories.map(c => ({
            ...c,
            label: physicsCats?.[c.category] || c.label,
          })),
          dominantPattern: r.dominantProfile as any,
          strengthAreas: r.strengthAreas as any,
          growthAreas: r.growthAreas as any,
        } as any;
      }
      if (testType === "infocomm") {
        const r = runInfoCommScoringEngine(answers as Record<number, number>, undefined, lang);
        return {
          ...r,
          dominantPattern: r.dominantProfile as any,
          strengthAreas: r.strengthAreas as any,
          growthAreas: r.growthAreas as any,
        } as any;
      }
      const generalResult = runScoringEngine(answers as Record<number, number>);
      const cats = t.categories as Record<string, string>;
      return {
        ...generalResult,
        categories: generalResult.categories.map(c => ({
          ...c,
          label: cats[c.category] || c.label,
        })),
      };
    } catch {
      return null;
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: t.profile.uploadError, description: error.message, variant: "destructive" });
    } else {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
      toast({ title: t.profile.avatarUploaded });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName.trim(), group_name: groupName.trim(), avatar_url: avatarUrl }).eq("user_id", user.id);
    if (error) {
      toast({ title: t.profile.saveError, description: error.message, variant: "destructive" });
    } else {
      toast({ title: t.profile.saved });
    }
    setSaving(false);
  };

  const initials = fullName ? fullName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-4xl pt-24 pb-12">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className={`grid w-full ${role === "student" ? "grid-cols-5" : "grid-cols-1"} mb-6`}>
            <TabsTrigger value="profile">{t.profile.title}</TabsTrigger>
            {role === "student" && <TabsTrigger value="progress">{t.progress.title}</TabsTrigger>}
            {role === "student" && <TabsTrigger value="tests">{t.profile.tests}</TabsTrigger>}
            {role === "student" && <TabsTrigger value="trainers">{t.nav.trainers}</TabsTrigger>}
            {role === "student" && <TabsTrigger value="cases">{t.profileCases?.tab || "Кейсы"}</TabsTrigger>}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <DashboardOverview
              user={user}
              profile={profile}
              testResults={testResults}
              caseHistory={caseHistory}
              trainerAttempts={trainerAttempts}
              lang={lang}
              onEditProfile={() => setEditDialogOpen(true)}
            />
          </TabsContent>

          {/* Progress Tab */}
          {role === "student" && (
            <TabsContent value="progress">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {loadingTests ? (
                  <Card className="border-border bg-card">
                    <CardContent className="py-8 text-center text-muted-foreground">
                      {t.dashboard?.loading || "Loading..."}
                    </CardContent>
                  </Card>
                ) : testResults.length === 0 ? (
                  <Card className="border-border bg-card">
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground mb-4">{t.profile.noTests}</p>
                      <Button asChild>
                        <a href="/diagnostics">{t.nav.diagnostics}</a>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {/* Stats Cards */}
                    {(() => {
                      const sorted = [...testResults].sort(
                        (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
                      );
                      const first = sorted[0];
                      const last = sorted[sorted.length - 1];
                      const best = sorted.reduce((max, r) => r.average_score > max.average_score ? r : max, sorted[0]);
                      const improvement = Math.round(last.average_score - first.average_score);
                      const trend = computeTrend(testResults);
                      const trendIcon = trend === "improving"
                        ? <TrendingUp className="h-5 w-5 text-green-400" />
                        : trend === "declining"
                          ? <TrendingDown className="h-5 w-5 text-destructive" />
                          : <Minus className="h-5 w-5 text-yellow-400" />;
                      const trendText = trend === "improving"
                        ? t.progress.improving
                        : trend === "declining"
                          ? t.progress.declining
                          : t.progress.stable;
                      const trendColor = trend === "improving"
                        ? "text-green-400"
                        : trend === "declining"
                          ? "text-destructive"
                          : "text-yellow-400";

                      return (
                        <>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="border-border bg-card">
                              <CardContent className="p-4 text-center">
                                <BarChart3 className="h-5 w-5 text-primary mx-auto mb-2" />
                                <div className="text-2xl font-display font-bold">{testResults.length}</div>
                                <div className="text-xs text-muted-foreground">{t.progress.totalTests}</div>
                              </CardContent>
                            </Card>
                            <Card className="border-border bg-card">
                              <CardContent className="p-4 text-center">
                                <Trophy className="h-5 w-5 text-primary mx-auto mb-2" />
                                <div className="text-2xl font-display font-bold">{Math.round(best.average_score)}%</div>
                                <div className="text-xs text-muted-foreground">
                                  {t.progress.bestScore}
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="border-border bg-card">
                              <CardContent className="p-4 text-center">
                                {trendIcon}
                                <div className={`text-2xl font-display font-bold mt-0.5 ${improvement >= 0 ? "text-green-400" : "text-destructive"}`}>
                                  {improvement >= 0 ? "+" : ""}{improvement}%
                                </div>
                                <div className="text-xs text-muted-foreground">{t.progress.improvement}</div>
                              </CardContent>
                            </Card>
                            <Card className="border-border bg-card">
                              <CardContent className="p-4 text-center">
                                <Target className="h-5 w-5 mx-auto mb-2" style={{ color: trendColor === "text-green-400" ? "hsl(142, 71%, 45%)" : trendColor === "text-destructive" ? "hsl(0, 84%, 60%)" : "hsl(48, 96%, 53%)" }} />
                                <div className={`text-2xl font-display font-bold ${trendColor}`}>{trendText}</div>
                                <div className="text-xs text-muted-foreground">{t.progress.trend}</div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Progress Chart */}
                          <Card className="border-border bg-card">
                            <CardHeader>
                              <CardTitle className="font-display text-xl">{t.progress.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ProgressChart results={testResults} />
                            </CardContent>
                          </Card>

                          {/* First vs Last comparison */}
                          {testResults.length >= 2 && (
                            <Card className="border-border bg-card">
                              <CardHeader>
                                <CardTitle className="font-display text-lg">
                                  {t.progress.firstAttempt} → {t.progress.lastAttempt}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid sm:grid-cols-2 gap-4">
                                  {(["cognitive_score", "soft_score", "professional_score", "adaptability_score"] as const).map((key) => {
                                    const catKey = key.replace("_score", "") as "cognitive" | "soft" | "professional" | "adaptability";
                                    const diff = Math.round(last[key] - first[key]);
                                    return (
                                      <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                                        <span className="text-sm font-medium">{t.categories[catKey]}</span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm text-muted-foreground">{Math.round(first[key])}%</span>
                                          <span className="text-muted-foreground">→</span>
                                          <span className="text-sm font-semibold">{Math.round(last[key])}%</span>
                                          <span className={`text-xs font-medium ${diff >= 0 ? "text-green-400" : "text-destructive"}`}>
                                            ({diff >= 0 ? "+" : ""}{diff})
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </motion.div>
            </TabsContent>
          )}

          {/* Tests Tab */}
          {role === "student" && (
            <TabsContent value="tests">
              {selectedTest ? (
                // Test Details View
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="font-display text-2xl">{t.results.title} {t.results.titleHighlight}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(selectedTest.completed_at).toLocaleString()}
                          </p>
                        </div>
                        <Button variant="ghost" onClick={() => setSelectedTest(null)} size="sm" className="gap-2">
                          <ArrowLeft size={16} /> {t.profile.back}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Overall Score */}
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
                        <div className="text-5xl font-display font-bold text-gradient mb-2">
                          {selectedTest.average_score}%
                        </div>
                        <p className="text-muted-foreground">{t.results.totalScore}</p>
                      </div>

                      {/* Profile & Confidence Cards (from answers JSONB) */}
                      {(() => {
                        const full = getFullResultForTest(selectedTest);
                        if (!full) return null;
                        return (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-3 rounded-xl bg-card-gradient border border-border text-center">
                              <Brain size={18} className="mx-auto mb-1.5 text-primary" />
                              <div className="text-xs text-muted-foreground mb-0.5">{t.results.profileType}</div>
                              <div className="text-xs font-semibold">{getProfileLabel(full.dominantPattern)}</div>
                            </div>
                            <div className="p-3 rounded-xl bg-card-gradient border border-border text-center">
                              {full.antiCheat.passed ? (
                                <Shield size={18} className="mx-auto mb-1.5 text-green-400" />
                              ) : (
                                <ShieldAlert size={18} className="mx-auto mb-1.5 text-yellow-400" />
                              )}
                              <div className="text-xs text-muted-foreground mb-0.5">{t.results.confidence}</div>
                              <div className="text-xs font-semibold">{Math.round(full.adjustedConfidence * 100)}%</div>
                            </div>
                            <div className="p-3 rounded-xl bg-card-gradient border border-border text-center">
                              <TrendingUp size={18} className="mx-auto mb-1.5 text-green-400" />
                              <div className="text-xs text-muted-foreground mb-0.5">{t.results.strengthAreas}</div>
                              <div className="text-xs font-medium leading-tight">
                                {full.strengthAreas.map(a => {
                                  const catResult = full.categories.find(c => c.category === a);
                                  return catResult?.label || (t.categories as Record<string, string>)[a] || a;
                                }).join(", ")}
                              </div>
                            </div>
                            <div className="p-3 rounded-xl bg-card-gradient border border-border text-center">
                              <Target size={18} className="mx-auto mb-1.5 text-yellow-400" />
                              <div className="text-xs text-muted-foreground mb-0.5">{t.results.growthAreas}</div>
                              <div className="text-xs font-medium leading-tight">
                                {full.growthAreas.map(a => {
                                  const catResult = full.categories.find(c => c.category === a);
                                  return catResult?.label || (t.categories as Record<string, string>)[a] || a;
                                }).join(", ")}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Scores by Category */}
                      {(() => {
                        const full = getFullResultForTest(selectedTest);
                        const testType = (selectedTest.answers as any)?._test_type || "general";

                        // Use scoring engine categories if available — they have correct labels
                        if (full?.categories && full.categories.length > 0) {
                          const dbScores = [
                            selectedTest.cognitive_score,
                            selectedTest.soft_score,
                            selectedTest.professional_score,
                            selectedTest.adaptability_score,
                          ];
                          const answers = selectedTest.answers as Record<string, any>;
                          const questionSet = testType === "physics"
                            ? physicsQuestions
                            : testType === "infocomm"
                              ? infoCommQuestions
                              : generalQuestions;

                          return (
                            <div className="grid sm:grid-cols-2 gap-4">
                              {full.categories.map((catResult, i) => {
                                const score = dbScores[i] ?? Math.round(catResult.rawScore);
                                const level = getLevel(score);
                                const isExpanded = expandedCategory === catResult.category;
                                return (
                                  <div
                                    key={catResult.category}
                                    className={`p-4 rounded-lg bg-card border transition-all cursor-pointer ${isExpanded ? "border-primary/50 sm:col-span-2" : "border-border hover:border-primary/30"}`}
                                    onClick={() => setExpandedCategory(isExpanded ? null : catResult.category)}
                                  >
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-sm font-medium">{catResult.label}</span>
                                      <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold ${level.color}`}>{score}%</span>
                                        <ArrowLeft size={12} className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-[-90deg]" : "rotate-[180deg]"}`} />
                                      </div>
                                    </div>
                                    <div className="mb-2">
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                        {t.results.skillLevel}: {getSkillLevelLabel(catResult.level)}
                                      </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                      <div className="h-full rounded-full bg-primary" style={{ width: `${score}%` }} />
                                    </div>
                                    {testType === "general" && !isExpanded && (
                                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                        {getRecommendation(catResult.category, score)}
                                      </p>
                                    )}

                                    {/* Expanded: show question-level breakdown */}
                                    {isExpanded && (
                                      <div className="mt-4 space-y-3 border-t border-border pt-3" onClick={(e) => e.stopPropagation()}>
                                        <div className="text-xs font-medium text-muted-foreground mb-2">
                                          {isKz ? "Сұрақтар бойынша нәтижелер" : "Результаты по вопросам"} ({catResult.questionScores.length})
                                        </div>
                                        {catResult.questionScores.map((qs) => {
                                          const qData = questionSet.find((q: any) => q.id === qs.id);
                                          if (!qData) return null;
                                          const chosenScore = answers[String(qs.id)];
                                          const chosenOpt = qData.options.find((o: any) => o.score === chosenScore);
                                          const maxScore = Math.max(...qData.options.map((o: any) => o.score));
                                          const bestOpt = qData.options.find((o: any) => o.score === maxScore);
                                          const pct = maxScore > 0 ? Math.round((qs.adjusted / maxScore) * 100) : 0;
                                          const isCorrect = chosenScore === maxScore;
                                          // Localize question text and option labels
                                          let qText = qData.text;
                                          let chosenLabel = chosenOpt ? (chosenOpt as any).label : "—";
                                          let bestLabel = bestOpt ? (bestOpt as any).label : "—";

                                          if (isKz) {
                                            if (testType === "general" && (t as any).questions) {
                                              const tq = (t as any).questions[qData.id - 1];
                                              if (tq) {
                                                qText = tq.text || qText;
                                                const tChosenOpt = tq.options?.find((o: any) => o.score === chosenScore);
                                                if (tChosenOpt) chosenLabel = tChosenOpt.label;
                                                const tBestOpt = tq.options?.find((o: any) => o.score === maxScore);
                                                if (tBestOpt) bestLabel = tBestOpt.label;
                                              }
                                            } else if (testType === "physics" && (t as any).physicsQuestions) {
                                              const tq = (t as any).physicsQuestions[qData.id - 1];
                                              if (tq) {
                                                qText = tq.text || qText;
                                                const tChosenOpt = tq.options?.find((o: any) => o.score === chosenScore);
                                                if (tChosenOpt) chosenLabel = tChosenOpt.label;
                                                const tBestOpt = tq.options?.find((o: any) => o.score === maxScore);
                                                if (tBestOpt) bestLabel = tBestOpt.label;
                                              }
                                            } else if (testType === "infocomm") {
                                              // InfoComm questions have textKz/labelKz directly
                                              qText = (qData as any).textKz || qText;
                                              if (chosenOpt && (chosenOpt as any).labelKz) chosenLabel = (chosenOpt as any).labelKz;
                                              if (bestOpt && (bestOpt as any).labelKz) bestLabel = (bestOpt as any).labelKz;
                                            }
                                          }

                                          const isKnowledgeTest = testType === "physics";
                                          const barColor = isKnowledgeTest
                                            ? (isCorrect ? "bg-green-500" : "bg-red-500")
                                            : (pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-primary" : pct >= 25 ? "bg-yellow-500" : "bg-red-500");
                                          const scoreColor = isKnowledgeTest
                                            ? (isCorrect ? "text-green-400" : "text-red-400")
                                            : (pct >= 75 ? "text-green-400" : pct >= 50 ? "text-primary" : pct >= 25 ? "text-yellow-400" : "text-red-400");

                                          return (
                                            <div key={qs.id} className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                                              <div className="flex items-start justify-between gap-2 mb-2">
                                                <p className="text-xs leading-relaxed flex-1">{qText}</p>
                                                <span className={`text-xs font-bold shrink-0 ${scoreColor}`}>
                                                  {isKnowledgeTest ? (isCorrect ? "✓" : "✗") : `${qs.adjusted}/${maxScore}`}
                                                </span>
                                              </div>
                                              {!isKnowledgeTest && (
                                                <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-2">
                                                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                                                </div>
                                              )}
                                              <div className="text-[11px] space-y-1">
                                                <div className="flex gap-1.5">
                                                  <span className="text-muted-foreground/70 shrink-0">
                                                    {isKz ? "Жауап:" : "Ответ:"}
                                                  </span>
                                                  <span className="text-muted-foreground">{chosenLabel}</span>
                                                </div>
                                                {isKnowledgeTest && !isCorrect && (
                                                  <div className="flex gap-1.5">
                                                    <span className="text-green-400 shrink-0">{isKz ? "Дұрыс:" : "Верно:"}</span>
                                                    <span className="text-muted-foreground">{bestLabel}</span>
                                                  </div>
                                                )}
                                                {!isKnowledgeTest && !isCorrect && (
                                                  <div className="flex gap-1.5">
                                                    <span className="text-primary/70 shrink-0">{isKz ? "Ең жақсы:" : "Лучший:"}</span>
                                                    <span className="text-muted-foreground">{bestLabel}</span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }

                        // Fallback: general categories from DB columns
                        const categories = [
                          { key: "cognitive_score" as const, cat: "cognitive" as const },
                          { key: "soft_score" as const, cat: "soft" as const },
                          { key: "professional_score" as const, cat: "professional" as const },
                          { key: "adaptability_score" as const, cat: "adaptability" as const },
                        ];
                        return (
                          <div className="grid sm:grid-cols-2 gap-4">
                            {categories.map(({ key, cat }) => {
                              const score = selectedTest[key];
                              const level = getLevel(score);
                              return (
                                <div key={cat} className="p-4 rounded-lg bg-card border border-border">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium">{t.categories[cat]}</span>
                                    <span className={`text-sm font-bold ${level.color}`}>{score}%</span>
                                  </div>
                                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                    <div className="h-full rounded-full bg-primary" style={{ width: `${score}%` }} />
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                    {getRecommendation(cat, score)}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}

                      {/* Anti-cheat status */}
                      {(() => {
                        const full = getFullResultForTest(selectedTest);
                        if (!full) return null;
                        return (
                          <div className={`flex items-center gap-2 justify-center text-xs ${full.antiCheat.passed ? "text-green-400" : "text-yellow-400"}`}>
                            {full.antiCheat.passed ? <Shield size={14} /> : <ShieldAlert size={14} />}
                            <span>{full.antiCheat.passed ? t.results.antiCheatPassed : t.results.antiCheatFailed}</span>
                          </div>
                        );
                      })()}

                      {/* Download Buttons */}
                      <div className="flex gap-3">
                        <Button
                          onClick={() => downloadAsCSV(selectedTest, fullName || "Student")}
                          className="flex-1 gap-2"
                        >
                          <Download size={16} /> {t.results.download}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const cats = t.categories as Record<string, string>;
                            const full = getFullResultForTest(selectedTest);
                            const scores = {
                              cognitive: selectedTest.cognitive_score,
                              soft: selectedTest.soft_score,
                              professional: selectedTest.professional_score,
                              adaptability: selectedTest.adaptability_score,
                              average: selectedTest.average_score,
                            };
                            const recs: Record<string, string> = {};
                            for (const cat of ["cognitive", "soft", "professional", "adaptability"]) {
                              recs[cat] = getRecommendation(cat, scores[cat as keyof typeof scores]);
                            }
                            if (full) {
                              printReport({
                                scores,
                                profileType: getProfileLabel(full.dominantPattern),
                                confidence: Math.round(full.adjustedConfidence * 100),
                                strengthAreas: full.strengthAreas.map(a => cats[a] || a),
                                growthAreas: full.growthAreas.map(a => cats[a] || a),
                                recommendations: recs,
                                date: selectedTest.completed_at,
                                studentName: fullName || "",
                                antiCheatPassed: full.antiCheat.passed,
                                categoryLabels: cats,
                                translations: {
                                  reportTitle: t.results.reportTitle,
                                  totalScore: t.results.totalScore,
                                  profileType: t.results.profileType,
                                  confidence: t.results.confidence,
                                  strengthAreas: t.results.strengthAreas,
                                  growthAreas: t.results.growthAreas,
                                  antiCheatPassed: t.results.antiCheatPassed,
                                  antiCheatFailed: t.results.antiCheatFailed,
                                  generatedAt: t.results.generatedAt,
                                },
                              });
                            } else {
                              printBasicReport({
                                scores,
                                date: selectedTest.completed_at,
                                studentName: fullName || "",
                                categoryLabels: cats,
                                recommendations: recs,
                                translations: {
                                  reportTitle: t.results.reportTitle,
                                  totalScore: t.results.totalScore,
                                  generatedAt: t.results.generatedAt,
                                },
                              });
                            }
                          }}
                          className="flex-1 gap-2"
                        >
                          <Printer size={16} /> {t.results.downloadPDF}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                // Tests List View
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="font-display text-2xl">{t.profile.tests}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingTests ? (
                      <div className="text-center py-8 text-muted-foreground">Тесттер жүктелуде...</div>
                    ) : testResults.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">{t.profile.noTests}</p>
                        <Button asChild>
                          <a href="/diagnostics">{t.nav.diagnostics}</a>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {testResults.map((test, index) => (
                          <motion.button
                            key={test.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedTest(test)}
                            className="w-full p-4 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-card/80 transition-all text-left"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-foreground">
                                    {new Date(test.completed_at).toLocaleDateString()} -{" "}
                                    {new Date(test.completed_at).toLocaleTimeString()}
                                  </p>
                                  {(() => {
                                    const tt = (test.answers as any)?._test_type || "general";
                                    const label = tt === "physics" ? (isKz ? "Физика" : "Физика") : tt === "infocomm" ? (isKz ? "Инфокомм" : "Инфокомм") : (isKz ? "Жалпы" : "Общий");
                                    const color = tt === "physics" ? "bg-cyan-500/10 text-cyan-500" : tt === "infocomm" ? "bg-violet-500/10 text-violet-500" : "bg-primary/10 text-primary";
                                    return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${color}`}>{label}</span>;
                                  })()}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {t.categories.cognitive}: {test.cognitive_score}% | {t.categories.soft}: {test.soft_score}% | {t.categories.professional}: {test.professional_score}%
                                </p>
                              </div>
                              <div className="text-right">
                                <div className={`text-2xl font-bold ${getLevel(test.average_score).color}`}>
                                  {test.average_score}%
                                </div>
                                <span className={`text-xs font-medium ${getLevel(test.average_score).color}`}>
                                  {getLevel(test.average_score).text}
                                </span>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          {/* Trainers Tab */}
          {role === "student" && (
            <TabsContent value="trainers">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {trainersLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : trainerAttempts.length === 0 ? (
                  <Card className="border-border bg-card">
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground mb-4">{t.trainers.noAttempts}</p>
                      <Button asChild><a href="/trainers">{t.trainers.start}</a></Button>
                    </CardContent>
                  </Card>
                ) : selectedTrainer ? (() => {
                  const trainerLabels: Record<TrainerType, string> = {
                    sbi_feedback: t.trainers.sbiTitle,
                    conflict_resolution: t.trainers.conflictTitle,
                    public_speaking: t.trainers.speakingTitle,
                  };
                  const trainerLinks: Record<TrainerType, string> = {
                    sbi_feedback: "/trainers/sbi-feedback",
                    conflict_resolution: "/trainers/conflict-resolution",
                    public_speaking: "/trainers/public-speaking",
                  };
                  const isKz = lang === "kz";
                  const attempts = trainerAttempts.filter(a => a.trainer_type === selectedTrainer);
                  const best = Math.max(...attempts.map(a => Math.round((a.score / a.max_score) * 100)), 0);

                  return (
                    <div>
                      <button onClick={() => setSelectedTrainer(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
                        <ArrowLeft size={16} /> {t.trainers.back}
                      </button>

                      <h3 className="font-display text-xl font-bold mb-4">{trainerLabels[selectedTrainer]}</h3>

                      {/* Best score + attempt count */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 rounded-xl bg-card-gradient border border-border text-center">
                          <div className="text-xs text-muted-foreground mb-1">{t.trainers.bestResult}</div>
                          <div className={`text-2xl font-display font-bold ${best >= 70 ? "text-green-400" : best >= 40 ? "text-yellow-400" : "text-destructive"}`}>{best}%</div>
                        </div>
                        <div className="p-4 rounded-xl bg-card-gradient border border-border text-center">
                          <div className="text-xs text-muted-foreground mb-1">{t.trainers.attempts}</div>
                          <div className="text-2xl font-display font-bold text-foreground">{attempts.length}</div>
                        </div>
                      </div>

                      {/* Score progress over attempts */}
                      {attempts.length > 1 && (
                        <div className="p-4 rounded-xl bg-card-gradient border border-border mb-6">
                          <div className="text-xs text-muted-foreground mb-3">{t.trainers.bestResult}</div>
                          <div className="flex items-end gap-1.5 h-20">
                            {[...attempts].reverse().map((a, i) => {
                              const pct = Math.round((a.score / a.max_score) * 100);
                              return (
                                <div key={a.id} className="flex-1 flex flex-col items-center gap-1">
                                  <span className="text-[10px] text-muted-foreground">{pct}%</span>
                                  <div
                                    className={`w-full rounded-t ${pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-yellow-500" : "bg-destructive"}`}
                                    style={{ height: `${Math.max(pct * 0.7, 4)}px` }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Dynamic improvement tips based on latest attempt */}
                      <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 mb-6">
                        <h4 className="font-display font-semibold text-sm mb-3 text-primary">{t.trainers.improveTips}</h4>
                        <ul className="space-y-2">
                          {(() => {
                            const latest = attempts[0];
                            const answers = (latest?.answers || {}) as Record<string, any>;
                            const dynamicTips: string[] = [];

                            if (selectedTrainer === "sbi_feedback") {
                              const scores = (answers.scores || []) as { situation: number; behavior: number; impact: number }[];
                              if (scores.length > 0) {
                                const avgS = Math.round(scores.reduce((s, r) => s + r.situation, 0) / scores.length);
                                const avgB = Math.round(scores.reduce((s, r) => s + r.behavior, 0) / scores.length);
                                const avgI = Math.round(scores.reduce((s, r) => s + r.impact, 0) / scores.length);
                                dynamicTips.push(avgS < 50 ? t.trainers.sbiSituationWeak : t.trainers.sbiSituationGood);
                                dynamicTips.push(avgB < 50 ? t.trainers.sbiBehaviorWeak : t.trainers.sbiBehaviorGood);
                                dynamicTips.push(avgI < 50 ? t.trainers.sbiImpactWeak : t.trainers.sbiImpactGood);
                              }
                            } else if (selectedTrainer === "conflict_resolution") {
                              const pct = latest ? Math.round((latest.score / latest.max_score) * 100) : 0;
                              if (pct < 40) dynamicTips.push(t.trainers.conflictLow);
                              else if (pct < 70) dynamicTips.push(t.trainers.conflictMid);
                              else dynamicTips.push(t.trainers.conflictHigh);
                            } else if (selectedTrainer === "public_speaking") {
                              const checked = (answers.checkedItems || []) as number[];
                              const missing = rubricItems.filter(r => !checked.includes(r.id));
                              if (missing.length === 0) {
                                dynamicTips.push(t.trainers.speakingAllGood);
                              } else {
                                const missingNames = missing.map(r => isKz ? r.textKz : r.text).join("; ");
                                dynamicTips.push(t.trainers.speakingMissing.replace("{items}", missingNames));
                              }
                            }

                            return dynamicTips.map((tip, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className={`mt-0.5 ${tip.includes("✓") || tip.includes("отлично") || tip.includes("тамаша") || tip.includes("хорош") || tip.includes("жақсы") ? "text-green-400" : "text-primary"}`}>•</span>
                                {tip}
                              </li>
                            ));
                          })()}
                        </ul>
                      </div>

                      {/* Attempt history */}
                      <h4 className="font-display font-semibold text-sm mb-3">{t.trainers.lastAttempt}</h4>
                      <div className="space-y-2 mb-6">
                        {attempts.map((a) => {
                          const pct = Math.round((a.score / a.max_score) * 100);
                          return (
                            <div key={a.id} className="p-3 rounded-lg bg-secondary/30 border border-border flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">{new Date(a.completed_at).toLocaleString()}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{a.score}/{a.max_score}</span>
                                <span className={`font-bold text-sm ${pct >= 70 ? "text-green-400" : pct >= 40 ? "text-yellow-400" : "text-destructive"}`}>{pct}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <Button className="w-full" asChild>
                        <a href={trainerLinks[selectedTrainer]}>{t.trainers.tryAgain}</a>
                      </Button>
                    </div>
                  );
                })() : (
                  <div className="space-y-4">
                    {(["sbi_feedback", "conflict_resolution", "public_speaking"] as TrainerType[]).map((type) => {
                      const trainerLabels: Record<TrainerType, string> = {
                        sbi_feedback: t.trainers.sbiTitle,
                        conflict_resolution: t.trainers.conflictTitle,
                        public_speaking: t.trainers.speakingTitle,
                      };
                      const trainerDescs: Record<TrainerType, string> = {
                        sbi_feedback: t.trainers.sbiDesc,
                        conflict_resolution: t.trainers.conflictDesc,
                        public_speaking: t.trainers.speakingDesc,
                      };
                      const trainerColors: Record<TrainerType, string> = {
                        sbi_feedback: "bg-blue-500/10 text-blue-400",
                        conflict_resolution: "bg-red-500/10 text-red-400",
                        public_speaking: "bg-violet-500/10 text-violet-400",
                      };
                      const trainerBorders: Record<TrainerType, string> = {
                        sbi_feedback: "hover:border-blue-500/30",
                        conflict_resolution: "hover:border-red-500/30",
                        public_speaking: "hover:border-violet-500/30",
                      };
                      const attempts = trainerAttempts.filter(a => a.trainer_type === type);
                      const best = attempts.length > 0
                        ? Math.max(...attempts.map(a => Math.round((a.score / a.max_score) * 100)))
                        : null;

                      return (
                        <button
                          key={type}
                          onClick={() => setSelectedTrainer(type)}
                          className={`w-full text-left p-5 rounded-xl bg-card-gradient border border-border ${trainerBorders[type]} transition-all duration-200 shadow-card cursor-pointer`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${trainerColors[type]}`}>
                              {trainerLabels[type]}
                            </span>
                            {best !== null && (
                              <div className="flex items-center gap-2">
                                <Trophy size={14} className="text-primary" />
                                <span className={`font-bold text-sm ${best >= 70 ? "text-green-400" : best >= 40 ? "text-yellow-400" : "text-destructive"}`}>{best}%</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{trainerDescs[type]}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{attempts.length} {t.trainers.attempts}</span>
                            {attempts.length > 0 && (
                              <span>{t.trainers.lastAttempt}: {new Date(attempts[0].completed_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </TabsContent>
          )}

          {/* Cases Tab */}
          {role === "student" && (
            <TabsContent value="cases">
              {selectedCase ? (
                // Case Detail View
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="font-display text-2xl">
                            {isKz ? selectedCase.caseTitleKz : selectedCase.caseTitle}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t.profileCases?.date || "Дата"}: {new Date(selectedCase.completedAt).toLocaleDateString()}
                          </p>
                          <div className="mt-2">
                            <RoleBadge role={selectedCase.role} isKz={isKz} />
                          </div>
                        </div>
                        <Button variant="ghost" onClick={() => setSelectedCase(null)} size="sm" className="gap-2">
                          <ArrowLeft size={16} /> {t.profile.back}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Solution score */}
                      {selectedCase.solutionScore !== null && (
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
                          <div className="text-5xl font-display font-bold text-gradient mb-2">
                            {selectedCase.solutionScore}%
                          </div>
                          <p className="text-muted-foreground">{t.profileCases?.solutionScore || "Балл за решение"}</p>
                        </div>
                      )}

                      {/* 4 criteria feedback */}
                      {selectedCase.peerAvg !== null && (
                        <div className="space-y-4">
                          {([
                            { key: "communication", label: "Communication", labelRu: "Коммуникация", labelKz: "Коммуникация", peer: selectedCase.peerCommunication, self: selectedCase.selfCommunication },
                            { key: "teamwork", label: "Teamwork", labelRu: "Командная работа", labelKz: "Командалық жұмыс", peer: selectedCase.peerTeamwork, self: selectedCase.selfTeamwork },
                            { key: "leadership", label: "Leadership", labelRu: "Лидерство", labelKz: "Көшбасшылық", peer: selectedCase.peerLeadership, self: selectedCase.selfLeadership },
                            { key: "problem_solving", label: "Problem Solving", labelRu: "Решение проблем", labelKz: "Мәселені шешу", peer: selectedCase.peerProblemSolving, self: selectedCase.selfProblemSolving },
                          ] as const).map((criterion, idx) => {
                            const gap = criterion.peer !== null && criterion.self !== null
                              ? Math.abs(criterion.peer - criterion.self)
                              : null;
                            const gapColor = gap !== null
                              ? gap <= 0.5 ? "text-green-400" : gap <= 1.0 ? "text-yellow-400" : "text-destructive"
                              : "";
                            return (
                              <motion.div
                                key={criterion.key}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                className="p-4 rounded-xl bg-card-gradient border border-border"
                              >
                                <div className="flex justify-between items-center mb-3">
                                  <span className="text-sm font-semibold">
                                    {isKz ? criterion.labelKz : criterion.labelRu}
                                  </span>
                                  {gap !== null && (
                                    <span className={`text-xs font-medium ${gapColor}`}>
                                      {t.profileCases?.gap || "Разрыв"}: {gap.toFixed(1)}
                                    </span>
                                  )}
                                </div>
                                {/* Peer score bar */}
                                {criterion.peer !== null && (
                                  <div className="mb-2">
                                    <div className="flex justify-between text-xs mb-1">
                                      <span className="text-muted-foreground">{t.profileCases?.peerScore || "Оценка команды"}</span>
                                      <span className="font-medium">{criterion.peer.toFixed(1)} / 5</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                      <div className="h-full rounded-full bg-primary" style={{ width: `${(criterion.peer / 5) * 100}%` }} />
                                    </div>
                                  </div>
                                )}
                                {/* Self score bar */}
                                {criterion.self !== null && (
                                  <div>
                                    <div className="flex justify-between text-xs mb-1">
                                      <span className="text-muted-foreground">{t.profileCases?.selfScore || "Самооценка"}</span>
                                      <span className="font-medium">{criterion.self.toFixed(1)} / 5</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                      <div className="h-full rounded-full bg-yellow-500/70" style={{ width: `${(criterion.self / 5) * 100}%` }} />
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      )}

                      {/* No feedback message */}
                      {selectedCase.peerAvg === null && selectedCase.solutionScore === null && (
                        <div className="text-center py-6 text-muted-foreground">
                          {isKz ? "Бағалау деректері жоқ" : "Нет данных оценки"}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                // Cases List View
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  {casesLoading ? (
                    <Card className="border-border bg-card">
                      <CardContent className="py-8 text-center text-muted-foreground">
                        {t.dashboard?.loading || "Loading..."}
                      </CardContent>
                    </Card>
                  ) : caseHistory.length === 0 ? (
                    <Card className="border-border bg-card">
                      <CardContent className="py-8 text-center">
                        <p className="text-muted-foreground mb-4">{t.profileCases?.noCases || "Кейсы ещё не пройдены"}</p>
                        <Button asChild>
                          <a href="/cases">{t.nav.cases}</a>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      {/* Stats Cards */}
                      {(() => {
                        const stats = computeStats(caseHistory);
                        const roleLabel = stats.mostCommonRole && (stats.mostCommonRole as SimRole) in ROLE_DEFINITIONS
                          ? (isKz ? ROLE_DEFINITIONS[stats.mostCommonRole as SimRole].labelKz : ROLE_DEFINITIONS[stats.mostCommonRole as SimRole].label)
                          : "—";
                        return (
                          <div className="grid grid-cols-3 gap-4">
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                              <Card className="border-border bg-card">
                                <CardContent className="p-4 text-center">
                                  <Briefcase className="h-5 w-5 text-primary mx-auto mb-2" />
                                  <div className="text-2xl font-display font-bold">{stats.totalCases}</div>
                                  <div className="text-xs text-muted-foreground">{t.profileCases?.totalCases || "Кейсов пройдено"}</div>
                                </CardContent>
                              </Card>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                              <Card className="border-border bg-card">
                                <CardContent className="p-4 text-center">
                                  <Star className="h-5 w-5 text-primary mx-auto mb-2" />
                                  <div className="text-2xl font-display font-bold">
                                    {stats.avgFeedbackScore > 0 ? stats.avgFeedbackScore.toFixed(1) : "—"}
                                  </div>
                                  <div className="text-xs text-muted-foreground">{t.profileCases?.avgFeedback || "Средняя оценка 360°"}</div>
                                </CardContent>
                              </Card>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
                              <Card className="border-border bg-card">
                                <CardContent className="p-4 text-center">
                                  <Users className="h-5 w-5 text-primary mx-auto mb-2" />
                                  <div className="text-2xl font-display font-bold">{roleLabel}</div>
                                  <div className="text-xs text-muted-foreground">{t.profileCases?.commonRole || "Частая роль"}</div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          </div>
                        );
                      })()}

                      {/* Case list */}
                      <Card className="border-border bg-card">
                        <CardHeader>
                          <CardTitle className="font-display text-2xl">{t.profileCases?.tab || "Кейсы"}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {caseHistory.map((item, index) => (
                              <motion.button
                                key={item.sessionId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelectedCase(item)}
                                className="w-full p-4 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-card/80 transition-all text-left"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-foreground">
                                      {isKz ? item.caseTitleKz : item.caseTitle}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <RoleBadge role={item.role} isKz={isKz} />
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(item.completedAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {item.peerAvg !== null ? (
                                      <>
                                        <div className="text-2xl font-bold text-primary">
                                          {item.peerAvg.toFixed(1)}
                                        </div>
                                        <span className="text-xs text-muted-foreground">/ 5</span>
                                      </>
                                    ) : item.solutionScore !== null ? (
                                      <>
                                        <div className={`text-2xl font-bold ${getLevel(item.solutionScore).color}`}>
                                          {item.solutionScore}%
                                        </div>
                                      </>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">—</span>
                                    )}
                                  </div>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </motion.div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>

      <ProfileEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={user}
        profile={profile}
        onSaved={() => {
          setEditDialogOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
};

const ROLE_BADGE_COLORS: Record<string, string> = {
  leader: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  analyst: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  creative: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  presenter: "bg-green-500/20 text-green-400 border-green-500/30",
  member: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const RoleBadge = ({ role, isKz }: { role: string; isKz: boolean }) => {
  const colorClass = ROLE_BADGE_COLORS[role] || ROLE_BADGE_COLORS.member;
  const label = (role as SimRole) in ROLE_DEFINITIONS
    ? (isKz ? ROLE_DEFINITIONS[role as SimRole].labelKz : ROLE_DEFINITIONS[role as SimRole].label)
    : role;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {label}
    </span>
  );
};

export default ProfilePage;
