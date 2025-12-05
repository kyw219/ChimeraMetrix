import { useState } from "react";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { Video, Users, Heart, Sparkles, Clock, Target, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

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
  const [isExpanded, setIsExpanded] = useState(true);

  if (isLoading) {
    return (
      <div className="subpanel rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-9 h-9 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="subpanel rounded-xl p-5 opacity-60">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-muted/30 flex items-center justify-center">
            <Video className="w-5 h-5 text-muted-foreground/40" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
              Feature Extraction
            </h3>
            <p className="text-[10px] text-muted-foreground">
              Upload a video to see analysis
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground/50 italic leading-tight">
          AI will analyze content, style, emotion, audience, and key features
        </p>
      </div>
    );
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="subpanel rounded-xl p-5">
        {/* Compact Summary */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
                Feature Extraction
              </h3>
              <p className="text-[10px] text-muted-foreground truncate">
                {data.category} • {data.emotion} • {data.audience}
              </p>
            </div>
          </div>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs hover:bg-primary/10"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 mr-1" />
                  Hide
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 mr-1" />
                  Details
                </>
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        {/* Expandable Details */}
        <CollapsibleContent>
          <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[hsl(var(--module-bg))]">
          <Target className="w-4 h-4 text-chart-1 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
              Category
            </p>
            <Badge variant="secondary" className="text-[9px] px-2 py-0.5">
              {data.category}
            </Badge>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[hsl(var(--module-bg))]">
          <Heart className="w-4 h-4 text-chart-2 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
              Emotion
            </p>
            <p className="text-xs text-foreground font-medium leading-tight">{data.emotion}</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[hsl(var(--module-bg))]">
          <Video className="w-4 h-4 text-chart-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
              Visual Style
            </p>
            <p className="text-xs text-foreground font-medium leading-tight">{data.visualStyle}</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[hsl(var(--module-bg))]">
          <Users className="w-4 h-4 text-chart-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
              Audience
            </p>
            <p className="text-xs text-foreground font-medium leading-tight">{data.audience}</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[hsl(var(--module-bg))]">
          <Clock className="w-4 h-4 text-chart-1 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
              Hook Type
            </p>
            <p className="text-xs text-foreground font-medium leading-tight">{data.hookType}</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[hsl(var(--module-bg))]">
          <Sparkles className="w-4 h-4 text-chart-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
              Key Topics
            </p>
            <div className="flex flex-wrap gap-1">
              {data.keywords.slice(0, 2).map((keyword, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-[8px] font-normal px-1.5 py-0.5"
                >
                  {keyword}
                </Badge>
              ))}
            </div>
            </div>
          </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
