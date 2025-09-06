import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Play, Clock, Ban, XCircle } from "lucide-react";

const licenseStatuses = [
  { name: "Ready", count: 45632, icon: CheckCircle, color: "bg-chart-primary" },
  { name: "Active", count: 28456, icon: Play, color: "bg-success" },
  { name: "Expired", count: 12834, icon: Clock, color: "bg-warning" },
  { name: "Revoked", count: 1856, icon: Ban, color: "bg-destructive" },
  { name: "Canceled", count: 456, icon: XCircle, color: "bg-chart-secondary" },
];

export function LicenseStatusBreakdown() {
  const total = licenseStatuses.reduce((sum, status) => sum + status.count, 0);

  return (
    <Card className="p-6 bg-gradient-card border-stat-border">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">License Status</h3>
        <div className="space-y-3">
          {licenseStatuses.map(({ name, count, icon: Icon, color }) => {
            const percentage = ((count / total) * 100).toFixed(1);
            
            return (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${color}/20`}>
                    <Icon className={`h-4 w-4 text-current`} style={{ color: `hsl(var(--${color.replace('bg-', '')}))` }} />
                  </div>
                  <span className="font-medium text-foreground">{name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {percentage}%
                  </Badge>
                  <span className="text-sm font-semibold text-foreground">{count.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}