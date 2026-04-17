// src/context/StockContext.jsx
import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import stockApi from '../services/stockApi';
import { calculateAllIndicators } from '../services/technicalIndicators';

const StockContext = createContext();

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within StockProvider');
  }
  return context;
};

export const StockProvider = ({ children }) => {
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [stockData, setStockData] = useState(null);
  const [quote, setQuote] = useState(null);
  const [profile, setProfile] = useState(null);
  const [news, setNews] = useState([]);
  const [timeframe, setTimeframe] = useState('1mo');
  const [loading, setLoading] = useState(true); // Start with true
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const fetchTimerRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Initialize with mock data immediately, then fetch real data
  useEffect(() => {
    // Set mock data immediately so UI doesn't hang
    const mockQuote = {
      symbol: 'AAPL',
      price: 175.50,
      change: 2.30,
      changePercent: 1.33,
      high: 176.20,
      low: 174.80,
      volume: 75000000,
      timestamp: new Date().toISOString()
    };
    
    const mockHistorical = stockApi.generateMockData('AAPL', '1mo');
    const enhancedData = calculateAllIndicators(mockHistorical);
    
    setQuote(mockQuote);
    setStockData(enhancedData);
    setSelectedStock('AAPL');
    setLoading(false);
    setIsInitialized(true);
    
    // Then fetch real data in background
    fetchStockData('AAPL', '1mo', true);
  }, []);

  const fetchStockData = useCallback(async (symbol = selectedStock, period = timeframe, isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    setError(null);
    
    try {
      console.log(`🔍 Fetching stock data for ${symbol}...`);
      
      let completeData;
      try {
        completeData = await stockApi.getCompleteStockData(symbol, period);
      } catch (apiError) {
        console.warn('API fetch failed, using mock data:', apiError);
        // Create mock data as fallback
        completeData = {
          quote: stockApi.getMockQuote(symbol),
          profile: stockApi.getMockCompanyProfile(symbol),
          historical: stockApi.generateMockData(symbol, period),
          news: stockApi.generateMockNews(symbol),
          financials: null
        };
      }
      
      if (!isMounted.current) return;
      
      // Calculate technical indicators
      const historicalData = completeData.historical || [];
      const enhancedData = calculateAllIndicators(historicalData);
      
      // Extract indicator data
      const rsi = enhancedData.filter(d => d.rsi).map(d => ({ date: d.date, rsi: d.rsi }));
      const macd = enhancedData.filter(d => d.macd).map(d => ({ 
        date: d.date, 
        macd: d.macd, 
        signal: d.signal,
        histogram: d.histogram 
      }));
      const bb = enhancedData.filter(d => d.upperBand).map(d => ({
        date: d.date,
        upper: d.upperBand,
        middle: d.sma,
        lower: d.lowerBand,
        price: d.close
      }));

      // Update state in a single batch
      setSelectedStock(symbol);
      setTimeframe(period);
      setQuote(completeData.quote);
      setProfile(completeData.profile);
      setStockData(enhancedData);
      setNews(completeData.news || []);
      setRsiData(rsi);
      setMacdData(macd);
      setBbData(bb);
      
      console.log(`✅ Successfully loaded ${symbol}`);
    } catch (err) {
      console.error('❌ Error fetching stock data:', err);
      if (isMounted.current) {
        setError(err.message || 'Failed to fetch stock data');
      }
    } finally {
      if (isMounted.current && !isBackground) {
        setLoading(false);
      }
    }
  }, [selectedStock, timeframe]);

  const [indicators, setIndicators] = useState({
    rsi: true,
    macd: true,
    bollinger: true,
    movingAverage: true,
  });
  
  const [rsiData, setRsiData] = useState([]);
  const [macdData, setMacdData] = useState([]);
  const [bbData, setBbData] = useState([]);

  const toggleIndicator = useCallback((indicator, value) => {
    setIndicators(prev => ({
      ...prev,
      [indicator]: value,
    }));
  }, []);

  // Quick Actions
  const quickActions = {
    addToPortfolio: (stock) => {
      console.log('Adding to portfolio:', stock);
    },
    compareStocks: () => {
      console.log('Navigating to stock comparison');
    },
    exportData: (symbol) => {
      console.log('Exporting data for:', symbol);
    },
    setAlert: (stock, price) => {
      console.log('Setting alert for:', stock, 'at price:', price);
    },
    addToWatchlist: (stock) => {
      console.log('Adding to watchlist:', stock);
    },
    shareAnalysis: (stock) => {
      console.log('Sharing analysis for:', stock);
    }
  };

  const value = {
    selectedStock,
    stockData,
    quote,
    profile,
    news,
    timeframe,
    loading,
    error,
    indicators,
    rsiData,
    macdData,
    bbData,
    setSelectedStock,
    setTimeframe,
    fetchStockData,
    toggleIndicator,
    quickActions,
    isInitialized,
  };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
};

StockProvider.propTypes = {
  children: PropTypes.node.isRequired,
};