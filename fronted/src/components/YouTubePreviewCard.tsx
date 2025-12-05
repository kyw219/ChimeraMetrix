interface YouTubePreviewCardProps {
  thumbnailUrl: string;
  duration: string; // "12:45" or "1:23:45"
  title: string;
  avatarUrl?: string; // Optional, will show placeholder if not provided
  channelName: string;
  views: number;
  publishedTime: string; // "1 month ago", "3 weeks ago", etc.
}

export const YouTubePreviewCard = ({
  thumbnailUrl,
  duration,
  title,
  avatarUrl,
  channelName,
  views,
  publishedTime,
}: YouTubePreviewCardProps) => {
  // Format views to English format (e.g., 435000 → "435K")
  const formatViews = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="w-full max-w-[400px] cursor-pointer transition-transform hover:scale-[1.02] duration-200">
      {/* Thumbnail Container - Full Width */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#0f0f0f] mb-3">
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        
        {/* Duration Badge - Bottom Right (YouTube style) */}
        <div className="absolute bottom-1.5 right-1.5 bg-black/90 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded-sm">
          {duration}
        </div>
      </div>

      {/* Video Info */}
      <div className="flex gap-3">
        {/* Channel Avatar - Smaller, aligned with title */}
        <div className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden bg-[#272727]">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={channelName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold">
              {channelName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Title and Metadata */}
        <div className="flex-1 min-w-0">
          {/* Title - Max 2 lines, bold, pure white */}
          <h3 className="text-[15px] font-semibold text-white leading-[1.4] line-clamp-2 mb-1">
            {title}
          </h3>

          {/* Channel Name - Small, gray */}
          <p className="text-[12px] text-[#aaa] leading-[18px]">
            {channelName}
          </p>

          {/* Views and Time - Small, gray */}
          <p className="text-[12px] text-[#aaa] leading-[18px]">
            {formatViews(views)} views · {publishedTime}
          </p>
        </div>
      </div>
    </div>
  );
};
