export function DashboardFooter() {
  return (
    <footer className="bg-dashboard-header border-t border-stat-border mt-8">
      <div className="container mx-auto px-6 py-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Contact email:{" "}
            <a 
              href="mailto:contact@edrlab.org" 
              className="text-primary hover:text-accent transition-colors"
            >
              contact@edrlab.org
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}