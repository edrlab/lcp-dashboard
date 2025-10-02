import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { StatCard } from "@/components/dashboard/StatCard";
import { LicenseChart } from "@/components/dashboard/LicenseChart";
import { PublicationBreakdown } from "@/components/dashboard/PublicationBreakdown";
import { LicenseStatusBreakdown } from "@/components/dashboard/LicenseStatusBreakdown";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: dashboardData, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-80 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
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
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load dashboard data. Please try again later.
            </AlertDescription>
          </Alert>
        </main>
        <DashboardFooter />
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Publications */}
          <StatCard
            title="Total Publications"
            value={dashboardData.totalPublications}
            className="lg:col-span-1"
          />
          
          {/* Total Users */}
          <StatCard
            title="Total Users"
            value={dashboardData.totalUsers}
            className="lg:col-span-1"
          />
          
          {/* Total Licenses */}
          <StatCard
            title="Total Licenses"
            value={dashboardData.totalLicenses}
            className="lg:col-span-1"
          />
          
          {/* License Metrics */}
          <StatCard
            title="Last 12 months"
            value={dashboardData.licensesLast12Months}
            subtitle="licenses generated"
            trend="up"
            className="lg:col-span-1"
          />
          
          <StatCard
            title="Last Month"
            value={dashboardData.licensesLastMonth}
            subtitle="licenses generated"
            trend="up"
            className="lg:col-span-1"
          />
          
          <StatCard
            title="Last week"
            value={dashboardData.licensesLastWeek}
            subtitle="licenses generated"
            trend="up"
            className="lg:col-span-1"
          />
          
          <StatCard
            title="Last Day"
            value={dashboardData.licensesLastDay}
            subtitle="licenses generated"
            trend="up"
            className="lg:col-span-1"
          />
          
          {/* Overshared Licenses with Link */}
          <div className="lg:col-span-1">
            <StatCard
              title="Overshared Licenses"
              value={dashboardData.oversharedLicensesCount}
              className="h-full"
            />
            <Link to="/overshared-licenses">
              <Button variant="link" className="mt-2 px-0 text-primary hover:text-primary/80">
                Check
              </Button>
            </Link>
          </div>
        </div>

        {/* Breakdown Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PublicationBreakdown />
          <LicenseStatusBreakdown />
        </div>

        {/* License Trends Chart */}
        <div className="mb-8">
          <LicenseChart />
        </div>

        {/* Historical Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Oldest License Generated"
            value={dashboardData.oldestLicenseDate}
            subtitle="First license on record"
            className="text-left"
          />
          
          <StatCard
            title="Total Licenses"
            value={dashboardData.totalLicensesSinceStart}
            subtitle="Since inception"
            trend="neutral"
          />
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}