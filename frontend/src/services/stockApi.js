// src/services/stockApi.js
import axios from 'axios';

class StockAPI {
  constructor() {
    this.cache = new Map();
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
    
    // ✅ YOUR FINNHUB API KEY - ACTIVATED
    this.finnhubKey = 'd666ef1r01qssgeclsr0d666ef1r01qssgeclsrg';
    this.alphaVantageKey = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;
    
    // API Base URLs
    this.finnhubBase = 'https://finnhub.io/api/v1';
    this.alphaVantageBase = 'https://www.alphavantage.co/query';
    
    console.log('✅ Finnhub API initialized with key:', this.finnhubKey.substring(0, 10) + '...');
  }

  // ============ PRIMARY API: FINNHUB (YOUR ACTIVE KEY) ============

  // 🟢 Get Real-time Quote (60 calls/min)
  async getRealTimeQuote(symbol) {
    const cacheKey = `quote-${symbol}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 60000) { // 1 minute cache
      console.log(`📊 Returning cached quote for ${symbol}`);
      return cached.data;
    }

    try {
      console.log(`🔄 Fetching real-time quote for ${symbol}...`);
      
      const response = await axios.get(`${this.finnhubBase}/quote`, {
        params: {
          symbol: symbol.toUpperCase(),
          token: this.finnhubKey
        }
      });

      if (!response.data || response.data.c === 0) {
        throw new Error('Invalid response from Finnhub');
      }

      const data = {
        symbol: symbol.toUpperCase(),
        price: response.data.c,
        change: response.data.d,
        changePercent: response.data.dp,
        high: response.data.h,
        low: response.data.l,
        open: response.data.o,
        previousClose: response.data.pc,
        timestamp: new Date().toISOString()
      };

      console.log(`✅ Quote fetched for ${symbol}: $${data.price}`);
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('❌ Error fetching real-time quote:', error.message);
      return this.getMockQuote(symbol);
    }
  }

  // 🟢 Get Company Profile (60 calls/min)
  async getCompanyProfile(symbol) {
    const cacheKey = `profile-${symbol}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour cache
      return cached.data;
    }

