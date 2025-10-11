import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
  action?: React.ReactNode;
}

export function StatCard({ title, value, subtitle, trend, className, action }: StatCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-success";
      case "down":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className={`p-6 bg-gradient-card border-stat-border hover:shadow-dashboard transition-all duration-300 ${className}`}>
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex items-baseline space-x-2">
          <p className="text-3xl font-bold text-foreground">{value.toLocaleString()}</p>
          {subtitle && (
            <p className={`text-sm font-medium ${getTrendColor()}`}>
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="mt-4">
            {action}
          </div>
        )}
      </div>
    </Card>
  );
}