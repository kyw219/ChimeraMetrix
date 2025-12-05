/**
 * Compress a base64 image to a smaller thumbnail for storage
 * @param base64Image - The original base64 image string
 * @param maxWidth - Maximum width of the compressed image (default: 320px)
 * @param quality - JPEG quality 0-1 (default: 0.7)
 * @returns Compressed base64 image string or null if compression fails
 */
export async function compressBase64Image(
  base64Image: string,
  maxWidth: number = 320,
  quality: number = 0.7
): Promise<string | null> {
  try {
    // Return null if not a base64 image
    if (!base64Image || !base64Image.startsWith('data:image')) {
      return null;
    }

    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        const aspectRatio = img.height / img.width;
        const newWidth = Math.min(img.width, maxWidth);
        const newHeight = newWidth * aspectRatio;

        // Create canvas for compression
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Convert to JPEG with quality compression
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };

      img.onerror = () => {
        resolve(null);
      };

      img.src = base64Image;
    });
  } catch (error) {
    console.error('Image compression failed:', error);
    return null;
  }
}
