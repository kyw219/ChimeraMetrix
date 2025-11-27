import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  time: string;
  value: number;
}

interface PerformanceChartProps {
  data: ChartData[];
  title: string;
  color?: string;
}

export const PerformanceChart = ({
  data,
  title,
  color = "hsl(var(--primary))",
}: PerformanceChartProps) => {
  return (
    <div className="pt-4">
      <h3 className="text-sm font-bold text-foreground mb-6 uppercase tracking-wide">{title}</h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
          <XAxis
            dataKey="time"
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tickLine={false}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={11}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "none",
              borderRadius: "0.75rem",
              fontSize: "11px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            dot={{ fill: color, r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0, fill: color, filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
