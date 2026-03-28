import { useState } from "react";
import { Menu, X, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLang, Lang } from "@/i18n/LanguageContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, role, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { lang, setLang, t } = useLang();

  const links = [
    { label: t.nav.tests, href: "/tests" },
    ...(role === "teacher" ? [{ label: t.nav.dashboard, href: "/dashboard" }] : []),
    { label: t.nav.cases, href: "/cases" },
    { label: t.nav.resources, href: "/resources" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const toggleLang = () => setLang(lang === "ru" ? "kz" : "ru");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-display text-xl font-bold tracking-tight">
          <span className="text-gradient">Skill</span>
          <span className="text-foreground">Map</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link key={l.href} to={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </Link>
          ))}

          {/* Language Switcher */}
          <button
            onClick={toggleLang}
            className="px-2.5 py-1 rounded-lg border border-border bg-secondary/50 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          >
            {lang === "ru" ? "KZ" : "RU"}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="text-xs text-muted-foreground flex items-center gap-1.5 hover:text-foreground transition-colors">
                <User size={14} />
                {profile?.full_name || user.email}
                {role && (
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-secondary text-[10px] uppercase tracking-wider">
                    {role === "teacher" ? t.nav.teacher : t.nav.student}
                  </span>
                )}
              </Link>
              <Button size="sm" variant="outline" onClick={handleSignOut}>
                <LogOut size={14} className="mr-1" /> {t.nav.signOut}
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => navigate("/auth")}>{t.nav.signIn}</Button>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3">
          {links.map((l) => (
            <Link key={l.href} to={l.href} className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <button
            onClick={toggleLang}
            className="w-full text-left px-2.5 py-1.5 rounded-lg border border-border bg-secondary/50 text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            {lang === "ru" ? "KZ — Қазақша" : "RU — Русский"}
          </button>
          {user ? (
            <Button size="sm" variant="outline" className="w-full" onClick={() => { handleSignOut(); setOpen(false); }}>
              <LogOut size={14} className="mr-1" /> {t.nav.signOut}
            </Button>
          ) : (
            <Button size="sm" className="w-full" onClick={() => { navigate("/auth"); setOpen(false); }}>{t.nav.signIn}</Button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
