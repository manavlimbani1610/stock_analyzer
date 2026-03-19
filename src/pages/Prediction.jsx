// src/pages/Prediction.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  InputAdornment,
  Card,
  CardContent,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Search as SearchIcon,
  Timeline,
  Assessment,
  ShowChart,
  Psychology,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import stockApi from '../services/stockApi';

// ML Backend API URL
const ML_API_URL = process.env.REACT_APP_ML_API_URL || 'http://localhost:5000';

// Simple Linear Regression for fallback prediction
const linearRegression = (data) => {
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  data.forEach((point, i) => {
    sumX += i;
    sumY += point.close;
    sumXY += i * point.close;
    sumX2 += i * i;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
};

// Calculate RMSE
const calculateRMSE = (actual, predicted) => {
  const n = Math.min(actual.length, predicted.length);
  let sumSquaredError = 0;

  for (let i = 0; i < n; i++) {
    const error = actual[i] - predicted[i];
    sumSquaredError += error * error;
  }

  return Math.sqrt(sumSquaredError / n);
};

// Moving Average for smoother predictions
const movingAverage = (data, period = 5) => {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(data[i]);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j];
      }
      result.push(sum / period);
    }
  }
  return result;
};

const Prediction = () => {
  const [ticker, setTicker] = useState('AAPL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [useMLBackend, setUseMLBackend] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Check if ML backend is available
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await axios.get(`${ML_API_URL}/api/health`, { timeout: 3000 });
        if (response.data.status === 'healthy') {
          setBackendStatus('connected');
          setUseMLBackend(true);
        }
      } catch {
        setBackendStatus('unavailable');
        setUseMLBackend(false);
      }
    };
    checkBackend();
  }, []);

  // Fallback: Generate predictions using client-side model
  const generateFallbackPredictions = (data) => {
    if (!data || data.length < 10) return { predictions: [], metrics: null };

    const trainingData = data.slice(-90);
    const closePrices = trainingData.map(d => d.close);
    const smoothedPrices = movingAverage(closePrices, 5);

    const { slope, intercept } = linearRegression(
      smoothedPrices.map((close) => ({ close }))
    );

    const fittedValues = smoothedPrices.map((_, i) => intercept + slope * i);
    const rmse = calculateRMSE(smoothedPrices, fittedValues);

    const returns = [];
    for (let i = 1; i < closePrices.length; i++) {
      returns.push((closePrices[i] - closePrices[i-1]) / closePrices[i-1]);
    }
    const volatility = Math.sqrt(returns.reduce((sum, r) => sum + r * r, 0) / returns.length) * Math.sqrt(252);

    const lastPrice = closePrices[closePrices.length - 1];
    const lastDate = new Date(trainingData[trainingData.length - 1].date);
    const predictedData = [];

    for (let i = 1; i <= 30; i++) {
      const trendComponent = slope * i;
      const randomComponent = (Math.random() - 0.5) * volatility * lastPrice * 0.02;
      const predictedPrice = lastPrice + trendComponent + randomComponent;

      const futureDate = new Date(lastDate);
      futureDate.setDate(futureDate.getDate() + i);

      while (futureDate.getDay() === 0 || futureDate.getDay() === 6) {
        futureDate.setDate(futureDate.getDate() + 1);
      }

      predictedData.push({
        day: i,
        date: futureDate.toISOString().split('T')[0],
        predictedClose: Math.max(0, predictedPrice),
        confidence: Math.max(0.5, 1 - (i / 30) * 0.3),
      });
    }

    const avgPredicted = predictedData.reduce((sum, p) => sum + p.predictedClose, 0) / predictedData.length;
    const trend = avgPredicted > lastPrice ? 'bullish' : 'bearish';
    const trendPercent = ((avgPredicted - lastPrice) / lastPrice) * 100;

    return {
      predictions: predictedData,
      metrics: {
        rmse: rmse.toFixed(4),
        trend,
        trendPercent: trendPercent.toFixed(2),
        volatility: (volatility * 100).toFixed(2),
        lastPrice: lastPrice.toFixed(2),
        modelType: 'client_linear_regression'
      }
    };
  };

  // Fetch predictions from ML backend
  const fetchMLPredictions = async (symbol) => {
    try {
      const response = await axios.get(`${ML_API_URL}/api/predict/${symbol}`, {
        params: { days: 30 },
        timeout: 30000
      });

      const data = response.data;

      setHistoricalData(data.historicalData || []);
      setPredictions(data.predictions || []);
      setModelMetrics({
        rmse: data.metrics?.rmse?.toFixed(4) || 'N/A',
        trend: data.metrics?.trend || 'neutral',
        trendPercent: data.metrics?.trendPercent?.toFixed(2) || '0',
        volatility: data.metrics?.volatility?.toFixed(2) || '0',
        lastPrice: data.metrics?.lastPrice?.toFixed(2) || '0',
        modelType: data.metrics?.modelType || 'ml_model'
      });

      return true;
    } catch (err) {
      console.error('ML Backend error:', err);
      return false;
    }
  };

  // Fetch data using fallback method
  const fetchFallbackData = async (symbol) => {
    const data = await stockApi.getHistoricalData(symbol, '3mo');

    if (!data || data.length === 0) {
      throw new Error('No historical data available for this ticker');
    }

    setHistoricalData(data);
    const { predictions: newPredictions, metrics } = generateFallbackPredictions(data);
    setPredictions(newPredictions);
    setModelMetrics(metrics);
  };

  const fetchData = async () => {
    if (!ticker.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const symbol = ticker.toUpperCase();

      // Try ML backend first if available
      if (useMLBackend && backendStatus === 'connected') {
        const success = await fetchMLPredictions(symbol);
        if (success) {
          setLoading(false);
          return;
        }
        // Fall back to client-side if ML backend fails
        console.log('ML Backend failed, using fallback...');
      }

      // Fallback to client-side prediction
      await fetchFallbackData(symbol);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (backendStatus !== 'checking') {
      fetchData();
    }
  }, [backendStatus]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    const historical = historicalData.slice(-30).map(d => ({
      date: d.date,
      close: d.close,
      type: 'historical'
    }));

    const predicted = predictions.map(p => ({
      date: p.date,
      predictedClose: p.predictedClose,
      type: 'prediction'
    }));

    if (historical.length > 0 && predicted.length > 0) {
      const lastHistorical = historical[historical.length - 1];
      predicted[0] = {
        ...predicted[0],
        close: lastHistorical.close,
      };
    }

    return [...historical, ...predicted];
  }, [historicalData, predictions]);

  const getModelTypeLabel = (modelType) => {
    const labels = {
      'lstm': 'LSTM Neural Network',
      'linear_regression': 'Linear Regression (Server)',
      'client_linear_regression': 'Linear Regression (Client)',
      'ml_model': 'ML Model'
    };
    return labels[modelType] || modelType;
  };

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Timeline sx={{ fontSize: 40, color: '#00d4ff', mr: 2 }} />
            <Typography variant="h4" fontWeight="bold">
              Stock Price Prediction
            </Typography>
          </Box>

          {/* Backend Status Indicator */}
          <Tooltip title={backendStatus === 'connected' ? 'ML Backend Connected' : 'Using Client-Side Model'}>
            <Chip
              icon={<Psychology />}
              label={backendStatus === 'connected' ? 'ML Backend' : 'Local Model'}
              color={backendStatus === 'connected' ? 'success' : 'default'}
              variant="outlined"
              size="small"
            />
          </Tooltip>
        </Box>

        {/* Search Form */}
        <Paper
          component="form"
          onSubmit={handleSearch}
          sx={{
            p: 3,
            mb: 3,
            background: 'linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(0,0,0,0) 100%)',
            border: '1px solid rgba(0,212,255,0.2)',
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Stock Ticker"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="Enter stock symbol (e.g., AAPL, MSFT, GOOGL)"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{
                  height: 56,
                  background: 'linear-gradient(45deg, #00d4ff 30%, #00a0cc 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #00a0cc 30%, #0088aa 90%)',
                  },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Prediction'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {!loading && predictions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Metrics Cards */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Assessment sx={{ color: '#00d4ff', mr: 1 }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          Model RMSE
                        </Typography>
                      </Box>
                      <Typography variant="h5" fontWeight="bold">
                        {modelMetrics?.rmse || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getModelTypeLabel(modelMetrics?.modelType)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <ShowChart sx={{ color: '#00d4ff', mr: 1 }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          Current Price
                        </Typography>
                      </Box>
                      <Typography variant="h5" fontWeight="bold">
                        ${modelMetrics?.lastPrice || 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{
                    background: modelMetrics?.trend === 'bullish'
                      ? 'rgba(76,175,80,0.1)'
                      : 'rgba(244,67,54,0.1)',
                    border: `1px solid ${modelMetrics?.trend === 'bullish' ? 'rgba(76,175,80,0.3)' : 'rgba(244,67,54,0.3)'}`
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {modelMetrics?.trend === 'bullish'
                          ? <TrendingUp sx={{ color: '#4caf50', mr: 1 }} />
                          : <TrendingDown sx={{ color: '#f44336', mr: 1 }} />
                        }
                        <Typography variant="subtitle2" color="text.secondary">
                          30-Day Trend
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip
                          label={modelMetrics?.trend?.toUpperCase() || 'N/A'}
                          color={modelMetrics?.trend === 'bullish' ? 'success' : 'error'}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="h6" fontWeight="bold" color={modelMetrics?.trend === 'bullish' ? 'success.main' : 'error.main'}>
                          {modelMetrics?.trendPercent > 0 ? '+' : ''}{modelMetrics?.trendPercent}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'rgba(255,152,0,0.1)', border: '1px solid rgba(255,152,0,0.3)' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Timeline sx={{ color: '#ff9800', mr: 1 }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          Volatility (Annual)
                        </Typography>
                      </Box>
                      <Typography variant="h5" fontWeight="bold">
                        {modelMetrics?.volatility}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Chart */}
              <Paper sx={{ p: 3, mb: 3, border: '1px solid rgba(0,212,255,0.2)' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <ShowChart sx={{ mr: 1, color: '#00d4ff' }} />
                  Price Prediction Chart - {ticker}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="date"
                      stroke="#888"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth()+1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis
                      stroke="#888"
                      domain={['auto', 'auto']}
                      tickFormatter={(value) => `$${value.toFixed(0)}`}
                    />
                    <ChartTooltip
                      contentStyle={{
                        backgroundColor: 'rgba(20, 30, 50, 0.95)',
                        border: '1px solid #00d4ff',
                        borderRadius: 8,
                      }}
                      formatter={(value, name) => [`$${value?.toFixed(2) || 'N/A'}`, name === 'close' ? 'Close Price' : 'Predicted Price']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <ReferenceLine
                      x={historicalData.length > 0 ? historicalData[historicalData.length - 1]?.date : null}
                      stroke="#ff9800"
                      strokeDasharray="5 5"
                      label={{ value: 'Today', fill: '#ff9800', fontSize: 12 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="close"
                      stroke="#00d4ff"
                      strokeWidth={2}
                      dot={false}
                      name="Close Price"
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="predictedClose"
                      stroke="#4caf50"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Predicted Price"
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>

              {/* Forecast Table */}
              <Paper sx={{ p: 3, border: '1px solid rgba(0,212,255,0.2)' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Timeline sx={{ mr: 1, color: '#00d4ff' }} />
                  30-Day Forecast Data - {ticker}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'rgba(0,212,255,0.1)' }}>Day</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'rgba(0,212,255,0.1)' }}>Date</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'rgba(0,212,255,0.1)' }}>Predicted Close</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'rgba(0,212,255,0.1)' }}>Change from Today</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'rgba(0,212,255,0.1)' }}>Confidence</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {predictions.map((row) => {
                        const changeFromToday = ((row.predictedClose - parseFloat(modelMetrics?.lastPrice || 0)) / parseFloat(modelMetrics?.lastPrice || 1)) * 100;
                        return (
                          <TableRow
                            key={row.day}
                            sx={{
                              '&:nth-of-type(odd)': { bgcolor: 'rgba(0,212,255,0.02)' },
                              '&:hover': { bgcolor: 'rgba(0,212,255,0.05)' }
                            }}
                          >
                            <TableCell>{row.day}</TableCell>
                            <TableCell>{row.date}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                              ${row.predictedClose.toFixed(2)}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                color: changeFromToday >= 0 ? '#4caf50' : '#f44336',
                                fontWeight: 'bold'
                              }}
                            >
                              {changeFromToday >= 0 ? '+' : ''}{changeFromToday.toFixed(2)}%
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={`${(row.confidence * 100).toFixed(0)}%`}
                                size="small"
                                sx={{
                                  bgcolor: `rgba(0,212,255,${row.confidence * 0.3})`,
                                  color: '#00d4ff',
                                  fontWeight: 'bold',
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* Disclaimer */}
              <Alert severity="warning" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Disclaimer:</strong> This prediction is based on {getModelTypeLabel(modelMetrics?.modelType)} using historical data patterns.
                  Stock prices are influenced by many factors not captured in this model. This is for educational purposes only
                  and should not be used as the sole basis for investment decisions.
                </Typography>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10 }}>
            <CircularProgress size={60} sx={{ color: '#00d4ff', mb: 2 }} />
            <Typography color="text.secondary">
              {useMLBackend ? 'Running ML model prediction...' : 'Generating prediction...'}
            </Typography>
          </Box>
        )}
      </motion.div>
    </Box>
  );
};

export default Prediction;
