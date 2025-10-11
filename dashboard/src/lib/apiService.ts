import { buildApiUrl, API_CONFIG } from './api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}`;
      let errorCode: string | undefined;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        errorCode = errorData.code;
      } catch {
        // Ignore JSON parsing errors, use default message
      }
      
      // Handle token expiration specifically
      if (response.status === 401 && errorCode === 'TOKEN_EXPIRED') {
        // Clear stored authentication data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        
        // Redirect to login page with expired parameter
        window.location.href = '/login?expired=true';
        
        throw new ApiError('Your session has expired. Please log in again.', response.status, { code: errorCode });
      }
      
      throw new ApiError(errorMessage, response.status, { code: errorCode });
    }

    try {
      return await response.json();
    } catch {
      // Return empty object if no JSON content
      return {} as T;
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(buildApiUrl(endpoint), {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(buildApiUrl(endpoint), {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(buildApiUrl(endpoint), {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(buildApiUrl(endpoint), {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<T>(response);
  }
}

export const apiService = new ApiService();