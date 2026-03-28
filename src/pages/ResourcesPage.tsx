import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  Library,
  Search,
  BookOpen,
  Play,
  Dumbbell,
  BookMarked,
  Layers,
  SearchX,
  FolderOpen,
  Sparkles,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { useResources, type Resource } from "@/hooks/useResources";
import ResourceCard from "@/components/ResourceCard";
import { Skeleton } from "@/components/ui/skeleton";

const categoryTabs = [
  { key: "", labelRu: "Все", labelKz: "Барлығы" },
  { key: "cognitive", labelRu: "Когнитивные", labelKz: "Когнитивтік" },
  { key: "soft", labelRu: "Soft Skills", labelKz: "Soft Skills" },
  { key: "professional", labelRu: "Профессиональные", labelKz: "Кәсіби" },
  { key: "adaptability", labelRu: "Адаптивность", labelKz: "Бейімділік" },
  { key: "physics", labelRu: "Физика", labelKz: "Физика" },
  { key: "infocomm", labelRu: "Цифровая грамотность", labelKz: "Сандық сауаттылық" },
];

const typeFilters = [
  { key: "", labelRu: "Все типы", labelKz: "Барлық түрлері", icon: Layers },
  { key: "article", labelRu: "Статьи", labelKz: "Мақалалар", icon: BookOpen },
  { key: "video", labelRu: "Видео", labelKz: "Бейне", icon: Play },
  { key: "exercise", labelRu: "Упражнения", labelKz: "Жаттығулар", icon: Dumbbell },
  { key: "book", labelRu: "Книги", labelKz: "Кітаптар", icon: BookMarked },
];

const ResourcesPage = () => {
  const { t, lang } = useLang();
  const isKz = lang === "kz";
  const { loadResources, loading, error } = useResources();
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [activeType, setActiveType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const filters: Record<string, string> = {};
    if (activeCategory) filters.category = activeCategory;
    if (activeType) filters.resource_type = activeType;
    loadResources(filters).then(setResources);
  }, [activeCategory, activeType]);

  const filteredResources = useMemo(() => {
    if (!searchQuery.trim()) return resources;
    const q = searchQuery.toLowerCase();
    return resources.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.title_kz?.toLowerCase().includes(q) ||
      r.description_kz?.toLowerCase().includes(q)
    );
  }, [resources, searchQuery]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-60 right-1/4 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <Navbar />

      <div className="container relative px-4 pt-24 pb-16">
        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 backdrop-blur-sm"
          >
            <Sparkles size={14} className="animate-pulse" />
            {t.resources?.badge || (isKz ? "Оқу материалдары" : "Учебные материалы")}
          </motion.div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
            {t.resources?.title || (isKz ? "Ресурстар" : "Библиотека")}{" "}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
              {t.resources?.titleHighlight || (isKz ? "кітапханасы" : "ресурсов")}
            </span>
          </h1>
          <p className="mt-5 text-muted-foreground max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            {t.resources?.subtitle || (isKz
              ? "Дағдылар мен деңгей бойынша бейнелер, мақалалар, жаттығулар және кітаптар"
              : "Видео, статьи, упражнения и книги по навыкам и уровням")}
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="max-w-lg mx-auto mb-10"
        >
          <div
            className={`relative rounded-2xl p-[1px] transition-all duration-300 ${
              searchFocused
                ? "bg-gradient-to-r from-primary via-purple-500 to-blue-500 shadow-lg shadow-primary/20"
                : "bg-border"
            }`}
          >
            <div className="relative flex items-center rounded-2xl bg-background">
              <Search
                size={18}
                className={`absolute left-4 transition-colors duration-200 ${
                  searchFocused ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder={isKz ? "Ресурстарды іздеу..." : "Поиск ресурсов..."}
                className="w-full pl-11 pr-5 py-3.5 rounded-2xl bg-transparent text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-wrap gap-2 justify-center mb-6"
        >
          {categoryTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === tab.key
                  ? "bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg shadow-primary/25 scale-[1.02]"
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground hover:scale-[1.02]"
              }`}
            >
              {isKz ? tab.labelKz : tab.labelRu}
            </button>
          ))}
        </motion.div>

        {/* Type filter */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="flex flex-wrap items-center gap-2 justify-center mb-10"
        >
          {typeFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeType === filter.key;
            return (
              <button
                key={filter.key}
                onClick={() => setActiveType(filter.key)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 border ${
                  isActive
                    ? "bg-primary/10 text-primary border-primary/30 shadow-sm shadow-primary/10"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                <Icon size={14} className={isActive ? "text-primary" : ""} />
                {isKz ? filter.labelKz : filter.labelRu}
              </button>
            );
          })}
        </motion.div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm p-5"
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-16 rounded-full" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-20 text-destructive">{error}</div>
        )}

        {/* Empty state */}
        <AnimatePresence>
          {!loading && !error && filteredResources.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-150" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary to-secondary/60 border border-border/50 flex items-center justify-center">
                  <SearchX size={32} className="text-muted-foreground/60" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 border border-border/50 flex items-center justify-center">
                  <FolderOpen size={14} className="text-muted-foreground/50" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t.resources?.empty || (isKz ? "Ресурстар табылмады" : "Ресурсы не найдены")}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {isKz
                  ? "Іздеу сұрауыңызды немесе сүзгілерді өзгертіп көріңіз"
                  : "Попробуйте изменить поисковый запрос или фильтры"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resource cards */}
        {!loading && !error && filteredResources.length > 0 && (
          <motion.div
            layout
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filteredResources.map((resource, i) => (
                <motion.div
                  key={resource.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.2 },
                  }}
                  className="relative group/card"
                >
                  {/* Hover glow effect behind the card */}
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/0 to-purple-500/0 group-hover/card:from-primary/10 group-hover/card:via-purple-500/5 group-hover/card:to-blue-500/10 blur-lg transition-all duration-500 opacity-0 group-hover/card:opacity-100" />
                  <div className="relative">
                    <ResourceCard resource={resource} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;
