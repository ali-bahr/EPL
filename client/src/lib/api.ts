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
        errorMessage = errorData.message || errorData.error || errorData.title || errorMessage;
      } catch {
        // If parsing fails, use text response
        try {
          const textError = await response.text();
          if (textError) errorMessage = textError;
        } catch {
          // Keep statusText if everything fails
        }
      }
      
      console.error('API Error:', {
        status: response.status,
        message: errorMessage,
        url: response.url
      });
      
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

    console.log('API Request:', options.method || 'GET', url);
    
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
  register: (data: unknown) => apiClient.post('/api/v1/Auth/signup-fan', data),
  login: (data: unknown) => apiClient.post('/api/v1/Auth/login', data),
  logout: () => apiClient.post('/api/v1/Auth/logout'),
  getCurrentUser: () => apiClient.get('/api/v1/User'),
  updateProfile: (data: unknown) => apiClient.patch('/api/v1/User', data),
};

export const matchApi = {
  getAll: () => apiClient.get('/api/v1/Match'),
  getById: (id: string | number) => apiClient.get(`/api/v1/Match/${id}`),
  create: (data: unknown) => apiClient.post('/api/v1/Match', data),
  update: (id: string | number, data: unknown) => apiClient.patch(`/api/v1/Match/${id}`, data),
  delete: (id: string | number) => apiClient.delete(`/api/v1/Match/${id}`),
};

export const stadiumApi = {
  getAll: () => apiClient.get('/api/v1/Stadium'),
  getById: (id: string | number) => apiClient.get(`/api/v1/Stadium/${id}`),
  create: (data: unknown) => apiClient.post('/api/v1/Stadium', data),
  update: (id: string | number, data: unknown) => apiClient.patch(`/api/v1/Stadium/${id}`, data),
  delete: (id: string | number) => apiClient.delete(`/api/v1/Stadium/${id}`),
};

export const reservationApi = {
  getAll: () => apiClient.get('/api/v1/Reservation'),
  getById: (id: string | number) => apiClient.get(`/api/v1/Reservation/${id}`),
  create: (data: unknown) => apiClient.post('/api/v1/Reservation', data),
  cancel: (id: string | number) => apiClient.delete(`/api/v1/Reservation/${id}`),
};

export const userApi = {
  getAll: () => apiClient.get('/api/v1/User'),
  getById: (id: string | number) => apiClient.get(`/api/v1/User/${id}`),
  update: (id: string | number, data: unknown) => apiClient.patch(`/api/v1/User/${id}`, data),
  delete: (id: string | number) => apiClient.delete(`/api/v1/User/${id}`),
};

export const teamApi = {
  getAll: () => apiClient.get('/api/v1/Team'),
  getById: (id: string | number) => apiClient.get(`/api/v1/Team/${id}`),
  create: (data: unknown) => apiClient.post('/api/v1/Team', data),
  update: (id: string | number, data: unknown) => apiClient.patch(`/api/v1/Team/${id}`, data),
  delete: (id: string | number) => apiClient.delete(`/api/v1/Team/${id}`),
};

export const refereeApi = {
  getAll: () => apiClient.get('/api/v1/Referee'),
  getById: (id: string | number) => apiClient.get(`/api/v1/Referee/${id}`),
  create: (data: unknown) => apiClient.post('/api/v1/Referee', data),
  update: (id: string | number, data: unknown) => apiClient.patch(`/api/v1/Referee/${id}`, data),
  delete: (id: string | number) => apiClient.delete(`/api/v1/Referee/${id}`),
};

export const adminApi = {
  getAllUsers: (pageIndex = 1, pageSize = 10) => 
    apiClient.get(`/api/v1/AdminContorller/users?pageIndex=${pageIndex}&pageSize=${pageSize}`),
  getUnconfirmedAccounts: (pageIndex = 1, pageSize = 10) => 
    apiClient.get(`/api/v1/AdminContorller/unconfirmed-accounts?pageIndex=${pageIndex}&pageSize=${pageSize}`),
  confirmAccount: (id: string) => apiClient.patch(`/api/v1/AdminContorller/confirm-account/${id}`),
  rejectAccount: (id: string) => apiClient.patch(`/api/v1/AdminContorller/reject-account/${id}`),
  deleteUser: (id: string) => apiClient.delete(`/api/v1/AdminContorller/users/${id}`),
};
