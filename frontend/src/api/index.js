/**
 * API Service Layer
 * Centralized API client for backend communication
 */

import axios from 'axios';
import config from '../config';

// Create axios instance with defaults
const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (request) => {
    if (config.debug) {
      console.log(`[API] ${request.method?.toUpperCase()} ${request.url}`);
    }
    return request;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (config.debug) {
      console.error('[API Error]', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

// API methods
export const api = {
  // Health
  health: () => apiClient.get('/health'),
  ready: () => apiClient.get('/ready'),
  
  // Stocks
  getQuote: (ticker) => apiClient.get(`/api/v1/stocks/quote/${ticker}`),
  getProfile: (ticker) => apiClient.get(`/api/v1/stocks/profile/${ticker}`),
  searchStocks: (query) => apiClient.get('/api/v1/stocks/search', { params: { q: query } }),
  
  // Predictions
  getPrediction: (ticker, days = 30) => 
    apiClient.get(`/api/v1/predictions/predict/${ticker}`, { params: { days } }),
  getModels: () => apiClient.get('/api/v1/predictions/models'),
  trainModel: (ticker) => apiClient.post(`/api/v1/predictions/train/${ticker}`),
};

export default api;
