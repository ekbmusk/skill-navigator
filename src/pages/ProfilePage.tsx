import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Save, User, Download, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/i18n/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDiagnostics } from "@/hooks/useDiagnostics";
import type { Tables } from "@/integrations/supabase/types";
import { motion } from "framer-motion";

const ProfilePage = () => {
  const { user, profile, role } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLang();
  const { loadAllResults, downloadAsCSV } = useDiagnostics();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [groupName, setGroupName] = useState(profile?.group_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Test history states
  const [testResults, setTestResults] = useState<Tables<"diagnostics_results">[]>([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Tables<"diagnostics_results"> | null>(null);

  // Load test results on component mount
  useEffect(() => {
    if (role === "student") {
      loadTestResults();
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
        description: "Тесттерді жүктеу барысында қате орын алды",
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

  const getScoreCategory = (name: string): "cognitive" | "soft" | "professional" | "adaptability" | null => {
    if (name.includes("cognitive")) return "cognitive";
    if (name.includes("soft")) return "soft";
    if (name.includes("professional")) return "professional";
    if (name.includes("adaptability")) return "adaptability";
    return null;
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
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="profile">{t.profile.title}</TabsTrigger>
            {role === "student" && <TabsTrigger value="tests">{t.profile.tests}</TabsTrigger>}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-border bg-card">
              <CardHeader className="text-center">
                <CardTitle className="font-display text-2xl text-foreground">{t.profile.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Avatar className="h-24 w-24 border-2 border-primary/30">
                      {avatarUrl ? <AvatarImage src={avatarUrl} alt="Avatar" /> : null}
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xl font-display">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="h-6 w-6 text-foreground" />
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                  <span className="text-xs text-muted-foreground">{uploading ? t.profile.avatarUploading : t.profile.avatarHint}</span>
                </div>

                <div className="flex justify-center">
                  <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs uppercase tracking-wider font-medium">
                    {role === "teacher" ? t.nav.teacher : t.nav.student}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-muted-foreground">{t.auth.email}</Label>
                    <Input id="email" value={user?.email || ""} disabled className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t.profile.fullName}</Label>
                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t.profile.fullNamePlaceholder} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="groupName">{t.profile.group}</Label>
                    <Input id="groupName" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder={t.profile.groupPlaceholder} />
                  </div>
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? t.profile.saving : t.profile.save}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

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

                      {/* Scores by Category */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-card border border-border">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">{t.categories.cognitive}</span>
                            <span className={`text-sm font-bold ${getLevel(selectedTest.cognitive_score).color}`}>
                              {selectedTest.cognitive_score}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${selectedTest.cognitive_score}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            {getRecommendation("cognitive", selectedTest.cognitive_score)}
                          </p>
                        </div>

                        <div className="p-4 rounded-lg bg-card border border-border">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">{t.categories.soft}</span>
                            <span className={`text-sm font-bold ${getLevel(selectedTest.soft_score).color}`}>
                              {selectedTest.soft_score}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${selectedTest.soft_score}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            {getRecommendation("soft", selectedTest.soft_score)}
                          </p>
                        </div>

                        <div className="p-4 rounded-lg bg-card border border-border">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">{t.categories.professional}</span>
                            <span className={`text-sm font-bold ${getLevel(selectedTest.professional_score).color}`}>
                              {selectedTest.professional_score}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${selectedTest.professional_score}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            {getRecommendation("professional", selectedTest.professional_score)}
                          </p>
                        </div>

                        <div className="p-4 rounded-lg bg-card border border-border">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">{t.categories.adaptability}</span>
                            <span className={`text-sm font-bold ${getLevel(selectedTest.adaptability_score).color}`}>
                              {selectedTest.adaptability_score}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${selectedTest.adaptability_score}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            {getRecommendation("adaptability", selectedTest.adaptability_score)}
                          </p>
                        </div>
                      </div>

                      {/* Download Button */}
                      <Button
                        onClick={() => downloadAsCSV(selectedTest, fullName || "Student")}
                        className="w-full gap-2"
                      >
                        <Download size={16} /> {t.results.download}
                      </Button>
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
                                <p className="font-semibold text-foreground">
                                  {new Date(test.completed_at).toLocaleDateString()} -{" "}
                                  {new Date(test.completed_at).toLocaleTimeString()}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Когнитивті: {test.cognitive_score}% | Soft: {test.soft_score}% | Кәсіби: {test.professional_score}%
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
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
