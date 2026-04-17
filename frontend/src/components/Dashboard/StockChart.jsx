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
import { useTheme } from '../../context/ThemeContext';
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

  const { darkMode } = useTheme();

  const [chartType, setChartType] = useState('candle'); // Default to candlestick
  const [showVolume, setShowVolume] = useState(true);
  const [isChanging, setIsChanging] = useState(false);
  const [chartKey, setChartKey] = useState(Date.now());
  const isMounted = useRef(true);
  const [chartColorsSetting, setChartColorsSetting] = useState('professional');

  // Theme-aware chart colors
  const chartColors = useMemo(() => ({
    // Grid and axis colors
    grid: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    axis: darkMode ? '#8899a6' : '#5f6b7a',
    text: darkMode ? '#ffffff' : '#1a2634',

    // Primary line color
    primary: darkMode ? '#00d4ff' : '#0099cc',

    // Trading colors (consistent across themes)
    bullish: '#4caf50',
    bearish: '#f44336',

    // Indicator colors
    sma: '#ff6b6b',
    ema: '#4caf50',
    volume: '#8884d8',

    // Area gradient
    areaFill: darkMode ? 'rgba(0, 212, 255, 0.2)' : 'rgba(0, 153, 204, 0.2)',

    // Tooltip
    tooltipBg: darkMode ? 'rgba(19, 47, 76, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    tooltipBorder: darkMode ? '#00d4ff' : '#0099cc',
  }), [darkMode]);

  const chartPalettes = useMemo(() => ({
    professional: ['#00d4ff', '#ff6b6b', '#4caf50', '#ff9800'],
    vibrant: ['#ff7b00', '#00c49f', '#a333c8', '#ff4d6d']
  }), []);

  const primaryStroke = chartPalettes[chartColorsSetting]?.[0] || '#00d4ff';

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Listen for settings updates (e.g., chartColors)
  useEffect(() => {
    const loadSetting = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('appSettings') || '{}');
        if (saved.chartColors) {
          setChartColorsSetting(saved.chartColors);
        }
      } catch (e) {
        // ignore
      }
    };

    loadSetting();

    const handleSettingsEvent = (e) => {
      if (e?.detail?.chartColors) {
        setChartColorsSetting(e.detail.chartColors);
      } else {
        loadSetting();
      }
    };

    window.addEventListener('appSettingsUpdated', handleSettingsEvent);
    window.addEventListener('storage', loadSetting);

    return () => {
      window.removeEventListener('appSettingsUpdated', handleSettingsEvent);
      window.removeEventListener('storage', loadSetting);
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
          bgcolor: 'var(--bg-tooltip)',
          border: '1px solid var(--color-primary)',
          boxShadow: 'var(--shadow-md)',
          minWidth: 240,
        }}>
          <Typography variant="body2" fontWeight="bold" gutterBottom sx={{ color: 'var(--color-primary)' }}>
            {data.fullDate || label}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>Open:</Typography>
            <Typography variant="body2" fontWeight="bold" color={change >= 0 ? chartColors.bullish : chartColors.bearish}>
              ${data.open?.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>High:</Typography>
            <Typography variant="body2" fontWeight="bold" sx={{ color: 'var(--text-primary)' }}>
              ${data.high?.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>Low:</Typography>
            <Typography variant="body2" fontWeight="bold" sx={{ color: 'var(--text-primary)' }}>
              ${data.low?.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>Close:</Typography>
            <Typography variant="body2" fontWeight="bold" color={change >= 0 ? chartColors.bullish : chartColors.bearish}>
              ${data.close?.toFixed(2)}
            </Typography>
          </Box>

          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: 1,
            pt: 1,
            borderTop: '1px solid var(--divider-color)'
          }}>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>Change:</Typography>
            <Typography
              variant="body2"
              fontWeight="bold"
              color={change >= 0 ? chartColors.bullish : chartColors.bearish}
            >
              {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>Volume:</Typography>
            <Typography variant="body2" fontWeight="bold" color={chartColors.volume}>
              {formatVolume(data.volume)}
            </Typography>
          </Box>

          {indicators?.movingAverage && (data.sma || data.ema) && (
            <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid var(--divider-color)' }}>
              {data.sma && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>SMA (20):</Typography>
                  <Typography variant="body2" sx={{ color: chartColors.sma }}>
                    ${data.sma?.toFixed(2)}
                  </Typography>
                </Box>
              )}
              {data.ema && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>EMA (12):</Typography>
                  <Typography variant="body2" sx={{ color: chartColors.ema }}>
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
  }, [indicators, formatVolume, chartColors]);

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
      <Paper sx={{ p: { xs: 1.5, sm: 2, md: 3 }, mb: 3 }}>
        {/* Header */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          mb: { xs: 2, md: 3 },
          gap: 2
        }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 0, fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }}>
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
            <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center" flexWrap="wrap">
              <Typography variant="h4" fontWeight="bold" sx={{ color: priceChange >= 0 ? '#4caf50' : '#f44336', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                ${latestPrice.toFixed(2)}
              </Typography>
              <Chip
                icon={priceChange >= 0 ? <TrendingUp /> : <TrendingDown />}
                label={`${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} (${priceChangePercent.toFixed(2)}%)`}
                color={priceChange >= 0 ? 'success' : 'error'}
                variant="filled"
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
              {quote?.volume && (
                <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Vol: {formatVolume(quote.volume)}
                </Typography>
              )}
            </Stack>
          </Box>

          <Stack direction={{ xs: 'row', sm: 'row' }} spacing={1} alignItems="center" sx={{ width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
            <FormControl size="small" sx={{ minWidth: { xs: 100, sm: 120 } }}>
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
                <ShowChart sx={{ fontSize: { xs: 18, sm: 24 } }} />
              </ToggleButton>
              <ToggleButton value="area">
                <Timeline sx={{ fontSize: { xs: 18, sm: 24 } }} />
              </ToggleButton>
              <ToggleButton value="candle" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
                <CandlestickIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Box>

        {/* Price Chart */}
        <Box key={chartKey} sx={{ height: showVolume ? { xs: 280, sm: 350, md: 400 } : { xs: 320, sm: 400, md: 500 }, width: '100%', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis
                  dataKey="date"
                  stroke={chartColors.axis}
                  tick={{ fontSize: 11, fill: chartColors.axis }}
                  tickLine={{ stroke: chartColors.axis }}
                  axisLine={{ stroke: chartColors.axis }}
                  interval={Math.floor(chartData.length / 8)}
                />
                <YAxis
                  stroke={chartColors.axis}
                  tick={{ fontSize: 11, fill: chartColors.axis }}
                  tickLine={{ stroke: chartColors.axis }}
                  axisLine={{ stroke: chartColors.axis }}
                  domain={priceDomain}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ color: chartColors.text }}
                  iconType="line"
                />
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={chartColors.primary}
                  fill="url(#colorPrice)"
                  strokeWidth={2}
                  name="Price"
                  dot={false}
                  activeDot={{ r: 6, fill: chartColors.primary, stroke: darkMode ? '#fff' : '#000' }}
                />
                {indicators?.movingAverage && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="sma"
                      stroke={chartColors.sma}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="SMA (20)"
                    />
                    <Line
                      type="monotone"
                      dataKey="ema"
                      stroke={chartColors.ema}
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
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis
                  dataKey="date"
                  stroke={chartColors.axis}
                  tick={{ fontSize: 11, fill: chartColors.axis }}
                  tickLine={{ stroke: chartColors.axis }}
                  axisLine={{ stroke: chartColors.axis }}
                  interval={Math.floor(chartData.length / 8)}
                />
                <YAxis
                  yAxisId="price"
                  orientation="right"
                  stroke={chartColors.axis}
                  tick={{ fontSize: 11, fill: chartColors.axis }}
                  tickLine={{ stroke: chartColors.axis }}
                  axisLine={{ stroke: chartColors.axis }}
                  domain={priceDomain}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <YAxis
                  yAxisId="volume"
                  orientation="left"
                  stroke={chartColors.volume}
                  tick={{ fontSize: 11, fill: chartColors.volume }}
                  tickLine={{ stroke: chartColors.volume }}
                  axisLine={{ stroke: chartColors.volume }}
                  domain={[0, 'auto']}
                  tickFormatter={(value) => formatVolume(value)}
                  hide={!showVolume}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ color: chartColors.text }}
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
                      stroke={chartColors.sma}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="SMA (20)"
                    />
                    <Line
                      yAxisId="price"
                      type="monotone"
                      dataKey="ema"
                      stroke={chartColors.ema}
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
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis
                  dataKey="date"
                  stroke={chartColors.axis}
                  tick={{ fontSize: 11, fill: chartColors.axis }}
                  tickLine={{ stroke: chartColors.axis }}
                  axisLine={{ stroke: chartColors.axis }}
                  interval={Math.floor(chartData.length / 8)}
                />
                <YAxis
                  stroke={chartColors.axis}
                  tick={{ fontSize: 11, fill: chartColors.axis }}
                  tickLine={{ stroke: chartColors.axis }}
                  axisLine={{ stroke: chartColors.axis }}
                  domain={priceDomain}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ color: chartColors.text }}
                  iconType="line"
                />
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke={chartColors.primary}
                  strokeWidth={3}
                  dot={false}
                  name="Price"
                  activeDot={{ r: 6, fill: chartColors.primary, stroke: darkMode ? '#fff' : '#000' }}
                />
                {indicators?.movingAverage && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="sma"
                      stroke={chartColors.sma}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="SMA (20)"
                    />
                    <Line
                      type="monotone"
                      dataKey="ema"
                      stroke={chartColors.ema}
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
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'var(--text-secondary)', mb: 0.5 }}>
              Volume
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis
                  dataKey="date"
                  stroke={chartColors.axis}
                  tick={{ fontSize: 10, fill: chartColors.axis }}
                  tickLine={false}
                  axisLine={false}
                  interval={Math.floor(chartData.length / 10)}
                />
                <YAxis
                  stroke={chartColors.axis}
                  tick={{ fontSize: 10, fill: chartColors.axis }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatVolume(value)}
                  width={60}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <Paper sx={{ p: 1, bgcolor: 'var(--bg-tooltip)', border: `1px solid ${chartColors.volume}` }}>
                          <Typography variant="caption" display="block" sx={{ color: 'var(--text-primary)' }}>{label}</Typography>
                          <Typography variant="caption" display="block" color={chartColors.volume}>
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
                  fill={chartColors.volume}
                  fillOpacity={0.7}
                  name="Volume"
                  isAnimationActive={false}
                >
                  {chartData.map((entry, index) => (
                    <rect
                      key={index}
                      fill={entry.close >= entry.open ? chartColors.bullish : chartColors.bearish}
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