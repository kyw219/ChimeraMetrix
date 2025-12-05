/**
 * Utility functions for YouTube preview card
 */

/**
 * Generate a random video duration in MM:SS or H:MM:SS format
 */
export const generateRandomDuration = (): string => {
  const minutes = Math.floor(Math.random() * 60) + 1;
  const seconds = Math.floor(Math.random() * 60);
  
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Generate random view count (for demo purposes)
 */
export const generateRandomViews = (): number => {
  const ranges = [
    { min: 1000, max: 10000 },      // 1k-10k
    { min: 10000, max: 100000 },    // 10k-100k
    { min: 100000, max: 1000000 },  // 100k-1M
    { min: 1000000, max: 10000000 }, // 1M-10M
  ];
  
  const range = ranges[Math.floor(Math.random() * ranges.length)];
  return Math.floor(Math.random() * (range.max - range.min) + range.min);
};

/**
 * Generate random published time text
 */
export const generateRandomPublishedTime = (): string => {
  const options = [
    '刚刚',
    '5分钟前',
    '30分钟前',
    '1小时前',
    '3小时前',
    '12小时前',
    '1天前',
    '3天前',
    '1周前',
    '2周前',
    '3周前',
    '1个月前',
    '2个月前',
    '3个月前',
  ];
  
  return options[Math.floor(Math.random() * options.length)];
};

/**
 * Format views count to Chinese format
 */
export const formatViewsCount = (count: number): string => {
  if (count >= 100000000) {
    return `${(count / 100000000).toFixed(1)}亿`;
  } else if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}千`;
  }
  return count.toString();
};

/**
 * Extract duration from video file (placeholder - would need actual video processing)
 */
export const extractVideoDuration = (videoFile: File): Promise<string> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = Math.floor(video.duration);
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      
      if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        resolve(`${hours}:${mins.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };
    
    video.onerror = () => {
      // Fallback to random duration if video can't be loaded
      resolve(generateRandomDuration());
    };
    
    video.src = URL.createObjectURL(videoFile);
  });
};
