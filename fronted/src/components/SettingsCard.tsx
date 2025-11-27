import { Card } from "./ui/card";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface SettingsCardProps {
  platform: string;
  category: string;
  onPlatformChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export const SettingsCard = ({
  platform,
  category,
  onPlatformChange,
  onCategoryChange,
}: SettingsCardProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">Settings</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="platform" className="text-sm text-foreground">
            Platform
          </Label>
          <Select value={platform} onValueChange={onPlatformChange}>
            <SelectTrigger id="platform">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm text-foreground">
            Category (Optional)
          </Label>
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="food">Food & Cooking</SelectItem>
              <SelectItem value="tech">Technology</SelectItem>
              <SelectItem value="lifestyle">Lifestyle</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};
