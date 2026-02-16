// src/components/Analysis/MarketOverview.jsx
import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import stockApi from '../../services/stockApi';

const MarketOverview = () => {
  const [marketData, setMarketData] = useState({
    sp500: null,
    nasdaq: null,
    dowJones: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      try {
        // Using ETFs as proxies for indices
        const [sp500, nasdaq, dow] = await Promise.all([
          stockApi.getRealTimeQuote('SPY'),  // S&P 500 ETF
          stockApi.getRealTimeQuote('QQQ'),   // NASDAQ ETF
          stockApi.getRealTimeQuote('DIA')    // Dow Jones ETF
        ]);
        
        setMarketData({
          sp500,
          nasdaq,
          dowJones: dow
        });
      } catch (error) {
        console.error('Error fetching market data:', error);
        // Set mock data on error
        setMarketData({
          sp500: { price: 4567.25, change: 12.5, changePercent: 0.27 },
          nasdaq: { price: 14265.80, change: 45.2, changePercent: 0.32 },
          dowJones: { price: 35430.45, change: -15.3, changePercent: -0.04 }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMarketData();
  }, []);

  if (loading) {
    return (
      <Paper sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={24} />
      </Paper>
    );
  }

  const MarketCard = ({ title, data, symbol }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
          <ShowChartIcon fontSize="small" sx={{ color: '#00d4ff' }} />
        </Box>
        <Typography variant="h6" fontWeight="bold">
          ${data?.price?.toFixed(2) || '---'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          {data?.change >= 0 ? (
            <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} />
          ) : (
            <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16 }} />
          )}
          <Typography 
            variant="caption" 
            color={data?.change >= 0 ? 'success.main' : 'error.main'}
            fontWeight="medium"
          >
            {data?.change >= 0 ? '+' : ''}{data?.change?.toFixed(2)} 
            ({data?.change >= 0 ? '+' : ''}{data?.changePercent?.toFixed(2)}%)
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {symbol}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Market Overview
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <MarketCard title="S&P 500" data={marketData.sp500} symbol="SPY" />
        </Grid>
        <Grid item xs={12} md={4}>
          <MarketCard title="NASDAQ" data={marketData.nasdaq} symbol="QQQ" />
        </Grid>
        <Grid item xs={12} md={4}>
          <MarketCard title="Dow Jones" data={marketData.dowJones} symbol="DIA" />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MarketOverview;