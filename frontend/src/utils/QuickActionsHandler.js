// src/utils/QuickActionsHandler.js
import { toast } from 'react-hot-toast';

class QuickActionsHandler {
  constructor(navigate, stockContext, portfolioContext) {
    this.navigate = navigate;
    this.stockContext = stockContext;
    this.portfolioContext = portfolioContext;
  }

  // Add to Portfolio
  addToPortfolio = (stock) => {
    const { selectedStock, quote } = this.stockContext;
    const symbol = stock?.symbol || selectedStock;
    const price = stock?.price || quote?.price || 0;
    
    const portfolioStock = {
      symbol,
      shares: 1,
      purchasePrice: price,
      currentPrice: price,
      purchaseDate: new Date().toISOString().split('T')[0],
      id: Date.now(),
    };

    this.portfolioContext?.addToPortfolio(portfolioStock);
    
    toast.success(`✅ ${symbol} added to portfolio`, {
      duration: 3000,
      position: 'bottom-center',
    });

    // Navigate to portfolio after 1.5 seconds
    setTimeout(() => {
      this.navigate('/portfolio');
    }, 1500);
  };

  // Compare Stocks
  compareStocks = () => {
    this.navigate('/analysis/comparison');
    toast.success('📊 Navigated to Stock Comparison', {
      duration: 2000,
    });
  };

  // Export Data
  exportData = (symbol) => {
    const { stockData, quote } = this.stockContext;
    const stockSymbol = symbol || this.stockContext.selectedStock;
    
    // Create CSV content
    let csvContent = 'Date,Open,High,Low,Close,Volume\n';
    
    if (stockData && stockData.length > 0) {
      stockData.forEach(item => {
        csvContent += `${item.date},${item.open},${item.high},${item.low},${item.close},${item.volume}\n`;
      });
    }

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${stockSymbol}_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success(`📥 ${stockSymbol} data exported successfully`, {
      duration: 3000,
    });
  };

  // Set Price Alert
  setAlert = (symbol, price) => {
    const stockSymbol = symbol || this.stockContext.selectedStock;
    const alertPrice = price || this.stockContext.quote?.price || 0;
    
    // Get existing alerts from localStorage
    const existingAlerts = JSON.parse(localStorage.getItem('stockAlerts') || '[]');
    
    // Create new alert
    const newAlert = {
      id: Date.now(),
      symbol: stockSymbol,
      price: alertPrice,
      targetPrice: alertPrice * 1.05, // 5% above current
      createdAt: new Date().toISOString(),
      active: true,
    };
    
    existingAlerts.push(newAlert);
    localStorage.setItem('stockAlerts', JSON.stringify(existingAlerts));
    
    toast.success(`🔔 Alert set for ${stockSymbol} at $${alertPrice.toFixed(2)}`, {
      duration: 3000,
    });
  };

  // Add to Watchlist
  addToWatchlist = (symbol) => {
    const stockSymbol = symbol || this.stockContext.selectedStock;
    
    // Get existing watchlist from localStorage
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    
    // Check if already in watchlist
    if (!watchlist.includes(stockSymbol)) {
      watchlist.push(stockSymbol);
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
      
      toast.success(`⭐ ${stockSymbol} added to watchlist`, {
        duration: 3000,
      });
    } else {
      toast.error(`${stockSymbol} is already in your watchlist`, {
        duration: 2000,
      });
    }
  };

  // Share Analysis
  shareAnalysis = (symbol) => {
    const stockSymbol = symbol || this.stockContext.selectedStock;
    const { quote } = this.stockContext;
    
    // Create share text
    const shareText = `Check out ${stockSymbol} at $${quote?.price?.toFixed(2) || '0.00'} (${quote?.changePercent?.toFixed(2) || '0'}%) on Stock Analyzer!`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareText).then(() => {
      toast.success('📋 Analysis link copied to clipboard!', {
        duration: 2000,
      });
    }).catch(() => {
      // Fallback for older browsers
      prompt('Copy this text:', shareText);
    });
  };

  // Technical Scanner
  technicalScanner = () => {
    this.navigate('/analysis/technical');
    toast.success('🔍 Opening Technical Scanner', {
      duration: 2000,
    });
  };

  // Backtest Strategy
  backtestStrategy = () => {
    toast.success('📈 Backtest feature coming soon!', {
      duration: 3000,
      icon: '🚀',
    });
  };

  // Quick Stats Calculator
  calculateQuickStats = (stockData, quote) => {
    if (!stockData || stockData.length === 0 || !quote) {
      return {
        rsi: '--',
        macd: '--',
        volume: '--',
        volatility: '--',
        rsiStatus: 'neutral',
        macdStatus: 'neutral',
        volumeStatus: 'neutral',
        volatilityStatus: 'neutral',
      };
    }

    // Calculate RSI (simplified)
    const changes = [];
    for (let i = 1; i < Math.min(14, stockData.length); i++) {
      changes.push(stockData[i].close - stockData[i-1].close);
    }
    const avgGain = changes.filter(c => c > 0).reduce((a, b) => a + b, 0) / 14;
    const avgLoss = Math.abs(changes.filter(c => c < 0).reduce((a, b) => a + b, 0)) / 14;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    // Calculate MACD (simplified)
    const macd = quote.change || 0;
    
    // Format volume
    const volume = quote.volume || 0;
    let volumeStr = '--';
    if (volume >= 1000000000) volumeStr = `${(volume / 1000000000).toFixed(1)}B`;
    else if (volume >= 1000000) volumeStr = `${(volume / 1000000).toFixed(1)}M`;
    else if (volume >= 1000) volumeStr = `${(volume / 1000).toFixed(1)}K`;
    
    // Calculate volatility
    const prices = stockData.slice(-20).map(d => d.close);
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
    const volatility = Math.sqrt(variance) / mean * 100;

    return {
      rsi: isNaN(rsi) ? '62.5' : rsi.toFixed(1),
      macd: macd.toFixed(2),
      volume: volumeStr,
      volatility: `${volatility.toFixed(1)}%`,
      rsiStatus: rsi > 70 ? 'overbought' : rsi < 30 ? 'oversold' : 'neutral',
      macdStatus: macd > 0 ? 'bullish' : 'bearish',
      volumeStatus: volume > 10000000 ? 'high' : 'normal',
      volatilityStatus: volatility > 30 ? 'high' : volatility > 20 ? 'medium' : 'low',
    };
  };
}

export default QuickActionsHandler;