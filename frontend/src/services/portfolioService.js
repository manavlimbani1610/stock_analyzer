import { calculateAllIndicators } from './technicalIndicators';

class PortfolioService {
  constructor() {
    this.storageKey = 'stock-portfolio';
  }

  getPortfolio() {
    try {
      const portfolio = localStorage.getItem(this.storageKey);
      return portfolio ? JSON.parse(portfolio) : [];
    } catch (error) {
      console.error('Error loading portfolio:', error);
      return [];
    }
  }

  savePortfolio(portfolio) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(portfolio));
    } catch (error) {
      console.error('Error saving portfolio:', error);
    }
  }

  addStock(stock) {
    const portfolio = this.getPortfolio();
    const newStock = {
      ...stock,
      id: Date.now(),
      addedDate: new Date().toISOString(),
      currentPrice: stock.purchasePrice, // Will be updated later
    };
    portfolio.push(newStock);
    this.savePortfolio(portfolio);
    return newStock;
  }

  removeStock(stockId) {
    const portfolio = this.getPortfolio();
    const updatedPortfolio = portfolio.filter(stock => stock.id !== stockId);
    this.savePortfolio(updatedPortfolio);
    return updatedPortfolio;
  }

  updateStock(stockId, updates) {
    const portfolio = this.getPortfolio();
    const updatedPortfolio = portfolio.map(stock => 
      stock.id === stockId ? { ...stock, ...updates } : stock
    );
    this.savePortfolio(updatedPortfolio);
    return updatedPortfolio;
  }

  calculatePortfolioMetrics(portfolio) {
    if (!portfolio || portfolio.length === 0) {
      return {
        totalInvested: 0,
        totalCurrentValue: 0,
        totalProfit: 0,
        profitPercentage: 0,
      };
    }

    const metrics = portfolio.reduce(
      (acc, stock) => {
        const invested = stock.shares * stock.purchasePrice;
        const currentValue = stock.shares * (stock.currentPrice || stock.purchasePrice);
        const profit = currentValue - invested;

        return {
          totalInvested: acc.totalInvested + invested,
          totalCurrentValue: acc.totalCurrentValue + currentValue,
          totalProfit: acc.totalProfit + profit,
        };
      },
      { totalInvested: 0, totalCurrentValue: 0, totalProfit: 0 }
    );

    const profitPercentage = metrics.totalInvested > 0
      ? (metrics.totalProfit / metrics.totalInvested) * 100
      : 0;

    return {
      ...metrics,
      profitPercentage,
    };
  }

  getPortfolioPerformance(portfolio) {
    if (!portfolio || portfolio.length === 0) return [];

    // Calculate daily performance for the last 30 days
    const performance = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Mock performance calculation
      const dayValue = portfolio.reduce((acc, stock) => {
        const baseValue = stock.shares * stock.purchasePrice;
        const randomChange = (Math.random() - 0.5) * 0.02; // ±2% daily change
        return acc + baseValue * (1 + randomChange);
      }, 0);
      
      performance.push({
        date: dateStr,
        value: dayValue,
      });
    }
    
    return performance;
  }

  getSectorAllocation(portfolio) {
    const sectors = {};
    
    portfolio.forEach(stock => {
      const sector = stock.sector || 'Other';
      const value = stock.shares * (stock.currentPrice || stock.purchasePrice);
      
      if (sectors[sector]) {
        sectors[sector] += value;
      } else {
        sectors[sector] = value;
      }
    });
    
    return Object.entries(sectors).map(([name, value]) => ({
      name,
      value,
    }));
  }

  generateReport(portfolio) {
    const metrics = this.calculatePortfolioMetrics(portfolio);
    const performance = this.getPortfolioPerformance(portfolio);
    const sectors = this.getSectorAllocation(portfolio);
    
    return {
      metrics,
      performance,
      sectors,
      stocks: portfolio.map(stock => ({
        ...stock,
        currentValue: stock.shares * (stock.currentPrice || stock.purchasePrice),
        profit: stock.shares * ((stock.currentPrice || stock.purchasePrice) - stock.purchasePrice),
        profitPercentage: ((stock.currentPrice || stock.purchasePrice) - stock.purchasePrice) / stock.purchasePrice * 100,
      })),
      generatedAt: new Date().toISOString(),
    };
  }
}

const portfolioService = new PortfolioService();
export default portfolioService;