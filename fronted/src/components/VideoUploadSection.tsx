import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Upload, Video, X } from "lucide-react";

interface VideoUploadSectionProps {
  onFileUpload: (file: File) => void;
  onThumbnailGenerated?: (thumbnail: string) => void;
  platform: string;
  onPlatformChange: (value: string) => void;
  onRemove?: () => void;
  initialThumbnail?: string | null;
  initialFileName?: string | null;
}

export const VideoUploadSection = ({
  onFileUpload,
  onThumbnailGenerated,
  platform,
  onPlatformChange,
  onRemove,
  initialThumbnail,
  initialFileName,
}: VideoUploadSectionProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(initialThumbnail || null);
  const [fileName, setFileName] = useState<string | null>(initialFileName || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("video/")) {
      setFile(droppedFile);
      onFileUpload(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      onFileUpload(selectedFile);
      
      // Create video URL for preview playback
      const videoUrl = URL.createObjectURL(selectedFile);
      setVideoThumbnail(videoUrl);
      onThumbnailGenerated?.(videoUrl);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setVideoThumbnail(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove?.();
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`relative rounded-xl transition-all ${
          isDragging
            ? "bg-primary/10 ring-2 ring-primary/50"
            : "bg-[hsl(var(--subpanel-bg))]"
        } ${file ? "p-4" : "p-12"}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {(file || videoThumbnail) ? (
          <div className="space-y-4">
            {/* Video Preview */}
            {videoThumbnail && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[hsl(var(--module-bg))]">
                {videoThumbnail.startsWith('blob:') ? (
                  <video 
                    src={videoThumbnail}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <img 
                    src={videoThumbnail} 
                    alt="Video preview" 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}
            
            {/* File Info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {fileName || file?.name || 'Video uploaded'}
                </p>
                {file && (
                  <p className="text-xs text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div className="mb-4">
              <p className="text-sm font-semibold text-foreground mb-1">
                Drop your video here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports MP4, MOV, AVI up to 500MB
              </p>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="bg-primary/5 hover:bg-primary/10 border-primary/20"
            >
              Browse Files
            </Button>
          </div>
        )}
      </div>

      {/* Platform Selection */}
      <div className="space-y-3">
        <Label htmlFor="platform" className="text-base font-bold text-primary">
          Target Platform
        </Label>
        <Select value={platform} onValueChange={onPlatformChange}>
          <SelectTrigger id="platform" className="bg-[hsl(var(--subpanel-bg))] h-11 text-sm">
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
            <SelectItem value="instagram">Instagram Reels</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
