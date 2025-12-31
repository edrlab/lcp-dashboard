import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService, ApiError } from '@/lib/apiService';
import { API_CONFIG } from '@/lib/api';

// Safe localStorage utilities
const safeLocalStorageGet = (key: string): string | null => {
  try {
    const value = localStorage.getItem(key);
    return (value && value !== 'undefined' && value !== 'null') ? value : null;
  } catch {
    return null;
  }
};

const safeLocalStorageSet = (key: string, value: string): void => {
  try {
    if (value && value !== 'undefined' && value !== 'null') {
      localStorage.setItem(key, value);
    }
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error);
  }
};

const safeLocalStorageRemove = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove ${key} from localStorage:`, error);
  }
};

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  handleTokenExpiration: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If using mock data, simulate an authenticated user
    const shouldUseMockData = (typeof __USE_MOCK_DATA__ !== 'undefined' && __USE_MOCK_DATA__) || 
                              import.meta.env.VITE_USE_MOCK_DATA === 'true';
    
    if (shouldUseMockData) {
      const mockUser = {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User'
      };
      const mockToken = 'mock-jwt-token-12345';
      
      setUser(mockUser);
      setToken(mockToken);
      setIsLoading(false);
      return;
    }

    // Check for existing token on mount (real auth mode)
    const storedToken = safeLocalStorageGet('auth_token');
    const storedUser = safeLocalStorageGet('auth_user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === 'object' && parsedUser.id) {
          setToken(storedToken);
          setUser(parsedUser);
        } else {
          // Invalid user object structure
          safeLocalStorageRemove('auth_token');
          safeLocalStorageRemove('auth_user');
        }
      } catch (error) {
        // Invalid JSON in localStorage, clear it
        console.warn('Invalid user data in localStorage, clearing...');
        safeLocalStorageRemove('auth_token');
        safeLocalStorageRemove('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // If using mock data, simulate successful login
      if (typeof __USE_MOCK_DATA__ !== 'undefined' && __USE_MOCK_DATA__) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Simulate basic validation (optional)
        if (!username || !password) {
          return { success: false, error: 'Please fill in all fields' };
        }
        
        const mockUser = {
          id: '1',
          email: username.includes('@') ? username : `${username}@example.com`,
          name: username.charAt(0).toUpperCase() + username.slice(1)
        };
        const mockToken = 'mock-jwt-token-12345';
        
        // Store mock data (optional, for consistency)
        safeLocalStorageSet('auth_token', mockToken);
        safeLocalStorageSet('auth_user', JSON.stringify(mockUser));
        
        setToken(mockToken);
        setUser(mockUser);
        
        return { success: true };
      }

      // Real authentication mode (no mock data)
      const apiUrl = import.meta.env.DEV 
        ? API_CONFIG.ENDPOINTS.LOGIN  // relative URL during dev (Vite proxy)
        : `${import.meta.env.VITE_API_BASE_URL || ''}${API_CONFIG.ENDPOINTS.LOGIN}`;
      
      console.log('Logging in to API URL:', apiUrl); // Debug log
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        // Gestion spécifique pour les erreurs d'authentification
        if (response.status === 401) {
          return { success: false, error: 'Invalid username or password' };
        }
        
        // Tentative de récupération du message d'erreur du serveur
        try {
          const errorData = await response.json();
          return { success: false, error: errorData.message || 'Login failed' };
        } catch {
          // Si impossible de parser la réponse JSON, utiliser un message générique
          return { success: false, error: 'Login failed' };
        }
      }

      const data = await response.json();
      const { token, user } = data;

      // Store token and user data
      safeLocalStorageSet('auth_token', token);
      safeLocalStorageSet('auth_user', JSON.stringify(user));
      
      setToken(token);
      setUser(user);

      return { success: true };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Login error:', error);
      }
      
      if (error instanceof ApiError) {
        return { success: false, error: error.message };
      }
      
      // Gestion plus spécifique des erreurs
      if (error instanceof TypeError) {
        // Erreurs réseau, fetch failed, etc.
        return { success: false, error: 'Unable to connect to server. Please check your connection.' };
      }
      
      if (error instanceof SyntaxError) {
        // Erreurs de parsing JSON
        return { success: false, error: 'Server returned invalid response. Please try again.' };
      }
      
      // Erreur générique pour tout le reste
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: `Network error: ${errorMessage}` };
    }
  };

  const logout = () => {
    // In mock mode, still allow logout but user will be auto-logged back in on refresh
    safeLocalStorageRemove('auth_token');
    safeLocalStorageRemove('auth_user');
    setToken(null);
    setUser(null);
  };

  const handleTokenExpiration = () => {
    // Clear authentication state
    safeLocalStorageRemove('auth_token');
    safeLocalStorageRemove('auth_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, handleTokenExpiration, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};