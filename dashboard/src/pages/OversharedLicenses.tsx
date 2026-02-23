import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/apiService";
import { API_CONFIG } from "@/lib/api";
import { mockOversharedLicenses } from "@/lib/mockData";
import { OversharedLicense } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link } from "react-router-dom";
import { capitalizeFirstLetter } from "@/lib/iconMapper";

const fetchOversharedLicenses = async (): Promise<OversharedLicense[]> => {
  if (typeof __USE_MOCK_DATA__ !== 'undefined' && __USE_MOCK_DATA__) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockOversharedLicenses;
  }
  
  return apiService.get<OversharedLicense[]>(API_CONFIG.ENDPOINTS.OVERSHARED_LICENSES);
};

const useOversharedLicenses = () => {
  return useQuery({
    queryKey: ['overshared', __USE_MOCK_DATA__ ? 'mock' : 'api'],
    queryFn: fetchOversharedLicenses,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-success/20 text-success border-success/30";
    case "ready":
      return "bg-primary/20 text-primary border-primary/30";
    case "expired":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "loan":
      return "bg-warning/20 text-warning border-warning/30";
    case "buy":
      return "bg-accent/20 text-accent border-accent/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

export default function OversharedLicenses() {
  const { data: licenses, isLoading, error } = useOversharedLicenses();
  const [processingLicenses, setProcessingLicenses] = useState<Set<string>>(new Set());

  const handleRevoke = async (licenseId: string) => {
    if (typeof __USE_MOCK_DATA__ !== 'undefined' && __USE_MOCK_DATA__) {
      toast({
        title: "Mock Mode",
        description: "License revocation was successful (mock)",
        className: "bg-success/20 border-success/30",
      });
      return;
    }

    setProcessingLicenses(prev => new Set(prev).add(licenseId));

    try {
      await apiService.put(API_CONFIG.ENDPOINTS.REVOKE_LICENSE(licenseId));
      toast({
        title: "Success",
        description: "License revocation was successful",
        className: "bg-success/20 border-success/30",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "License revocation failed",
        variant: "destructive",
      });
    } finally {
      setProcessingLicenses(prev => {
        const newSet = new Set(prev);
        newSet.delete(licenseId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/dashboard">
              <Button variant="outline" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Overshared Licenses</h1>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </main>
        <DashboardFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/dashboard">
              <Button variant="outline" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Overshared Licenses</h1>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load overshared licenses. Please try again later.
            </AlertDescription>
          </Alert>
        </main>
        <DashboardFooter />
      </div>
    );
  }

  const licenseList = licenses || [];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/dashboard">
            <Button variant="outline" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Overshared Licenses</h1>
        </div>
        
        <div className="space-y-4">
          {licenseList.length === 0 ? (
            <Card className="p-12 flex flex-col items-center justify-center text-center bg-gradient-card border-stat-border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No overshared licenses found</h3>
              <p className="text-muted-foreground max-w-md">
                There are currently no licenses that exceed the sharing threshold.
              </p>
            </Card>
          ) : (
            licenseList.map((license) => (
              <Card key={license.id} className="p-6 bg-gradient-card border-stat-border hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-semibold text-foreground line-clamp-2">
                      {license.title}
                    </h3>

                    <div className="text-sm text-muted-foreground">
                      <span>License ID: <span className="font-medium text-foreground">{license.id}</span></span>
                      <span className="mx-2">|</span>
                      <span>Publication ID: <span className="font-medium text-foreground">{license.publication_id}</span></span>
                      <span className="mx-2">|</span>
                      <span>Alt ID: <span className="font-medium text-foreground">{license.alt_id}</span></span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 items-center text-sm">
                      <span className="text-muted-foreground">
                        {license.user_email ? "User:" : "User ID:"}
                      </span>
                      {license.user_email && (
                        <span className="text-foreground font-medium">{license.user_email}</span>
                      )}
                      <span className="text-foreground font-medium">
                        {license.user_email ? `(${license.user_id})` : license.user_id}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">Type:</span>
                        <Badge variant="outline" className={getTypeColor(license.type)}>
                          {capitalizeFirstLetter(license.type)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">Status:</span>
                        <Badge variant="outline" className={getStatusColor(license.status)}>
                          {capitalizeFirstLetter(license.status)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">Devices:</span>
                        <span className="text-xl font-bold text-primary">
                          {license.devices}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {(license.status === "active" || license.status === "ready") && (
                      <Button
                        onClick={() => handleRevoke(license.id)}
                        disabled={processingLicenses.has(license.id)}
                        variant={license.status === "active" ? "destructive" : "default"}
                      >
                        {processingLicenses.has(license.id) 
                          ? "Processing..." 
                          : license.status === "active" 
                            ? "Revoke" 
                            : "Cancel"}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}
