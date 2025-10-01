import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/useDashboardData";
import { getLicenseStatusConfig } from "@/lib/iconMapper";

export function LicenseStatusBreakdown() {
  const { data: dashboardData, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-card border-stat-border">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error || !dashboardData?.licenseStatuses) {
    return (
      <Card className="p-6 bg-gradient-card border-stat-border">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">License Status</h3>
          <p className="text-muted-foreground">Failed to load license status data</p>
        </div>
      </Card>
    );
  }

  const licenseStatuses = dashboardData.licenseStatuses;
  const total = licenseStatuses.reduce((sum, status) => sum + status.count, 0);

  return (
    <Card className="p-6 bg-gradient-card border-stat-border">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">License Status</h3>
        <div className="space-y-3">
          {licenseStatuses.map(({ name, count }) => {
            const percentage = ((count / total) * 100).toFixed(1);
            const { icon: IconComponent, color } = getLicenseStatusConfig(name);
            
            return (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${color}/20`}>
                    <IconComponent className={`h-4 w-4 text-current`} style={{ color: `hsl(var(--${color.replace('bg-', '')}))` }} />
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