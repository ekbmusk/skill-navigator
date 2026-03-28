import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Library, Filter } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { useResources, type Resource } from "@/hooks/useResources";
import ResourceCard from "@/components/ResourceCard";

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
  { key: "", labelRu: "Все типы", labelKz: "Барлық түрлері" },
  { key: "article", labelRu: "Статьи", labelKz: "Мақалалар" },
  { key: "video", labelRu: "Видео", labelKz: "Бейне" },
  { key: "exercise", labelRu: "Упражнения", labelKz: "Жаттығулар" },
  { key: "book", labelRu: "Книги", labelKz: "Кітаптар" },
];

const ResourcesPage = () => {
  const { t, lang } = useLang();
  const isKz = lang === "kz";
  const { loadResources, loading, error } = useResources();
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [activeType, setActiveType] = useState("");

  useEffect(() => {
    const filters: Record<string, string> = {};
    if (activeCategory) filters.category = activeCategory;
    if (activeType) filters.resource_type = activeType;
    loadResources(filters).then(setResources);
  }, [activeCategory, activeType]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Library size={16} />
            {t.resources?.badge || (isKz ? "Оқу материалдары" : "Учебные материалы")}
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold">
            {t.resources?.title || (isKz ? "Ресурстар" : "Библиотека")}{" "}
            <span className="text-gradient">
              {t.resources?.titleHighlight || (isKz ? "кітапханасы" : "ресурсов")}
            </span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {t.resources?.subtitle || (isKz
              ? "Дағдылар мен деңгей бойынша бейнелер, мақалалар, жаттығулар және кітаптар"
              : "Видео, статьи, упражнения и книги по навыкам и уровням")}
          </p>
        </motion.div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {categoryTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === tab.key
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              {isKz ? tab.labelKz : tab.labelRu}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <Filter size={14} className="text-muted-foreground" />
          {typeFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveType(filter.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeType === filter.key
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isKz ? filter.labelKz : filter.labelRu}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-destructive">{error}</div>
        )}

        {!loading && !error && resources.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            {t.resources?.empty || (isKz ? "Ресурстар табылмады" : "Ресурсы не найдены")}
          </div>
        )}

        {!loading && !error && resources.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource, i) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ResourceCard resource={resource} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;
