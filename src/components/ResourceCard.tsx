import { BookOpen, Video, Dumbbell, Library, ExternalLink, Clock } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import type { Resource } from "@/hooks/useResources";

const typeIcons: Record<string, typeof BookOpen> = {
  article: BookOpen,
  video: Video,
  exercise: Dumbbell,
  book: Library,
};

const typeColors: Record<string, string> = {
  article: "bg-blue-500/10 text-blue-500",
  video: "bg-red-500/10 text-red-500",
  exercise: "bg-green-500/10 text-green-500",
  book: "bg-purple-500/10 text-purple-500",
};

interface Props {
  resource: Resource;
  compact?: boolean;
}

const ResourceCard = ({ resource, compact = false }: Props) => {
  const { t, lang } = useLang();
  const isKz = lang === "kz";

  const Icon = typeIcons[resource.resource_type] || BookOpen;
  const colorClass = typeColors[resource.resource_type] || "bg-muted text-muted-foreground";

  const title = isKz ? resource.title_kz : resource.title;
  const description = isKz ? resource.description_kz : resource.description;

  const typeLabels = t.resources?.types || {};
  const typeLabel = typeLabels[resource.resource_type as keyof typeof typeLabels] || resource.resource_type;

  const content = (
    <div className={`group rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 transition-all hover:border-primary/30 hover:shadow-md ${compact ? "" : "h-full"}`}>
      <div className="flex items-start gap-3">
        <div className={`rounded-lg p-2 ${colorClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${colorClass}`}>
              {typeLabel}
            </span>
            {resource.duration_minutes && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {resource.duration_minutes} {t.resources?.minutes || "мин"}
              </span>
            )}
          </div>
          <h4 className="font-medium text-sm leading-tight mb-1 group-hover:text-primary transition-colors">
            {title}
          </h4>
          {!compact && (
            <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
          )}
        </div>
        {resource.url && (
          <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </div>
  );

  if (resource.url) {
    return (
      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return content;
};

export default ResourceCard;
