import { LucideIcon } from "lucide-react";
import { Badge } from "./ui/badge";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  note?: string;
  badge?: string;
  iconColor?: string;
}

export const MetricCard = ({
  icon: Icon,
  label,
  value,
  note,
  badge,
  iconColor = "text-primary",
}: MetricCardProps) => {
  return (
    <div className="subpanel rounded-xl p-5 hover:bg-[hsl(var(--module-bg))] transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`${iconColor} bg-primary/5 p-2.5 rounded-lg`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {note && (
        <p className="text-[10px] text-muted-foreground/80 leading-tight mb-2">{note}</p>
      )}
      {badge && (
        <Badge variant="secondary" className="text-[9px] px-2 py-1">
          {badge}
        </Badge>
      )}
    </div>
  );
};
