import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import appLogo from "@/assets/app-logo.png";

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleSignOut = () => {
    logout();
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === '/dashboard') {
      e.preventDefault();
      window.location.reload();
    }
  };

  return (
    <header className="bg-dashboard-header border-b border-stat-border shadow-card">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/dashboard" 
            onClick={handleLogoClick}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img 
              src={appLogo} 
              alt="Dashboard Logo" 
              className="h-12 w-auto"
            />
          </Link>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-xl font-semibold text-foreground">LCP Server dashboard</h1>
            {typeof __USE_MOCK_DATA__ !== 'undefined' && __USE_MOCK_DATA__ && (
              <p className="text-xs text-muted-foreground bg-orange-100 dark:bg-orange-900/20 px-2 py-1 rounded mt-1">
                🧪 Development Mode - Mock Data
              </p>
            )}
          </div>

          {/* User Authentication */}
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-foreground">
                <User className="h-4 w-4" />
                <span className="font-medium">{user.name || user.email}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSignOut}
                className="text-foreground hover:text-primary hover:bg-secondary"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          ) : (
            <Button variant="ghost" className="text-foreground hover:text-primary hover:bg-secondary">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}