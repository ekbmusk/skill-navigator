import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ru } from "./ru";
import { kz } from "./kz";

export type Lang = "ru" | "kz";
export type Translations = typeof ru;

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "ru",
  setLang: () => {},
  t: ru,
});

const translations: Record<Lang, Translations> = { ru, kz: kz as unknown as Translations };

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("lang");
    return (saved === "kz" ? "kz" : "ru") as Lang;
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
