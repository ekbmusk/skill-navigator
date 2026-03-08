import { useLang } from "@/i18n/LanguageContext";

const Footer = () => {
  const { t } = useLang();

  return (
    <footer className="border-t border-border py-12">
      <div className="container px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-display text-lg font-bold">
          <span className="text-gradient">Skill</span>Map
        </span>
        <p className="text-sm text-muted-foreground">{t.footer.rights}</p>
      </div>
    </footer>
  );
};

export default Footer;
