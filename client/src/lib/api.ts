// API Configuration and Service Layer
// In development with Vite proxy, use relative URLs
// In production or when VITE_API_URL is set, use the full URL
const API_BASE_URL = import.meta.env.DEV && !import.meta.env.VITE_API_URL 
  ? '' // Use relative URLs in dev (proxy will handle it)
  : (import.meta.env.VITE_API_URL || 'https://golazo.runasp.net');

export interface ApiError {
  message: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If parsing fails, use text response
        try {
          errorMessage = await response.text();
        } catch {
          // Keep statusText if everything fails
        }
      }
      
      const error: ApiError = {
        message: errorMessage,
        status: response.status
      };
      throw error;
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    return response.json();
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important for cookies
    };

    const response = await fetch(url, config);
    return this.handleResponse<T>(response);
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// API Service Functions
export const authApi = {
  register: (data: unknown) => apiClient.post('/api/auth/register', data),
  login: (data: unknown) => apiClient.post('/api/auth/login', data),
  logout: () => apiClient.post('/api/auth/logout'),
  getCurrentUser: () => apiClient.get('/api/auth/me'),
  updateProfile: (data: unknown) => apiClient.patch('/api/auth/me', data),
};

export const matchApi = {
  getAll: () => apiClient.get('/api/matches'),
  getById: (id: string | number) => apiClient.get(`/api/matches/${id}`),
  create: (data: unknown) => apiClient.post('/api/matches', data),
  update: (id: string | number, data: unknown) => apiClient.patch(`/api/matches/${id}`, data),
  delete: (id: string | number) => apiClient.delete(`/api/matches/${id}`),
};

export const stadiumApi = {
  getAll: () => apiClient.get('/api/stadiums'),
  getById: (id: string | number) => apiClient.get(`/api/stadiums/${id}`),
  create: (data: unknown) => apiClient.post('/api/stadiums', data),
  update: (id: string | number, data: unknown) => apiClient.patch(`/api/stadiums/${id}`, data),
  delete: (id: string | number) => apiClient.delete(`/api/stadiums/${id}`),
};

export const reservationApi = {
  getAll: () => apiClient.get('/api/reservations'),
  getById: (id: string | number) => apiClient.get(`/api/reservations/${id}`),
  create: (data: unknown) => apiClient.post('/api/reservations', data),
  cancel: (id: string | number) => apiClient.delete(`/api/reservations/${id}`),
};

export const userApi = {
  getAll: () => apiClient.get('/api/users'),
  getById: (id: string | number) => apiClient.get(`/api/users/${id}`),
  update: (id: string | number, data: unknown) => apiClient.patch(`/api/users/${id}`, data),
  delete: (id: string | number) => apiClient.delete(`/api/users/${id}`),
};
