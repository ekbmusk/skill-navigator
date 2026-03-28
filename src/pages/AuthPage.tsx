import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageContext";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLang();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
      else navigate("/");
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
      });
      if (error) toast.error(error.message);
      else toast.success(t.auth.checkEmail);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth`,
      },
    });
    if (error) toast.error(t.auth.googleError);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex">
      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/60 to-violet-500/40 blur-[100px]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.12, scale: 1 }}
          transition={{ duration: 2.5, ease: "easeOut", delay: 0.3 }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-cyan-500/40 to-primary/30 blur-[120px]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.08, scale: 1 }}
          transition={{ duration: 3, ease: "easeOut", delay: 0.6 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-violet-500/30 to-cyan-400/20 blur-[80px]"
        />
      </div>

      {/* Left decorative panel - hidden on mobile */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 relative items-center justify-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-violet-500/5 to-transparent" />
        <div className="relative z-10 px-16 max-w-lg">
          {/* Floating decorative shapes */}
          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-8 right-12 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/10 backdrop-blur-sm"
          />
          <motion.div
            animate={{ y: [6, -10, 6] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400/20 to-primary/15 border border-cyan-400/10 backdrop-blur-sm"
          />
          <motion.div
            animate={{ y: [-5, 12, -5] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/3 -right-8 w-10 h-10 rounded-xl rotate-45 bg-gradient-to-br from-violet-400/20 to-pink-400/15 border border-violet-400/10 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h1 className="font-display text-5xl font-bold leading-tight mb-6">
              <span className="text-gradient">Skill</span>
              <span className="text-foreground">Map</span>
            </h1>
            <div className="w-16 h-1 rounded-full bg-gradient-to-r from-primary to-violet-500 mb-6" />
            <p className="text-muted-foreground text-lg leading-relaxed">
              {t.hero.subtitle}
            </p>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 flex gap-8"
          >
            {[
              { value: "12+", label: t.hero.statSkills },
              { value: "500+", label: t.hero.statStudents },
              { value: "20+", label: t.hero.statCases },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-gradient">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="w-full max-w-md p-8 rounded-2xl bg-card/70 backdrop-blur-xl border border-border/50 shadow-card"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="text-center mb-8"
          >
            {/* Logo visible on mobile, hidden on lg where left panel shows it */}
            <h1 className="font-display text-2xl font-bold lg:hidden mb-1">
              <span className="text-gradient">Skill</span><span className="text-foreground">Map</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">{isLogin ? t.auth.loginTitle : t.auth.signupTitle}</p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="name" className="text-sm font-medium">{t.auth.name}</Label>
                <Input
                  id="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.auth.namePlaceholder}
                  required={!isLogin}
                  className="rounded-xl border-border/60 bg-background/50 backdrop-blur-sm transition-all duration-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
              </motion.div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">{t.auth.email}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="rounded-xl border-border/60 bg-background/50 backdrop-blur-sm transition-all duration-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">{t.auth.password}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="rounded-xl border-border/60 bg-background/50 backdrop-blur-sm transition-all duration-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-xl h-11 text-sm font-semibold bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 transition-all duration-200 shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? t.auth.loading : isLogin ? t.auth.login : t.auth.signup}
            </Button>
            {isLogin && (
              <button
                type="button"
                className="w-full text-sm text-muted-foreground hover:text-primary hover:underline mt-2 transition-colors duration-200"
                onClick={async () => {
                  if (!email) {
                    toast.error(t.auth.enterEmail);
                    return;
                  }
                  const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/auth`,
                  });
                  if (error) toast.error(error.message);
                  else toast.success(t.auth.resetSent);
                }}
              >
                {t.auth.forgotPassword}
              </button>
            )}
          </motion.form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/40" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card/70 backdrop-blur-sm px-3 text-muted-foreground">{t.auth.or}</span></div>
          </div>

          <Button
            variant="outline"
            className="w-full rounded-xl h-11 border-border/60 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-200 group"
            onClick={handleGoogle}
          >
            <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-sm font-medium">{t.auth.googleLogin}</span>
          </Button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center text-sm text-muted-foreground mt-6"
          >
            {isLogin ? t.auth.noAccount : t.auth.hasAccount}{" "}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium transition-colors duration-200">
              {isLogin ? t.auth.signup : t.auth.login}
            </button>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
