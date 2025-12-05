import { LucideIcon, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface StrategyCardProps {
  icon: LucideIcon;
  title: string;
  content?: string;
  coverImageUrl?: string; // 新增：封面图片 URL（base64 或 URL）
  placeholder?: string;
  iconColor?: string;
  isEmpty?: boolean;
  onRegenerate?: () => void;
}

export const StrategyCard = ({
  icon: Icon,
  title,
  content,
  coverImageUrl,
  placeholder,
  iconColor = "text-primary",
  isEmpty = false,
  onRegenerate,
}: StrategyCardProps) => {
  const colorName = iconColor.replace('text-', '');
  const isCoverCard = title === "Recommended Cover";
  
  return (
    <div className={`subpanel rounded-xl p-5 transition-all h-full ${
      isEmpty 
        ? 'opacity-60' 
        : 'hover:bg-[hsl(var(--module-bg))]'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
            colorName === 'chart-1' ? 'bg-chart-1/10' :
            colorName === 'chart-2' ? 'bg-chart-2/10' :
            colorName === 'chart-3' ? 'bg-chart-3/10' :
            colorName === 'chart-4' ? 'bg-chart-4/10' :
            'bg-primary/10'
          }`}>
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
          <h4 className="text-xs font-bold text-foreground leading-tight uppercase tracking-wide">{title}</h4>
        </div>
        {!isEmpty && onRegenerate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRegenerate}
            className="h-7 w-7 p-0 hover:bg-primary/10"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
      
      {/* Special visual treatment for cover card */}
      {isCoverCard && !isEmpty ? (
        <div className="space-y-3">
          {/* Visual preview box */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-chart-1/10 to-chart-2/10 border border-border/30">
            {coverImageUrl ? (
              // 显示真实的 AI 生成图片
              <>
                <img 
                  src={coverImageUrl} 
                  alt="AI Generated Cover" 
                  className="w-full h-full object-cover"
                />
                {/* Decorative corner badge */}
                <div className="absolute top-2 right-2 px-2 py-1 rounded bg-primary/20 backdrop-blur-sm">
                  <span className="text-[9px] font-semibold text-primary uppercase tracking-wide">AI Generated</span>
                </div>
              </>
            ) : (
              // 降级：显示文字描述
              <>
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <p className="text-xs text-center text-muted-foreground/80 leading-relaxed line-clamp-4">
                    {content}
                  </p>
                </div>
                {/* Decorative corner badge */}
                <div className="absolute top-2 right-2 px-2 py-1 rounded bg-primary/20 backdrop-blur-sm">
                  <span className="text-[9px] font-semibold text-primary uppercase tracking-wide">AI Design</span>
                </div>
              </>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground/60 italic">
            {coverImageUrl ? '🎨 AI-generated thumbnail ready to use' : '💡 Visual description for your thumbnail design'}
          </p>
        </div>
      ) : (
        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
          isEmpty ? 'text-muted-foreground/50 italic' : 'text-muted-foreground'
        }`}>
          {isEmpty ? placeholder : content}
        </p>
      )}
    </div>
  );
};
