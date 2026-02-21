import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiService } from '@/lib/apiService';
import { API_CONFIG } from '@/lib/api';
import { LicenseInfo } from './useDashboardData';

const fetchUserLicenses = async (userIdentifier: string): Promise<LicenseInfo[]> => {
  if (!userIdentifier.trim()) {
    return [];
  }
  
  return apiService.get<LicenseInfo[]>(API_CONFIG.ENDPOINTS.USER_LICENSES_SEARCH(userIdentifier));
};

export const useUserLicenseSearch = (
  userIdentifier: string,
  options?: Partial<UseQueryOptions<LicenseInfo[], Error>>
) => {
  return useQuery({
    queryKey: ['user-licenses', userIdentifier],
    queryFn: () => fetchUserLicenses(userIdentifier),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: false, // Only run when explicitly triggered
    ...options,
  });
};