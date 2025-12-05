import { Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { YouTubePreviewCard } from "./YouTubePreviewCard";
import { useState } from "react";

interface StrategyPreviewProps {
  strategy?: {
    cover?: string;
    coverImageUrl?: string; // AI 生成的封面图片 URL
    title?: string;
    description?: string; // 视频简介
    hashtags?: string;
    postingTime?: string;
  } | null;
  isEmpty?: boolean;
  label?: string;
}

export const StrategyPreview = ({ 
  strategy, 
  isEmpty = false,
  label = "Strategy Preview"
}: StrategyPreviewProps) => {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  if (isEmpty || !strategy) {
    return (
      <div className="subpanel rounded-xl p-6">
        <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wide">
          {label}
        </h3>
        <div className="space-y-4">
          {/* Thumbnail placeholder */}
          <div className="w-full aspect-video bg-[hsl(var(--module-bg))] rounded-lg flex items-center justify-center border border-dashed border-muted-foreground/20">
            <div className="text-center">
              <p className="text-xs text-muted-foreground/50">Visual preview will appear here</p>
            </div>
          </div>
          
          {/* Metadata placeholders */}
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <div className="h-6 w-20 bg-[hsl(var(--module-bg))] rounded animate-pulse" />
              <div className="h-6 w-24 bg-[hsl(var(--module-bg))] rounded animate-pulse" />
            </div>
            <div className="h-8 w-32 bg-[hsl(var(--module-bg))] rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const hashtags = strategy.hashtags?.split(' ').filter(tag => tag.trim()) || [];

  return (
    <div className="subpanel rounded-xl p-6">
      <h3 className="text-sm font-bold text-primary mb-2 uppercase tracking-wide">
        YouTube Home Feed Preview
      </h3>
      <p className="text-xs text-muted-foreground mb-6">
        This is how your video will appear in YouTube's home feed recommendations
      </p>
      
      {/* YouTube-style Preview Area with dark background */}
      <div className="bg-[#0f0f0f] rounded-xl p-6 mb-4">
        <div className="flex justify-center">
          <YouTubePreviewCard
            thumbnailUrl={strategy.coverImageUrl || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=640&h=360&fit=crop"}
            duration="10:24"
            title={strategy.title || "No title generated"}
            channelName="Your Channel"
            views={35000}
            publishedTime="1 month ago"
          />
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-muted-foreground/60 italic mb-4 text-center">
        Preview simulation. Actual YouTube display may vary slightly with UI updates. Sample data shown for layout reference.
      </p>

      {/* Collapsible Strategy Details */}
      <div className="mt-6 pt-6 border-t border-border/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
          className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground mb-3"
        >
          <span className="uppercase tracking-wide">
            Strategy Details (Internal Reference Only)
          </span>
          {isDetailsExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>

        <p className="text-[10px] text-muted-foreground/60 mb-4">
          The following fields are for your reference and will not appear on YouTube's home feed.
        </p>
        
        {isDetailsExpanded && (
          <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
            {/* Description */}
            {strategy.description && (
              <div className="p-3 bg-[hsl(var(--module-bg))] rounded-lg border border-border/30">
                <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase">Description</p>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {strategy.description}
                </p>
              </div>
            )}
            
            {/* Hashtags */}
            {hashtags.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase">Hashtags</p>
                <div className="flex gap-2 flex-wrap">
                  {hashtags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="text-[10px] px-2 py-1 bg-chart-3/10 text-chart-3 border-chart-3/20"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Posting Time */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase">Optimal Posting Time</p>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <Badge 
                  variant="outline"
                  className="text-xs px-3 py-1 bg-chart-4/10 text-chart-4 border-chart-4/20"
                >
                  {strategy.postingTime || "No time specified"}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
