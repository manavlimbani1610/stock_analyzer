import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import portfolioService from '../services/portfolioService';

const PortfolioContext = createContext();

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within PortfolioProvider');
  }
  return context;
};

export const PortfolioProvider = ({ children }) => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(false);
  const [portfolioMetrics, setPortfolioMetrics] = useState({
    totalValue: 0,
    totalInvested: 0,
    totalProfit: 0,
    profitPercentage: 0,
  });

  useEffect(() => {
    loadPortfolio();
  }, []);

  useEffect(() => {
    calculateMetrics();
  }, [portfolio]);

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const savedPortfolio = portfolioService.getPortfolio();
      setPortfolio(savedPortfolio);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToPortfolio = (stock) => {
    const updatedPortfolio = [...portfolio, stock];
    setPortfolio(updatedPortfolio);
    portfolioService.savePortfolio(updatedPortfolio);
  };

  const removeFromPortfolio = (stockId) => {
    const updatedPortfolio = portfolio.filter(stock => stock.id !== stockId);
    setPortfolio(updatedPortfolio);
    portfolioService.savePortfolio(updatedPortfolio);
  };

  const updateStock = (stockId, updates) => {
    const updatedPortfolio = portfolio.map(stock =>
      stock.id === stockId ? { ...stock, ...updates } : stock
    );
    setPortfolio(updatedPortfolio);
    portfolioService.savePortfolio(updatedPortfolio);
  };

  const calculateMetrics = () => {
    const metrics = portfolio.reduce(
      (acc, stock) => {
        const invested = stock.shares * stock.purchasePrice;
        const currentValue = stock.shares * (stock.currentPrice || stock.purchasePrice);
        const profit = currentValue - invested;

        return {
          totalValue: acc.totalValue + currentValue,
          totalInvested: acc.totalInvested + invested,
          totalProfit: acc.totalProfit + profit,
        };
      },
      { totalValue: 0, totalInvested: 0, totalProfit: 0 }
    );

    const profitPercentage = metrics.totalInvested > 0
      ? (metrics.totalProfit / metrics.totalInvested) * 100
      : 0;

    setPortfolioMetrics({
      ...metrics,
      profitPercentage,
    });
  };

  const value = {
    portfolio,
    portfolioMetrics,
    loading,
    addToPortfolio,
    removeFromPortfolio,
    updateStock,
    calculateMetrics,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

PortfolioProvider.propTypes = {
  children: PropTypes.node.isRequired,
};