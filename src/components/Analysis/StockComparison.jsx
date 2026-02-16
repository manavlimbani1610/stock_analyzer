// src/components/Analysis/StockComparison.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  CompareArrows as CompareArrowsIcon,
  TrendingUp,
  TrendingDown,
  ShowChart,
  Timeline,
  BarChart,
  PieChart,
  Speed,
  Assessment,
  Download,
  Share,
  Bookmark,
  BookmarkBorder,
  Info,
  CheckCircle,
  Warning,
  Refresh,
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
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import stockApi from '../../services/stockApi';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// Tab Panel Component
const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`comparison-tabpanel-${index}`}
    aria-labelledby={`comparison-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const StockComparison = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  const [stock1, setStock1] = useState('AAPL');
  const [stock2, setStock2] = useState('MSFT');
  const [stock3, setStock3] = useState('GOOGL');
  const [stock4, setStock4] = useState('AMZN');
  
  const [data1, setData1] = useState(null);
  const [data2, setData2] = useState(null);
  const [data3, setData3] = useState(null);
  const [data4, setData4] = useState(null);
  
  const [historical1, setHistorical1] = useState([]);
  const [historical2, setHistorical2] = useState([]);
  const [historical3, setHistorical3] = useState([]);
  const [historical4, setHistorical4] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [comparisonMode, setComparisonMode] = useState('two');
  const [timeframe, setTimeframe] = useState('1mo');
  const [chartType, setChartType] = useState('line');
  const [normalized, setNormalized] = useState(true);
  const [savedComparisons, setSavedComparisons] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

  // Load saved comparisons from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedComparisons');
    if (saved) {
      setSavedComparisons(JSON.parse(saved));
    }
  }, []);

  // Fetch complete stock data including historical
  const fetchCompleteStockData = async (symbol) => {
    try {
      const [quote, historical] = await Promise.all([
        stockApi.getRealTimeQuote(symbol),
        stockApi.getHistoricalData(symbol, timeframe)
      ]);
      return { quote, historical };
    } catch (error) {
      console.error(`Error fetching ${symbol}:`, error);
      return null;
    }
  };

  const compareStocks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const stocksToFetch = comparisonMode === 'two' 
        ? [stock1, stock2]
        : [stock1, stock2, stock3, stock4];
      
      const results = await Promise.all(
        stocksToFetch.map(symbol => fetchCompleteStockData(symbol))
      );

      const [result1, result2, result3, result4] = results;
      
      if (result1) {
        setData1(result1.quote);
        setHistorical1(result1.historical);
      }
      if (result2) {
        setData2(result2.quote);
        setHistorical2(result2.historical);
      }
      if (comparisonMode === 'four') {
        if (result3) {
          setData3(result3.quote);
          setHistorical3(result3.historical);
        }
        if (result4) {
          setData4(result4.quote);
          setHistorical4(result4.historical);
        }
      }

      const comparisonKey = `${stock1}-${stock2}-${comparisonMode === 'four' ? `${stock3}-${stock4}` : ''}`;
      const saved = savedComparisons.some(c => c.key === comparisonKey);
      setIsSaved(saved);

      toast.success('Comparison loaded successfully!');
    } catch (error) {
      console.error('Error comparing stocks:', error);
      setError('Failed to fetch stock data. Please try again.');
      toast.error('Failed to load comparison');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data with normalization
  const chartData = useMemo(() => {
    if (!historical1.length || !historical2.length) return [];

    const maxLength = Math.max(
      historical1.length,
      historical2.length,
      comparisonMode === 'four' ? historical3.length : 0,
      comparisonMode === 'four' ? historical4.length : 0
    );

    const data = [];
    
    for (let i = 0; i < maxLength; i++) {
      const point = {
        date: historical1[i]?.date || historical2[i]?.date || '',
      };

      if (normalized) {
        if (historical1[i]) {
          const firstPrice = historical1[0]?.close || 1;
          point[stock1] = ((historical1[i].close - firstPrice) / firstPrice) * 100;
        }
        if (historical2[i]) {
          const firstPrice = historical2[0]?.close || 1;
          point[stock2] = ((historical2[i].close - firstPrice) / firstPrice) * 100;
        }
        if (comparisonMode === 'four') {
          if (historical3[i]) {
            const firstPrice = historical3[0]?.close || 1;
            point[stock3] = ((historical3[i].close - firstPrice) / firstPrice) * 100;
          }
          if (historical4[i]) {
            const firstPrice = historical4[0]?.close || 1;
            point[stock4] = ((historical4[i].close - firstPrice) / firstPrice) * 100;
          }
        }
      } else {
        if (historical1[i]) point[stock1] = historical1[i].close;
        if (historical2[i]) point[stock2] = historical2[i].close;
        if (comparisonMode === 'four') {
          if (historical3[i]) point[stock3] = historical3[i].close;
          if (historical4[i]) point[stock4] = historical4[i].close;
        }
      }
      
      data.push(point);
    }
    
    return data;
  }, [historical1, historical2, historical3, historical4, stock1, stock2, stock3, stock4, normalized, comparisonMode]);

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    const stocks = comparisonMode === 'two' 
      ? [stock1, stock2].filter((s, i) => i === 0 ? data1 : data2)
      : [stock1, stock2, stock3, stock4].filter((s, i) => {
          if (i === 0) return data1;
          if (i === 1) return data2;
          if (i === 2) return data3;
          return data4;
        });

    return stocks.map((symbol, index) => {
      const data = index === 0 ? data1 : index === 1 ? data2 : index === 2 ? data3 : data4;
      const historical = index === 0 ? historical1 : index === 1 ? historical2 : index === 2 ? historical3 : historical4;
      
      if (!data || !historical.length) return null;

      const firstPrice = historical[0]?.close || data.price;
      const lastPrice = historical[historical.length - 1]?.close || data.price;
      const periodReturn = ((lastPrice - firstPrice) / firstPrice) * 100;
      
      const returns = historical.slice(1).map((d, i) => 
        (d.close - historical[i].close) / historical[i].close * 100
      );
      const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length;
      const volatility = Math.sqrt(variance);
      
      const riskFreeRate = 2;
      const dailyRiskFree = riskFreeRate / 252;
      const sharpe = ((avgReturn - dailyRiskFree) / volatility) * Math.sqrt(252);
      
      let maxDrawdown = 0;
      let peak = historical[0].close;
      historical.forEach(d => {
        if (d.close > peak) peak = d.close;
        const drawdown = ((peak - d.close) / peak) * 100;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
      });

      return {
        symbol,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        periodReturn,
        volatility: volatility.toFixed(2),
        sharpe: sharpe.toFixed(2),
        maxDrawdown: maxDrawdown.toFixed(2),
        volume: data.volume,
        high: data.high,
        low: data.low,
      };
    }).filter(Boolean);
  }, [data1, data2, data3, data4, historical1, historical2, historical3, historical4, stock1, stock2, stock3, stock4, comparisonMode]);

  // Radar chart data for multi-dimensional comparison
  const radarData = useMemo(() => {
    if (!performanceMetrics.length) return [];

    const metrics = ['Period Return', 'Volatility', 'Sharpe Ratio', 'Max Drawdown', 'Volume Score'];
    
    return metrics.map(metric => {
      const point = { metric };
      
      performanceMetrics.forEach((stock, index) => {
        if (!stock) return;
        
        let value = 0;
        switch(metric) {
          case 'Period Return':
            value = Math.max(0, (stock.periodReturn + 50) / 100 * 100);
            break;
          case 'Volatility':
            value = Math.min(100, (1 - stock.volatility / 50) * 100);
            break;
          case 'Sharpe Ratio':
            value = Math.min(100, (stock.sharpe / 3) * 100);
            break;
          case 'Max Drawdown':
            value = Math.min(100, (1 - stock.maxDrawdown / 50) * 100);
            break;
          case 'Volume Score':
            const volumeScore = Math.min(100, (stock.volume / 100000000) * 100);
            value = Math.min(100, volumeScore);
            break;
        }
        point[stock.symbol] = Math.max(0, Math.min(100, value));
      });
      
      return point;
    });
  }, [performanceMetrics]);

  // Save current comparison
  const saveComparison = () => {
    const comparisonKey = `${stock1}-${stock2}-${comparisonMode === 'four' ? `${stock3}-${stock4}` : ''}`;
    const newComparison = {
      key: comparisonKey,
      stocks: comparisonMode === 'two' ? [stock1, stock2] : [stock1, stock2, stock3, stock4],
      date: new Date().toISOString(),
    };

    const updated = [...savedComparisons, newComparison];
    setSavedComparisons(updated);
    localStorage.setItem('savedComparisons', JSON.stringify(updated));
    setIsSaved(true);
    
    addNotification({
      title: '🔖 Comparison Saved',
      message: `Saved comparison: ${comparisonKey}`,
      type: 'success',
    });
    
    toast.success('Comparison saved!');
  };

  // Export comparison data
  const exportComparison = () => {
    const data = {
      stocks: comparisonMode === 'two' ? [stock1, stock2] : [stock1, stock2, stock3, stock4],
      quotes: [data1, data2, data3, data4].filter(Boolean),
      metrics: performanceMetrics,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-comparison-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Comparison exported!');
  };

  // Share comparison
  const shareComparison = () => {
    const shareText = `Stock Comparison: ${comparisonMode === 'two' 
      ? `${stock1} vs ${stock2}` 
      : `${stock1}, ${stock2}, ${stock3}, ${stock4}`} | ${format(new Date(), 'MMM dd, yyyy')}`;
    
    navigator.clipboard.writeText(shareText);
    toast.success('Comparison link copied to clipboard!');
  };

  const colors = ['#00d4ff', '#ff6b6b', '#4caf50', '#ff9800'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper sx={{ p: 4, mb: 3, background: 'linear-gradient(135deg, #132f4c 0%, #1a3a5f 100%)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CompareArrowsIcon sx={{ fontSize: 40, color: '#00d4ff' }} />
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Stock Comparison
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Compare performance metrics across multiple stocks
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Export comparison">
              <IconButton onClick={exportComparison} sx={{ color: '#00d4ff' }}>
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share comparison">
              <IconButton onClick={shareComparison} sx={{ color: '#00d4ff' }}>
                <Share />
              </IconButton>
            </Tooltip>
            <Tooltip title={isSaved ? "Saved" : "Save comparison"}>
              <IconButton 
                onClick={saveComparison} 
                disabled={isSaved}
                sx={{ color: isSaved ? '#4caf50' : '#00d4ff' }}
              >
                {isSaved ? <CheckCircle /> : <BookmarkBorder />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Comparison Mode Selector */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Chip
            label="2 Stocks"
            onClick={() => setComparisonMode('two')}
            color={comparisonMode === 'two' ? 'primary' : 'default'}
            variant={comparisonMode === 'two' ? 'filled' : 'outlined'}
            sx={{ cursor: 'pointer' }}
          />
          <Chip
            label="4 Stocks"
            onClick={() => setComparisonMode('four')}
            color={comparisonMode === 'four' ? 'primary' : 'default'}
            variant={comparisonMode === 'four' ? 'filled' : 'outlined'}
            sx={{ cursor: 'pointer' }}
          />
        </Box>

        {/* Stock Input Grid */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={comparisonMode === 'two' ? 5 : 3}>
            <TextField
              fullWidth
              label="Stock 1"
              value={stock1}
              onChange={(e) => setStock1(e.target.value.toUpperCase())}
              size="small"
              variant="outlined"
              InputProps={{
                sx: { bgcolor: 'background.paper' }
              }}
            />
          </Grid>
          <Grid item xs={comparisonMode === 'two' ? 5 : 3}>
            <TextField
              fullWidth
              label="Stock 2"
              value={stock2}
              onChange={(e) => setStock2(e.target.value.toUpperCase())}
              size="small"
              variant="outlined"
              InputProps={{
                sx: { bgcolor: 'background.paper' }
              }}
            />
          </Grid>
          {comparisonMode === 'four' && (
            <>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Stock 3"
                  value={stock3}
                  onChange={(e) => setStock3(e.target.value.toUpperCase())}
                  size="small"
                  variant="outlined"
                  InputProps={{
                    sx: { bgcolor: 'background.paper' }
                  }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Stock 4"
                  value={stock4}
                  onChange={(e) => setStock4(e.target.value.toUpperCase())}
                  size="small"
                  variant="outlined"
                  InputProps={{
                    sx: { bgcolor: 'background.paper' }
                  }}
                />
              </Grid>
            </>
          )}
          <Grid item xs={comparisonMode === 'two' ? 2 : 12}>
            <Button
              fullWidth
              variant="contained"
              onClick={compareStocks}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <CompareArrowsIcon />}
              sx={{ 
                height: 40,
                bgcolor: '#00d4ff',
                '&:hover': { bgcolor: '#00b4d8' }
              }}
            >
              {loading ? 'Loading...' : 'Compare'}
            </Button>
          </Grid>
        </Grid>

        {/* Chart Controls */}
        {data1 && data2 && (
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label="Line"
                onClick={() => setChartType('line')}
                color={chartType === 'line' ? 'primary' : 'default'}
                size="small"
                icon={<ShowChart />}
              />
              <Chip
                label="Area"
                onClick={() => setChartType('area')}
                color={chartType === 'area' ? 'primary' : 'default'}
                size="small"
                icon={<Timeline />}
              />
              <Chip
                label="Bar"
                onClick={() => setChartType('bar')}
                color={chartType === 'bar' ? 'primary' : 'default'}
                size="small"
                icon={<BarChart />}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label="Normalized"
                onClick={() => setNormalized(!normalized)}
                color={normalized ? 'success' : 'default'}
                size="small"
                icon={<Assessment />}
              />
              <Chip
                label="1M"
                onClick={() => setTimeframe('1mo')}
                color={timeframe === '1mo' ? 'primary' : 'default'}
                size="small"
              />
              <Chip
                label="3M"
                onClick={() => setTimeframe('3mo')}
                color={timeframe === '3mo' ? 'primary' : 'default'}
                size="small"
              />
              <Chip
                label="6M"
                onClick={() => setTimeframe('6mo')}
                color={timeframe === '6mo' ? 'primary' : 'default'}
                size="small"
              />
              <Chip
                label="1Y"
                onClick={() => setTimeframe('1y')}
                color={timeframe === '1y' ? 'primary' : 'default'}
                size="small"
              />
            </Box>
          </Box>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress sx={{ bgcolor: 'rgba(0,212,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#00d4ff' } }} />
          </Box>
        )}

        {/* Quick Price Cards */}
        {data1 && data2 && (
          <Fade in={true}>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {performanceMetrics.map((stock, index) => (
                <Grid item xs={12 / performanceMetrics.length} key={stock.symbol}>
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card sx={{ 
                      borderLeft: `4px solid ${colors[index % colors.length]}`,
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-4px)' }
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" fontWeight="bold">
                            {stock.symbol}
                          </Typography>
                          <Chip
                            icon={stock.change >= 0 ? <TrendingUp /> : <TrendingDown />}
                            label={`${stock.changePercent.toFixed(2)}%`}
                            size="small"
                            color={stock.change >= 0 ? 'success' : 'error'}
                          />
                        </Box>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: colors[index % colors.length] }}>
                          ${stock.price.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Day Range: ${stock.low?.toFixed(2)} - ${stock.high?.toFixed(2)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Fade>
        )}
      </Paper>

      {/* Main Content Tabs */}
      {data1 && data2 && (
        <Paper sx={{ p: 3 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Price Chart" icon={<ShowChart />} iconPosition="start" />
            <Tab label="Performance Metrics" icon={<Speed />} iconPosition="start" />
            <Tab label="Radar Analysis" icon={<PieChart />} iconPosition="start" />
            <Tab label="Detailed Stats" icon={<Assessment />} iconPosition="start" />
          </Tabs>

          {/* Price Chart Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ height: 500 }}>
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#8899a6"
                      tick={{ fontSize: 12, fill: '#8899a6' }}
                      interval={Math.floor(chartData.length / 10)}
                    />
                    <YAxis 
                      stroke="#8899a6"
                      tick={{ fontSize: 12, fill: '#8899a6' }}
                      tickFormatter={(value) => normalized ? `${value.toFixed(1)}%` : `$${value.toFixed(0)}`}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        background: '#132f4c',
                        border: '1px solid #00d4ff',
                        borderRadius: '8px',
                      }}
                      formatter={(value, name) => [
                        normalized ? `${value.toFixed(2)}%` : `$${value.toFixed(2)}`,
                        name
                      ]}
                    />
                    <Legend />
                    {performanceMetrics.map((stock, index) => (
                      <Line
                        key={stock.symbol}
                        type="monotone"
                        dataKey={stock.symbol}
                        stroke={colors[index % colors.length]}
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                ) : chartType === 'area' ? (
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#8899a6"
                      tick={{ fontSize: 12, fill: '#8899a6' }}
                      interval={Math.floor(chartData.length / 10)}
                    />
                    <YAxis 
                      stroke="#8899a6"
                      tick={{ fontSize: 12, fill: '#8899a6' }}
                      tickFormatter={(value) => normalized ? `${value.toFixed(1)}%` : `$${value.toFixed(0)}`}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        background: '#132f4c',
                        border: '1px solid #00d4ff',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    {performanceMetrics.map((stock, index) => (
                      <Area
                        key={stock.symbol}
                        type="monotone"
                        dataKey={stock.symbol}
                        stroke={colors[index % colors.length]}
                        fill={colors[index % colors.length]}
                        fillOpacity={0.1}
                      />
                    ))}
                  </AreaChart>
                ) : (
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#8899a6"
                      tick={{ fontSize: 12, fill: '#8899a6' }}
                      interval={Math.floor(chartData.length / 10)}
                    />
                    <YAxis 
                      stroke="#8899a6"
                      tick={{ fontSize: 12, fill: '#8899a6' }}
                      tickFormatter={(value) => normalized ? `${value.toFixed(1)}%` : `$${value.toFixed(0)}`}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        background: '#132f4c',
                        border: '1px solid #00d4ff',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    {performanceMetrics.map((stock, index) => (
                      <Bar
                        key={stock.symbol}
                        dataKey={stock.symbol}
                        fill={colors[index % colors.length]}
                        fillOpacity={0.7}
                      />
                    ))}
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </Box>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              {normalized ? 'Showing normalized performance (starting at 0%)' : 'Showing actual prices'}
            </Alert>
          </TabPanel>

          {/* Performance Metrics Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              {performanceMetrics.map((stock, index) => (
                <Grid item xs={12} md={6} key={stock.symbol}>
                  <Card sx={{ border: `1px solid ${colors[index % colors.length]}` }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: colors[index % colors.length] }}>
                          {stock.symbol}
                        </Typography>
                        <Chip
                          label={`${stock.periodReturn.toFixed(2)}%`}
                          color={stock.periodReturn >= 0 ? 'success' : 'error'}
                        />
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Current Price</Typography>
                          <Typography variant="h6">${stock.price.toFixed(2)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Volume</Typography>
                          <Typography variant="h6">{(stock.volume / 1000000).toFixed(2)}M</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Volatility</Typography>
                          <Typography variant="h6">{stock.volatility}%</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Sharpe Ratio</Typography>
                          <Typography variant="h6">{stock.sharpe}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Max Drawdown</Typography>
                          <Typography variant="h6" color="error">-{stock.maxDrawdown}%</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Period Return</Typography>
                          <Typography variant="h6" color={stock.periodReturn >= 0 ? 'success' : 'error'}>
                            {stock.periodReturn >= 0 ? '+' : ''}{stock.periodReturn.toFixed(2)}%
                          </Typography>
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Performance Rating
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ flex: 1, bgcolor: 'background.default', borderRadius: 1, p: 0.5 }}>
                            <Box
                              sx={{
                                width: `${Math.min(100, Math.max(0, (stock.periodReturn + 50)))}%`,
                                height: 8,
                                bgcolor: colors[index % colors.length],
                                borderRadius: 1,
                                transition: 'width 0.5s',
                              }}
                            />
                          </Box>
                          <Typography variant="body2" fontWeight="bold">
                            {Math.min(100, Math.max(0, (stock.periodReturn + 50))).toFixed(0)}%
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* Radar Analysis Tab */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Box sx={{ height: 500 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: '#8899a6', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#8899a6' }} />
                      {performanceMetrics.map((stock, index) => (
                        <Radar
                          key={stock.symbol}
                          name={stock.symbol}
                          dataKey={stock.symbol}
                          stroke={colors[index % colors.length]}
                          fill={colors[index % colors.length]}
                          fillOpacity={0.3}
                        />
                      ))}
                      <Legend />
                      <RechartsTooltip
                        contentStyle={{
                          background: '#132f4c',
                          border: '1px solid #00d4ff',
                          borderRadius: '8px',
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'background.default', height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Multi-Dimensional Analysis
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      The radar chart shows how each stock performs across 5 key metrics:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, color: 'text.secondary' }}>
                      <li>Period Return - Total return over selected period</li>
                      <li>Volatility - Price fluctuation (lower is better)</li>
                      <li>Sharpe Ratio - Risk-adjusted return (higher is better)</li>
                      <li>Max Drawdown - Largest peak to trough decline</li>
                      <li>Volume Score - Trading liquidity</li>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Best Performer by Metric:
                    </Typography>
                    {radarData.map((metric, idx) => {
                      const best = performanceMetrics.reduce((best, stock) => {
                        return metric[stock.symbol] > metric[best?.symbol || ''] ? stock : best;
                      }, performanceMetrics[0]);
                      
                      return (
                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption">{metric.metric}:</Typography>
                          <Typography variant="caption" fontWeight="bold" sx={{ color: colors[performanceMetrics.indexOf(best) % colors.length] }}>
                            {best?.symbol} ({metric[best?.symbol]?.toFixed(0)}%)
                          </Typography>
                        </Box>
                      );
                    })}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Detailed Stats Tab */}
          <TabPanel value={tabValue} index={3}>
            <TableContainer component={Card}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Metric</TableCell>
                    {performanceMetrics.map(stock => (
                      <TableCell key={stock.symbol} align="right">
                        <Typography fontWeight="bold" sx={{ color: colors[performanceMetrics.indexOf(stock) % colors.length] }}>
                          {stock.symbol}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Current Price</TableCell>
                    {performanceMetrics.map(stock => (
                      <TableCell key={stock.symbol} align="right">${stock.price.toFixed(2)}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell>Daily Change</TableCell>
                    {performanceMetrics.map(stock => (
                      <TableCell key={stock.symbol} align="right" sx={{ color: stock.change >= 0 ? '#4caf50' : '#f44336' }}>
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell>Day High</TableCell>
                    {performanceMetrics.map(stock => (
                      <TableCell key={stock.symbol} align="right">${stock.high?.toFixed(2)}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell>Day Low</TableCell>
                    {performanceMetrics.map(stock => (
                      <TableCell key={stock.symbol} align="right">${stock.low?.toFixed(2)}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell>Volume</TableCell>
                    {performanceMetrics.map(stock => (
                      <TableCell key={stock.symbol} align="right">{(stock.volume / 1000000).toFixed(2)}M</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell>Period Return</TableCell>
                    {performanceMetrics.map(stock => (
                      <TableCell key={stock.symbol} align="right" sx={{ color: stock.periodReturn >= 0 ? '#4caf50' : '#f44336' }}>
                        {stock.periodReturn >= 0 ? '+' : ''}{stock.periodReturn.toFixed(2)}%
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell>Volatility (σ)</TableCell>
                    {performanceMetrics.map(stock => (
                      <TableCell key={stock.symbol} align="right">{stock.volatility}%</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell>Sharpe Ratio</TableCell>
                    {performanceMetrics.map(stock => (
                      <TableCell key={stock.symbol} align="right">{stock.sharpe}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell>Max Drawdown</TableCell>
                    {performanceMetrics.map(stock => (
                      <TableCell key={stock.symbol} align="right" sx={{ color: '#f44336' }}>
                        -{stock.maxDrawdown}%
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Paper>
      )}

      {/* Saved Comparisons Section */}
      {savedComparisons.length > 0 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Saved Comparisons
          </Typography>
          <Grid container spacing={2}>
            {savedComparisons.slice(-5).reverse().map((saved, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}
                  onClick={() => {
                    const [s1, s2, s3, s4] = saved.stocks;
                    setStock1(s1);
                    setStock2(s2);
                    if (s3 && s4) {
                      setComparisonMode('four');
                      setStock3(s3);
                      setStock4(s4);
                    } else {
                      setComparisonMode('two');
                    }
                    compareStocks();
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {saved.stocks.join(' vs ')}
                      </Typography>
                      <Chip
                        label={format(new Date(saved.date), 'MMM dd')}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </motion.div>
  );
};

export default StockComparison;