import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, FileText, Headphones, Image } from "lucide-react";

const publicationTypes = [
  { name: "EPUB", count: 1284, icon: Book, color: "bg-chart-primary" },
  { name: "PDF", count: 892, icon: FileText, color: "bg-chart-secondary" },
  { name: "Audiobooks", count: 456, icon: Headphones, color: "bg-success" },
  { name: "Comics", count: 234, icon: Image, color: "bg-warning" },
];

export function PublicationBreakdown() {
  const total = publicationTypes.reduce((sum, type) => sum + type.count, 0);

  return (
    <Card className="p-6 bg-gradient-card border-stat-border">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Publication Formats</h3>
        <div className="space-y-3">
          {publicationTypes.map(({ name, count, icon: Icon, color }) => {
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