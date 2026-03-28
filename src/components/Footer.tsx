import { Link } from "react-router-dom";
import { useLang } from "@/i18n/LanguageContext";

const Footer = () => {
  const { t } = useLang();

  return (
    <footer className="border-t border-border bg-secondary/20">
      <div className="container px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <span className="font-display text-xl font-bold">
              <span className="text-gradient">Skill</span>Map
            </span>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {t.footer.description}
            </p>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4">{t.footer.platform}</h4>
            <ul className="space-y-2.5">
              <li><Link to="/tests" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.footer.diagnosticsLink}</Link></li>
              <li><Link to="/cases" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.footer.casesLink}</Link></li>
              <li><Link to="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.footer.resourcesLink}</Link></li>
            </ul>
          </div>

          {/* For Teachers */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4">{t.footer.forTeachers}</h4>
            <ul className="space-y-2.5">
              <li><Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.footer.dashboardLink}</Link></li>
              <li><span className="text-sm text-muted-foreground">{t.footer.analyticsLink}</span></li>
              <li><span className="text-sm text-muted-foreground">{t.footer.reportsLink}</span></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4">{t.footer.support}</h4>
            <ul className="space-y-2.5">
              <li><span className="text-sm text-muted-foreground">{t.footer.helpLink}</span></li>
              <li><span className="text-sm text-muted-foreground">{t.footer.contactLink}</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">{t.footer.rights}</p>
          <span className="font-display text-sm font-bold text-muted-foreground">
            <span className="text-gradient">Skill</span>Map
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
