import { useQuery } from '@tanstack/react-query';

export interface DashboardData {
  totalPublications: number;
  totalUsers: number;
  licensesLast12Months: number;
  licensesLastWeek: number;
  oldestLicenseDate: string;
  totalLicensesSinceStart: number;
}

const fetchDashboardData = async (): Promise<DashboardData> => {
  // Replace with your actual API endpoint
  const response = await fetch('/api/dashboard');
  
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  
  return response.json();
};

export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};