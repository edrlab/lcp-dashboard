import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/apiService';
import { API_CONFIG } from '@/lib/api';
import { mockDashboardData } from '@/lib/mockData';
import { useApiErrorHandler } from './useApiErrorHandler';

export interface PublicationType {
  name: string;
  count: number;
}

export interface LicenseStatus {
  name: string;
  count: number;
}

export interface ChartDataPoint {
  month: string;
  licenses: number;
}

export interface OversharedLicense {
  id: string;
  publicationId: string;
  altId: string;
  title: string;
  userId: string;
  userEmail: string;
  type: "loan" | "buy";
  status: "ready" | "active" | "expired";
  devices: number;
}

export interface Publication {
  created_at: string;
  provider?: string;
  uuid: string;
  alt_id?: string;
  content_type: string;
  title: string;
  description?: string;
  authors?: string;
  publishers?: string;
  cover_url?: string;
  encryption_key: number[];
  href: string;
  size: number;
  checksum: string;
}

export interface DashboardData {
  totalPublications: number;
  totalUsers: number;
  totalLicenses: number;
  licensesLast12Months: number;
  licensesLastMonth: number;
  licensesLastWeek: number;
  licensesLastDay: number;
  oldestLicenseDate: string;
  latestLicenseDate: string;
  oversharedLicensesCount: number;
  publicationTypes: PublicationType[];
  licenseStatuses: LicenseStatus[];
  chartData: ChartDataPoint[];
}

const fetchDashboardData = async (): Promise<DashboardData> => {
  // Use mock data if the flag is set
  if (typeof __USE_MOCK_DATA__ !== 'undefined' && __USE_MOCK_DATA__) {
    // Simulate API delay for realistic development experience
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockDashboardData;
  }
  
  return apiService.get<DashboardData>(API_CONFIG.ENDPOINTS.DASHBOARD);
};

export const useDashboardData = () => {
  const { handleApiError } = useApiErrorHandler();
  
  const result = useQuery({
    queryKey: ['dashboard', __USE_MOCK_DATA__ ? 'mock' : 'api'],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof Error && error.message.includes('401')) {
        handleApiError(error);
        return false;
      }
      return failureCount < 3;
    },
  });

  // Handle errors when they occur
  if (result.error) {
    handleApiError(result.error);
  }

  return result;
};