    try {
      console.log(`🏢 Fetching company profile for ${symbol}...`);
      
      const response = await axios.get(`${this.finnhubBase}/stock/profile2`, {
        params: {
          symbol: symbol.toUpperCase(),
          token: this.finnhubKey
        }
      });

      if (!response.data || !response.data.name) {
        throw new Error('Company profile not found');
      }

      const data = {
        name: response.data.name || `${symbol} Inc.`,
        description: response.data.description || `A leading company in its sector.`,
        ticker: response.data.ticker || symbol,
        marketCap: response.data.marketCapitalization || 1000000000,
        shareOutstanding: response.data.shareOutstanding || 1000000000,
        ipo: response.data.ipo || '1980-01-01',
        logo: response.data.logo || '',
        weburl: response.data.weburl || `https://www.${symbol.toLowerCase()}.com`,
        phone: response.data.phone || '+1-800-555-5555',
        industry: response.data.finnhubIndustry || 'Technology',
        sector: this.getSectorFromIndustry(response.data.finnhubIndustry) || 'Technology',
        exchange: response.data.exchange || 'NASDAQ'
      };

      console.log(`✅ Company profile fetched for ${data.name}`);
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('❌ Error fetching company profile:', error.message);
      return this.getMockCompanyProfile(symbol);
    }
  }

  // 🟢 Get Company News (60 calls/min)
  async getCompanyNews(symbol) {
    const cacheKey = `news-${symbol}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 900000) { // 15 minutes cache
      return cached.data;
    }

    try {
      console.log(`📰 Fetching news for ${symbol}...`);

      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 30);

      const response = await axios.get(`${this.finnhubBase}/company-news`, {
        params: {
          symbol: symbol.toUpperCase(),
          from: from.toISOString().split('T')[0],
          to: to.toISOString().split('T')[0],
          token: this.finnhubKey
        }
      });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid news response');
      }

      const data = response.data
        .filter(article => article.headline && article.url)
        .slice(0, 10)
        .map(article => ({
          id: article.id || Date.now() + Math.random(),
          title: article.headline,
          description: article.summary || article.headline,
          url: article.url,
          imageUrl: article.image || null,
          publishedAt: new Date(article.datetime * 1000).toISOString(),
          source: article.source || 'Finnhub',
          sentiment: article.sentiment || 'neutral',
          category: article.category || 'company'
        }));

      console.log(`✅ ${data.length} news articles fetched for ${symbol}`);
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('❌ Error fetching company news:', error.message);
      return this.generateMockNews(symbol);
    }
  }

  // 🟢 Get Market News (60 calls/min)
  async getMarketNews(category = 'general') {
    const cacheKey = `market-news-${category}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 900000) {
      return cached.data;
    }

    try {
      console.log(`🌍 Fetching ${category} market news...`);
      
      const response = await axios.get(`${this.finnhubBase}/news`, {
        params: {
          category,
          token: this.finnhubKey
        }
      });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid market news response');
      }

      const data = response.data
        .filter(article => article.headline)
        .slice(0, 10)
        .map(article => ({
          id: article.id || Date.now() + Math.random(),
          title: article.headline,
          description: article.summary || article.headline,
          url: article.url,
          imageUrl: article.image || null,
          publishedAt: new Date(article.datetime * 1000).toISOString(),
          source: article.source || 'Finnhub',
          category: article.category || category
        }));

      console.log(`✅ ${data.length} market news articles fetched`);
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('❌ Error fetching market news:', error.message);
      return this.generateMockMarketNews();
    }
  }

  // 🟢 Get Earnings Calendar (60 calls/min)
  async getEarningsCalendar(from = null, to = null) {
    try {
      console.log(`📅 Fetching earnings calendar...`);

      const today = new Date();
      const startDate = from || today.toISOString().split('T')[0];
      const endDate = to || new Date(today.setDate(today.getDate() + 7)).toISOString().split('T')[0];

      const response = await axios.get(`${this.finnhubBase}/calendar/earnings`, {
        params: {
          from: startDate,
          to: endDate,
          token: this.finnhubKey
        }
      });

      if (!response.data || !response.data.earningsCalendar) {
        throw new Error('Invalid earnings calendar response');
      }

      console.log(`✅ ${response.data.earningsCalendar.length} earnings events fetched`);
      
      return response.data.earningsCalendar.map(item => ({
        symbol: item.symbol,
        date: item.date,
        quarter: item.quarter,
        year: item.year,
        estimate: item.estimate,
        actual: item.actual,
        revenue: item.revenue,
        revenueEstimate: item.revenueEstimate
      }));
    } catch (error) {
      console.error('❌ Error fetching earnings calendar:', error.message);
      return this.generateMockEarnings();
    }
  }

  // 🟢 Get Market Status (60 calls/min)
  async getMarketStatus(exchange = 'US') {
    try {
      const response = await axios.get(`${this.finnhubBase}/stock/market-status`, {
        params: {
          exchange,
          token: this.finnhubKey
        }
      });

      return {
        isOpen: response.data.isOpen || false,
        holiday: response.data.holiday || null,
        nextOpen: response.data.nextOpen || null,
        nextClose: response.data.nextClose || null,
        tradingHalted: response.data.tradingHalted || false
      };
    } catch (error) {
      console.error('❌ Error fetching market status:', error.message);
      return { isOpen: true, exchange };
    }
  }

  // 🟢 Get Basic Financials (60 calls/min)
  async getBasicFinancials(symbol) {
    try {
      const response = await axios.get(`${this.finnhubBase}/stock/metric`, {
        params: {
          symbol: symbol.toUpperCase(),
          metric: 'all',
          token: this.finnhubKey
        }
      });

      const metric = response.data.metric || {};
      
      return {
        symbol,
        '52WeekHigh': metric['52WeekHigh'],
        '52WeekLow': metric['52WeekLow'],
        '50DayMA': metric['50DayMovingAverage'],
        '200DayMA': metric['200DayMovingAverage'],
        peRatio: metric.peTTM,
        eps: metric.epsTTM,
        dividendYield: metric.dividendYieldIndicatedAnnual,
        beta: metric.beta,
        marketCap: metric.marketCapitalization
      };
    } catch (error) {
      console.error('❌ Error fetching financials:', error.message);
      return null;
    }
  }

  // ============ SECONDARY API: ALPHA VANTAGE (Optional) ============

  async getHistoricalData(symbol, period = '1mo') {
    // Fallback to mock data if no Alpha Vantage key
    if (!this.alphaVantageKey) {
      console.log('📊 Using mock historical data (Alpha Vantage key not configured)');
      return this.generateMockData(symbol, period);
    }

    try {
      // Alpha Vantage implementation (add later if needed)
      return this.generateMockData(symbol, period);
    } catch (error) {
      return this.generateMockData(symbol, period);
    }
  }

  // ============ HELPER METHODS ============

  getDataPoints(period) {
    const map = {
      '1d': 1,
      '5d': 5,
      '1mo': 30,
      '3mo': 90,
      '6mo': 180,
      '1y': 365,
    };
    return map[period] || 30;
  }

  getSectorFromIndustry(industry) {
    if (!industry) return 'Technology';
    
    const sectorMap = {
      'Software': 'Technology',
      'Technology': 'Technology',
      'Banking': 'Financial Services',
      'Finance': 'Financial Services',
      'Healthcare': 'Healthcare',
      'Pharmaceuticals': 'Healthcare',
      'Retail': 'Consumer Cyclical',
      'Automotive': 'Consumer Cyclical',
      'Energy': 'Energy',
      'Oil & Gas': 'Energy',
      'Telecommunications': 'Communication Services',
      'Media': 'Communication Services',
      'Industrial': 'Industrials',
      'Manufacturing': 'Industrials'
    };

    for (const [key, value] of Object.entries(sectorMap)) {
      if (industry.includes(key)) {
        return value;
      }
    }
    
    return 'Technology';
  }

  // ============ COMPOSITE METHODS ============

  // 🟢 Get complete stock data using your active Finnhub key
  async getCompleteStockData(symbol, period = '1mo') {
    console.log(`🎯 Fetching complete stock data for ${symbol}...`);
    
    try {
      const [quote, profile, news] = await Promise.all([
        this.getRealTimeQuote(symbol),
        this.getCompanyProfile(symbol),
        this.getCompanyNews(symbol)
      ]);

      // Get historical data (mock for now)
      const historical = await this.getHistoricalData(symbol, period);

      // Get financial metrics
      const financials = await this.getBasicFinancials(symbol);

      const data = {
        symbol: symbol.toUpperCase(),
        quote,
        profile,
        historical,
        news,
        financials,
        lastUpdated: new Date().toISOString()
      };

      console.log(`✅ Complete stock data fetched for ${symbol}`);
      return data;
    } catch (error) {
      console.error('❌ Error getting complete stock data:', error);
      throw error;
    }
  }

  // ============ MOCK DATA GENERATORS (FALLBACK) ============

  getMockQuote(symbol) {
    const basePrice = 100 + Math.random() * 50;
    const change = (Math.random() - 0.5) * 10;
    return {
      symbol: symbol.toUpperCase(),
      price: basePrice + change,
      change,
      changePercent: (change / basePrice) * 100,
      high: basePrice + Math.random() * 5,
      low: basePrice - Math.random() * 5,
      open: basePrice,
      previousClose: basePrice - change,
      timestamp: new Date().toISOString()
    };
  }

  getMockCompanyProfile(symbol) {
    return {
      name: `${symbol} Inc.`,
      description: `A leading ${symbol} company in the technology sector, known for innovation and market leadership.`,
      ticker: symbol,
      marketCap: 1000000000000 + Math.random() * 900000000000,
      shareOutstanding: 1000000000 + Math.random() * 500000000,
      ipo: '1980-01-01',
      logo: '',
      weburl: `https://www.${symbol.toLowerCase()}.com`,
      phone: '+1-800-555-5555',
      industry: 'Software',
      sector: 'Technology',
      exchange: 'NASDAQ'
    };
  }

  generateMockData(symbol, period) {
    const points = this.getDataPoints(period);
    const data = [];
    let price = 100 + Math.random() * 50;

    for (let i = 0; i < points; i++) {
      const change = (Math.random() - 0.5) * 10;
      price += change;
      const date = new Date();
      date.setDate(date.getDate() - (points - i - 1));

      data.push({
        date: date.toISOString().split('T')[0],
        open: price - Math.random() * 2,
        high: price + Math.random() * 3,
        low: price - Math.random() * 3,
        close: price,
        volume: Math.floor(1000000 + Math.random() * 5000000),
        change
      });
    }
    return data;
  }

  generateMockNews(symbol) {
    const headlines = [
      `${symbol} Reports Strong Quarterly Earnings`,
      `Analysts Upgrade ${symbol} Price Target`,
      `${symbol} Announces New Product Line`,
      `${symbol} Expands International Operations`,
      `${symbol} CEO Discusses Future Growth Strategy`
    ];

    return headlines.map((title, index) => ({
      id: Date.now() + index,
      title,
      description: `${symbol} continues to show strong performance in the market with promising growth prospects for the coming quarters.`,
      url: '#',
      imageUrl: null,
      publishedAt: new Date(Date.now() - index * 86400000).toISOString(),
      source: ['Bloomberg', 'Reuters', 'CNBC', 'WSJ', 'MarketWatch'][index],
      sentiment: index % 2 === 0 ? 'positive' : 'neutral',
      category: 'company'
    }));
  }

  generateMockMarketNews() {
    return [
      {
        id: 1,
        title: 'Tech Stocks Surge Amid AI Optimism',
        description: 'Technology sector leads market gains as AI adoption accelerates across industries.',
        url: '#',
        imageUrl: null,
        publishedAt: new Date().toISOString(),
        source: 'Bloomberg',
        category: 'technology'
      },
      {
        id: 2,
        title: 'Fed Signals Potential Rate Cuts',
        description: 'Federal Reserve indicates possible interest rate reductions in coming months as inflation cools.',
        url: '#',
        publishedAt: new Date().toISOString(),
        source: 'Reuters',
        category: 'economy'
      },
      {
        id: 3,
        title: 'Oil Prices Stabilize After Volatile Week',
        description: 'Crude oil markets show stability amid supply concerns and geopolitical tensions.',
        url: '#',
        publishedAt: new Date().toISOString(),
        source: 'CNBC',
        category: 'commodity'
      }
    ];
  }

  generateMockEarnings() {
    const today = new Date();
    return [
      {
        symbol: 'AAPL',
        date: today.toISOString().split('T')[0],
        quarter: 1,
        year: 2024,
        estimate: 1.52,
        actual: null,
        revenue: null,
        revenueEstimate: 118.5
      },
      {
        symbol: 'MSFT',
        date: today.toISOString().split('T')[0],
        quarter: 1,
        year: 2024,
        estimate: 2.65,
        actual: null,
        revenue: null,
        revenueEstimate: 62.8
      },
      {
        symbol: 'GOOGL',
        date: new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0],
        quarter: 1,
        year: 2024,
        estimate: 1.55,
        actual: null,
        revenue: null,
        revenueEstimate: 72.3
      }
    ];
  }
}

const stockApi = new StockAPI();
export default stockApi;