/**
 * Frontend Environment Configuration
 * Centralized config management with environment awareness
 */

const getEnvVariable = (key, defaultValue = '') => {
  if (typeof window !== 'undefined' && window._env_) {
    return window._env_[key] || defaultValue;
  }
  return process.env[key] || defaultValue;
};

const config = {
  // Application
  app: {
    name: getEnvVariable('REACT_APP_NAME', 'Stock Analyzer'),
    version: getEnvVariable('REACT_APP_VERSION', '1.0.0'),
    environment: getEnvVariable('REACT_APP_ENVIRONMENT', 'development'),
  },

  // API Endpoints
  api: {
    baseUrl: getEnvVariable('REACT_APP_API_URL', 'http://localhost:8000'),
    mlServiceUrl: getEnvVariable('REACT_APP_ML_API_URL', 'http://localhost:5001'),
    timeout: parseInt(getEnvVariable('REACT_APP_API_TIMEOUT', '30000'), 10),
  },

  // External APIs
  externalApis: {
    finnhubKey: getEnvVariable('REACT_APP_FINNHUB_API_KEY', ''),
    alphaVantageKey: getEnvVariable('REACT_APP_ALPHA_VANTAGE_API_KEY', ''),
  },

  // Feature Flags
  features: {
    enablePrediction: getEnvVariable('REACT_APP_ENABLE_PREDICTION', 'true') === 'true',
    enablePortfolio: getEnvVariable('REACT_APP_ENABLE_PORTFOLIO', 'true') === 'true',
    enableAnalysis: getEnvVariable('REACT_APP_ENABLE_ANALYSIS', 'true') === 'true',
    debugMode: getEnvVariable('REACT_APP_DEBUG', 'false') === 'true',
  },

  // Caching
  cache: {
    quoteTtl: parseInt(getEnvVariable('REACT_APP_QUOTE_CACHE_TTL', '60000'), 10),
    profileTtl: parseInt(getEnvVariable('REACT_APP_PROFILE_CACHE_TTL', '3600000'), 10),
    newsTtl: parseInt(getEnvVariable('REACT_APP_NEWS_CACHE_TTL', '900000'), 10),
  },
};

// Validate required configuration in production
if (config.app.environment === 'production') {
  const requiredVars = ['REACT_APP_API_URL'];
  const missing = requiredVars.filter(key => !getEnvVariable(key));
  if (missing.length > 0) {
    console.warn(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export default config;
