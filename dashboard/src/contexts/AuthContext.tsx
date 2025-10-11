import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService, ApiError } from '@/lib/apiService';
import { API_CONFIG } from '@/lib/api';

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
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
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
        localStorage.setItem('auth_token', mockToken);
        localStorage.setItem('auth_user', JSON.stringify(mockUser));
        
        setToken(mockToken);
        setUser(mockUser);
        
        return { success: true };
      }

      // Real authentication mode
      const apiUrl = import.meta.env.DEV 
        ? API_CONFIG.ENDPOINTS.LOGIN  // URL relative en dev (proxy Vite)
        : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${API_CONFIG.ENDPOINTS.LOGIN}`;
      
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
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      
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
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  };

  const handleTokenExpiration = () => {
    // Clear authentication state
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, handleTokenExpiration, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};