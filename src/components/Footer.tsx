import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";

const linkHoverVariants = {
  initial: { x: 0 },
  hover: { x: 4, transition: { type: "spring", stiffness: 400, damping: 20 } },
};

const FooterLink = ({ to, children, isSpan }: { to?: string; children: React.ReactNode; isSpan?: boolean }) => {
  const inner = (
    <motion.span
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      variants={linkHoverVariants}
      initial="initial"
      whileHover="hover"
    >
      <span className="w-0 group-hover:w-2 h-px bg-primary transition-all duration-200" />
      {children}
    </motion.span>
  );

  if (isSpan) return <li className="group">{inner}</li>;
  return (
    <li className="group">
      <Link to={to!}>{inner}</Link>
    </li>
  );
};

const Footer = () => {
  const { t } = useLang();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-border bg-secondary/20">
      {/* Gradient accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="container px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <span className="font-display text-2xl md:text-3xl font-bold">
              <span className="text-gradient">Skill</span>Map
            </span>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              {t.footer.description}
            </p>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4">{t.footer.platform}</h4>
            <ul className="space-y-2.5">
              <FooterLink to="/tests">{t.footer.diagnosticsLink}</FooterLink>
              <FooterLink to="/cases">{t.footer.casesLink}</FooterLink>
              <FooterLink to="/resources">{t.footer.resourcesLink}</FooterLink>
            </ul>
          </div>

          {/* For Teachers */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4">{t.footer.forTeachers}</h4>
            <ul className="space-y-2.5">
              <FooterLink to="/dashboard">{t.footer.dashboardLink}</FooterLink>
              <FooterLink isSpan>{t.footer.analyticsLink}</FooterLink>
              <FooterLink isSpan>{t.footer.reportsLink}</FooterLink>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4">{t.footer.support}</h4>
            <ul className="space-y-2.5">
              <FooterLink isSpan>{t.footer.helpLink}</FooterLink>
              <FooterLink isSpan>{t.footer.contactLink}</FooterLink>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar - glassmorphic */}
      <div className="border-t border-border">
        <div className="container px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] px-5 py-3">
            <p className="text-xs text-muted-foreground">{t.footer.rights}</p>

            <span className="font-display text-sm font-bold text-muted-foreground">
              <span className="text-gradient">Skill</span>Map
            </span>

            {/* Back to top */}
            <motion.button
              onClick={scrollToTop}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group/top"
            >
              <span className="hidden sm:inline">Back to top</span>
              <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover/top:bg-primary/20 transition-colors">
                <ArrowUp size={14} className="text-primary" />
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
