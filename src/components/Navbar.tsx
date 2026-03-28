import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, User, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLang, Lang } from "@/i18n/LanguageContext";
import { useTheme } from "@/hooks/useTheme";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, role, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + "/");
  const { lang, setLang, t } = useLang();

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setOpen(false), [location.pathname]);

  const links = [
    { label: t.nav.tests, href: "/tests" },
    { label: t.nav.trainers, href: "/trainers" },
    ...(role === "teacher" ? [{ label: t.nav.dashboard, href: "/dashboard" }] : []),
    { label: t.nav.cases, href: "/cases" },
    { label: t.nav.resources, href: "/resources" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const toggleLang = () => setLang(lang === "ru" ? "kz" : "ru");
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/70 backdrop-blur-2xl border-b border-border/50 shadow-lg shadow-black/5 dark:shadow-black/10"
            : "bg-transparent backdrop-blur-none border-b border-transparent"
        }`}
      >
        {/* Gradient line at very top — only visible when scrolled */}
        <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`} />

        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="font-display text-2xl font-bold tracking-tight group flex items-center gap-1">
            <span className="text-gradient group-hover:opacity-80 transition-opacity">Skill</span>
            <span className="text-foreground">Map</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className="relative px-4 py-2 rounded-lg text-base transition-all duration-200 group"
              >
                {/* Active indicator dot */}
                {isActive(l.href) && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${
                  isActive(l.href)
                    ? "text-primary font-medium"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}>
                  {l.label}
                </span>
              </Link>
            ))}

            {/* Separator */}
            <div className="w-px h-5 bg-border/50 mx-2" />

            {/* Language Switcher */}
            <button
              onClick={toggleLang}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              {lang === "ru" ? "KZ" : "RU"}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Sun size={15} />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Moon size={15} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* User section */}
            {user ? (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all duration-200 group"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <User size={12} className="text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors max-w-[120px] truncate">
                    {profile?.full_name || user.email}
                  </span>
                  {role && (
                    <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold ${
                      role === "teacher" ? "bg-primary/15 text-primary" : "bg-white/[0.06] text-muted-foreground"
                    }`}>
                      {role === "teacher" ? t.nav.teacher : t.nav.student}
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-lg bg-white/[0.04] hover:bg-destructive/10 border border-white/[0.06] hover:border-destructive/20 text-muted-foreground hover:text-destructive transition-all duration-200"
                  title={t.nav.signOut}
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <Button size="sm" className="ml-2 shadow-glow" onClick={() => navigate("/auth")}>
                {t.nav.signIn}
              </Button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden relative w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-foreground"
            onClick={() => setOpen(!open)}
          >
            <AnimatePresence mode="wait">
              {open ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X size={20} />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-background/95 backdrop-blur-2xl border-l border-white/[0.06] md:hidden flex flex-col"
          >
            {/* Mobile header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <span className="font-display text-lg font-bold">
                <span className="text-gradient">Skill</span>Map
              </span>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mobile links */}
            <div className="flex-1 p-4 space-y-1 overflow-y-auto">
              {links.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={l.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                      isActive(l.href)
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {isActive(l.href) && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Mobile footer */}
            <div className="p-4 border-t border-white/[0.06] space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={toggleLang}
                  className="flex-1 flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-muted-foreground"
                >
                  <span>{lang === "ru" ? "Қазақша" : "Русский"}</span>
                  <span className="text-xs font-bold uppercase text-primary">{lang === "ru" ? "KZ" : "RU"}</span>
                </button>
                <button
                  onClick={toggleTheme}
                  className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-muted-foreground"
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
              {user ? (
                <div className="space-y-2">
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06]"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User size={14} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{profile?.full_name || user.email}</div>
                      {role && <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{role === "teacher" ? t.nav.teacher : t.nav.student}</div>}
                    </div>
                  </Link>
                  <button
                    onClick={() => { handleSignOut(); setOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-destructive/20 text-destructive text-sm hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut size={14} /> {t.nav.signOut}
                  </button>
                </div>
              ) : (
                <Button className="w-full shadow-glow" onClick={() => { navigate("/auth"); setOpen(false); }}>
                  {t.nav.signIn}
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
