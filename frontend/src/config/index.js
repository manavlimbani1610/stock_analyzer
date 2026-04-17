/**
 * Frontend Configuration
 * Environment-based configuration for API endpoints
 */

const config = {
  // API Base URLs
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  mlApiUrl: process.env.REACT_APP_ML_API_URL || 'http://localhost:5001',
  
  // Environment
  environment: process.env.REACT_APP_ENVIRONMENT || 'development',
  debug: process.env.REACT_APP_DEBUG === 'true',
  
  // External APIs
  finnhubApiKey: process.env.REACT_APP_FINNHUB_API_KEY || '',
  alphaVantageApiKey: process.env.REACT_APP_ALPHA_VANTAGE_API_KEY || '',
  
  // Feature flags
  enablePrediction: process.env.REACT_APP_ENABLE_PREDICTION !== 'false',
  enablePortfolio: process.env.REACT_APP_ENABLE_PORTFOLIO !== 'false',
  enableAnalysis: process.env.REACT_APP_ENABLE_ANALYSIS !== 'false',
  
  // Cache TTL (milliseconds)
  quoteCacheTTL: parseInt(process.env.REACT_APP_QUOTE_CACHE_TTL || '60000'),
  profileCacheTTL: parseInt(process.env.REACT_APP_PROFILE_CACHE_TTL || '3600000'),
  newsCacheTTL: parseInt(process.env.REACT_APP_NEWS_CACHE_TTL || '900000'),
  
  // API timeout
  apiTimeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000'),
};

export default config;
