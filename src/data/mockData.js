import { format, subDays } from 'date-fns';

export const generateMockStockData = (symbol, days = 30) => {
  const data = [];
  let price = 100 + Math.random() * 50;
  
  for (let i = days - 1; i >= 0; i--) {
    const change = (Math.random() - 0.5) * 10;
    price += change;
    const date = subDays(new Date(), i);
    
    data.push({
      symbol,
      date: format(date, 'yyyy-MM-dd'),
      open: price - Math.random() * 2,
      high: price + Math.random() * 3,
      low: price - Math.random() * 3,
      close: price,
      volume: Math.floor(1000000 + Math.random() * 5000000),
      sma: price + (Math.random() - 0.5) * 5,
      ema: price + (Math.random() - 0.5) * 4,
      rsi: 30 + Math.random() * 50,
    });
  }
  
  return data;
};

export const mockPortfolio = [
  {
    id: 1,
    symbol: 'AAPL',
    name: 'Apple Inc.',
    shares: 10,
    purchasePrice: 150.25,
    currentPrice: 182.63,
    purchaseDate: '2023-01-15',
    sector: 'Technology',
  },
  {
    id: 2,
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    shares: 5,
    purchasePrice: 125.50,
    currentPrice: 138.42,
    purchaseDate: '2023-02-20',
    sector: 'Technology',
  },
  {
    id: 3,
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    shares: 8,
    purchasePrice: 285.75,
    currentPrice: 330.25,
    purchaseDate: '2023-03-10',
    sector: 'Technology',
  },
  {
    id: 4,
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    shares: 3,
    purchasePrice: 210.30,
    currentPrice: 240.85,
    purchaseDate: '2023-04-05',
    sector: 'Automotive',
  },
  {
    id: 5,
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    shares: 15,
    purchasePrice: 135.80,
    currentPrice: 142.35,
    purchaseDate: '2023-05-12',
    sector: 'Financial Services',
  },
];

export const mockNews = [
  {
    id: 1,
    title: 'Tech Stocks Surge Amid AI Optimism',
    source: 'Bloomberg',
    date: '2023-12-01',
    summary: 'Technology stocks led market gains as investors remain optimistic about AI-driven growth.',
    sentiment: 'positive',
  },
  {
    id: 2,
    title: 'Federal Reserve Holds Interest Rates Steady',
    source: 'Reuters',
    date: '2023-11-30',
    summary: 'The Federal Reserve maintained interest rates while hinting at potential cuts in 2024.',
    sentiment: 'neutral',
  },
  {
    id: 3,
    title: 'Earnings Season Exceeds Expectations',
    source: 'CNBC',
    date: '2023-11-29',
    summary: 'Q3 earnings reports show stronger-than-expected performance across multiple sectors.',
    sentiment: 'positive',
  },
  {
    id: 4,
    title: 'Energy Sector Faces Headwinds',
    source: 'WSJ',
    date: '2023-11-28',
    summary: 'Falling oil prices and regulatory challenges pressure energy company profits.',
    sentiment: 'negative',
  },
  {
    id: 5,
    title: 'Retail Sales Show Holiday Strength',
    source: 'MarketWatch',
    date: '2023-11-27',
    summary: 'Early holiday shopping data indicates robust consumer spending.',
    sentiment: 'positive',
  },
];

export const mockMarketIndicators = {
  sp500: 4567.25,
  nasdaq: 14265.80,
  dowJones: 35430.45,
  vix: 13.25,
  gold: 1975.30,
  oil: 74.85,
  usdIndex: 103.45,
};

export const mockEarningsCalendar = [
  { date: '2023-12-04', company: 'CRM', estimate: 2.06, actual: 2.11 },
  { date: '2023-12-05', company: 'COST', estimate: 3.71, actual: 3.74 },
  { date: '2023-12-06', company: 'GME', estimate: -0.08, actual: null },
  { date: '2023-12-07', company: 'LULU', estimate: 2.26, actual: null },
  { date: '2023-12-08', company: 'ORCL', estimate: 1.33, actual: null },
];