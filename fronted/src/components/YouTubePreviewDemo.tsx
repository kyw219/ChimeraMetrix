import { YouTubePreviewCard } from "./YouTubePreviewCard";

/**
 * Demo component showing how to use YouTubePreviewCard
 * This can be used in Upload.tsx to replace StrategyPreview
 */
export const YouTubePreviewDemo = () => {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-lg font-bold text-primary mb-4">
          YouTube 首页预览效果
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          This is how your video will appear in YouTube's homepage recommendation feed
        </p>

        {/* Example 1: With AI-generated cover */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <YouTubePreviewCard
            thumbnailUrl="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=640&h=360&fit=crop"
            duration="12:45"
            title="I Tried NYC's SPICIEST Noodles Challenge 🔥 (Instant Regret)"
            channelName="FoodieAdventures"
            views={435000}
            publishedTime="3周前"
          />

          <YouTubePreviewCard
            thumbnailUrl="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=640&h=360&fit=crop"
            duration="8:23"
            title="10 AI Tools That Will Change Your Life in 2024"
            avatarUrl="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
            channelName="TechDaily"
            views={1250000}
            publishedTime="1个月前"
          />

          <YouTubePreviewCard
            thumbnailUrl="https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=640&h=360&fit=crop"
            duration="1:23:45"
            title="Complete React Tutorial for Beginners - Build 5 Projects"
            channelName="CodeMaster"
            views={89000}
            publishedTime="2天前"
          />
        </div>
      </div>

      {/* Example with long title to show truncation */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">
          标题截断示例（超过两行自动省略）
        </h3>
        <YouTubePreviewCard
          thumbnailUrl="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=640&h=360&fit=crop"
          duration="15:30"
          title="This is an extremely long video title that demonstrates how the YouTube preview card handles text overflow when the title exceeds two lines and needs to be truncated with ellipsis"
          channelName="LongTitleChannel"
          views={5600}
          publishedTime="5小时前"
        />
      </div>
    </div>
  );
};
