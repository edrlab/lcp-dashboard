import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useDashboardData } from "@/hooks/useDashboardData";
import { LicenseReportDialog } from "@/components/dashboard/LicenseReportDialog";

export function LicenseChart() {
  const { data: dashboardData, isLoading, error } = useDashboardData();

  const reportHeader = (
    <div className="flex items-center justify-between gap-4">
      <h3 className="text-lg font-semibold text-foreground">License Generation Trends (Activated only)</h3>
      <LicenseReportDialog />
    </div>
  );

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-card border-stat-border col-span-full">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-80 w-full" />
        </div>
      </Card>
    );
  }

  if (error || !dashboardData?.chart_data) {
    return (
      <Card className="p-6 bg-gradient-card border-stat-border col-span-full">
        <div className="space-y-4">
          {reportHeader}
          <p className="text-muted-foreground">Failed to load chart data</p>
        </div>
      </Card>
    );
  }

  const chartData = dashboardData.chart_data;
  return (
    <Card className="p-6 bg-gradient-card border-stat-border col-span-full">
      <div className="space-y-4">
        {reportHeader}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--stat-border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))"
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Line 
                type="monotone" 
                dataKey="licenses" 
                stroke="hsl(var(--chart-primary))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--chart-primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(var(--chart-primary))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}