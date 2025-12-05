import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
      <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wide">
        {label}
      </h3>
      
      {/* Visual Mock Preview */}
      <div className="relative w-full aspect-video bg-gradient-to-br from-[hsl(var(--module-bg))] to-[hsl(var(--subpanel-bg))] rounded-lg overflow-hidden border border-primary/10">
        {/* Cover Image or Description */}
        {strategy.coverImageUrl ? (
          <img 
            src={strategy.coverImageUrl} 
            alt="AI Generated Cover" 
            className="w-full h-full object-cover"
          />
        ) : strategy.cover ? (
          <div className="absolute inset-0 flex items-center justify-center p-8 bg-gradient-to-br from-chart-1/5 to-chart-2/5">
            <p className="text-xs text-center text-muted-foreground/70 leading-relaxed line-clamp-4">
              {strategy.cover}
            </p>
          </div>
        ) : null}
        
        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
          <h4 className="text-sm font-bold text-white leading-tight line-clamp-2">
            {strategy.title || "No title generated"}
          </h4>
        </div>
        
        {/* Platform Badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-black/50 text-white border-white/20 text-[10px]">
            {strategy.coverImageUrl ? 'AI Generated' : 'Preview'}
          </Badge>
        </div>
      </div>
      
      {/* Metadata Below Preview */}
      <div className="mt-4 space-y-3">
        {/* Description */}
        {strategy.description && (
          <div className="p-3 bg-[hsl(var(--module-bg))] rounded-lg border border-border/30">
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {strategy.description}
            </p>
          </div>
        )}
        
        {/* Hashtags */}
        <div className="flex gap-2 flex-wrap">
          {hashtags.length > 0 ? (
            hashtags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="text-[10px] px-2 py-1 bg-chart-3/10 text-chart-3 border-chart-3/20"
              >
                {tag}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">No hashtags</span>
          )}
        </div>
        
        {/* Posting Time */}
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
  );
}
