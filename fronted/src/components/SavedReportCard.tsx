import { Badge } from "./ui/badge";
import { Clock, Hash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SavedReportCardProps {
  id: string;
  timestamp: Date;
  strategy: {
    cover: string;
    coverImageUrl?: string | null;
    title: string;
    hashtags: string[];
    postingTime: string;
  };
  metrics: {
    views24h: string;
    ctr24h: string;
    likes24h: string;
  };
  onClick: () => void;
}

export const SavedReportCard = ({ id, timestamp, strategy, metrics, onClick }: SavedReportCardProps) => {
  const displayHashtags = strategy.hashtags.slice(0, 3);
  const remainingCount = strategy.hashtags.length - 3;

  return (
    <div
      onClick={onClick}
      className="subpanel rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] group"
    >
      {/* Thumbnail Preview */}
      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
        {strategy.coverImageUrl ? (
          <>
            <img 
              src={strategy.coverImageUrl} 
              alt={strategy.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--module-bg))] via-transparent to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--module-bg))] via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="text-center">
                <div className="text-6xl mb-3">🎬</div>
                <p className="text-[11px] text-muted-foreground/60 font-medium">Saved Strategy Report</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {strategy.title}
        </h3>

        {/* Hashtags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Hash className="w-3 h-3 text-muted-foreground/50" />
          {displayHashtags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary border-primary/20"
            >
              {tag.replace("#", "")}
            </Badge>
          ))}
          {remainingCount > 0 && (
            <span className="text-[9px] text-muted-foreground">+{remainingCount} more</span>
          )}
        </div>

        {/* Posting Time */}
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-accent" />
          <span className="text-[10px] text-muted-foreground">{strategy.postingTime}</span>
        </div>

        {/* Metrics Preview */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="text-[10px]">
            <span className="text-muted-foreground">Views: </span>
            <span className="text-foreground font-medium">{metrics.views24h}</span>
          </div>
          <div className="text-[10px]">
            <span className="text-muted-foreground">CTR: </span>
            <span className="text-foreground font-medium">{metrics.ctr24h}</span>
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-[9px] text-muted-foreground/60">
          Saved {formatDistanceToNow(timestamp, { addSuffix: true })}
        </div>
      </div>
    </div>
  );
};
