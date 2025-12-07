/**
 * API Configuration
 * Centralized configuration for API endpoints and environment settings
 */

interface ApiConfig {
  baseURL: string;
  socketURL: string;
  timeout: number;
}

/**
 * Get the API configuration based on environment variables
 * 
 * Environment Variables:
 * - VITE_API_BASE_URL: Base URL for API requests (default: http://localhost:5000)
 * - VITE_SOCKET_URL: WebSocket server URL (default: same as API base URL)
 */
export function getApiConfig(): ApiConfig {
  // In production, use the current origin; in development, use the env var or localhost
  const defaultBaseURL = "https://golazo.runasp.net/api/v1"
   
    console.log("enta feen: ", defaultBaseURL) 

  const baseURL = import.meta.env.VITE_API_BASE_URL || defaultBaseURL;
  const socketURL = import.meta.env.VITE_SOCKET_URL || baseURL;

  return {
    baseURL,
    socketURL,
    timeout: 10000, // 10 seconds
  };
}

/**
 * Get the full API URL for a given endpoint
 * @param endpoint - API endpoint path (e.g., '/api/auth/login')
 * @returns Full URL including base URL
 */
export function getApiUrl(endpoint: string): string {
  const config = getApiConfig();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  console.log("Base: ", config.baseURL)
  return `${config.baseURL}${cleanEndpoint}`;
}

/**
 * Get the socket server URL
 */
export function getSocketUrl(): string {
  return getApiConfig().socketURL;
}
