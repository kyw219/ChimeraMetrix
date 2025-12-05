import { Skeleton } from "./ui/skeleton";
import { Video, Users, Heart, Clock, Target, Sparkles } from "lucide-react";

interface AnalysisData {
  category: string;
  emotion: string;
  visualStyle: string;
  keywords: string[];
  audience: string;
  hookType: string;
}

interface VideoAnalysisCardProps {
  data: AnalysisData | null;
  isLoading?: boolean;
}

export const VideoAnalysisCard = ({ data, isLoading }: VideoAnalysisCardProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-3 rounded-lg bg-[hsl(var(--module-bg))]">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid grid-cols-2 gap-3 opacity-60">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-3 rounded-lg bg-[hsl(var(--module-bg))]">
            <p className="text-xs text-muted-foreground/50 italic">
              Waiting for analysis...
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[hsl(var(--module-bg))]">
        <Target className="w-4 h-4 text-chart-1 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-muted-foreground mb-1">
            Category
          </p>
          <p className="text-sm text-foreground leading-relaxed">{data.category}</p>
        </div>
      </div>

      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[hsl(var(--module-bg))]">
        <Heart className="w-4 h-4 text-chart-2 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-muted-foreground mb-1">
            Emotion
          </p>
          <p className="text-sm text-foreground leading-relaxed">{data.emotion}</p>
        </div>
      </div>

      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[hsl(var(--module-bg))]">
        <Video className="w-4 h-4 text-chart-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-muted-foreground mb-1">
            Visual Style
          </p>
          <p className="text-sm text-foreground leading-relaxed">{data.visualStyle}</p>
        </div>
      </div>

      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[hsl(var(--module-bg))]">
        <Users className="w-4 h-4 text-chart-4 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-muted-foreground mb-1">
            Audience
          </p>
          <p className="text-sm text-foreground leading-relaxed">{data.audience}</p>
        </div>
      </div>

      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[hsl(var(--module-bg))]">
        <Clock className="w-4 h-4 text-chart-1 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-muted-foreground mb-1">
            Hook Type
          </p>
          <p className="text-sm text-foreground leading-relaxed">{data.hookType}</p>
        </div>
      </div>

      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[hsl(var(--module-bg))]">
        <Sparkles className="w-4 h-4 text-chart-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-muted-foreground mb-1">
            Key Topics
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            {data.keywords.slice(0, 3).join(', ')}
          </p>
        </div>
      </div>
    </div>
  );
};
