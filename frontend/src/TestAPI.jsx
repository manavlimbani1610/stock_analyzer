import React, { useEffect, useState } from 'react';
import { Box,  CircularProgress, Alert,  Card, CardContent } from '@mui/material';
import stockApi from './services/stockApi';

const TestAPI = () => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('🚀 Testing Finnhub API...');
        
        // Test real-time quote
        const quote = await stockApi.getRealTimeQuote('AAPL');
        
        setResults({
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          timestamp: new Date().toLocaleString()
        });
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    testAPI();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="success">✅ API Working! AAPL: ${results.price}</Alert>
    </Box>
  );
};

export default TestAPI;