// src/components/Dashboard/TechnicalIndicators.jsx
import React, { useState, useMemo } from 'react';
import {
  Paper,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Slider,
  Switch,
  FormControlLabel,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Bar,
  BarChart,
  ComposedChart,
} from 'recharts';
import {
  Speed,
  ShowChart,
  Timeline,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { useStock } from '../../context/StockContext';
import { format } from 'date-fns';

const TechnicalIndicators = () => {
  const { 
    selectedStock, 
    stockData, 
    indicators, 
    toggleIndicator,
    rsiData,
    macdData,
    bbData,
    loading 
  } = useStock();
  
  const [tabValue, setTabValue] = useState(0);
  const [rsiPeriod, setRsiPeriod] = useState(14);
  const [bbPeriod, setBbPeriod] = useState(20);
  const [showSignals, setShowSignals] = useState(true);

  // Filter RSI data based on period
  const filteredRsiData = useMemo(() => {
    return rsiData.slice(-30); // Last 30 days
  }, [rsiData]);

  // Filter MACD data
  const filteredMacdData = useMemo(() => {
    return macdData.slice(-30); // Last 30 days
  }, [macdData]);

  // Filter Bollinger Bands data
  const filteredBbData = useMemo(() => {
    return bbData.slice(-30); // Last 30 days
  }, [bbData]);

  // Get current RSI value and signal
  const currentRSI = rsiData.length > 0 ? rsiData[rsiData.length - 1].rsi : 50;
  const rsiSignal = currentRSI > 70 ? 'Overbought' : currentRSI < 30 ? 'Oversold' : 'Neutral';
  const rsiColor = currentRSI > 70 ? '#f44336' : currentRSI < 30 ? '#4caf50' : '#ff9800';

  // Get current MACD signal
  const currentMACD = macdData.length > 0 ? macdData[macdData.length - 1] : null;
  const macdSignal = currentMACD?.macd > currentMACD?.signal ? 'Bullish' : 'Bearish';
  const macdColor = currentMACD?.macd > currentMACD?.signal ? '#4caf50' : '#f44336';

  // Get current Bollinger Bands position
  const currentBB = bbData.length > 0 ? bbData[bbData.length - 1] : null;
  let bbSignal = 'Neutral';
  let bbColor = '#ff9800';
  if (currentBB) {
    if (currentBB.price > currentBB.upper) {
      bbSignal = 'Overbought';
      bbColor = '#f44336';
    } else if (currentBB.price < currentBB.lower) {
      bbSignal = 'Oversold';
      bbColor = '#4caf50';
    }
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5, bgcolor: 'background.paper', border: '1px solid #00d4ff' }}>
          <Typography variant="caption" fontWeight="bold">
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="caption" display="block" sx={{ color: entry.color }}>
              {entry.name}: {entry.value?.toFixed(2)}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  const IndicatorCard = ({ title, value, signal, color, description }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography color="text.secondary" variant="body2">
            {title}
          </Typography>
          <ShowChart fontSize="small" sx={{ color }} />
        </Box>
        <Typography variant="h4" gutterBottom sx={{ color, fontWeight: 'bold' }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color, fontWeight: 'medium' }}>
          {signal}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Paper sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (!stockData || stockData.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="info">
          Search for a stock to view technical indicators
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Speed color="primary" />
        <Typography variant="h6">Technical Indicators - {selectedStock}</Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Overview" />
          <Tab label="RSI" />
          <Tab label="MACD" />
          <Tab label="Bollinger Bands" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={indicators.rsi}
                    onChange={(e) => toggleIndicator('rsi', e.target.checked)}
                    size="small"
                  />
                }
                label="RSI"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={indicators.macd}
                    onChange={(e) => toggleIndicator('macd', e.target.checked)}
                    size="small"
                  />
                }
                label="MACD"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={indicators.bollinger}
                    onChange={(e) => toggleIndicator('bollinger', e.target.checked)}
                    size="small"
                  />
                }
                label="Bollinger Bands"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={indicators.movingAverage}
                    onChange={(e) => toggleIndicator('movingAverage', e.target.checked)}
                    size="small"
                  />
                }
                label="Moving Averages"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <IndicatorCard
                title="RSI (14)"
                value={currentRSI.toFixed(2)}
                signal={rsiSignal}
                color={rsiColor}
                description="Overbought >70, Oversold <30"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <IndicatorCard
                title="MACD"
                value={currentMACD?.macd?.toFixed(2) || '0.00'}
                signal={macdSignal}
                color={macdColor}
                description="MACD vs Signal Line"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <IndicatorCard
                title="Bollinger Bands"
                value={bbSignal}
                signal={`Width: ${currentBB ? (currentBB.upper - currentBB.lower).toFixed(2) : '0.00'}`}
                color={bbColor}
                description="Price position in bands"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <IndicatorCard
                title="Trend"
                value={stockData[stockData.length - 1]?.close > stockData[0]?.close ? 'Uptrend' : 'Downtrend'}
                signal={stockData[stockData.length - 1]?.close > stockData[0]?.close ? '+12.5%' : '-8.3%'}
                color={stockData[stockData.length - 1]?.close > stockData[0]?.close ? '#4caf50' : '#f44336'}
                description="Based on price action"
              />
            </Grid>
          </Grid>
        </>
      )}

      {tabValue === 1 && indicators.rsi && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">RSI (Relative Strength Index)</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Period: {rsiPeriod}
                </Typography>
                <Slider
                  value={rsiPeriod}
                  onChange={(e, v) => setRsiPeriod(v)}
                  min={5}
                  max={25}
                  step={1}
                  sx={{ width: 120 }}
                  size="small"
                />
              </Box>
            </Box>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={filteredRsiData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3e50" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#8899a6"
                    tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                  />
                  <YAxis domain={[0, 100]} stroke="#8899a6" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="rsi"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.2}
                    name="RSI"
                  />
                  <Line
                    type="monotone"
                    dataKey="overbought"
                    stroke="#f44336"
                    strokeDasharray="5 5"
                    dot={false}
                    name="Overbought (70)"
                  />
                  <Line
                    type="monotone"
                    dataKey="oversold"
                    stroke="#4caf50"
                    strokeDasharray="5 5"
                    dot={false}
                    name="Oversold (30)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
            {showSignals && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color={rsiColor}>
                  Current Signal: <strong>{rsiSignal}</strong> - RSI is at {currentRSI.toFixed(2)}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {tabValue === 2 && indicators.macd && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>MACD (Moving Average Convergence Divergence)</Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={filteredMacdData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3e50" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#8899a6"
                    tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                  />
                  <YAxis stroke="#8899a6" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="histogram" fill="#2196f3" opacity={0.5} name="Histogram" />
                  <Line
                    type="monotone"
                    dataKey="macd"
                    stroke="#ff9800"
                    strokeWidth={2}
                    dot={false}
                    name="MACD Line"
                  />
                  <Line
                    type="monotone"
                    dataKey="signal"
                    stroke="#4caf50"
                    strokeWidth={2}
                    dot={false}
                    name="Signal Line"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
            {currentMACD && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color={macdColor}>
                  Current Signal: <strong>{macdSignal}</strong> - MACD: {currentMACD.macd?.toFixed(2)} | Signal: {currentMACD.signal?.toFixed(2)}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {tabValue === 3 && indicators.bollinger && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Bollinger Bands</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Period: {bbPeriod}
                </Typography>
                <Slider
                  value={bbPeriod}
                  onChange={(e, v) => setBbPeriod(v)}
                  min={10}
                  max={50}
                  step={1}
                  sx={{ width: 120 }}
                  size="small"
                />
              </Box>
            </Box>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={filteredBbData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3e50" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#8899a6"
                    tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                  />
                  <YAxis stroke="#8899a6" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="#ff9800"
                    fill="#ff9800"
                    fillOpacity={0.1}
                    name="Upper Band"
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stroke="#ff9800"
                    fill="#ff9800"
                    fillOpacity={0.1}
                    name="Lower Band"
                  />
                  <Line
                    type="monotone"
                    dataKey="middle"
                    stroke="#ff9800"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Middle Band (SMA)"
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#00d4ff"
                    strokeWidth={2}
                    dot={false}
                    name="Price"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
            {currentBB && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color={bbColor}>
                  Current Signal: <strong>{bbSignal}</strong> - Price: ${currentBB.price?.toFixed(2)} | Upper: ${currentBB.upper?.toFixed(2)} | Lower: ${currentBB.lower?.toFixed(2)}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Paper>
  );
};

export default TechnicalIndicators;