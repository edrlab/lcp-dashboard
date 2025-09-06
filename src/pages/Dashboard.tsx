import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { StatCard } from "@/components/dashboard/StatCard";
import { LicenseChart } from "@/components/dashboard/LicenseChart";
import { PublicationBreakdown } from "@/components/dashboard/PublicationBreakdown";

export default function Dashboard() {
  // Mock data - in real app this would come from API
  const dashboardData = {
    totalPublications: 2866,
    totalUsers: 102,
    licensesLast12Months: 15847,
    licensesLastWeek: 147,
    oldestLicenseDate: "March 15, 2019",
    totalLicensesSinceStart: 89234,
  };

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
          
          {/* License Metrics */}
          <StatCard
            title="Last 12 months"
            value={dashboardData.licensesLast12Months}
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
        </div>

        {/* Publication Breakdown */}
        <div className="mb-8">
          <PublicationBreakdown />
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