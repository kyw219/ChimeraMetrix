interface YouTubePreviewCardProps {
  thumbnailUrl: string;
  duration: string; // "12:45" or "1:23:45"
  title: string;
  avatarUrl?: string; // Optional, will show placeholder if not provided
  channelName: string;
  views: number;
  publishedTime: string; // "1个月前", "3周前", etc.
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
  // Format views to Chinese format (e.g., 435000 → "43.5万")
  const formatViews = (count: number): string => {
    if (count >= 100000000) {
      return `${(count / 100000000).toFixed(1)}亿`;
    } else if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}万`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}千`;
    }
    return count.toString();
  };

  return (
    <div className="w-full max-w-[360px] cursor-pointer">
      {/* Thumbnail Container */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#0f0f0f] mb-3">
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        
        {/* Duration Badge - Bottom Right */}
        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs font-medium px-1 py-0.5 rounded">
          {duration}
        </div>
      </div>

      {/* Video Info */}
      <div className="flex gap-3">
        {/* Channel Avatar */}
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
          {/* Title - Max 2 lines with ellipsis */}
          <h3 className="text-sm font-medium text-foreground leading-5 line-clamp-2 mb-1">
            {title}
          </h3>

          {/* Channel Name */}
          <p className="text-xs text-muted-foreground leading-[18px]">
            {channelName}
          </p>

          {/* Views and Time */}
          <p className="text-xs text-muted-foreground leading-[18px]">
            {formatViews(views)}次观看 · {publishedTime}
          </p>
        </div>
      </div>
    </div>
  );
};
