// src/components/Dashboard/StockChart.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  ComposedChart,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
  Bar,
  BarChart,
  Scatter,
} from 'recharts';
import {
  Paper,
  Typography,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  IconButton,
  CircularProgress,
  Skeleton,
  Alert,
  Fade,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShowChart,
  Timeline,
  CandlestickChart as CandlestickIcon,
  Refresh,
} from '@mui/icons-material';
import { useStock } from '../../context/StockContext';
import { format } from 'date-fns';

const StockChart = () => {
  const { 
    stockData, 
    selectedStock, 
    timeframe, 
    setTimeframe, 
    indicators, 
    fetchStockData,
    loading,
    quote 
  } = useStock();
  
  const [chartType, setChartType] = useState('candle'); // Default to candlestick
  const [showVolume, setShowVolume] = useState(true);
  const [isChanging, setIsChanging] = useState(false);
  const [chartKey, setChartKey] = useState(Date.now());
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Handle timeframe change without blinking
  const handleTimeframeChange = useCallback(async (event) => {
    const newTimeframe = event.target.value;
    if (newTimeframe === timeframe) return;
    
    setIsChanging(true);
    setTimeframe(newTimeframe);
    
    try {
      await fetchStockData(selectedStock, newTimeframe);
      if (isMounted.current) {
        setChartKey(Date.now()); // Force chart re-render
        setTimeout(() => {
          setIsChanging(false);
        }, 200);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (isMounted.current) {
        setIsChanging(false);
      }
    }
  }, [selectedStock, timeframe, fetchStockData, setTimeframe]);

  // Fetch data when timeframe changes
  useEffect(() => {
    if (selectedStock && !isChanging) {
      const fetchData = async () => {
        setIsChanging(true);
        await fetchStockData(selectedStock, timeframe);
        if (isMounted.current) {
          setChartKey(Date.now());
          setTimeout(() => {
            setIsChanging(false);
          }, 200);
        }
      };
      fetchData();
    }
  }, [timeframe, selectedStock, fetchStockData]);

  // Prepare chart data with proper formatting
  const chartData = useMemo(() => {
    if (!stockData || stockData.length === 0) return [];
    
    return stockData.map((item) => ({
      date: format(new Date(item.date), 'MMM dd'),
      fullDate: format(new Date(item.date), 'yyyy-MM-dd'),
      timestamp: new Date(item.date).getTime(),
      open: Number(item.open) || 0,
      high: Number(item.high) || 0,
      low: Number(item.low) || 0,
      close: Number(item.close) || 0,
      volume: Number(item.volume) || 0,
      sma: item.sma ? Number(item.sma) : null,
      ema: item.ema ? Number(item.ema) : null,
      upperBand: item.upperBand ? Number(item.upperBand) : null,
      lowerBand: item.lowerBand ? Number(item.lowerBand) : null,
    }));
  }, [stockData]);

  // Calculate price domain for Y-axis
  const priceDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 100];
    
    let minPrice = Math.min(...chartData.map(d => d.low)) * 0.995;
    let maxPrice = Math.max(...chartData.map(d => d.high)) * 1.005;
    
    if (indicators?.movingAverage) {
      const smaValues = chartData.map(d => d.sma).filter(Boolean);
      const emaValues = chartData.map(d => d.ema).filter(Boolean);
      if (smaValues.length) {
        minPrice = Math.min(minPrice, Math.min(...smaValues) * 0.995);
        maxPrice = Math.max(maxPrice, Math.max(...smaValues) * 1.005);
      }
      if (emaValues.length) {
        minPrice = Math.min(minPrice, Math.min(...emaValues) * 0.995);
        maxPrice = Math.max(maxPrice, Math.max(...emaValues) * 1.005);
      }
    }
    
    return [minPrice, maxPrice];
  }, [chartData, indicators]);

  // Format volume
  const formatVolume = useCallback((volume) => {
    if (!volume) return '0';
    if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(1)}B`;
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  }, []);

  // Professional Candlestick Component
  const CandlestickBar = useCallback((props) => {
    const { x, y, width, height, payload } = props;
    if (!payload || !payload.open || !payload.close) return null;
    
    const { open, close, high, low } = payload;
    const isBullish = close >= open;
    const color = isBullish ? '#4caf50' : '#f44336';
    
    // Calculate positions
    const candleWidth = Math.max(2, width * 0.7);
    const candleX = x - candleWidth / 2;
    const candleCenter = x;
    
    // Scale factors (adjust these based on your chart dimensions)
    const priceRange = priceDomain[1] - priceDomain[0];
    const chartHeight = 400; // Approximate chart height
    const scaleFactor = chartHeight / priceRange;
    
    // Calculate Y positions (Y increases downward in SVG)
    const baseY = y; // This is the Y position for the close price
    
    // Wick positions
    const wickTop = baseY - (high - close) * scaleFactor;
    const wickBottom = baseY + (open - low) * scaleFactor;
    
    // Body positions
    const bodyHeight = Math.abs(close - open) * scaleFactor;
    const bodyY = isBullish ? baseY - bodyHeight : baseY;
    
    return (
      <g>
        {/* Wick / Shadow */}
        <line
          x1={candleCenter}
          y1={wickTop}
          x2={candleCenter}
          y2={wickBottom}
          stroke={color}
          strokeWidth={1}
          opacity={0.7}
        />
        {/* Body */}
        <rect
          x={candleX}
          y={bodyY}
          width={candleWidth}
          height={Math.max(1, bodyHeight)}
          fill={color}
          fillOpacity={0.9}
          stroke={color}
          strokeWidth={0.5}
        />
      </g>
    );
  }, [priceDomain]);

  // Custom Tooltip
  const CustomTooltip = useCallback(({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      if (!data) return null;
      
      const change = data.close - data.open;
      const changePercent = (change / data.open) * 100;
      
      return (
        <Paper sx={{ 
          p: 2, 
          bgcolor: 'background.paper', 
          border: '1px solid #00d4ff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          minWidth: 240,
        }}>
          <Typography variant="body2" fontWeight="bold" gutterBottom sx={{ color: '#00d4ff' }}>
            {data.fullDate || label}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">Open:</Typography>
            <Typography variant="body2" fontWeight="bold" color={change >= 0 ? '#4caf50' : '#f44336'}>
              ${data.open?.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">High:</Typography>
            <Typography variant="body2" fontWeight="bold" color="#fff">
              ${data.high?.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">Low:</Typography>
            <Typography variant="body2" fontWeight="bold" color="#fff">
              ${data.low?.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">Close:</Typography>
            <Typography variant="body2" fontWeight="bold" color={change >= 0 ? '#4caf50' : '#f44336'}>
              ${data.close?.toFixed(2)}
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 1, 
            pt: 1, 
            borderTop: '1px solid rgba(255,255,255,0.1)' 
          }}>
            <Typography variant="body2" color="text.secondary">Change:</Typography>
            <Typography 
              variant="body2" 
              fontWeight="bold"
              color={change >= 0 ? '#4caf50' : '#f44336'}
            >
              {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">Volume:</Typography>
            <Typography variant="body2" fontWeight="bold" color="#8884d8">
              {formatVolume(data.volume)}
            </Typography>
          </Box>
          
          {indicators?.movingAverage && (data.sma || data.ema) && (
            <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {data.sma && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">SMA (20):</Typography>
                  <Typography variant="body2" sx={{ color: '#ff6b6b' }}>
                    ${data.sma?.toFixed(2)}
                  </Typography>
                </Box>
              )}
              {data.ema && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">EMA (12):</Typography>
                  <Typography variant="body2" sx={{ color: '#4caf50' }}>
                    ${data.ema?.toFixed(2)}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      );
    }
    return null;
  }, [indicators, formatVolume]);

  // Timeframe options
  const timeframes = [
    { value: '1d', label: '1 Day' },
    { value: '5d', label: '5 Days' },
    { value: '1mo', label: '1 Month' },
    { value: '3mo', label: '3 Months' },
    { value: '6mo', label: '6 Months' },
    { value: '1y', label: '1 Year' },
  ];

  // Calculate latest price and change
  const latestPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : 0;
  const firstPrice = chartData.length > 0 ? chartData[0].close : 0;
  const priceChange = latestPrice - firstPrice;
  const priceChangePercent = firstPrice ? ((priceChange / firstPrice) * 100) : 0;

  // Loading skeleton
  if (loading || isChanging) {
    return (
      <Fade in={true} timeout={300}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Skeleton variant="text" width={200} height={40} />
              <Skeleton variant="text" width={150} height={30} sx={{ mt: 1 }} />
            </Box>
            <Skeleton variant="rectangular" width={200} height={40} sx={{ borderRadius: 1 }} />
          </Box>
          <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 1 }} />
          {showVolume && (
            <Skeleton variant="rectangular" width="100%" height={80} sx={{ borderRadius: 1, mt: 2 }} />
          )}
        </Paper>
      </Fade>
    );
  }

  if (!stockData || stockData.length === 0) {
    return (
      <Fade in={true} timeout={500}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Alert severity="info" sx={{ bgcolor: 'rgba(0, 212, 255, 0.1)', border: '1px solid #00d4ff' }}>
            Search for a stock to view the chart
          </Alert>
        </Paper>
      </Fade>
    );
  }

  return (
    <Fade in={true} timeout={500}>
      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
                {selectedStock} Stock Chart
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => {
                  setIsChanging(true);
                  fetchStockData(selectedStock, timeframe).finally(() => {
                    if (isMounted.current) {
                      setChartKey(Date.now());
                      setTimeout(() => setIsChanging(false), 200);
                    }
                  });
                }}
                sx={{ 
                  ml: 1,
                  color: '#00d4ff',
                  '&:hover': { bgcolor: 'rgba(0, 212, 255, 0.1)' }
                }}
              >
                <Refresh fontSize="small" />
              </IconButton>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="h4" fontWeight="bold" sx={{ color: priceChange >= 0 ? '#4caf50' : '#f44336' }}>
                ${latestPrice.toFixed(2)}
              </Typography>
              <Chip
                icon={priceChange >= 0 ? <TrendingUp /> : <TrendingDown />}
                label={`${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} (${priceChangePercent.toFixed(2)}%)`}
                color={priceChange >= 0 ? 'success' : 'error'}
                variant="filled"
                size="medium"
                sx={{ fontWeight: 'bold' }}
              />
              {quote?.volume && (
                <Typography variant="body2" color="text.secondary">
                  Vol: {formatVolume(quote.volume)}
                </Typography>
              )}
            </Stack>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Timeframe</InputLabel>
              <Select
                value={timeframe}
                label="Timeframe"
                onChange={handleTimeframeChange}
                sx={{ bgcolor: 'background.paper' }}
              >
                {timeframes.map((tf) => (
                  <MenuItem key={tf.value} value={tf.value}>
                    {tf.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={(e, newType) => newType && setChartType(newType)}
              size="small"
              sx={{ bgcolor: 'background.paper' }}
            >
              <ToggleButton value="line">
                <ShowChart />
              </ToggleButton>
              <ToggleButton value="area">
                <Timeline />
              </ToggleButton>
              <ToggleButton value="candle">
                <CandlestickIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Box>

        {/* Price Chart */}
        <Box key={chartKey} sx={{ height: showVolume ? 400 : 500, width: '100%', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="#8899a6"
                  tick={{ fontSize: 11, fill: '#8899a6' }}
                  tickLine={{ stroke: '#8899a6' }}
                  axisLine={{ stroke: '#8899a6' }}
                  interval={Math.floor(chartData.length / 8)}
                />
                <YAxis 
                  stroke="#8899a6"
                  tick={{ fontSize: 11, fill: '#8899a6' }}
                  tickLine={{ stroke: '#8899a6' }}
                  axisLine={{ stroke: '#8899a6' }}
                  domain={priceDomain}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ color: '#fff' }}
                  iconType="line"
                />
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke="#00d4ff"
                  fill="url(#colorPrice)"
                  strokeWidth={2}
                  name="Price"
                  dot={false}
                  activeDot={{ r: 6, fill: '#00d4ff', stroke: '#fff' }}
                />
                {indicators?.movingAverage && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="sma"
                      stroke="#ff6b6b"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="SMA (20)"
                    />
                    <Line
                      type="monotone"
                      dataKey="ema"
                      stroke="#4caf50"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      dot={false}
                      name="EMA (12)"
                    />
                  </>
                )}
              </AreaChart>
            ) : chartType === 'candle' ? (
              <ComposedChart 
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="#8899a6"
                  tick={{ fontSize: 11, fill: '#8899a6' }}
                  tickLine={{ stroke: '#8899a6' }}
                  axisLine={{ stroke: '#8899a6' }}
                  interval={Math.floor(chartData.length / 8)}
                />
                <YAxis 
                  yAxisId="price"
                  orientation="right"
                  stroke="#8899a6"
                  tick={{ fontSize: 11, fill: '#8899a6' }}
                  tickLine={{ stroke: '#8899a6' }}
                  axisLine={{ stroke: '#8899a6' }}
                  domain={priceDomain}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <YAxis 
                  yAxisId="volume"
                  orientation="left"
                  stroke="#8884d8"
                  tick={{ fontSize: 11, fill: '#8884d8' }}
                  tickLine={{ stroke: '#8884d8' }}
                  axisLine={{ stroke: '#8884d8' }}
                  domain={[0, 'auto']}
                  tickFormatter={(value) => formatVolume(value)}
                  hide={!showVolume}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ color: '#fff' }}
                  iconType="rect"
                />
                
                {/* Candlesticks */}
                <Scatter
                  yAxisId="price"
                  data={chartData}
                  shape={<CandlestickBar />}
                  name="Price"
                  isAnimationActive={false}
                />
                
                {/* Moving Averages */}
                {indicators?.movingAverage && (
                  <>
                    <Line
                      yAxisId="price"
                      type="monotone"
                      dataKey="sma"
                      stroke="#ff6b6b"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="SMA (20)"
                    />
                    <Line
                      yAxisId="price"
                      type="monotone"
                      dataKey="ema"
                      stroke="#4caf50"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      dot={false}
                      name="EMA (12)"
                    />
                  </>
                )}
              </ComposedChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="#8899a6"
                  tick={{ fontSize: 11, fill: '#8899a6' }}
                  tickLine={{ stroke: '#8899a6' }}
                  axisLine={{ stroke: '#8899a6' }}
                  interval={Math.floor(chartData.length / 8)}
                />
                <YAxis 
                  stroke="#8899a6"
                  tick={{ fontSize: 11, fill: '#8899a6' }}
                  tickLine={{ stroke: '#8899a6' }}
                  axisLine={{ stroke: '#8899a6' }}
                  domain={priceDomain}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ color: '#fff' }}
                  iconType="line"
                />
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke="#00d4ff"
                  strokeWidth={3}
                  dot={false}
                  name="Price"
                  activeDot={{ r: 6, fill: '#00d4ff', stroke: '#fff' }}
                />
                {indicators?.movingAverage && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="sma"
                      stroke="#ff6b6b"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="SMA (20)"
                    />
                    <Line
                      type="monotone"
                      dataKey="ema"
                      stroke="#4caf50"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      dot={false}
                      name="EMA (12)"
                    />
                  </>
                )}
                {indicators?.bollinger && chartData[0]?.upperBand && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="upperBand"
                      stroke="#ff9800"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      dot={false}
                      name="Upper BB"
                    />
                    <Line
                      type="monotone"
                      dataKey="lowerBand"
                      stroke="#ff9800"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      dot={false}
                      name="Lower BB"
                    />
                  </>
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </Box>

        {/* Volume Chart */}
        {showVolume && (
          <Box sx={{ height: 80, mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 0.5 }}>
              Volume
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  stroke="#8899a6"
                  tick={{ fontSize: 10, fill: '#8899a6' }}
                  tickLine={false}
                  axisLine={false}
                  interval={Math.floor(chartData.length / 10)}
                />
                <YAxis 
                  stroke="#8899a6"
                  tick={{ fontSize: 10, fill: '#8899a6' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatVolume(value)}
                  width={60}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <Paper sx={{ p: 1, bgcolor: 'background.paper', border: '1px solid #8884d8' }}>
                          <Typography variant="caption" display="block">{label}</Typography>
                          <Typography variant="caption" display="block" color="#8884d8">
                            Volume: {formatVolume(payload[0].value)}
                          </Typography>
                        </Paper>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="volume" 
                  fill="#8884d8" 
                  fillOpacity={0.7}
                  name="Volume"
                  isAnimationActive={false}
                >
                  {chartData.map((entry, index) => (
                    <rect
                      key={index}
                      fill={entry.close >= entry.open ? '#4caf50' : '#f44336'}
                      fillOpacity={0.5}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    </Fade>
  );
};

export default StockChart;