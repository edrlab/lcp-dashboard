import { DashboardData } from '@/hooks/useDashboardData';

// Mock data for development
export const mockDashboardData: DashboardData = {
  totalPublications: 2866,
  totalUsers: 428,
  licensesLast12Months: 6824,
  licensesLastWeek: 127,
  oldestLicenseDate: "2022-01-15",
  totalLicensesSinceStart: 89234,
  publicationTypes: [
    { name: "EPUB", count: 1284 },
    { name: "PDF", count: 892 },
    { name: "Audiobooks", count: 456 },
    { name: "Comics", count: 234 },
  ],
  licenseStatuses: [
    { name: "Ready", count: 45632 },
    { name: "Active", count: 28456 },
    { name: "Expired", count: 12834 },
    { name: "Revoked", count: 1856 },
    { name: "Canceled", count: 456 },
  ],
  chartData: [
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
  ],
};