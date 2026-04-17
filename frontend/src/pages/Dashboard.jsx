// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Grid, Box, Alert, Fade } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useStock } from '../context/StockContext';
import StockSearch from '../components/Dashboard/StockSearch';
import StockChart from '../components/Dashboard/StockChart';
import TechnicalIndicators from '../components/Dashboard/TechnicalIndicators';
import StockInfo from '../components/Dashboard/StockInfo';
import QuickActions from '../components/Dashboard/QuickActions';
import NewsFeed from '../components/Analysis/NewsFeed';
import MarketOverview from '../components/Analysis/MarketOverview';
import LoadingSkeleton from '../components/Common/LoadingSkeleton';

const Dashboard = () => {
  const { loading, error, stockData, isInitialized, fetchStockData, selectedStock } = useStock();
  const [showContent, setShowContent] = useState(false);

  // Force loading to false after timeout if stuck
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn('Loading timeout - forcing content to show');
        setShowContent(true);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    if (stockData && !loading) {
      setShowContent(true);
    } else if (!loading && !stockData) {
      // If no data and not loading, try to fetch
      fetchStockData(selectedStock);
    }
  }, [stockData, loading, fetchStockData, selectedStock]);

  // If still loading after 5 seconds, show error
  if (loading && !stockData) {
    return (
      <Box sx={{ p: 3 }}>
        <LoadingSkeleton />
        <Fade in={true}>
          <Alert 
            severity="info" 
            sx={{ 
              position: 'fixed', 
              bottom: 20, 
              left: '50%', 
              transform: 'translateX(-50%)',
              zIndex: 9999,
              bgcolor: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid #00d4ff'
            }}
          >
            Loading stock data... This may take a few seconds
          </Alert>
        </Fade>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              action={
                <button onClick={() => fetchStockData(selectedStock)}>
                  Retry
                </button>
              }
            >
              {error} - Click retry
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <StockSearch />
      
      <AnimatePresence mode="wait">
        {!stockData ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <LoadingSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <StockChart />
                <TechnicalIndicators />
                <StockInfo />
              </Grid>
              
              <Grid item xs={12} lg={4}>
                <QuickActions />
                <NewsFeed compact />
                <MarketOverview />
              </Grid>
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Dashboard;