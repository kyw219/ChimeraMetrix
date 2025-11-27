import { Badge } from "./ui/badge";
import { Clock, Hash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SavedReportCardProps {
  report: {
    id: string;
    timestamp: Date;
    strategy: {
      cover: string;
      title: string;
      hashtags: string[];
      postingTime: string;
    };
    metrics: {
      views24h: string;
      ctr24h: string;
      likes24h: string;
    };
  };
  onClick: () => void;
}

export const SavedReportCard = ({ report, onClick }: SavedReportCardProps) => {
  const displayHashtags = report.strategy.hashtags.slice(0, 3);
  const remainingCount = report.strategy.hashtags.length - 3;

  return (
    <div
      onClick={onClick}
      className="subpanel rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] group"
    >
      {/* Thumbnail Preview */}
      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--module-bg))] via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <p className="text-xs text-center text-muted-foreground/60 italic line-clamp-3">
            {report.strategy.cover}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {report.strategy.title}
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
          <span className="text-[10px] text-muted-foreground">{report.strategy.postingTime}</span>
        </div>

        {/* Metrics Preview */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="text-[10px]">
            <span className="text-muted-foreground">Views: </span>
            <span className="text-foreground font-medium">{report.metrics.views24h}</span>
          </div>
          <div className="text-[10px]">
            <span className="text-muted-foreground">CTR: </span>
            <span className="text-foreground font-medium">{report.metrics.ctr24h}</span>
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-[9px] text-muted-foreground/60">
          Saved {formatDistanceToNow(report.timestamp, { addSuffix: true })}
        </div>
      </div>
    </div>
  );
};
