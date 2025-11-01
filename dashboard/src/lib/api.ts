// API configuration
export const API_CONFIG = {
  // En développement, utiliser des URLs relatives pour passer par le proxy Vite
  // En production, utiliser l'URL complète de l'API
  BASE_URL: import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'),
  ENDPOINTS: {
    LOGIN: '/dashboard/login',
    DASHBOARD: '/dashboard/data',
    OVERSHARED_LICENSES: '/dashboard/overshared',
    REVOKE_LICENSE: (licenseId: string) => `/dashboard/revoke/${licenseId}`,
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