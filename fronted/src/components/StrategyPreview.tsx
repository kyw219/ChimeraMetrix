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
  videoUrl?: string; // 原始视频 URL for hover preview
  isEmpty?: boolean;
  label?: string;
}

export const StrategyPreview = ({ 
  strategy,
  videoUrl,
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
      <h3 className="text-sm font-bold text-primary mb-2">
        YouTube Home Feed Preview
      </h3>
      <p className="text-xs text-muted-foreground mb-6">
        This is how your video will appear in YouTube's home feed recommendations
      </p>
      
      {/* YouTube Preview Card - No background, direct display */}
      <div className="flex justify-center">
        {strategy.coverImageUrl ? (
          <YouTubePreviewCard
            thumbnailUrl={strategy.coverImageUrl}
            duration="10:24"
            title={strategy.title || "No title generated"}
            channelName="Your Channel"
            views={35000}
            publishedTime="1 month ago"
            videoUrl={videoUrl}
          />
        ) : (
          <div className="w-full max-w-[360px] space-y-3">
            {/* Placeholder thumbnail */}
            <div className="w-full aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-2">🎬</div>
                <p className="text-xs text-muted-foreground/60">Cover image not available</p>
              </div>
            </div>
            {/* Title and metadata */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground line-clamp-2">
                {strategy.title || "No title generated"}
              </h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Your Channel</span>
                <span>•</span>
                <span>35K views</span>
                <span>•</span>
                <span>1 month ago</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
