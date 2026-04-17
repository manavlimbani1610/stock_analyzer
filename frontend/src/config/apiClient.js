/**
 * API Service Configuration
 * Centralized API client with error handling and retry logic
 */

import axios from 'axios';
import config from './environment';

// Create axios instance with defaults
const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (requestConfig) => {
    // Add request ID for tracking
    requestConfig.headers['X-Request-ID'] = generateRequestId();

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      requestConfig.headers['Authorization'] = `Bearer ${token}`;
    }

    if (config.features.debugMode) {
      console.log(`[API Request] ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`);
    }

    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    if (config.features.debugMode) {
      console.log(`[API Response] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Clear token and redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle 429 - Rate Limited
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 5;
      console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
      // Could implement automatic retry here
    }

    // Log errors in debug mode
    if (config.features.debugMode) {
      console.error('[API Error]', {
        url: originalRequest.url,
        status: error.response?.status,
        message: error.message,
      });
    }

    return Promise.reject(error);
  }
);

// Generate unique request ID
function generateRequestId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Export configured client
export default apiClient;

// Export helper methods
export const api = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data, config = {}) => apiClient.post(url, data, config),
  put: (url, data, config = {}) => apiClient.put(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
};
