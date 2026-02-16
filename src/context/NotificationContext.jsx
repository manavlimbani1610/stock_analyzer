// src/context/NotificationContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';
import { useStock } from './StockContext';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const { selectedStock, quote } = useStock();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [priceAlerts, setPriceAlerts] = useState([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedNotifications = localStorage.getItem(`notifications_${user.id}`);
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      }
      
      const savedAlerts = localStorage.getItem(`priceAlerts_${user.id}`);
      if (savedAlerts) {
        setPriceAlerts(JSON.parse(savedAlerts));
      }
    }
  }, [user]);

  // Save notifications to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
      setUnreadCount(notifications.filter(n => !n.read).length);
    }
  }, [notifications, user]);

  // Save price alerts to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`priceAlerts_${user.id}`, JSON.stringify(priceAlerts));
    }
  }, [priceAlerts, user]);

  // Check price alerts in real-time
  useEffect(() => {
    if (!user || !quote || !selectedStock) return;

    const checkPriceAlerts = () => {
      priceAlerts.forEach(alert => {
        if (alert.symbol === selectedStock && alert.active) {
          if (alert.type === 'above' && quote.price >= alert.targetPrice) {
            addNotification({
              title: `💰 ${alert.symbol} Price Alert`,
              message: `${alert.symbol} has reached $${quote.price.toFixed(2)} (Target: $${alert.targetPrice})`,
              type: 'success',
              symbol: alert.symbol,
              action: 'price_alert'
            });
            
            // Deactivate alert after triggering
            deactivateAlert(alert.id);
          }
          
          if (alert.type === 'below' && quote.price <= alert.targetPrice) {
            addNotification({
              title: `⚠️ ${alert.symbol} Price Alert`,
              message: `${alert.symbol} has dropped to $${quote.price.toFixed(2)} (Target: $${alert.targetPrice})`,
              type: 'warning',
              symbol: alert.symbol,
              action: 'price_alert'
            });
            
            deactivateAlert(alert.id);
          }
        }
      });
    };

    checkPriceAlerts();
    
    // Check every 30 seconds
    const interval = setInterval(checkPriceAlerts, 30000);
    return () => clearInterval(interval);
  }, [quote, selectedStock, priceAlerts, user]);

  // Add notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50
    
    // Show toast
    if (notification.type === 'success') {
      toast.success(notification.message, { icon: '💰' });
    } else if (notification.type === 'warning') {
      toast.error(notification.message, { icon: '⚠️' });
    } else if (notification.type === 'info') {
      toast.success(notification.message, { icon: '📈' });
    } else {
      toast.success(notification.message, { icon: '🔔' });
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  // Delete notification
  const deleteNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Add price alert
  const addPriceAlert = useCallback((symbol, targetPrice, type = 'above') => {
    const newAlert = {
      id: Date.now().toString(),
      symbol: symbol.toUpperCase(),
      targetPrice: parseFloat(targetPrice),
      type,
      active: true,
      createdAt: new Date().toISOString()
    };
    
    setPriceAlerts(prev => [...prev, newAlert]);
    
    addNotification({
      title: '🔔 Price Alert Set',
      message: `Alert set for ${symbol} at $${targetPrice}`,
      type: 'info',
      symbol
    });
    
    return newAlert;
  }, [addNotification]);

  // Deactivate alert
  const deactivateAlert = useCallback((alertId) => {
    setPriceAlerts(prev => 
      prev.map(a => 
        a.id === alertId ? { ...a, active: false } : a
      )
    );
  }, []);

  // Remove alert
  const removeAlert = useCallback((alertId) => {
    setPriceAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  // Simulate real-time notifications (for demo)
  useEffect(() => {
    if (!user) return;

    // Simulate market news every 2-3 minutes
    const newsInterval = setInterval(() => {
      const marketNews = [
        {
          title: '📈 Market Update',
          message: 'S&P 500 reaches new all-time high',
          type: 'info',
          action: 'market_news'
        },
        {
          title: '🏢 Company News',
          message: 'Tech stocks lead market gains',
          type: 'success',
          action: 'market_news'
        },
        {
          title: '📊 Earnings Report',
          message: 'Strong earnings season continues',
          type: 'info',
          action: 'earnings'
        }
      ];
      
      const randomNews = marketNews[Math.floor(Math.random() * marketNews.length)];
      
      addNotification({
        ...randomNews,
        timestamp: new Date().toISOString()
      });
    }, 120000); // Every 2 minutes

    return () => clearInterval(newsInterval);
  }, [user, addNotification]);

  const value = {
    notifications,
    unreadCount,
    priceAlerts,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addPriceAlert,
    removeAlert,
    deactivateAlert
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired
};