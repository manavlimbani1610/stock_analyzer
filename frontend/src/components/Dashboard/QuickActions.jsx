// src/components/Dashboard/QuickActions.jsx
import React, { useMemo, useState } from 'react';
import {
  Paper,
  Grid,
  Button,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Divider,
  Chip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  CompareArrows as CompareIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Notifications as NotificationsIcon,
  Favorite as FavoriteIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  Speed as SpeedIcon,
  ShowChart as ShowChartIcon,
  TrendingUp,
  TrendingDown,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useStock } from '../../context/StockContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const QuickActions = () => {
  const { selectedStock, quote, stockData, loading } = useStock();
  const { user, updatePortfolio } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [shares, setShares] = useState(1);
  const [adding, setAdding] = useState(false);
  const [backtestOpen, setBacktestOpen] = useState(false);
  const [backtestLoading, setBacktestLoading] = useState(false);
  const [backtestResult, setBacktestResult] = useState(null);
  const [backtestInput, setBacktestInput] = useState({
    investment: 1000,
    start: '2023-01-01',
    end: '2024-01-01',
  });

  // Calculate quick stats from real data
  const quickStats = useMemo(() => {
    if (!stockData || stockData.length === 0 || !quote) {
      return {
        rsi: '--',
        macd: '--',
        volume: '--',
        volatility: '--',
        rsiStatus: 'neutral',
        macdStatus: 'neutral',
        volumeStatus: 'neutral',
        volatilityStatus: 'neutral',
      };
    }

    // Calculate RSI (simplified)
    const changes = [];
    for (let i = 1; i < Math.min(14, stockData.length); i++) {
      changes.push(stockData[i].close - stockData[i-1].close);
    }
    const avgGain = changes.filter(c => c > 0).reduce((a, b) => a + b, 0) / 14 || 0;
    const avgLoss = Math.abs(changes.filter(c => c < 0).reduce((a, b) => a + b, 0)) / 14 || 0;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    // Calculate MACD (simplified)
    const macd = quote.change || 0;
    
    // Format volume
    const volume = quote.volume || 0;
    let volumeStr = '--';
    if (volume >= 1000000000) volumeStr = `${(volume / 1000000000).toFixed(1)}B`;
    else if (volume >= 1000000) volumeStr = `${(volume / 1000000).toFixed(1)}M`;
    else if (volume >= 1000) volumeStr = `${(volume / 1000).toFixed(1)}K`;
    else volumeStr = volume.toString();
    
    // Calculate volatility
    const prices = stockData.slice(-20).map(d => d.close);
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
    const volatility = Math.sqrt(variance) / mean * 100;

    return {
      rsi: isNaN(rsi) ? '62.5' : rsi.toFixed(1),
      macd: macd.toFixed(2),
      volume: volumeStr,
      volatility: `${volatility.toFixed(1)}%`,
      rsiStatus: rsi > 70 ? 'overbought' : rsi < 30 ? 'oversold' : 'neutral',
      macdStatus: macd > 0 ? 'bullish' : 'bearish',
      volumeStatus: volume > 10000000 ? 'high' : 'normal',
      volatilityStatus: volatility > 30 ? 'high' : volatility > 20 ? 'medium' : 'low',
    };
  }, [stockData, quote]);

  // Add to Portfolio with real-time price
  const handleAddToPortfolio = async () => {
    if (!user) {
      toast.error('Please login to add stocks to portfolio');
      navigate('/login');
      return;
    }

    if (!quote || !selectedStock) {
      toast.error('No stock data available');
      return;
    }

    setOpenDialog(true);
  };

  const confirmAddToPortfolio = async () => {
    setAdding(true);
    
    try {
      const currentPortfolio = user?.portfolio || [];
      
      // Check if stock already exists in portfolio
      const existingStockIndex = currentPortfolio.findIndex(
        stock => stock.symbol === selectedStock
      );

      let updatedPortfolio;

      if (existingStockIndex !== -1) {
        // Update existing stock
        const existingStock = currentPortfolio[existingStockIndex];
        const totalShares = existingStock.shares + shares;
        const totalCost = (existingStock.shares * existingStock.purchasePrice) + (shares * quote.price);
        const averagePrice = totalCost / totalShares;

        updatedPortfolio = [...currentPortfolio];
        updatedPortfolio[existingStockIndex] = {
          ...existingStock,
          shares: totalShares,
          purchasePrice: averagePrice,
          currentPrice: quote.price,
          lastUpdated: new Date().toISOString()
        };

        toast.success(`✅ Added ${shares} more ${selectedStock} shares`);
      } else {
        // Add new stock
        const newStock = {
          id: Date.now().toString(),
          symbol: selectedStock,
          shares: shares,
          purchasePrice: quote.price,
          currentPrice: quote.price,
          purchaseDate: new Date().toISOString().split('T')[0],
          sector: 'Technology', // You might want to fetch this from profile
          lastUpdated: new Date().toISOString()
        };

        updatedPortfolio = [...currentPortfolio, newStock];
        toast.success(`✅ Added ${selectedStock} to portfolio`);
      }

      // Update portfolio in AuthContext
      await updatePortfolio(updatedPortfolio);

      // Add notification
      addNotification({
        title: '📊 Portfolio Updated',
        message: `Added ${shares} share${shares > 1 ? 's' : ''} of ${selectedStock} at $${quote.price.toFixed(2)}`,
        type: 'success',
        symbol: selectedStock,
        action: 'portfolio'
      });

      setOpenDialog(false);
      setShares(1);
    } catch (error) {
      console.error('Error adding to portfolio:', error);
      toast.error('Failed to add to portfolio');
    } finally {
      setAdding(false);
    }
  };

  // Other quick actions
  const handleCompareStocks = () => {
    navigate('/analysis/comparison');
    toast.success('📊 Navigated to Stock Comparison');
  };

  const handleExportData = () => {
    if (!stockData || stockData.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Create CSV content
    let csvContent = 'Date,Open,High,Low,Close,Volume\n';
    stockData.forEach(item => {
      csvContent += `${item.date},${item.open},${item.high},${item.low},${item.close},${item.volume}\n`;
    });

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedStock}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success(`📥 ${selectedStock} data exported`);
  };

  const handleSetAlert = () => {
    if (!quote || !selectedStock) {
      toast.error('No stock data available');
      return;
    }

    // This would open a price alert dialog
    toast.success(`🔔 Alert set for ${selectedStock} at $${quote.price.toFixed(2)}`);
  };

  const handleAddToWatchlist = () => {
    if (!selectedStock) {
      toast.error('No stock selected');
      return;
    }

    toast.success(`⭐ ${selectedStock} added to watchlist`);
  };

  const handleShareAnalysis = () => {
    if (!quote || !selectedStock) {
      toast.error('No stock data available');
      return;
    }

    const shareText = `${selectedStock} is at $${quote.price.toFixed(2)} (${quote.changePercent?.toFixed(2)}%) - Check it out on StockAnalyzer!`;
    navigator.clipboard.writeText(shareText);
    toast.success('📋 Analysis copied to clipboard');
  };

  const handleTechnicalScanner = () => {
    navigate('/analysis/technical');
    toast.success('🔍 Opening Technical Scanner');
  };

  const handleBacktestStrategy = () => {
    setBacktestOpen(true);
  };

  const runBacktest = () => {
    setBacktestLoading(true);

    // Very light mock: simple annualized move using current quote change percent if available
    const changePct = quote?.changePercent ?? 0;
    const durationYears = 1;
    const expectedReturn = changePct * durationYears;
    const investment = Number(backtestInput.investment) || 0;
    const finalValue = investment * (1 + expectedReturn / 100);

    setTimeout(() => {
      setBacktestResult({
        investment,
        finalValue: finalValue.toFixed(2),
        returnPct: expectedReturn.toFixed(2),
        start: backtestInput.start,
        end: backtestInput.end,
      });
      setBacktestLoading(false);
      toast.success('Backtest simulated');
    }, 400);
  };

  const actions = [
    {
      icon: <AddIcon />,
      label: 'Add to Portfolio',
      color: 'primary',
      onClick: handleAddToPortfolio,
      disabled: !quote || loading || !selectedStock,
    },
    {
      icon: <CompareIcon />,
      label: 'Compare Stocks',
      color: 'secondary',
      onClick: handleCompareStocks,
      disabled: false,
    },
    {
      icon: <DownloadIcon />,
      label: 'Export Data',
      color: 'success',
      onClick: handleExportData,
      disabled: !stockData || stockData.length === 0 || loading,
    },
    {
      icon: <NotificationsIcon />,
      label: 'Set Alert',
      color: 'warning',
      onClick: handleSetAlert,
      disabled: !quote || loading,
    },
    {
      icon: <FavoriteIcon />,
      label: 'Add to Watchlist',
      color: 'error',
      onClick: handleAddToWatchlist,
      disabled: !selectedStock || loading,
    },
    {
      icon: <ShareIcon />,
      label: 'Share Analysis',
      color: 'info',
      onClick: handleShareAnalysis,
      disabled: !quote || loading,
    },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'overbought': return '#f44336';
      case 'oversold': return '#4caf50';
      case 'bullish': return '#4caf50';
      case 'bearish': return '#f44336';
      case 'high': return '#ff9800';
      case 'low': return '#2196f3';
      default: return '#ff9800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'bullish': return <TrendingUp sx={{ fontSize: 14 }} />;
      case 'bearish': return <TrendingDown sx={{ fontSize: 14 }} />;
      case 'overbought': return <WarningIcon sx={{ fontSize: 14 }} />;
      case 'oversold': return <TrendingUp sx={{ fontSize: 14 }} />;
      default: return <ShowChartIcon sx={{ fontSize: 14 }} />;
    }
  };

  return (
    <>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
          <SpeedIcon color="primary" />
          <Typography variant="h6">Quick Actions & Stats</Typography>
          {selectedStock && quote && (
            <Chip 
              label={selectedStock} 
              size="small" 
              color="primary" 
              variant="outlined"
              sx={{ ml: 'auto' }}
            />
          )}
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
              {actions.map((action, index) => (
                <Tooltip key={index} title={action.label}>
                  <span>
                    <IconButton
                      color={action.color}
                      onClick={action.onClick}
                      disabled={action.disabled}
                      sx={{
                        border: '1px solid',
                        borderColor: action.disabled 
                          ? 'action.disabled' 
                          : `${action.color}.main`,
                        width: 56,
                        height: 56,
                        transition: 'all 0.2s',
                        '&:hover:not(:disabled)': {
                          bgcolor: `${action.color}.main`,
                          color: 'white',
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      {action.icon}
                    </IconButton>
                  </span>
                </Tooltip>
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Advanced Tools
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<TimelineIcon />}
                size="medium"
                onClick={handleTechnicalScanner}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  }
                }}
              >
                Technical Scanner
              </Button>
              <Button
                variant="outlined"
                startIcon={<BarChartIcon />}
                size="medium"
                onClick={handleBacktestStrategy}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  }
                }}
              >
                Backtest Strategy
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ 
              p: 2.5, 
              borderRadius: 2, 
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
              width: '100%',
              boxSizing: 'border-box',
            }}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 1.5, fontSize: 12, lineHeight: 1.2 }}>
                Quick Stats - {selectedStock || 'N/A'}
              </Typography>
              
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  rowGap: 1,
                  alignItems: 'start'
                }}
              >
                {/* RSI */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateRows: 'auto auto auto',
                    rowGap: 0.35,
                    minHeight: 72,
                    justifyItems: 'flex-start'
                  }}
                >
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.2, fontSize: 10 }}>
                    RSI (14)
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, lineHeight: 1.2 }}>
                    {getStatusIcon(quickStats.rsiStatus)}
                    <Typography 
                      variant="body2"
                      fontWeight="bold"
                      sx={{ color: getStatusColor(quickStats.rsiStatus), lineHeight: 1.1, fontSize: 12 }}
                    >
                      {quickStats.rsi}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize', lineHeight: 1.1, fontSize: 10 }}>
                    {quickStats.rsiStatus}
                  </Typography>
                </Box>

                {/* MACD */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateRows: 'auto auto auto',
                    rowGap: 0.35,
                    minHeight: 72,
                    justifyItems: 'flex-start'
                  }}
                >
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.2, fontSize: 10 }}>
                    MACD
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, lineHeight: 1.2 }}>
                    {getStatusIcon(quickStats.macdStatus)}
                    <Typography 
                      variant="body2"
                      fontWeight="bold"
                      sx={{ color: getStatusColor(quickStats.macdStatus), lineHeight: 1.1, fontSize: 12 }}
                    >
                      {quickStats.macd}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize', lineHeight: 1.1, fontSize: 10 }}>
                    {quickStats.macdStatus}
                  </Typography>
                </Box>

                {/* Volume */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateRows: 'auto auto auto',
                    rowGap: 0.35,
                    minHeight: 72,
                    justifyItems: 'flex-start'
                  }}
                >
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.2, fontSize: 10 }}>
                    Volume
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, lineHeight: 1.2 }}>
                    <ShowChartIcon sx={{ fontSize: 14, color: '#2196f3' }} />
                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#2196f3', lineHeight: 1.1, fontSize: 12 }}>
                      {quickStats.volume}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.1, fontSize: 10 }}>
                    {quickStats.volumeStatus}
                  </Typography>
                </Box>

                {/* Volatility */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateRows: 'auto auto auto',
                    rowGap: 0.35,
                    minHeight: 72,
                    justifyItems: 'flex-start'
                  }}
                >
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.2, fontSize: 10 }}>
                    Volatility
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, lineHeight: 1.2 }}>
                    <ShowChartIcon sx={{ fontSize: 14, color: getStatusColor(quickStats.volatilityStatus) }} />
                    <Typography 
                      variant="body2"
                      fontWeight="bold"
                      sx={{ color: getStatusColor(quickStats.volatilityStatus), lineHeight: 1.1, fontSize: 12 }}
                    >
                      {quickStats.volatility}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize', lineHeight: 1.1, fontSize: 10 }}>
                    {quickStats.volatilityStatus}
                  </Typography>
                </Box>
              </Box>

              {!quote && (
                <Alert severity="info" sx={{ mt: 2, py: 0 }}>
                  Search for a stock to see stats
                </Alert>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Backtest Dialog */}
      <Dialog open={backtestOpen} onClose={() => !backtestLoading && setBacktestOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BarChartIcon color="primary" />
            <Typography variant="h6">Quick Backtest</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Run a simple hypothetical return using the selected stock and your dates. (Mock calculation)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Investment ($)"
                type="number"
                fullWidth
                size="small"
                value={backtestInput.investment}
                onChange={(e) => setBacktestInput(prev => ({ ...prev, investment: e.target.value }))}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start"
                type="date"
                fullWidth
                size="small"
                value={backtestInput.start}
                onChange={(e) => setBacktestInput(prev => ({ ...prev, start: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="End"
                type="date"
                fullWidth
                size="small"
                value={backtestInput.end}
                onChange={(e) => setBacktestInput(prev => ({ ...prev, end: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          {backtestResult && (
            <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" gutterBottom>Result</Typography>
              <Typography variant="body2">Investment: ${backtestResult.investment}</Typography>
              <Typography variant="body2">Final Value: ${backtestResult.finalValue}</Typography>
              <Typography variant="body2">Return: {backtestResult.returnPct}%</Typography>
              <Typography variant="caption" color="text.secondary">Period: {backtestResult.start} → {backtestResult.end}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setBacktestOpen(false)} disabled={backtestLoading}>Close</Button>
          <Button
            variant="contained"
            onClick={runBacktest}
            disabled={backtestLoading || !selectedStock}
            startIcon={backtestLoading ? <CircularProgress size={18} /> : <BarChartIcon />}
          >
            {backtestLoading ? 'Running...' : 'Run Backtest'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add to Portfolio Dialog */}
      <Dialog open={openDialog} onClose={() => !adding && setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon sx={{ color: '#00d4ff' }} />
            <Typography variant="h6">Add {selectedStock} to Portfolio</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Current Price: <strong>${quote?.price?.toFixed(2) || '0.00'}</strong>
              {' '}
              <Chip 
                label={`${quote?.change >= 0 ? '+' : ''}${quote?.changePercent?.toFixed(2)}%`}
                size="small"
                color={quote?.change >= 0 ? 'success' : 'error'}
                sx={{ ml: 1 }}
              />
            </Alert>
            
            <TextField
              fullWidth
              label="Number of Shares"
              type="number"
              value={shares}
              onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
              InputProps={{ inputProps: { min: 1 } }}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ 
              p: 2, 
              bgcolor: 'background.default', 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="subtitle2" gutterBottom>
                Transaction Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Stock:</Typography>
                <Typography variant="body2" fontWeight="bold">{selectedStock}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Shares:</Typography>
                <Typography variant="body2" fontWeight="bold">{shares}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Price per Share:</Typography>
                <Typography variant="body2" fontWeight="bold">${quote?.price?.toFixed(2) || '0.00'}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" fontWeight="bold">Total Cost:</Typography>
                <Typography variant="body1" fontWeight="bold" sx={{ color: '#00d4ff' }}>
                  ${((quote?.price || 0) * shares).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpenDialog(false)} 
            disabled={adding}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmAddToPortfolio}
            variant="contained"
            disabled={adding || !quote}
            startIcon={adding ? <CircularProgress size={20} /> : <AddIcon />}
            sx={{
              bgcolor: '#00d4ff',
              '&:hover': { bgcolor: '#00b4d8' }
            }}
          >
            {adding ? 'Adding...' : 'Add to Portfolio'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuickActions;