// src/components/Analysis/TechnicalAnalysis.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Fade,
  Zoom,
  Slider,
  Switch,
  FormControlLabel,
  Button,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  ShowChart as ShowChartIcon,
  TrendingUp,
  TrendingDown,
  Timeline,
  Speed,
  Assessment,
  Info,
  Warning,
  CheckCircle,
  Refresh,
  Download,
  Share,
  Settings,
  SignalCellularAlt,
  Equalizer,
  BubbleChart,
  DonutLarge,
  ScatterPlot,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  Bar,
  BarChart,
  Scatter,
  ScatterChart,
  ZAxis,
  ReferenceLine,
  ReferenceArea,
  Brush,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useStock } from '../../context/StockContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import stockApi from '../../services/stockApi';
import { calculateAllIndicators } from '../../services/technicalIndicators';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// Tab Panel Component
const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`tech-tabpanel-${index}`}
    aria-labelledby={`tech-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const TechnicalAnalysis = () => {
  const { selectedStock, stockData, fetchStockData } = useStock();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [timeframe, setTimeframe] = useState('1mo');
  const [indicatorPeriod, setIndicatorPeriod] = useState(14);
  const [showSignals, setShowSignals] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [chartType, setChartType] = useState('candle');
  
  // Indicator states
  const [rsiData, setRsiData] = useState([]);
  const [macdData, setMacdData] = useState([]);
  const [bbData, setBbData] = useState([]);
  const [smaData, setSmaData] = useState([]);
  const [emaData, setEmaData] = useState([]);
  const [stochData, setStochData] = useState([]);
  const [cciData, setCciData] = useState([]);
  const [adxData, setAdxData] = useState([]);
  const [obvData, setObvData] = useState([]);
  const [vwapData, setVwapData] = useState([]);
  const [fibLevels, setFibLevels] = useState([]);
  const [pivotPoints, setPivotPoints] = useState({});
  
  // Indicator toggles
  const [indicators, setIndicators] = useState({
    rsi: true,
    macd: true,
    bollinger: true,
    movingAverage: true,
    stochastic: false,
    cci: false,
    adx: false,
    obv: false,
    vwap: false,
    fibonacci: false,
    pivot: false,
  });

  // Calculate all indicators when stock data changes
  useEffect(() => {
    if (stockData && stockData.length > 0) {
      calculateTechnicalIndicators();
    }
  }, [stockData, indicatorPeriod]);

  const calculateTechnicalIndicators = useCallback(() => {
    if (!stockData || stockData.length === 0) return;

    // Calculate RSI
    const rsi = calculateRSI(stockData, indicatorPeriod);
    setRsiData(rsi);

    // Calculate MACD
    const macd = calculateMACD(stockData);
    setMacdData(macd);

    // Calculate Bollinger Bands
    const bb = calculateBollingerBands(stockData, 20);
    setBbData(bb);

    // Calculate Moving Averages
    const sma20 = calculateSMA(stockData, 20);
    const sma50 = calculateSMA(stockData, 50);
    const ema12 = calculateEMA(stockData, 12);
    const ema26 = calculateEMA(stockData, 26);
    setSmaData({ sma20, sma50 });
    setEmaData({ ema12, ema26 });

    // Calculate Stochastic
    const stoch = calculateStochastic(stockData, 14);
    setStochData(stoch);

    // Calculate CCI
    const cci = calculateCCI(stockData, 20);
    setCciData(cci);

    // Calculate ADX
    const adx = calculateADX(stockData, 14);
    setAdxData(adx);

    // Calculate OBV
    const obv = calculateOBV(stockData);
    setObvData(obv);

    // Calculate VWAP
    const vwap = calculateVWAP(stockData);
    setVwapData(vwap);

    // Calculate Fibonacci levels
    const fib = calculateFibonacciLevels(stockData);
    setFibLevels(fib);

    // Calculate Pivot Points
    const pivot = calculatePivotPoints(stockData);
    setPivotPoints(pivot);
  }, [stockData, indicatorPeriod]);

  // Technical Indicator Calculation Functions
  const calculateRSI = (data, period = 14) => {
    const rsiData = [];
    const changes = [];
    
    for (let i = 1; i < data.length; i++) {
      changes.push(data[i].close - data[i-1].close);
    }
    
    for (let i = period; i < changes.length; i++) {
      let avgGain = 0;
      let avgLoss = 0;
      
      for (let j = i - period; j < i; j++) {
        if (changes[j] > 0) {
          avgGain += changes[j];
        } else {
          avgLoss -= changes[j];
        }
      }
      
      avgGain /= period;
      avgLoss /= period;
      
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      
      rsiData.push({
        date: data[i].date,
        rsi,
        overbought: 70,
        oversold: 30,
        signal: rsi > 70 ? 'overbought' : rsi < 30 ? 'oversold' : 'neutral'
      });
    }
    
    return rsiData;
  };

  const calculateMACD = (data) => {
    const ema12 = calculateEMA(data, 12);
    const ema26 = calculateEMA(data, 26);
    
    const macdLine = [];
    const signalLine = [];
    const histogram = [];
    
    for (let i = 0; i < data.length; i++) {
      if (ema12[i] && ema26[i]) {
        const macd = ema12[i].ema - ema26[i].ema;
        macdLine.push({ date: data[i].date, macd });
        
        if (i >= 34) {
          const signal = calculateEMA(macdLine.slice(-9), 9)[8]?.ema || 0;
          signalLine.push({ date: data[i].date, signal });
          histogram.push({ 
            date: data[i].date, 
            histogram: macd - signal,
            signal: macd > signal ? 'bullish' : 'bearish'
          });
        }
      }
    }
    
    return { macdLine, signalLine, histogram };
  };

  const calculateSMA = (data, period) => {
    const smaData = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0);
      smaData.push({
        date: data[i].date,
        value: sum / period
      });
    }
    return smaData;
  };

  const calculateEMA = (data, period) => {
    const k = 2 / (period + 1);
    const emaData = [];
    let ema = data[0].close;
    
    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        ema = data[i].close;
      } else {
        ema = data[i].close * k + ema * (1 - k);
      }
      emaData.push({
        date: data[i].date,
        ema
      });
    }
    
    return emaData;
  };

  const calculateBollingerBands = (data, period = 20, stdDev = 2) => {
    const bbData = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const prices = slice.map(d => d.close);
      
      const sma = prices.reduce((acc, price) => acc + price, 0) / period;
      const variance = prices.reduce((acc, price) => acc + Math.pow(price - sma, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      const upper = sma + (standardDeviation * stdDev);
      const lower = sma - (standardDeviation * stdDev);
      
      let signal = 'neutral';
      if (data[i].close > upper) signal = 'overbought';
      else if (data[i].close < lower) signal = 'oversold';
      
      bbData.push({
        date: data[i].date,
        upper,
        middle: sma,
        lower,
        price: data[i].close,
        bandwidth: (upper - lower) / sma,
        signal
      });
    }
    
    return bbData;
  };

  const calculateStochastic = (data, period = 14) => {
    const stochData = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const high = Math.max(...slice.map(d => d.high));
      const low = Math.min(...slice.map(d => d.low));
      const current = data[i].close;
      
      const k = ((current - low) / (high - low)) * 100;
      const d = k; // Simplified %D
      
      stochData.push({
        date: data[i].date,
        k,
        d,
        signal: k > 80 ? 'overbought' : k < 20 ? 'oversold' : 'neutral'
      });
    }
    
    return stochData;
  };

  const calculateCCI = (data, period = 20) => {
    const cciData = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const typicalPrices = slice.map(d => (d.high + d.low + d.close) / 3);
      const sma = typicalPrices.reduce((a, b) => a + b, 0) / period;
      const meanDeviation = typicalPrices.reduce((acc, price) => acc + Math.abs(price - sma), 0) / period;
      
      const currentTP = (data[i].high + data[i].low + data[i].close) / 3;
      const cci = meanDeviation === 0 ? 0 : (currentTP - sma) / (0.015 * meanDeviation);
      
      cciData.push({
        date: data[i].date,
        cci,
        signal: cci > 100 ? 'overbought' : cci < -100 ? 'oversold' : 'neutral'
      });
    }
    
    return cciData;
  };

  const calculateADX = (data, period = 14) => {
    const adxData = [];
    
    for (let i = period * 2; i < data.length; i++) {
      const plusDM = [];
      const minusDM = [];
      const tr = [];
      
      for (let j = i - period + 1; j <= i; j++) {
        const high = data[j].high;
        const low = data[j].low;
        const prevHigh = data[j-1].high;
        const prevLow = data[j-1].low;
        const prevClose = data[j-1].close;
        
        const upMove = high - prevHigh;
        const downMove = prevLow - low;
        
        if (upMove > downMove && upMove > 0) {
          plusDM.push(upMove);
        } else {
          plusDM.push(0);
        }
        
        if (downMove > upMove && downMove > 0) {
          minusDM.push(downMove);
        } else {
          minusDM.push(0);
        }
        
        tr.push(Math.max(
          high - low,
          Math.abs(high - prevClose),
          Math.abs(low - prevClose)
        ));
      }
      
      const avgTR = tr.reduce((a, b) => a + b, 0) / period;
      const avgPlusDM = plusDM.reduce((a, b) => a + b, 0) / period;
      const avgMinusDM = minusDM.reduce((a, b) => a + b, 0) / period;
      
      const plusDI = (avgPlusDM / avgTR) * 100;
      const minusDI = (avgMinusDM / avgTR) * 100;
      const dx = Math.abs((plusDI - minusDI) / (plusDI + minusDI)) * 100;
      
      adxData.push({
        date: data[i].date,
        adx: dx,
        plusDI,
        minusDI,
        trend: dx > 25 ? 'strong' : dx > 20 ? 'moderate' : 'weak'
      });
    }
    
    return adxData;
  };

  const calculateOBV = (data) => {
    const obvData = [];
    let obv = 0;
    
    for (let i = 0; i < data.length; i++) {
      if (i > 0) {
        if (data[i].close > data[i-1].close) {
          obv += data[i].volume;
        } else if (data[i].close < data[i-1].close) {
          obv -= data[i].volume;
        }
      }
      
      obvData.push({
        date: data[i].date,
        obv
      });
    }
    
    return obvData;
  };

  const calculateVWAP = (data) => {
    const vwapData = [];
    let cumulativeTPV = 0;
    let cumulativeVolume = 0;
    
    for (let i = 0; i < data.length; i++) {
      const typicalPrice = (data[i].high + data[i].low + data[i].close) / 3;
      cumulativeTPV += typicalPrice * data[i].volume;
      cumulativeVolume += data[i].volume;
      
      vwapData.push({
        date: data[i].date,
        vwap: cumulativeTPV / cumulativeVolume
      });
    }
    
    return vwapData;
  };

  const calculateFibonacciLevels = (data) => {
    const prices = data.map(d => d.close);
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const diff = high - low;
    
    return [
      { level: '0%', value: low, color: '#8884d8' },
      { level: '23.6%', value: low + diff * 0.236, color: '#4caf50' },
      { level: '38.2%', value: low + diff * 0.382, color: '#ff9800' },
      { level: '50%', value: low + diff * 0.5, color: '#ff6b6b' },
      { level: '61.8%', value: low + diff * 0.618, color: '#f44336' },
      { level: '78.6%', value: low + diff * 0.786, color: '#9c27b0' },
      { level: '100%', value: high, color: '#00d4ff' },
    ];
  };

  const calculatePivotPoints = (data) => {
    if (data.length < 1) return {};
    
    const lastDay = data[data.length - 1];
    const high = lastDay.high;
    const low = lastDay.low;
    const close = lastDay.close;
    
    const pivot = (high + low + close) / 3;
    const r1 = 2 * pivot - low;
    const r2 = pivot + (high - low);
    const r3 = high + 2 * (pivot - low);
    const s1 = 2 * pivot - high;
    const s2 = pivot - (high - low);
    const s3 = low - 2 * (high - pivot);
    
    return { pivot, r1, r2, r3, s1, s2, s3 };
  };

  // Generate trading signals
  const tradingSignals = useMemo(() => {
    const signals = [];
    
    if (rsiData.length > 0) {
      const lastRSI = rsiData[rsiData.length - 1];
      signals.push({
        indicator: 'RSI',
        value: lastRSI.rsi.toFixed(2),
        signal: lastRSI.signal,
        action: lastRSI.signal === 'oversold' ? 'BUY' : lastRSI.signal === 'overbought' ? 'SELL' : 'HOLD',
        strength: Math.abs(50 - lastRSI.rsi) / 50 * 100,
      });
    }
    
    if (macdData.histogram && macdData.histogram.length > 0) {
      const lastHist = macdData.histogram[macdData.histogram.length - 1];
      signals.push({
        indicator: 'MACD',
        value: lastHist.histogram.toFixed(2),
        signal: lastHist.signal,
        action: lastHist.signal === 'bullish' ? 'BUY' : lastHist.signal === 'bearish' ? 'SELL' : 'HOLD',
        strength: Math.abs(lastHist.histogram) / 2 * 100,
      });
    }
    
    if (bbData.length > 0) {
      const lastBB = bbData[bbData.length - 1];
      signals.push({
        indicator: 'Bollinger Bands',
        value: lastBB.bandwidth.toFixed(3),
        signal: lastBB.signal,
        action: lastBB.signal === 'oversold' ? 'BUY' : lastBB.signal === 'overbought' ? 'SELL' : 'HOLD',
        strength: lastBB.bandwidth * 100,
      });
    }
    
    if (stochData.length > 0) {
      const lastStoch = stochData[stochData.length - 1];
      signals.push({
        indicator: 'Stochastic',
        value: lastStoch.k.toFixed(2),
        signal: lastStoch.signal,
        action: lastStoch.signal === 'oversold' ? 'BUY' : lastStoch.signal === 'overbought' ? 'SELL' : 'HOLD',
        strength: Math.abs(50 - lastStoch.k) / 50 * 100,
      });
    }
    
    if (cciData.length > 0) {
      const lastCCI = cciData[cciData.length - 1];
      signals.push({
        indicator: 'CCI',
        value: lastCCI.cci.toFixed(2),
        signal: lastCCI.signal,
        action: lastCCI.signal === 'oversold' ? 'BUY' : lastCCI.signal === 'overbought' ? 'SELL' : 'HOLD',
        strength: Math.abs(lastCCI.cci) / 200 * 100,
      });
    }
    
    if (adxData.length > 0) {
      const lastADX = adxData[adxData.length - 1];
      signals.push({
        indicator: 'ADX',
        value: lastADX.adx.toFixed(2),
        signal: lastADX.trend,
        action: lastADX.trend === 'strong' ? 'TREND' : 'RANGE',
        strength: lastADX.adx,
      });
    }
    
    return signals;
  }, [rsiData, macdData, bbData, stochData, cciData, adxData]);

  // Overall technical rating
  const technicalRating = useMemo(() => {
    if (tradingSignals.length === 0) return { rating: 'Neutral', score: 50, color: '#ff9800' };
    
    const buySignals = tradingSignals.filter(s => s.action === 'BUY').length;
    const sellSignals = tradingSignals.filter(s => s.action === 'SELL').length;
    const total = tradingSignals.length;
    
    const score = (buySignals / total) * 100;
    
    if (score >= 70) return { rating: 'Strong Buy', score, color: '#4caf50' };
    if (score >= 55) return { rating: 'Buy', score, color: '#8bc34a' };
    if (score >= 45) return { rating: 'Neutral', score, color: '#ff9800' };
    if (score >= 30) return { rating: 'Sell', score, color: '#ff6b6b' };
    return { rating: 'Strong Sell', score, color: '#f44336' };
  }, [tradingSignals]);

  // Support and Resistance levels
  const supportResistance = useMemo(() => {
    if (!stockData || stockData.length < 20) return { supports: [], resistances: [] };
    
    const prices = stockData.map(d => d.close);
    const highs = stockData.map(d => d.high);
    const lows = stockData.map(d => d.low);
    
    // Find local maxima for resistance
    const resistances = [];
    for (let i = 1; i < highs.length - 1; i++) {
      if (highs[i] > highs[i-1] && highs[i] > highs[i+1]) {
        resistances.push(highs[i]);
      }
    }
    
    // Find local minima for support
    const supports = [];
    for (let i = 1; i < lows.length - 1; i++) {
      if (lows[i] < lows[i-1] && lows[i] < lows[i+1]) {
        supports.push(lows[i]);
      }
    }
    
    // Get unique levels (rounded to 2 decimals)
    const uniqueResistances = [...new Set(resistances.map(r => Math.round(r * 100) / 100))].sort((a, b) => b - a).slice(0, 3);
    const uniqueSupports = [...new Set(supports.map(s => Math.round(s * 100) / 100))].sort((a, b) => a - b).slice(0, 3);
    
    return {
      resistances: uniqueResistances,
      supports: uniqueSupports,
      currentPrice: prices[prices.length - 1],
    };
  }, [stockData]);

  const toggleIndicator = (indicator) => {
    setIndicators(prev => ({ ...prev, [indicator]: !prev[indicator] }));
  };

  const refreshData = () => {
    setLoading(true);
    fetchStockData(selectedStock, timeframe).then(() => {
      setLoading(false);
      toast.success('Technical indicators updated');
    });
  };

  const exportAnalysis = () => {
    const analysisData = {
      stock: selectedStock,
      timestamp: new Date().toISOString(),
      signals: tradingSignals,
      rating: technicalRating,
      supportResistance,
      pivotPoints,
      fibLevels,
    };
    
    const blob = new Blob([JSON.stringify(analysisData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedStock}-technical-analysis-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Analysis exported');
  };

  const colors = {
    buy: '#4caf50',
    sell: '#f44336',
    neutral: '#ff9800',
    strong: '#00d4ff',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <Paper sx={{ p: 4, mb: 3, background: 'linear-gradient(135deg, #132f4c 0%, #1a3a5f 100%)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Equalizer sx={{ fontSize: 40, color: '#00d4ff' }} />
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Technical Analysis - {selectedStock}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Advanced technical indicators and real-time market analysis
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Refresh data">
              <IconButton onClick={refreshData} disabled={loading} sx={{ color: '#00d4ff' }}>
                {loading ? <CircularProgress size={24} /> : <Refresh />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Export analysis">
              <IconButton onClick={exportAnalysis} sx={{ color: '#00d4ff' }}>
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton sx={{ color: '#00d4ff' }}>
                <Share />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Technical Rating Card */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'background.default', border: `2px solid ${technicalRating.color}` }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Technical Rating
                </Typography>
                <Typography variant="h3" fontWeight="bold" sx={{ color: technicalRating.color }}>
                  {technicalRating.rating}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ flex: 1, bgcolor: 'background.paper', borderRadius: 1, height: 8 }}>
                    <Box
                      sx={{
                        width: `${technicalRating.score}%`,
                        height: '100%',
                        bgcolor: technicalRating.color,
                        borderRadius: 1,
                        transition: 'width 0.5s',
                      }}
                    />
                  </Box>
                  <Typography variant="body2" fontWeight="bold">
                    {technicalRating.score.toFixed(0)}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'background.default' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Signal Summary
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Chip
                      label={`${tradingSignals.filter(s => s.action === 'BUY').length} Buy`}
                      size="small"
                      sx={{ bgcolor: 'rgba(76,175,80,0.1)', color: '#4caf50', width: '100%' }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Chip
                      label={`${tradingSignals.filter(s => s.action === 'SELL').length} Sell`}
                      size="small"
                      sx={{ bgcolor: 'rgba(244,67,54,0.1)', color: '#f44336', width: '100%' }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Chip
                      label={`${tradingSignals.filter(s => s.action === 'HOLD').length} Hold`}
                      size="small"
                      sx={{ bgcolor: 'rgba(255,152,0,0.1)', color: '#ff9800', width: '100%' }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'background.default' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Market Context
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Trend Strength:</Typography>
                  <Chip
                    label={adxData.length > 0 ? adxData[adxData.length-1].trend : 'N/A'}
                    size="small"
                    color={adxData.length > 0 && adxData[adxData.length-1].adx > 25 ? 'success' : 'warning'}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Volatility:</Typography>
                  <Chip
                    label={bbData.length > 0 ? `${(bbData[bbData.length-1].bandwidth * 100).toFixed(1)}%` : 'N/A'}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Paper sx={{ p: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Overview" icon={<ShowChartIcon />} iconPosition="start" />
          <Tab label="Momentum" icon={<TrendingUp />} iconPosition="start" />
          <Tab label="Trend" icon={<Timeline />} iconPosition="start" />
          <Tab label="Volume" icon={<SignalCellularAlt />} iconPosition="start" />
          <Tab label="Support/Resistance" icon={<BubbleChart />} iconPosition="start" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Trading Signals */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Trading Signals
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Indicator</TableCell>
                          <TableCell align="right">Value</TableCell>
                          <TableCell align="center">Signal</TableCell>
                          <TableCell align="center">Action</TableCell>
                          <TableCell align="right">Strength</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tradingSignals.map((signal, index) => (
                          <TableRow key={index}>
                            <TableCell>{signal.indicator}</TableCell>
                            <TableCell align="right">{signal.value}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={signal.signal}
                                size="small"
                                sx={{
                                  bgcolor: signal.signal.includes('overbought') ? 'rgba(244,67,54,0.1)' :
                                          signal.signal.includes('oversold') ? 'rgba(76,175,80,0.1)' :
                                          'rgba(255,152,0,0.1)',
                                  color: signal.signal.includes('overbought') ? '#f44336' :
                                         signal.signal.includes('oversold') ? '#4caf50' :
                                         '#ff9800',
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={signal.action}
                                size="small"
                                sx={{
                                  bgcolor: signal.action === 'BUY' ? 'rgba(76,175,80,0.1)' :
                                          signal.action === 'SELL' ? 'rgba(244,67,54,0.1)' :
                                          'rgba(255,152,0,0.1)',
                                  color: signal.action === 'BUY' ? '#4caf50' :
                                         signal.action === 'SELL' ? '#f44336' :
                                         '#ff9800',
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 50, bgcolor: 'background.paper', borderRadius: 1, height: 4 }}>
                                  <Box
                                    sx={{
                                      width: `${signal.strength}%`,
                                      height: '100%',
                                      bgcolor: signal.action === 'BUY' ? '#4caf50' :
                                              signal.action === 'SELL' ? '#f44336' :
                                              '#ff9800',
                                      borderRadius: 1,
                                    }}
                                  />
                                </Box>
                                <Typography variant="caption">
                                  {signal.strength.toFixed(0)}%
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Support & Resistance */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Support & Resistance Levels
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Resistance
                      </Typography>
                      {supportResistance.resistances.map((level, index) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">R{index + 1}:</Typography>
                          <Typography variant="body2" fontWeight="bold" sx={{ color: '#f44336' }}>
                            ${level.toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                      {pivotPoints.r1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">R1 (Pivot):</Typography>
                          <Typography variant="body2" sx={{ color: '#ff9800' }}>
                            ${pivotPoints.r1.toFixed(2)}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Support
                      </Typography>
                      {supportResistance.supports.map((level, index) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">S{index + 1}:</Typography>
                          <Typography variant="body2" fontWeight="bold" sx={{ color: '#4caf50' }}>
                            ${level.toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                      {pivotPoints.s1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">S1 (Pivot):</Typography>
                          <Typography variant="body2" sx={{ color: '#ff9800' }}>
                            ${pivotPoints.s1.toFixed(2)}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Fibonacci Levels
                  </Typography>
                  <Grid container spacing={1}>
                    {fibLevels.map((level, index) => (
                      <Grid item xs={6} key={index}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption">{level.level}:</Typography>
                          <Typography variant="caption" sx={{ color: level.color }}>
                            ${level.value.toFixed(2)}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Pivot Points */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Pivot Points Analysis
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">R3</Typography>
                        <Typography variant="h6" sx={{ color: '#f44336' }}>
                          ${pivotPoints.r3?.toFixed(2) || '---'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">R2</Typography>
                        <Typography variant="h6" sx={{ color: '#ff6b6b' }}>
                          ${pivotPoints.r2?.toFixed(2) || '---'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">R1</Typography>
                        <Typography variant="h6" sx={{ color: '#ff9800' }}>
                          ${pivotPoints.r1?.toFixed(2) || '---'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">Pivot</Typography>
                        <Typography variant="h6" sx={{ color: '#00d4ff' }}>
                          ${pivotPoints.pivot?.toFixed(2) || '---'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">S1</Typography>
                        <Typography variant="h6" sx={{ color: '#8bc34a' }}>
                          ${pivotPoints.s1?.toFixed(2) || '---'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">S2</Typography>
                        <Typography variant="h6" sx={{ color: '#4caf50' }}>
                          ${pivotPoints.s2?.toFixed(2) || '---'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">S3</Typography>
                        <Typography variant="h6" sx={{ color: '#2e7d32' }}>
                          ${pivotPoints.s3?.toFixed(2) || '---'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Momentum Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {/* RSI Chart */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">RSI (14)</Typography>
                    <Chip
                      label={rsiData.length > 0 ? rsiData[rsiData.length-1].signal : 'N/A'}
                      size="small"
                      sx={{
                        bgcolor: rsiData.length > 0 && rsiData[rsiData.length-1].rsi > 70 ? 'rgba(244,67,54,0.1)' :
                                rsiData.length > 0 && rsiData[rsiData.length-1].rsi < 30 ? 'rgba(76,175,80,0.1)' :
                                'rgba(255,152,0,0.1)',
                        color: rsiData.length > 0 && rsiData[rsiData.length-1].rsi > 70 ? '#f44336' :
                               rsiData.length > 0 && rsiData[rsiData.length-1].rsi < 30 ? '#4caf50' :
                               '#ff9800',
                      }}
                    />
                  </Box>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={rsiData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="#8899a6" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 100]} stroke="#8899a6" />
                        <RechartsTooltip
                          contentStyle={{ background: '#132f4c', border: '1px solid #00d4ff' }}
                        />
                        <ReferenceLine y={70} stroke="#f44336" strokeDasharray="3 3" />
                        <ReferenceLine y={30} stroke="#4caf50" strokeDasharray="3 3" />
                        <Area
                          type="monotone"
                          dataKey="rsi"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.3}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* MACD Chart */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">MACD</Typography>
                    <Chip
                      label={macdData.histogram?.length > 0 ? macdData.histogram[macdData.histogram.length-1].signal : 'N/A'}
                      size="small"
                      sx={{
                        bgcolor: macdData.histogram?.length > 0 && macdData.histogram[macdData.histogram.length-1].histogram > 0
                          ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)',
                        color: macdData.histogram?.length > 0 && macdData.histogram[macdData.histogram.length-1].histogram > 0
                          ? '#4caf50' : '#f44336',
                      }}
                    />
                  </Box>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={macdData.histogram}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="#8899a6" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#8899a6" />
                        <RechartsTooltip
                          contentStyle={{ background: '#132f4c', border: '1px solid #00d4ff' }}
                        />
                        <Bar dataKey="histogram" fill="#8884d8" fillOpacity={0.5} />
                        <Line type="monotone" dataKey="macd" stroke="#ff9800" dot={false} />
                        <Line type="monotone" dataKey="signal" stroke="#4caf50" dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Stochastic */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Stochastic Oscillator</Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={stochData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="#8899a6" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 100]} stroke="#8899a6" />
                        <RechartsTooltip
                          contentStyle={{ background: '#132f4c', border: '1px solid #00d4ff' }}
                        />
                        <ReferenceLine y={80} stroke="#f44336" strokeDasharray="3 3" />
                        <ReferenceLine y={20} stroke="#4caf50" strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="k" stroke="#00d4ff" dot={false} />
                        <Line type="monotone" dataKey="d" stroke="#ff9800" dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* CCI */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Commodity Channel Index (CCI)</Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={cciData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="#8899a6" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#8899a6" />
                        <RechartsTooltip
                          contentStyle={{ background: '#132f4c', border: '1px solid #00d4ff' }}
                        />
                        <ReferenceLine y={100} stroke="#f44336" strokeDasharray="3 3" />
                        <ReferenceLine y={-100} stroke="#4caf50" strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="cci" stroke="#ff6b6b" dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Trend Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {/* Moving Averages */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Moving Averages</Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">SMA 20</Typography>
                        <Typography variant="h6" sx={{ color: '#ff6b6b' }}>
                          ${smaData.sma20?.[smaData.sma20.length-1]?.value.toFixed(2) || '---'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">SMA 50</Typography>
                        <Typography variant="h6" sx={{ color: '#ff9800' }}>
                          ${smaData.sma50?.[smaData.sma50.length-1]?.value.toFixed(2) || '---'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">EMA 12</Typography>
                        <Typography variant="h6" sx={{ color: '#4caf50' }}>
                          ${emaData.ema12?.[emaData.ema12.length-1]?.ema.toFixed(2) || '---'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">EMA 26</Typography>
                        <Typography variant="h6" sx={{ color: '#00d4ff' }}>
                          ${emaData.ema26?.[emaData.ema26.length-1]?.ema.toFixed(2) || '---'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* ADX */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Average Directional Index (ADX)</Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={adxData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="#8899a6" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#8899a6" />
                        <RechartsTooltip
                          contentStyle={{ background: '#132f4c', border: '1px solid #00d4ff' }}
                        />
                        <ReferenceLine y={25} stroke="#4caf50" strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="adx" stroke="#00d4ff" dot={false} />
                        <Line type="monotone" dataKey="plusDI" stroke="#4caf50" dot={false} />
                        <Line type="monotone" dataKey="minusDI" stroke="#f44336" dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Bollinger Bands */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Bollinger Bands</Typography>
                    <Chip
                      label={bbData.length > 0 ? bbData[bbData.length-1].signal : 'N/A'}
                      size="small"
                      sx={{
                        bgcolor: bbData.length > 0 && bbData[bbData.length-1].signal === 'overbought' ? 'rgba(244,67,54,0.1)' :
                                bbData.length > 0 && bbData[bbData.length-1].signal === 'oversold' ? 'rgba(76,175,80,0.1)' :
                                'rgba(255,152,0,0.1)',
                        color: bbData.length > 0 && bbData[bbData.length-1].signal === 'overbought' ? '#f44336' :
                               bbData.length > 0 && bbData[bbData.length-1].signal === 'oversold' ? '#4caf50' :
                               '#ff9800',
                      }}
                    />
                  </Box>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={bbData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="#8899a6" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#8899a6" />
                        <RechartsTooltip
                          contentStyle={{ background: '#132f4c', border: '1px solid #00d4ff' }}
                        />
                        <Area type="monotone" dataKey="upper" stroke="#ff9800" fill="#ff9800" fillOpacity={0.1} />
                        <Area type="monotone" dataKey="lower" stroke="#ff9800" fill="#ff9800" fillOpacity={0.1} />
                        <Line type="monotone" dataKey="middle" stroke="#ff9800" dot={false} />
                        <Line type="monotone" dataKey="price" stroke="#00d4ff" dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Volume Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            {/* OBV */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>On-Balance Volume (OBV)</Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={obvData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="#8899a6" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#8899a6" />
                        <RechartsTooltip
                          contentStyle={{ background: '#132f4c', border: '1px solid #00d4ff' }}
                        />
                        <Line type="monotone" dataKey="obv" stroke="#8884d8" dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* VWAP */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Volume Weighted Average Price (VWAP)</Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={vwapData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="#8899a6" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#8899a6" />
                        <RechartsTooltip
                          contentStyle={{ background: '#132f4c', border: '1px solid #00d4ff' }}
                        />
                        <Line type="monotone" dataKey="vwap" stroke="#00d4ff" dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Support/Resistance Tab */}
        <TabPanel value={tabValue} index={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Support & Resistance Chart</Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={stockData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="#8899a6" />
                    <YAxis stroke="#8899a6" />
                    <RechartsTooltip
                      contentStyle={{ background: '#132f4c', border: '1px solid #00d4ff' }}
                    />
                    <Line type="monotone" dataKey="close" stroke="#00d4ff" dot={false} />
                    
                    {/* Support Lines */}
                    {supportResistance.supports.map((level, index) => (
                      <ReferenceLine
                        key={index}
                        y={level}
                        stroke="#4caf50"
                        strokeDasharray="5 5"
                        label={{
                          value: `S${index + 1}`,
                          position: 'left',
                          fill: '#4caf50',
                          fontSize: 12,
                        }}
                      />
                    ))}
                    
                    {/* Resistance Lines */}
                    {supportResistance.resistances.map((level, index) => (
                      <ReferenceLine
                        key={index}
                        y={level}
                        stroke="#f44336"
                        strokeDasharray="5 5"
                        label={{
                          value: `R${index + 1}`,
                          position: 'right',
                          fill: '#f44336',
                          fontSize: 12,
                        }}
                      />
                    ))}
                    
                    {/* Current Price */}
                    <ReferenceLine
                      y={stockData[stockData.length - 1]?.close}
                      stroke="#ff9800"
                      label={{
                        value: 'Current',
                        position: 'top',
                        fill: '#ff9800',
                        fontSize: 12,
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>
    </motion.div>
  );
};

export default TechnicalAnalysis;