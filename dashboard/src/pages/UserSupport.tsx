import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { LicenseInfo, Event } from "@/hooks/useDashboardData";
import { useUserLicenseSearch } from "@/hooks/useUserLicenseSearch";
import { useLicenseEvents } from "@/hooks/useLicenseEvents";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function UserSupport() {
  const [userIdentifier, setUserIdentifier] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [selectedLicenseId, setSelectedLicenseId] = useState<string | null>(null);

  const { 
    data: licenses, 
    isLoading, 
    error, 
    refetch 
  } = useUserLicenseSearch(userIdentifier, { enabled: false });

  const {
    data: events,
    isLoading: eventsLoading,
    error: eventsError,
  } = useLicenseEvents(selectedLicenseId || "", { enabled: !!selectedLicenseId });

  const handleSearch = async () => {
    if (!userIdentifier.trim()) {
      setValidationError("This field is required");
      return;
    }
    
    setValidationError("");
    setHasSearched(true);
    refetch();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserIdentifier(e.target.value);
    if (validationError) {
      setValidationError("");
    }
  };

  const handleShowEvents = (licenseId: string) => {
    setSelectedLicenseId(licenseId);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/dashboard">
            <Button variant="outline" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">User Support</h1>
        </div>

        <div className="mb-8">
          <p className="text-muted-foreground">Search for licenses acquired by a specific user</p>
        </div>

        {/* Search Form */}
        <Card className="p-6 mb-8">
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-identifier" className="text-sm font-medium">
                Enter a user identifier to list their acquired licenses
              </Label>
              <div className="mt-2 flex gap-2 items-start">
                <div className="flex-1">
                  <Input
                    id="user-identifier"
                    type="text"
                    value={userIdentifier}
                    onChange={handleInputChange}
                    placeholder="User identifier"
                    className={validationError ? "border-red-500" : ""}
                  />
                  {validationError && (
                    <p className="text-sm text-red-500 mt-1">{validationError}</p>
                  )}
                </div>
                <Button 
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="shrink-0"
                >
                  {isLoading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Results Section */}
        {hasSearched && (
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  Search error. Please try again.
                </AlertDescription>
              </Alert>
            )}
            
            {!error && !isLoading && licenses && licenses.length === 0 && (
              <Alert>
                <AlertDescription>
                  No license has been acquired by this user
                </AlertDescription>
              </Alert>
            )}
            
            {!error && !isLoading && licenses && licenses.length > 0 && (
              <Card className="p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Publication Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Device Count</TableHead>
                        <TableHead>Start</TableHead>
                        <TableHead>End</TableHead>
                        <TableHead className="text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {licenses.map((license) => (
                        <TableRow key={license.uuid}>
                          <TableCell className="font-medium">
                            {license.publication_title}
                          </TableCell>
                          <TableCell>
                            <Badge variant={license.status === 'active' ? 'default' : license.status === 'expired' ? 'secondary' : 'outline'}>
                              {license.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{license.device_count}</TableCell>
                          <TableCell>{new Date(license.start).toLocaleDateString()}</TableCell>
                          <TableCell>{license.end ? new Date(license.end).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleShowEvents(license.uuid)}
                                >
                                  Events
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>License Events</DialogTitle>
                                </DialogHeader>
                                {eventsLoading && <p>Loading events...</p>}
                                {eventsError && (
                                  <Alert variant="destructive">
                                    <AlertDescription>
                                      Failed to load license events. Please try again.
                                    </AlertDescription>
                                  </Alert>
                                )}
                                {!eventsLoading && !eventsError && events && (
                                  <div className="mt-4">
                                    {events.length === 0 ? (
                                      <p className="text-muted-foreground">No events found for this license.</p>
                                    ) : (
                                      <div className="overflow-x-auto">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>Timestamp</TableHead>
                                              <TableHead>Type</TableHead>
                                              <TableHead>Device Name</TableHead>
                                              <TableHead>Device ID</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {events.map((event, index) => (
                                              <TableRow key={index}>
                                                <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                                                <TableCell>{event.type}</TableCell>
                                                <TableCell>{event.device_name || 'N/A'}</TableCell>
                                                <TableCell className="font-mono text-sm">{event.device_id || 'N/A'}</TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </div>
        )}
      </main>

      <DashboardFooter />
    </div>
  );
}