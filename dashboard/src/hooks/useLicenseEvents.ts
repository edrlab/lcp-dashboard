import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiService } from '@/lib/apiService';
import { API_CONFIG } from '@/lib/api';
import { Event } from './useDashboardData';

const fetchLicenseEvents = async (licenseId: string): Promise<Event[]> => {
  if (!licenseId.trim()) {
    return [];
  }
  
  return apiService.get<Event[]>(API_CONFIG.ENDPOINTS.LICENSE_EVENTS(licenseId));
};

export const useLicenseEvents = (
  licenseId: string,
  options?: Partial<UseQueryOptions<Event[], Error>>
) => {
  return useQuery({
    queryKey: ['license-events', licenseId],
    queryFn: () => fetchLicenseEvents(licenseId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: false, // Only run when explicitly triggered
    ...options,
  });
};