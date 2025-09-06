import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <header className="bg-dashboard-header border-b border-stat-border shadow-card">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-primary w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">EDR</span>
            </div>
            <span className="text-foreground font-medium">edrlab.org</span>
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-xl font-semibold text-foreground">LCP Server dashboard</h1>
          </div>

          {/* Sign In */}
          <Button variant="ghost" className="text-foreground hover:text-primary hover:bg-secondary">
            Sign In
          </Button>
        </div>
      </div>
    </header>
  );
}