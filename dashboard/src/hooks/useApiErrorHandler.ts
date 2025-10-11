import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/lib/apiService';

export const useApiErrorHandler = () => {
  const { handleTokenExpiration } = useAuth();

  const handleApiError = useCallback((error: unknown) => {
    if (error instanceof ApiError) {
      // Handle token expiration
      if (error.status === 401 && error.response?.code === 'TOKEN_EXPIRED') {
        handleTokenExpiration();
        return;
      }
      
      // Handle other 401 errors (invalid credentials, etc.)
      if (error.status === 401) {
        console.warn('Authentication error:', error.message);
        return;
      }
      
      // Handle other API errors
      console.error('API Error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }, [handleTokenExpiration]);

  return { handleApiError };
};