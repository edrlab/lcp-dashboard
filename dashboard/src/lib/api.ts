// API configuration
export const API_CONFIG = {
  // During development, use relative URLs to go through the Vite proxy
  // In production, use VITE_API_BASE_URL or an empty string by default
  BASE_URL: import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || ''),
  ENDPOINTS: {
    LOGIN: '/dashdata/login',
    DASHBOARD: '/dashdata/data',
    OVERSHARED_LICENSES: '/dashdata/overshared',
    REVOKE_LICENSE: (licenseId: string) => `/dashdata/revoke/${licenseId}`,
    PUBLICATIONS: (page: number = 1, perPage: number = 20) => `/dashdata/publications?page=${page}&per_page=${perPage}`,
    DELETE_PUBLICATION: (uuid: string) => `/dashdata/publications/${uuid}`,
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function for authenticated API calls
export const createAuthenticatedFetch = (token: string) => {
  return (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  };
};