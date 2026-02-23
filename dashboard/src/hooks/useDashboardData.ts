import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/apiService';
import { API_CONFIG } from '@/lib/api';
import { mockDashboardData } from '@/lib/mockData';
import { useApiErrorHandler } from './useApiErrorHandler';

export interface PublicationType {
  name: string;
  count: number;
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

export interface LicenseStatus {
  name: string;
  count: number;
}

export interface ChartDataPoint {
  month: string;
  licenses: number;
}

export interface LicenseInfo {
  CreatedAt: string;
  UpdatedAt: string;
  uuid: string;
  provider?: string;
  user_id: string;
  start: string;
  end: string;
  max_end?: string;
  copy: number;
  print: number;
  status: string;
  device_count: number;
  publication_id: string;
  publication_title: string;
}

export interface Event {
  timestamp: string;
  type: string;
  device_name: string;
  device_id: string;
}

export interface OversharedLicense {
  id: string;
  publication_id: string;
  alt_id: string;
  title: string;
  user_id: string;
  user_email: string;
  type: "loan" | "buy";
  status: "ready" | "active" | "expired";
  devices: number;
}

export interface DashboardData {
  total_publications: number;
  total_users: number;
  total_licenses: number;
  licenses_last_12_months: number;
  licenses_last_month: number;
  licenses_last_week: number;
  licenses_last_day: number;
  oldest_license_date: string;
  latest_license_date: string;
  overshared_licenses_count: number;
  publication_types: PublicationType[];
  license_statuses: LicenseStatus[];
  chart_data: ChartDataPoint[];
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