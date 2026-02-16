// src/components/Portfolio/PortfolioManager.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  LinearProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  TrendingUp,
  TrendingDown,
  Refresh as RefreshIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  TableChart as TableIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import stockApi from '../../services/stockApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const PortfolioManager = () => {
  const { user, updatePortfolio } = useAuth();
  const { addNotification } = useNotifications();
  
  const [portfolio, setPortfolio] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [performanceData, setPerformanceData] = useState([]);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  
  // Refs to prevent multiple toasts
  const hasShownToast = useRef(false);
  const refreshTimeoutRef = useRef(null);
  const isFirstLoad = useRef(true);

  const [newStock, setNewStock] = useState({
    symbol: '',
    shares: '',
    purchasePrice: '',
    purchaseDate: format(new Date(), 'yyyy-MM-dd'),
    sector: 'Technology'
  });

  // Load portfolio from user data
  useEffect(() => {
    if (user) {
      loadPortfolio();
    }
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [user]);

  // Auto-refresh prices every 60 seconds (increased from 30)
  useEffect(() => {
    if (portfolio.length > 0) {
      const interval = setInterval(() => {
        refreshPrices();
      }, 60000); // 60 seconds
      return () => clearInterval(interval);
    }
  }, [portfolio]);

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      if (user?.portfolio) {
        setPortfolio(user.portfolio);
        // Don't refresh prices on initial load to avoid multiple toasts
        if (!isFirstLoad.current) {
          await refreshPrices(user.portfolio);
        }
        calculatePerformance(user.portfolio);
        isFirstLoad.current = false;
      }
    } catch (error) {
      console.error('Error loading portfolio:', error);
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const refreshPrices = async (portfolioData = portfolio) => {
    if (portfolioData.length === 0) return;
    
    setRefreshing(true);
    const updatedPortfolio = [...portfolioData];
    let hasSignificantChanges = false;
    let changedStocks = [];
    
    for (let i = 0; i < updatedPortfolio.length; i++) {
      try {
        const quote = await stockApi.getRealTimeQuote(updatedPortfolio[i].symbol);
        
        if (quote && quote.price) {
          const oldPrice = updatedPortfolio[i].currentPrice;
          const newPrice = quote.price;
          
          updatedPortfolio[i].currentPrice = newPrice;
          updatedPortfolio[i].lastUpdated = new Date().toISOString();
          
          // Check if price changed significantly (more than 1%)
          if (oldPrice && Math.abs((newPrice - oldPrice) / oldPrice) > 0.01) {
            hasSignificantChanges = true;
            changedStocks.push({
              symbol: updatedPortfolio[i].symbol,
              oldPrice,
              newPrice,
              change: ((newPrice - oldPrice) / oldPrice * 100).toFixed(2)
            });
            
            // Calculate profit change
            const invested = updatedPortfolio[i].shares * updatedPortfolio[i].purchasePrice;
            const currentValue = updatedPortfolio[i].shares * newPrice;
            const profit = currentValue - invested;
            const profitPercent = (profit / invested) * 100;
            
            // Add notification for significant price change
            addNotification({
              title: `💰 ${updatedPortfolio[i].symbol} Price Update`,
              message: `${updatedPortfolio[i].symbol} is now $${newPrice.toFixed(2)} (${profitPercent > 0 ? '+' : ''}${profitPercent.toFixed(2)}%)`,
              type: profit > 0 ? 'success' : 'warning',
              symbol: updatedPortfolio[i].symbol,
              action: 'price_alert'
            });
          }
        }
      } catch (error) {
        console.error(`Error refreshing ${updatedPortfolio[i].symbol}:`, error);
      }
    }
    
    // Only save and show toast if there are actual changes
    if (hasSignificantChanges) {
      await savePortfolio(updatedPortfolio);
      calculatePerformance(updatedPortfolio);
      setLastRefreshed(new Date());
      
      // Show single toast with summary of changes
      if (changedStocks.length === 1) {
        toast.success(`${changedStocks[0].symbol}: $${changedStocks[0].newPrice.toFixed(2)} (${changedStocks[0].change}%)`, {
          icon: '📈',
          duration: 3000
        });
      } else if (changedStocks.length > 1) {
        toast.success(`${changedStocks.length} stocks updated`, {
          icon: '📊',
          duration: 3000
        });
      }
    }
    
    setRefreshing(false);
  };

  const savePortfolio = async (updatedPortfolio) => {
    try {
      const success = await updatePortfolio(updatedPortfolio);
      if (success) {
        setPortfolio(updatedPortfolio);
        return true;
      }
    } catch (error) {
      console.error('Error saving portfolio:', error);
      toast.error('Failed to save portfolio');
    }
    return false;
  };

  const calculatePerformance = (portfolioData) => {
    if (!portfolioData || portfolioData.length === 0) {
      setPerformanceData([]);
      return;
    }

    // Generate 30-day performance data
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      let totalValue = 0;
      portfolioData.forEach(stock => {
        const price = stock.currentPrice || stock.purchasePrice;
        totalValue += stock.shares * price;
      });
      
      data.push({
        date: format(date, 'MMM dd'),
        value: totalValue
      });
    }
    
    setPerformanceData(data);
  };

  const handleAddStock = async () => {
    if (!newStock.symbol || !newStock.shares || !newStock.purchasePrice) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      let currentPrice;
      try {
        const quote = await stockApi.getRealTimeQuote(newStock.symbol);
        currentPrice = quote.price;
      } catch (error) {
        currentPrice = parseFloat(newStock.purchasePrice);
      }

      const stock = {
        id: editingStock?.id || Date.now().toString(),
        symbol: newStock.symbol.toUpperCase(),
        shares: parseFloat(newStock.shares),
        purchasePrice: parseFloat(newStock.purchasePrice),
        currentPrice: currentPrice,
        purchaseDate: newStock.purchaseDate,
        sector: newStock.sector,
        lastUpdated: new Date().toISOString()
      };

      let updatedPortfolio;
      if (editingStock) {
        updatedPortfolio = portfolio.map(s => 
          s.id === editingStock.id ? stock : s
        );
        toast.success(`✅ ${stock.symbol} updated successfully`);
      } else {
        updatedPortfolio = [...portfolio, stock];
        toast.success(`✅ ${stock.symbol} added to portfolio`);
      }

      await savePortfolio(updatedPortfolio);
      calculatePerformance(updatedPortfolio);
      
      addNotification({
        title: '📊 Portfolio Updated',
        message: editingStock 
          ? `Updated ${stock.symbol} holdings` 
          : `Added ${stock.shares} shares of ${stock.symbol}`,
        type: 'success',
        symbol: stock.symbol,
        action: 'portfolio'
      });
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error adding stock:', error);
      toast.error('Failed to add stock');
    }
  };

  const handleDeleteStock = async (id) => {
    const stockToDelete = portfolio.find(s => s.id === id);
    const updatedPortfolio = portfolio.filter(stock => stock.id !== id);
    await savePortfolio(updatedPortfolio);
    calculatePerformance(updatedPortfolio);
    
    toast.success(`🗑️ ${stockToDelete.symbol} removed from portfolio`);
    
    addNotification({
      title: '📊 Portfolio Updated',
      message: `Removed ${stockToDelete.symbol} from portfolio`,
      type: 'info',
      symbol: stockToDelete.symbol,
      action: 'portfolio'
    });
  };

  const handleEditStock = (stock) => {
    setEditingStock(stock);
    setNewStock({
      symbol: stock.symbol,
      shares: stock.shares.toString(),
      purchasePrice: stock.purchasePrice.toString(),
      purchaseDate: stock.purchaseDate,
      sector: stock.sector || 'Technology'
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStock(null);
    setNewStock({
      symbol: '',
      shares: '',
      purchasePrice: '',
      purchaseDate: format(new Date(), 'yyyy-MM-dd'),
      sector: 'Technology'
    });
  };

  const calculateTotals = () => {
    let totalInvested = 0;
    let totalCurrent = 0;
    
    portfolio.forEach(stock => {
      const invested = stock.shares * stock.purchasePrice;
      const current = stock.shares * (stock.currentPrice || stock.purchasePrice);
      totalInvested += invested;
      totalCurrent += current;
    });
    
    const totalProfit = totalCurrent - totalInvested;
    const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;
    
    return { totalInvested, totalCurrent, totalProfit, profitPercentage };
  };

  const getSectorAllocation = () => {
    const sectors = {};
    portfolio.forEach(stock => {
      const sector = stock.sector || 'Other';
      const value = stock.shares * (stock.currentPrice || stock.purchasePrice);
      sectors[sector] = (sectors[sector] || 0) + value;
    });
    
    return Object.entries(sectors).map(([name, value]) => ({ name, value }));
  };

  const totals = calculateTotals();
  const sectorData = getSectorAllocation();
  const COLORS = ['#00d4ff', '#ff6b6b', '#4caf50', '#ff9800', '#9c27b0', '#2196f3', '#e91e63', '#009688'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress sx={{ 
          bgcolor: 'rgba(0,212,255,0.1)', 
          '& .MuiLinearProgress-bar': { 
            bgcolor: '#00d4ff' 
          } 
        }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        background: (theme) => theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #132f4c 0%, #1a3a5f 100%)'
          : 'linear-gradient(135deg, #e3f2fd 0%, #bbdef5 100%)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              {user?.name}'s Portfolio
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Last updated: {format(lastRefreshed, 'MMM dd, yyyy HH:mm')}
              </Typography>
              <Chip
                icon={<RefreshIcon sx={{ 
                  animation: refreshing ? 'spin 1s infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} />}
                label={refreshing ? 'Updating...' : 'Auto-refresh (60s)'}
                size="small"
                color={refreshing ? 'warning' : 'success'}
                variant="outlined"
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Refresh prices now">
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => refreshPrices()}
                disabled={refreshing || portfolio.length === 0}
              >
                {refreshing ? 'Updating...' : 'Refresh'}
              </Button>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{
                bgcolor: '#00d4ff',
                '&:hover': { bgcolor: '#00b4d8' }
              }}
            >
              Add Stock
            </Button>
          </Box>
        </Box>

        {/* Portfolio Summary Cards */}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              bgcolor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(0,212,255,0.1)' 
                : 'rgba(0,212,255,0.05)',
              border: '1px solid rgba(0,212,255,0.3)'
            }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Invested
                </Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#00d4ff' }}>
                  {formatCurrency(totals.totalInvested)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              bgcolor: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(76,175,80,0.1)'
                : 'rgba(76,175,80,0.05)',
              border: '1px solid rgba(76,175,80,0.3)'
            }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Current Value
                </Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#4caf50' }}>
                  {formatCurrency(totals.totalCurrent)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              bgcolor: (theme) => {
                const color = totals.totalProfit >= 0 ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)';
                return theme.palette.mode === 'dark' ? color : color.replace('0.1', '0.05');
              },
              border: `1px solid ${totals.totalProfit >= 0 ? 'rgba(76,175,80,0.3)' : 'rgba(244,67,54,0.3)'}`
            }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Profit/Loss
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {totals.totalProfit >= 0 ? (
                    <TrendingUp sx={{ color: '#4caf50' }} />
                  ) : (
                    <TrendingDown sx={{ color: '#f44336' }} />
                  )}
                  <Typography 
                    variant="h5" 
                    fontWeight="bold"
                    sx={{ color: totals.totalProfit >= 0 ? '#4caf50' : '#f44336' }}
                  >
                    {formatCurrency(Math.abs(totals.totalProfit))}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: totals.totalProfit >= 0 ? '#4caf50' : '#f44336' }}>
                  {totals.totalProfit >= 0 ? '+' : ''}{totals.profitPercentage.toFixed(2)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              bgcolor: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(255,152,0,0.1)'
                : 'rgba(255,152,0,0.05)',
              border: '1px solid rgba(255,152,0,0.3)'
            }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Holdings
                </Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#ff9800' }}>
                  {portfolio.length} {portfolio.length === 1 ? 'Stock' : 'Stocks'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab icon={<TableIcon />} label="HOLDINGS" />
          <Tab icon={<ShowChartIcon />} label="PERFORMANCE" />
          <Tab icon={<PieChartIcon />} label="ALLOCATION" />
        </Tabs>
      </Box>

      {/* Holdings Tab */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3 }}>
          {portfolio.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell align="right">Shares</TableCell>
                    <TableCell align="right">Purchase Price</TableCell>
                    <TableCell align="right">Current Price</TableCell>
                    <TableCell align="right">Current Value</TableCell>
                    <TableCell align="right">Profit/Loss</TableCell>
                    <TableCell align="right">Return %</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {portfolio.map((stock) => {
                    const value = stock.shares * (stock.currentPrice || stock.purchasePrice);
                    const invested = stock.shares * stock.purchasePrice;
                    const profit = value - invested;
                    const profitPercent = invested > 0 ? (profit / invested) * 100 : 0;
                    const isProfit = profit >= 0;
                    
                    return (
                      <TableRow 
                        key={stock.id}
                        sx={{ 
                          '&:hover': { 
                            bgcolor: (theme) => theme.palette.mode === 'dark' 
                              ? 'rgba(255,255,255,0.05)' 
                              : 'rgba(0,0,0,0.02)' 
                          } 
                        }}
                      >
                        <TableCell>
                          <Box>
                            <Typography fontWeight="bold">{stock.symbol}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {stock.sector}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">{stock.shares}</TableCell>
                        <TableCell align="right">{formatCurrency(stock.purchasePrice)}</TableCell>
                        <TableCell align="right">
                          <Box>
                            <Typography fontWeight="medium">
                              {formatCurrency(stock.currentPrice || stock.purchasePrice)}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: (stock.currentPrice || 0) >= stock.purchasePrice 
                                  ? '#4caf50' 
                                  : '#f44336' 
                              }}
                            >
                              {((stock.currentPrice || 0) - stock.purchasePrice).toFixed(2)} 
                              ({(((stock.currentPrice || 0) - stock.purchasePrice) / stock.purchasePrice * 100).toFixed(2)}%)
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">{formatCurrency(value)}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            {isProfit ? (
                              <TrendingUp sx={{ color: '#4caf50', mr: 0.5, fontSize: 16 }} />
                            ) : (
                              <TrendingDown sx={{ color: '#f44336', mr: 0.5, fontSize: 16 }} />
                            )}
                            <Typography 
                              color={isProfit ? 'success.main' : 'error.main'}
                              fontWeight="medium"
                            >
                              {formatCurrency(Math.abs(profit))}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${profitPercent.toFixed(2)}%`}
                            size="small"
                            sx={{ 
                              fontWeight: 'bold',
                              bgcolor: isProfit ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)',
                              color: isProfit ? '#4caf50' : '#f44336',
                              border: `1px solid ${isProfit ? '#4caf50' : '#f44336'}`
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditStock(stock)} 
                              sx={{ color: '#00d4ff' }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteStock(stock.id)} 
                              sx={{ color: '#f44336' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <PieChartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Your portfolio is empty
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start building your portfolio by adding your first stock
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
                sx={{ 
                  bgcolor: '#00d4ff', 
                  '&:hover': { bgcolor: '#00b4d8' },
                  px: 4,
                  py: 1.5
                }}
              >
                Add Your First Stock
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {/* Performance Tab */}
      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Portfolio Performance (30 Days)
          </Typography>
          <Box sx={{ height: 400, mt: 2 }}>
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#8899a6"
                    tick={{ fill: '#8899a6' }}
                  />
                  <YAxis 
                    stroke="#8899a6"
                    tick={{ fill: '#8899a6' }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      background: '#132f4c',
                      border: '1px solid #00d4ff',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value) => [formatCurrency(value), 'Portfolio Value']}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#00d4ff"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: '#00d4ff', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary">
                  No performance data available
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      )}

      {/* Allocation Tab */}
      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Sector Allocation
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {sectorData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sectorData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sectorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{
                          background: '#132f4c',
                          border: '1px solid #00d4ff',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography color="text.secondary">
                    No sector data available
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {sectorData.map((sector, index) => (
                      <TableRow key={sector.name}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box 
                              sx={{ 
                                width: 12, 
                                height: 12, 
                                bgcolor: COLORS[index % COLORS.length], 
                                borderRadius: 1 
                              }} 
                            />
                            <Typography>{sector.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">{formatCurrency(sector.value)}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${((sector.value / totals.totalCurrent) * 100).toFixed(1)}%`}
                            size="small"
                            sx={{ 
                              bgcolor: `${COLORS[index % COLORS.length]}20`,
                              color: COLORS[index % COLORS.length],
                              border: `1px solid ${COLORS[index % COLORS.length]}`
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Add/Edit Stock Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            background: (theme) => theme.palette.background.paper,
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {editingStock ? <EditIcon sx={{ color: '#00d4ff' }} /> : <AddIcon sx={{ color: '#00d4ff' }} />}
            <Typography variant="h6">
              {editingStock ? 'Edit Stock' : 'Add Stock to Portfolio'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Stock Symbol"
              value={newStock.symbol}
              onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value.toUpperCase() })}
              margin="normal"
              placeholder="e.g., AAPL"
              required
              disabled={!!editingStock}
            />
            <TextField
              fullWidth
              label="Number of Shares"
              type="number"
              value={newStock.shares}
              onChange={(e) => setNewStock({ ...newStock, shares: e.target.value })}
              margin="normal"
              required
              InputProps={{ inputProps: { min: 0.01, step: 0.01 } }}
            />
            <TextField
              fullWidth
              label="Purchase Price ($)"
              type="number"
              value={newStock.purchasePrice}
              onChange={(e) => setNewStock({ ...newStock, purchasePrice: e.target.value })}
              margin="normal"
              required
              InputProps={{ inputProps: { min: 0.01, step: 0.01 } }}
            />
            <TextField
              fullWidth
              label="Purchase Date"
              type="date"
              value={newStock.purchaseDate}
              onChange={(e) => setNewStock({ ...newStock, purchaseDate: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Sector</InputLabel>
              <Select
                value={newStock.sector}
                onChange={(e) => setNewStock({ ...newStock, sector: e.target.value })}
                label="Sector"
              >
                <MenuItem value="Technology">Technology</MenuItem>
                <MenuItem value="Healthcare">Healthcare</MenuItem>
                <MenuItem value="Financial Services">Financial Services</MenuItem>
                <MenuItem value="Consumer Cyclical">Consumer Cyclical</MenuItem>
                <MenuItem value="Communication Services">Communication Services</MenuItem>
                <MenuItem value="Industrials">Industrials</MenuItem>
                <MenuItem value="Energy">Energy</MenuItem>
                <MenuItem value="Basic Materials">Basic Materials</MenuItem>
                <MenuItem value="Real Estate">Real Estate</MenuItem>
                <MenuItem value="Utilities">Utilities</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button
            onClick={handleAddStock}
            variant="contained"
            disabled={!newStock.symbol || !newStock.shares || !newStock.purchasePrice}
            sx={{
              bgcolor: '#00d4ff',
              '&:hover': { bgcolor: '#00b4d8' }
            }}
          >
            {editingStock ? 'Update Stock' : 'Add to Portfolio'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PortfolioManager;