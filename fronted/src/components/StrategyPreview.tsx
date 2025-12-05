import { YouTubePreviewCard } from "./YouTubePreviewCard";

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

  return (
    <div className="subpanel rounded-xl p-6">
      <h3 className="text-sm font-bold text-primary mb-2 uppercase tracking-wide">
        YouTube Home Feed Preview
      </h3>
      <p className="text-xs text-muted-foreground mb-6">
        This is how your video will appear in YouTube's home feed recommendations
      </p>
      
      {/* YouTube Preview Card - No background, direct display */}
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
  );
};
