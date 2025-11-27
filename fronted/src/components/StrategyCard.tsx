import { LucideIcon, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface StrategyCardProps {
  icon: LucideIcon;
  title: string;
  content?: string;
  placeholder?: string;
  iconColor?: string;
  isEmpty?: boolean;
  onRegenerate?: () => void;
}

export const StrategyCard = ({
  icon: Icon,
  title,
  content,
  placeholder,
  iconColor = "text-primary",
  isEmpty = false,
  onRegenerate,
}: StrategyCardProps) => {
  const colorName = iconColor.replace('text-', '');
  
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
      <p className={`text-sm leading-relaxed ${
        isEmpty ? 'text-muted-foreground/50 italic' : 'text-muted-foreground'
      }`}>
        {isEmpty ? placeholder : content}
      </p>
    </div>
  );
};
