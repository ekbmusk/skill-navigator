import { useState } from "react";
import { Menu, X, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, role, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const links = [
    { label: "Диагностика", href: "/diagnostics", isRoute: true },
    ...(role === "teacher" ? [{ label: "Дашборд", href: "/dashboard", isRoute: true }] : []),
    { label: "Кейсы", href: "/case", isRoute: true },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

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
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <User size={14} />
                {profile?.full_name || user.email}
                {role && (
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-secondary text-[10px] uppercase tracking-wider">
                    {role === "teacher" ? "Преподаватель" : "Студент"}
                  </span>
                )}
              </span>
              <Button size="sm" variant="outline" onClick={handleSignOut}>
                <LogOut size={14} className="mr-1" /> Выйти
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => navigate("/auth")}>Войти</Button>
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
          {user ? (
            <Button size="sm" variant="outline" className="w-full" onClick={() => { handleSignOut(); setOpen(false); }}>
              <LogOut size={14} className="mr-1" /> Выйти
            </Button>
          ) : (
            <Button size="sm" className="w-full" onClick={() => { navigate("/auth"); setOpen(false); }}>Войти</Button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
