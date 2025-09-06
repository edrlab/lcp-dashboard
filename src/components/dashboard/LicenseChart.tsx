import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data for the chart
const chartData = [
  { month: "Jan", licenses: 245 },
  { month: "Feb", licenses: 312 },
  { month: "Mar", licenses: 198 },
  { month: "Apr", licenses: 427 },
  { month: "May", licenses: 389 },
  { month: "Jun", licenses: 516 },
  { month: "Jul", licenses: 634 },
  { month: "Aug", licenses: 573 },
  { month: "Sep", licenses: 692 },
  { month: "Oct", licenses: 758 },
  { month: "Nov", licenses: 841 },
  { month: "Dec", licenses: 923 },
];

export function LicenseChart() {
  return (
    <Card className="p-6 bg-gradient-card border-stat-border col-span-full">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">License Generation Trends</h3>
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