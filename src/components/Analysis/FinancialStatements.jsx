// src/components/Analysis/FinancialStatements.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  LinearProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  TrendingUp,
  TrendingDown,
  Assessment,
  Download,
  AttachMoney,
  AccountBalance,
  BarChart,
  PieChart,
  CompareArrows,
   Info,
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
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { useStock } from '../../context/StockContext';
import { useNotifications } from '../../context/NotificationContext';
import stockApi from '../../services/stockApi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// Tab Panel Component
const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`financial-tabpanel-${index}`}
    aria-labelledby={`financial-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const FinancialStatements = () => {
  const { selectedStock } = useStock();
  const { addNotification } = useNotifications();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [fiscalYear, setFiscalYear] = useState('2023');
  
  // Financial data states
  const [companyInfo, setCompanyInfo] = useState({});
  const [allIncomeStatement, setAllIncomeStatement] = useState([]);
  const [allBalanceSheet, setAllBalanceSheet] = useState([]);
  const [allCashFlow, setAllCashFlow] = useState([]);
  const [ratios, setRatios] = useState({});
  const [growthRates, setGrowthRates] = useState({});
  const [valuations, setValuations] = useState({});
  const [peerComparison, setPeerComparison] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

  // Filtered data based on fiscal year
  const incomeStatement = useMemo(() => {
    if (!allIncomeStatement.length) return [];
    if (fiscalYear === 'all') return allIncomeStatement;
    return allIncomeStatement.filter(item => item.year === fiscalYear);
  }, [allIncomeStatement, fiscalYear]);

  const balanceSheet = useMemo(() => {
    if (!allBalanceSheet.length) return [];
    if (fiscalYear === 'all') return allBalanceSheet;
    return allBalanceSheet.filter(item => item.year === fiscalYear);
  }, [allBalanceSheet, fiscalYear]);

  const cashFlow = useMemo(() => {
    if (!allCashFlow.length) return [];
    if (fiscalYear === 'all') return allCashFlow;
    return allCashFlow.filter(item => item.year === fiscalYear);
  }, [allCashFlow, fiscalYear]);

  // Current data for selected year
  const currentData = useMemo(() => {
    return incomeStatement[0] || allIncomeStatement[0] || {};
  }, [incomeStatement, allIncomeStatement]);

  // Colors for charts
  const COLORS = ['#00d4ff', '#ff6b6b', '#4caf50', '#ff9800', '#9c27b0', '#2196f3'];

  // Fetch data when stock changes
  useEffect(() => {
    fetchFinancialData();
  }, [selectedStock]);

  const fetchFinancialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In production, replace with actual API calls to get real financial data
      // For demo, we'll generate mock data based on the selected stock
      
      // Get company info first
      let companyProfile;
      try {
        companyProfile = await stockApi.getCompanyProfile(selectedStock);
      } catch (error) {
        console.warn('Using mock company profile');
        companyProfile = {
          name: `${selectedStock} Inc.`,
          sector: 'Technology',
          industry: 'Software',
          marketCap: 2850000000000,
          logo: '',
        };
      }
      setCompanyInfo(companyProfile);

      // Generate mock financial data based on stock symbol
      // In production, this would come from a financial data API
      const baseMultiplier = getStockMultiplier(selectedStock);
      
      // Income Statement Data - Complete dataset for all years
      const mockIncomeStatement = [
        { 
          year: '2023', 
          revenue: 394328000000 * baseMultiplier, 
          costOfRevenue: 223546000000 * baseMultiplier,
          grossProfit: 170782000000 * baseMultiplier,
          operatingExpenses: 51445000000 * baseMultiplier,
          operatingIncome: 119337000000 * baseMultiplier,
          interestExpense: 2930000000 * baseMultiplier,
          incomeBeforeTax: 119044000000 * baseMultiplier,
          incomeTaxExpense: 16741000000 * baseMultiplier,
          netIncome: 102303000000 * baseMultiplier,
          eps: 6.16 * baseMultiplier,
          dilutedEps: 6.13 * baseMultiplier,
          weightedAverageShares: 16600000000,
        },
        { 
          year: '2022', 
          revenue: 365817000000 * baseMultiplier, 
          costOfRevenue: 212981000000 * baseMultiplier,
          grossProfit: 152836000000 * baseMultiplier,
          operatingExpenses: 46783000000 * baseMultiplier,
          operatingIncome: 109053000000 * baseMultiplier,
          interestExpense: 2870000000 * baseMultiplier,
          incomeBeforeTax: 109183000000 * baseMultiplier,
          incomeTaxExpense: 14527000000 * baseMultiplier,
          netIncome: 94756000000 * baseMultiplier,
          eps: 5.89 * baseMultiplier,
          dilutedEps: 5.85 * baseMultiplier,
          weightedAverageShares: 16200000000,
        },
        { 
          year: '2021', 
          revenue: 347155000000 * baseMultiplier, 
          costOfRevenue: 197699000000 * baseMultiplier,
          grossProfit: 149456000000 * baseMultiplier,
          operatingExpenses: 43873000000 * baseMultiplier,
          operatingIncome: 105583000000 * baseMultiplier,
          interestExpense: 2650000000 * baseMultiplier,
          incomeBeforeTax: 105933000000 * baseMultiplier,
          incomeTaxExpense: 12597000000 * baseMultiplier,
          netIncome: 93336000000 * baseMultiplier,
          eps: 5.61 * baseMultiplier,
          dilutedEps: 5.58 * baseMultiplier,
          weightedAverageShares: 16700000000,
        },
        { 
          year: '2020', 
          revenue: 274515000000 * baseMultiplier, 
          costOfRevenue: 169559000000 * baseMultiplier,
          grossProfit: 104956000000 * baseMultiplier,
          operatingExpenses: 38668000000 * baseMultiplier,
          operatingIncome: 66288000000 * baseMultiplier,
          interestExpense: 2876000000 * baseMultiplier,
          incomeBeforeTax: 63412000000 * baseMultiplier,
          incomeTaxExpense: 9680000000 * baseMultiplier,
          netIncome: 53732000000 * baseMultiplier,
          eps: 3.28 * baseMultiplier,
          dilutedEps: 3.24 * baseMultiplier,
          weightedAverageShares: 17100000000,
        },
      ];
      
      // Balance Sheet Data
      const mockBalanceSheet = [
        {
          year: '2023',
          cashAndEquivalents: 29965000000 * baseMultiplier,
          shortTermInvestments: 31590000000 * baseMultiplier,
          accountsReceivable: 29508000000 * baseMultiplier,
          inventory: 6580000000 * baseMultiplier,
          totalCurrentAssets: 143566000000 * baseMultiplier,
          propertyPlantEquipment: 43715000000 * baseMultiplier,
          totalAssets: 352583000000 * baseMultiplier,
          accountsPayable: 62611000000 * baseMultiplier,
          shortTermDebt: 13422000000 * baseMultiplier,
          totalCurrentLiabilities: 145313000000 * baseMultiplier,
          longTermDebt: 104484000000 * baseMultiplier,
          totalLiabilities: 282432000000 * baseMultiplier,
          totalEquity: 70151000000 * baseMultiplier,
        },
        {
          year: '2022',
          cashAndEquivalents: 23646000000 * baseMultiplier,
          shortTermInvestments: 24658000000 * baseMultiplier,
          accountsReceivable: 28184000000 * baseMultiplier,
          inventory: 4940000000 * baseMultiplier,
          totalCurrentAssets: 135390000000 * baseMultiplier,
          propertyPlantEquipment: 42717000000 * baseMultiplier,
          totalAssets: 352755000000 * baseMultiplier,
          accountsPayable: 54763000000 * baseMultiplier,
          shortTermDebt: 21110000000 * baseMultiplier,
          totalCurrentLiabilities: 133103000000 * baseMultiplier,
          longTermDebt: 98959000000 * baseMultiplier,
          totalLiabilities: 275854000000 * baseMultiplier,
          totalEquity: 76901000000 * baseMultiplier,
        },
        {
          year: '2021',
          cashAndEquivalents: 34965000000 * baseMultiplier,
          shortTermInvestments: 27749000000 * baseMultiplier,
          accountsReceivable: 26278000000 * baseMultiplier,
          inventory: 6580000000 * baseMultiplier,
          totalCurrentAssets: 152566000000 * baseMultiplier,
          propertyPlantEquipment: 39440000000 * baseMultiplier,
          totalAssets: 351002000000 * baseMultiplier,
          accountsPayable: 54763000000 * baseMultiplier,
          shortTermDebt: 15768000000 * baseMultiplier,
          totalCurrentLiabilities: 125103000000 * baseMultiplier,
          longTermDebt: 109106000000 * baseMultiplier,
          totalLiabilities: 273000000000 * baseMultiplier,
          totalEquity: 63000000000 * baseMultiplier,
        },
      ];
      
      // Cash Flow Data
      const mockCashFlow = [
        {
          year: '2023',
          operatingCashFlow: 110543000000 * baseMultiplier,
          investingCashFlow: -3990000000 * baseMultiplier,
          financingCashFlow: -103301000000 * baseMultiplier,
          freeCashFlow: 97554000000 * baseMultiplier,
          capex: -12973000000 * baseMultiplier,
          dividends: -14705000000 * baseMultiplier,
          shareRepurchases: -77550000000 * baseMultiplier,
        },
        {
          year: '2022',
          operatingCashFlow: 111443000000 * baseMultiplier,
          investingCashFlow: -9050000000 * baseMultiplier,
          financingCashFlow: -108646000000 * baseMultiplier,
          freeCashFlow: 99430000000 * baseMultiplier,
          capex: -11413000000 * baseMultiplier,
          dividends: -14605000000 * baseMultiplier,
          shareRepurchases: -83450000000 * baseMultiplier,
        },
        {
          year: '2021',
          operatingCashFlow: 104038000000 * baseMultiplier,
          investingCashFlow: -14545000000 * baseMultiplier,
          financingCashFlow: -93349000000 * baseMultiplier,
          freeCashFlow: 92953000000 * baseMultiplier,
          capex: -11085000000 * baseMultiplier,
          dividends: -14467000000 * baseMultiplier,
          shareRepurchases: -85547000000 * baseMultiplier,
        },
      ];
      
      // Financial Ratios
      const mockRatios = {
        profitability: {
          grossMargin: 43.3,
          operatingMargin: 30.3,
          netMargin: 26.0,
          roe: 145.0,
          roa: 29.0,
          roic: 50.0,
        },
        liquidity: {
          currentRatio: 0.99,
          quickRatio: 0.94,
          cashRatio: 0.42,
        },
        solvency: {
          debtToEquity: 1.65,
          debtToAssets: 0.33,
          interestCoverage: 40.7,
        },
        efficiency: {
          assetTurnover: 1.12,
          inventoryTurnover: 34.5,
          receivablesTurnover: 13.3,
        },
        valuation: {
          pe: 28.5,
          pb: 48.5,
          ps: 7.4,
          pcf: 22.1,
          peg: 1.8,
        },
      };
      
      // Growth Rates
      const mockGrowthRates = {
        revenue: {
          qoq: 8.2,
          yoy: 7.8,
          cagr3y: 12.5,
          cagr5y: 10.2,
        },
        earnings: {
          qoq: 10.5,
          yoy: 8.3,
          cagr3y: 15.2,
          cagr5y: 12.8,
        },
        fcf: {
          yoy: 5.2,
          cagr3y: 11.5,
        },
      };
      
      // Peer Comparison
      const mockPeerComparison = [
        { symbol: selectedStock, pe: 28.5 * baseMultiplier, pb: 48.5 * baseMultiplier, ps: 7.4 * baseMultiplier, roe: 145.0, margin: 26.0 },
        { symbol: 'MSFT', pe: 32.1, pb: 15.2, ps: 12.5, roe: 42.5, margin: 35.0 },
        { symbol: 'GOOGL', pe: 25.3, pb: 6.8, ps: 5.9, roe: 25.8, margin: 24.0 },
        { symbol: 'AMZN', pe: 58.2, pb: 8.4, ps: 3.2, roe: 18.5, margin: 5.5 },
      ];
      
      // Analyst Forecasts
      const mockForecasts = [
        { year: '2024', revenue: 418000000000 * baseMultiplier, eps: 6.85 * baseMultiplier, growth: 11.2 },
        { year: '2025', revenue: 452000000000 * baseMultiplier, eps: 7.62 * baseMultiplier, growth: 11.3 },
        { year: '2026', revenue: 489000000000 * baseMultiplier, eps: 8.45 * baseMultiplier, growth: 10.9 },
      ];
      
      setAllIncomeStatement(mockIncomeStatement);
      setAllBalanceSheet(mockBalanceSheet);
      setAllCashFlow(mockCashFlow);
      setRatios(mockRatios);
      setGrowthRates(mockGrowthRates);
      setValuations(mockRatios.valuation);
      setPeerComparison(mockPeerComparison);
      setForecasts(mockForecasts);
      
      // Set available years for dropdown
      const years = [...new Set(mockIncomeStatement.map(item => item.year))].sort().reverse();
      setAvailableYears(years);
      setFiscalYear(years[0] || '2023');
      
      toast.success(`Loaded financial data for ${selectedStock}`);
      
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setError('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate stock-specific multipliers
  const getStockMultiplier = (symbol) => {
    const multipliers = {
      'AAPL': 1.0,
      'MSFT': 0.85,
      'GOOGL': 0.78,
      'AMZN': 0.92,
      'TSLA': 0.45,
      'NVDA': 0.67,
      'META': 0.71,
      'JPM': 0.32,
      'V': 0.28,
      'WMT': 0.41,
    };
    return multipliers[symbol] || 0.5 + Math.random() * 0.5;
  };

  const formatLargeNumber = (num) => {
    if (!num) return '—';
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
  };

  const formatPercent = (num) => `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;

  const exportData = () => {
    const exportData = {
      stock: selectedStock,
      companyName: companyInfo.name,
      timestamp: new Date().toISOString(),
      fiscalYear,
      incomeStatement: allIncomeStatement,
      balanceSheet: allBalanceSheet,
      cashFlow: allCashFlow,
      ratios,
      growthRates,
      valuations,
      forecasts,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedStock}-financials-${fiscalYear}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Financial data for ${selectedStock} exported`);
  };

  const handleYearChange = (event) => {
    const newYear = event.target.value;
    setFiscalYear(newYear);
    toast.success(`Showing ${newYear === 'all' ? 'all years' : `FY ${newYear}`} data for ${selectedStock}`);
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress sx={{ bgcolor: 'rgba(0,212,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#00d4ff' } }} />
        <Typography sx={{ textAlign: 'center', mt: 2 }} color="text.secondary">
          Loading financial data for {selectedStock}...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

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
            <Assessment sx={{ fontSize: 40, color: '#00d4ff' }} />
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Financial Analysis - {selectedStock}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {companyInfo.name || `${selectedStock} Inc.`} • {companyInfo.sector || 'Technology'} • {companyInfo.industry || 'Software'}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Fiscal Year</InputLabel>
              <Select 
                value={fiscalYear} 
                label="Fiscal Year" 
                onChange={handleYearChange}
              >
                <MenuItem value="all">All Years</MenuItem>
                {availableYears.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Tooltip title="Export data">
              <IconButton onClick={exportData} sx={{ color: '#00d4ff' }}>
                <Download />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Key Metrics Summary - Updates with stock and year */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'rgba(0,212,255,0.1)', border: '1px solid #00d4ff' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>Market Cap</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#00d4ff' }}>
                  {formatLargeNumber(companyInfo.marketCap || 2850000000000)}
                </Typography>
                <Chip size="small" label="+12.5% YTD" color="success" sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'rgba(76,175,80,0.1)', border: '1px solid #4caf50' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>P/E Ratio</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#4caf50' }}>
                  {(valuations.pe * getStockMultiplier(selectedStock)).toFixed(2)}
                </Typography>
                <Typography variant="caption">Industry: 25.4</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'rgba(255,152,0,0.1)', border: '1px solid #ff9800' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>ROE</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#ff9800' }}>
                  {ratios.profitability?.roe.toFixed(1)}%
                </Typography>
                <Typography variant="caption">Very Strong</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'rgba(244,67,54,0.1)', border: '1px solid #f44336' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>Revenue (TTM)</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#f44336' }}>
                  {formatLargeNumber(currentData.revenue || 394328000000)}
                </Typography>
                <Chip size="small" label="+7.8% YoY" color="success" sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Chip 
            icon={<Assessment />} 
            label={`${selectedStock}`} 
            size="small" 
            sx={{ bgcolor: '#00d4ff', color: '#000' }}
          />
          <Chip 
            icon={<TimelineIcon />} 
            label={`Showing ${fiscalYear === 'all' ? 'all fiscal years' : `FY ${fiscalYear}`}`} 
            size="small" 
            variant="outlined" 
            sx={{ borderColor: '#00d4ff' }}
          />
        </Box>
      </Paper>

      {/* Main Tabs */}
      <Paper sx={{ p: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Income Statement" icon={<AttachMoney />} iconPosition="start" />
          <Tab label="Balance Sheet" icon={<AccountBalance />} iconPosition="start" />
          <Tab label="Cash Flow" icon={<TrendingUp />} iconPosition="start" />
          <Tab label="Financial Ratios" icon={<BarChart />} iconPosition="start" />
          <Tab label="Growth & Forecasts" icon={<TimelineIcon />} iconPosition="start" />
          <Tab label="Peer Comparison" icon={<CompareArrows />} iconPosition="start" />
        </Tabs>

        {/* Income Statement Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TableContainer component={Card}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Income Statement (in millions)</TableCell>
                      {fiscalYear === 'all' ? (
                        allIncomeStatement.map((row) => (
                          <TableCell key={row.year} align="right">{row.year}</TableCell>
                        ))
                      ) : (
                        <TableCell align="right">{fiscalYear}</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Revenue</TableCell>
                      {fiscalYear === 'all' ? (
                        allIncomeStatement.map((row) => (
                          <TableCell key={row.year} align="right">${(row.revenue / 1e6).toFixed(0)}</TableCell>
                        ))
                      ) : (
                        <TableCell align="right">${(currentData.revenue / 1e6).toFixed(0)}</TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ pl: 4 }}>Cost of Revenue</TableCell>
                      {fiscalYear === 'all' ? (
                        allIncomeStatement.map((row) => (
                          <TableCell key={row.year} align="right">${(row.costOfRevenue / 1e6).toFixed(0)}</TableCell>
                        ))
                      ) : (
                        <TableCell align="right">${(currentData.costOfRevenue / 1e6).toFixed(0)}</TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Gross Profit</TableCell>
                      {fiscalYear === 'all' ? (
                        allIncomeStatement.map((row) => (
                          <TableCell key={row.year} align="right" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                            ${(row.grossProfit / 1e6).toFixed(0)}
                          </TableCell>
                        ))
                      ) : (
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                          ${(currentData.grossProfit / 1e6).toFixed(0)}
                        </TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ pl: 4 }}>Operating Expenses</TableCell>
                      {fiscalYear === 'all' ? (
                        allIncomeStatement.map((row) => (
                          <TableCell key={row.year} align="right">${(row.operatingExpenses / 1e6).toFixed(0)}</TableCell>
                        ))
                      ) : (
                        <TableCell align="right">${(currentData.operatingExpenses / 1e6).toFixed(0)}</TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Operating Income</TableCell>
                      {fiscalYear === 'all' ? (
                        allIncomeStatement.map((row) => (
                          <TableCell key={row.year} align="right" sx={{ fontWeight: 'bold' }}>
                            ${(row.operatingIncome / 1e6).toFixed(0)}
                          </TableCell>
                        ))
                      ) : (
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          ${(currentData.operatingIncome / 1e6).toFixed(0)}
                        </TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell>Interest Expense</TableCell>
                      {fiscalYear === 'all' ? (
                        allIncomeStatement.map((row) => (
                          <TableCell key={row.year} align="right">${(row.interestExpense / 1e6).toFixed(0)}</TableCell>
                        ))
                      ) : (
                        <TableCell align="right">${(currentData.interestExpense / 1e6).toFixed(0)}</TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell>Income Before Tax</TableCell>
                      {fiscalYear === 'all' ? (
                        allIncomeStatement.map((row) => (
                          <TableCell key={row.year} align="right">${(row.incomeBeforeTax / 1e6).toFixed(0)}</TableCell>
                        ))
                      ) : (
                        <TableCell align="right">${(currentData.incomeBeforeTax / 1e6).toFixed(0)}</TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell>Income Tax Expense</TableCell>
                      {fiscalYear === 'all' ? (
                        allIncomeStatement.map((row) => (
                          <TableCell key={row.year} align="right">${(row.incomeTaxExpense / 1e6).toFixed(0)}</TableCell>
                        ))
                      ) : (
                        <TableCell align="right">${(currentData.incomeTaxExpense / 1e6).toFixed(0)}</TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Net Income</TableCell>
                      {fiscalYear === 'all' ? (
                        allIncomeStatement.map((row) => (
                          <TableCell key={row.year} align="right" sx={{ fontWeight: 'bold', color: '#00d4ff' }}>
                            ${(row.netIncome / 1e6).toFixed(0)}
                          </TableCell>
                        ))
                      ) : (
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#00d4ff' }}>
                          ${(currentData.netIncome / 1e6).toFixed(0)}
                        </TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell>EPS (Diluted)</TableCell>
                      {fiscalYear === 'all' ? (
                        allIncomeStatement.map((row) => (
                          <TableCell key={row.year} align="right">${row.dilutedEps.toFixed(2)}</TableCell>
                        ))
                      ) : (
                        <TableCell align="right">${currentData.dilutedEps?.toFixed(2) || '—'}</TableCell>
                      )}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Revenue & Profit Trends
                    {fiscalYear !== 'all' && (
                      <Chip 
                        label={`FY ${fiscalYear}`} 
                        size="small" 
                        sx={{ ml: 1, bgcolor: '#00d4ff', color: '#000' }} 
                      />
                    )}
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={fiscalYear === 'all' ? allIncomeStatement : [currentData]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="year" stroke="#8899a6" />
                        <YAxis yAxisId="left" stroke="#8899a6" tickFormatter={(v) => `$${(v/1e9).toFixed(0)}B`} />
                        <RechartsTooltip
                          contentStyle={{ background: '#132f4c', border: '1px solid #00d4ff' }}
                          formatter={(v) => formatLargeNumber(v)}
                        />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#00d4ff" strokeWidth={3} name="Revenue" />
                        <Line yAxisId="left" type="monotone" dataKey="netIncome" stroke="#4caf50" strokeWidth={3} name="Net Income" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>Margin Analysis</Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Gross Margin</Typography>
                        <Typography variant="h6" sx={{ color: '#4caf50' }}>
                          {currentData.grossProfit && currentData.revenue 
                            ? `${((currentData.grossProfit / currentData.revenue) * 100).toFixed(1)}%`
                            : '—'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Operating Margin</Typography>
                        <Typography variant="h6" sx={{ color: '#ff9800' }}>
                          {currentData.operatingIncome && currentData.revenue 
                            ? `${((currentData.operatingIncome / currentData.revenue) * 100).toFixed(1)}%`
                            : '—'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Net Margin</Typography>
                        <Typography variant="h6" sx={{ color: '#00d4ff' }}>
                          {currentData.netIncome && currentData.revenue 
                            ? `${((currentData.netIncome / currentData.revenue) * 100).toFixed(1)}%`
                            : '—'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Balance Sheet Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TableContainer component={Card}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Balance Sheet (in millions)</TableCell>
                      {fiscalYear === 'all' ? (
                        allBalanceSheet.map((row) => (
                          <TableCell key={row.year} align="right">{row.year}</TableCell>
                        ))
                      ) : (
                        <TableCell align="right">{fiscalYear}</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={fiscalYear === 'all' ? allBalanceSheet.length + 1 : 2} sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>Assets</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ pl: 4 }}>Cash & Equivalents</TableCell>
                      {fiscalYear === 'all' ? (
                        allBalanceSheet.map((row) => (
                          <TableCell key={row.year} align="right">${(row.cashAndEquivalents / 1e6).toFixed(0)}</TableCell>
                        ))
                      ) : (
                        <TableCell align="right">${(balanceSheet[0]?.cashAndEquivalents / 1e6).toFixed(0)}</TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ pl: 4 }}>Short Term Investments</TableCell>
                      {fiscalYear === 'all' ? (
                        allBalanceSheet.map((row) => (
                          <TableCell align="right">${(row.shortTermInvestments / 1e6).toFixed(0)}</TableCell>
                        ))
                      ) : (
                        <TableCell align="right">${(balanceSheet[0]?.shortTermInvestments / 1e6).toFixed(0)}</TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ pl: 4 }}>Accounts Receivable</TableCell>
                      {fiscalYear === 'all' ? (
                        allBalanceSheet.map((row) => (
                          <TableCell align="right">${(row.accountsReceivable / 1e6).toFixed(0)}</TableCell>
                        ))
                      ) : (
                        <TableCell align="right">${(balanceSheet[0]?.accountsReceivable / 1e6).toFixed(0)}</TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ pl: 4 }}>Inventory</TableCell>
                      {fiscalYear === 'all' ? (
                        allBalanceSheet.map((row) => (
                          <TableCell align="right">${(row.inventory / 1e6).toFixed(0)}</TableCell>
                        ))
                      ) : (
                        <TableCell align="right">${(balanceSheet[0]?.inventory / 1e6).toFixed(0)}</TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Total Current Assets</TableCell>
                      {fiscalYear === 'all' ? (
                        allBalanceSheet.map((row) => (
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            ${(row.totalCurrentAssets / 1e6).toFixed(0)}
                          </TableCell>
                        ))
                      ) : (
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          ${(balanceSheet[0]?.totalCurrentAssets / 1e6).toFixed(0)}
                        </TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ pl: 4 }}>Property, Plant & Equipment</TableCell>
                      {fiscalYear === 'all' ? (
                        allBalanceSheet.map((row) => (
                          <TableCell align="right">${(row.propertyPlantEquipment / 1e6).toFixed(0)}</TableCell>
                        ))
                      ) : (
                        <TableCell align="right">${(balanceSheet[0]?.propertyPlantEquipment / 1e6).toFixed(0)}</TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Total Assets</TableCell>
                      {fiscalYear === 'all' ? (
                        allBalanceSheet.map((row) => (
                          <TableCell align="right" sx={{ fontWeight: 'bold', color: '#00d4ff' }}>
                            ${(row.totalAssets / 1e6).toFixed(0)}
                          </TableCell>
                        ))
                      ) : (
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#00d4ff' }}>
                          ${(balanceSheet[0]?.totalAssets / 1e6).toFixed(0)}
                        </TableCell>
                      )}
                    </TableRow>
                    
                    <TableRow>
                      <TableCell colSpan={fiscalYear === 'all' ? allBalanceSheet.length + 1 : 2} sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>Liabilities</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ pl: 4 }}>Accounts Payable</TableCell>
                      {fiscalYear === 'all' ? (
                        allBalanceSheet.map((row) => (
                          <TableCell align="right">${(row.accountsPayable / 1e6).toFixed(0)}</TableCell>
                        ))
                      ) : (
                        <TableCell align="right">${(balanceSheet[0]?.accountsPayable / 1e6).toFixed(0)}</TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ pl: 4 }}>Short Term Debt</TableCell>
                      {fiscalYear === 'all' ? (
                        allBalanceSheet.map((row) => (
                          <TableCell align="right">${(row.shortTermDebt / 1e6).toFixed(0)}</TableCell>
                        ))
                      ) : (
                        <TableCell align="right">${(balanceSheet[0]?.shortTermDebt / 1e6).toFixed(0)}</TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Total Current Liabilities</TableCell>
                      {fiscalYear === 'all' ? (
                        allBalanceSheet.map((row) => (
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            ${(row.totalCurrentLiabilities / 1e6).toFixed(0)}
                          </TableCell>
                        ))
                      ) : (
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          ${(balanceSheet[0]?.totalCurrentLiabilities / 1e6).toFixed(0)}
                        </TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ pl: 4 }}>Long Term Debt</TableCell>
                      {fiscalYear === 'all' ? (
                        allBalanceSheet.map((row) => (
                          <TableCell align="right">${(row.longTermDebt / 1e6).toFixed(0)}</TableCell>
                        ))
                      ) : (
                        <TableCell align="right">${(balanceSheet[0]?.longTermDebt / 1e6).toFixed(0)}</TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Total Liabilities</TableCell>
                      {fiscalYear === 'all' ? (
                        allBalanceSheet.map((row) => (
                          <TableCell align="right" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                            ${(row.totalLiabilities / 1e6).toFixed(0)}
                          </TableCell>
                        ))
                      ) : (
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                          ${(balanceSheet[0]?.totalLiabilities / 1e6).toFixed(0)}
                        </TableCell>
                      )}
                    </TableRow>
                    
                    <TableRow>
                      <TableCell colSpan={fiscalYear === 'all' ? allBalanceSheet.length + 1 : 2} sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>Equity</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Equity</TableCell>
                      {fiscalYear === 'all' ? (
                        allBalanceSheet.map((row) => (
                          <TableCell align="right" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                            ${(row.totalEquity / 1e6).toFixed(0)}
                          </TableCell>
                        ))
                      ) : (
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                          ${(balanceSheet[0]?.totalEquity / 1e6).toFixed(0)}
                        </TableCell>
                      )}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Asset Allocation - {selectedStock}
                    {fiscalYear !== 'all' && (
                      <Chip 
                        label={`FY ${fiscalYear}`} 
                        size="small" 
                        sx={{ ml: 1, bgcolor: '#00d4ff', color: '#000' }} 
                      />
                    )}
                  </Typography>
                  <Box sx={{ height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={[
                            { name: 'Cash & Investments', value: (balanceSheet[0]?.cashAndEquivalents + balanceSheet[0]?.shortTermInvestments) || 61555000000 },
                            { name: 'Receivables', value: balanceSheet[0]?.accountsReceivable || 29508000000 },
                            { name: 'Inventory', value: balanceSheet[0]?.inventory || 6580000000 },
                            { name: 'PP&E', value: balanceSheet[0]?.propertyPlantEquipment || 43715000000 },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[0,1,2,3].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(v) => formatLargeNumber(v)} />
                      </RePieChart>
                    </ResponsiveContainer>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>Liquidity Ratios</Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Current Ratio</Typography>
                        <Typography variant="h6">{ratios.liquidity?.currentRatio.toFixed(2)}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Quick Ratio</Typography>
                        <Typography variant="h6">{ratios.liquidity?.quickRatio.toFixed(2)}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Cash Ratio</Typography>
                        <Typography variant="h6">{ratios.liquidity?.cashRatio.toFixed(2)}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Cash Flow Tab - Similar structure with year filtering */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TableContainer component={Card}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Cash Flow (in millions) - {selectedStock}</TableCell>
                      {fiscalYear === 'all' ? (
                        allCashFlow.map((row) => (
                          <TableCell key={row.year} align="right">{row.year}</TableCell>
                        ))
                      ) : (
                        <TableCell align="right">{fiscalYear}</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Operating Cash Flow</TableCell>
                      {fiscalYear === 'all' ? (
                        allCashFlow.map((row) => (
                          <TableCell key={row.year} align="right" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                            ${(row.operatingCashFlow / 1e6).toFixed(0)}
                          </TableCell>
                        ))
                      ) : (
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                          ${(cashFlow[0]?.operatingCashFlow / 1e6).toFixed(0)}
                        </TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Investing Cash Flow</TableCell>
                      {fiscalYear === 'all' ? (
                        allCashFlow.map((row) => (
                          <TableCell align="right" sx={{ color: '#f44336' }}>
                            ${(row.investingCashFlow / 1e6).toFixed(0)}
                          </TableCell>
                        ))
                      ) : (
                        <TableCell align="right" sx={{ color: '#f44336' }}>
                          ${(cashFlow[0]?.investingCashFlow / 1e6).toFixed(0)}
                        </TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ pl: 4 }}>Capital Expenditures</TableCell>
                      {fiscalYear === 'all' ? (
                        allCashFlow.map((row) => (
                          <TableCell align="right">${(row.capex / 1e6).toFixed(0)}</TableCell>
                        ))
                      ) : (
                        <TableCell align="right">${(cashFlow[0]?.capex / 1e6).toFixed(0)}</TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Financing Cash Flow</TableCell>
                      {fiscalYear === 'all' ? (
                        allCashFlow.map((row) => (
                          <TableCell align="right">${(row.financingCashFlow / 1e6).toFixed(0)}</TableCell>
                        ))
                      ) : (
                        <TableCell align="right">${(cashFlow[0]?.financingCashFlow / 1e6).toFixed(0)}</TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ pl: 4 }}>Dividends Paid</TableCell>
                      {fiscalYear === 'all' ? (
                        allCashFlow.map((row) => (
                          <TableCell align="right">${(row.dividends / 1e6).toFixed(0)}</TableCell>
                        ))
                      ) : (
                        <TableCell align="right">${(cashFlow[0]?.dividends / 1e6).toFixed(0)}</TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ pl: 4 }}>Share Repurchases</TableCell>
                      {fiscalYear === 'all' ? (
                        allCashFlow.map((row) => (
                          <TableCell align="right">${(row.shareRepurchases / 1e6).toFixed(0)}</TableCell>
                        ))
                      ) : (
                        <TableCell align="right">${(cashFlow[0]?.shareRepurchases / 1e6).toFixed(0)}</TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Free Cash Flow</TableCell>
                      {fiscalYear === 'all' ? (
                        allCashFlow.map((row) => (
                          <TableCell align="right" sx={{ fontWeight: 'bold', color: '#00d4ff' }}>
                            ${(row.freeCashFlow / 1e6).toFixed(0)}
                          </TableCell>
                        ))
                      ) : (
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#00d4ff' }}>
                          ${(cashFlow[0]?.freeCashFlow / 1e6).toFixed(0)}
                        </TableCell>
                      )}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Cash Flow Trends - {selectedStock}
                    {fiscalYear !== 'all' && (
                      <Chip 
                        label={`FY ${fiscalYear}`} 
                        size="small" 
                        sx={{ ml: 1, bgcolor: '#00d4ff', color: '#000' }} 
                      />
                    )}
                  </Typography>
                  <Box sx={{ height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={fiscalYear === 'all' ? allCashFlow : [cashFlow[0]]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="year" stroke="#8899a6" />
                        <YAxis stroke="#8899a6" />
                        <RechartsTooltip
                          contentStyle={{ background: '#132f4c', border: '1px solid #00d4ff' }}
                          formatter={(v) => formatLargeNumber(v)}
                        />
                        <Legend />
                        <Bar dataKey="operatingCashFlow" fill="#4caf50" name="Operating CF" />
                        <Bar dataKey="freeCashFlow" fill="#00d4ff" name="Free CF" />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>FCF Conversion</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">FCF / Net Income</Typography>
                    <Chip
                      label={`${currentData.freeCashFlow && currentData.netIncome 
                        ? ((currentData.freeCashFlow / currentData.netIncome) * 100).toFixed(1) 
                        : '—'}%`}
                      color="success"
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Financial Ratios Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Profitability Ratios - {selectedStock}</Typography>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Gross Margin</TableCell>
                        <TableCell align="right">
                          <Chip label={formatPercent(ratios.profitability?.grossMargin)} color="success" size="small" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Operating Margin</TableCell>
                        <TableCell align="right">
                          <Chip label={formatPercent(ratios.profitability?.operatingMargin)} color="success" size="small" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Net Margin</TableCell>
                        <TableCell align="right">
                          <Chip label={formatPercent(ratios.profitability?.netMargin)} color="success" size="small" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>ROE</TableCell>
                        <TableCell align="right">
                          <Chip label={formatPercent(ratios.profitability?.roe)} color="primary" size="small" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>ROA</TableCell>
                        <TableCell align="right">
                          <Chip label={formatPercent(ratios.profitability?.roa)} color="info" size="small" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>ROIC</TableCell>
                        <TableCell align="right">
                          <Chip label={formatPercent(ratios.profitability?.roic)} color="secondary" size="small" />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Liquidity & Solvency - {selectedStock}</Typography>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Current Ratio</TableCell>
                        <TableCell align="right">
                          <Chip label={ratios.liquidity?.currentRatio.toFixed(2)} 
                            color={ratios.liquidity?.currentRatio > 1 ? 'success' : 'warning'} 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Quick Ratio</TableCell>
                        <TableCell align="right">
                          <Chip label={ratios.liquidity?.quickRatio.toFixed(2)} 
                            color={ratios.liquidity?.quickRatio > 1 ? 'success' : 'warning'} 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Debt/Equity</TableCell>
                        <TableCell align="right">
                          <Chip label={ratios.solvency?.debtToEquity.toFixed(2)} 
                            color={ratios.solvency?.debtToEquity < 1 ? 'success' : 'warning'} 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Interest Coverage</TableCell>
                        <TableCell align="right">
                          <Chip label={ratios.solvency?.interestCoverage.toFixed(1)} color="success" size="small" />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Efficiency Ratios - {selectedStock}</Typography>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Asset Turnover</TableCell>
                        <TableCell align="right">
                          <Chip label={ratios.efficiency?.assetTurnover.toFixed(2)} color="info" size="small" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Inventory Turnover</TableCell>
                        <TableCell align="right">
                          <Chip label={ratios.efficiency?.inventoryTurnover.toFixed(1)} color="info" size="small" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Receivables Turnover</TableCell>
                        <TableCell align="right">
                          <Chip label={ratios.efficiency?.receivablesTurnover.toFixed(1)} color="info" size="small" />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Growth & Forecasts Tab */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Growth Rates - {selectedStock}</Typography>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Metric</TableCell>
                        <TableCell align="right">QoQ</TableCell>
                        <TableCell align="right">YoY</TableCell>
                        <TableCell align="right">3Y CAGR</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Revenue</TableCell>
                        <TableCell align="right">
                          <Chip label={formatPercent(growthRates.revenue?.qoq)} color="success" size="small" />
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={formatPercent(growthRates.revenue?.yoy)} color="success" size="small" />
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={formatPercent(growthRates.revenue?.cagr3y)} color="primary" size="small" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Earnings</TableCell>
                        <TableCell align="right">
                          <Chip label={formatPercent(growthRates.earnings?.qoq)} color="success" size="small" />
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={formatPercent(growthRates.earnings?.yoy)} color="success" size="small" />
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={formatPercent(growthRates.earnings?.cagr3y)} color="primary" size="small" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Free Cash Flow</TableCell>
                        <TableCell align="right">—</TableCell>
                        <TableCell align="right">
                          <Chip label={formatPercent(growthRates.fcf?.yoy)} color="success" size="small" />
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={formatPercent(growthRates.fcf?.cagr3y)} color="primary" size="small" />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Analyst Forecasts - {selectedStock}</Typography>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Year</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                        <TableCell align="right">EPS</TableCell>
                        <TableCell align="right">Growth</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {forecasts.map((forecast) => (
                        <TableRow key={forecast.year}>
                          <TableCell>{forecast.year}</TableCell>
                          <TableCell align="right">{formatLargeNumber(forecast.revenue)}</TableCell>
                          <TableCell align="right">${forecast.eps.toFixed(2)}</TableCell>
                          <TableCell align="right">
                            <Chip label={formatPercent(forecast.growth)} color="success" size="small" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Peer Comparison Tab */}
        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Peer Comparison - {selectedStock}</Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Company</TableCell>
                          <TableCell align="right">P/E</TableCell>
                          <TableCell align="right">P/B</TableCell>
                          <TableCell align="right">P/S</TableCell>
                          <TableCell align="right">ROE</TableCell>
                          <TableCell align="right">Net Margin</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {peerComparison.map((peer) => (
                          <TableRow key={peer.symbol} 
                            sx={{ 
                              bgcolor: peer.symbol === selectedStock ? 'rgba(0,212,255,0.1)' : 'inherit',
                            }}
                          >
                            <TableCell>
                              <Typography fontWeight={peer.symbol === selectedStock ? 'bold' : 'normal'}>
                                {peer.symbol}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">{peer.pe.toFixed(1)}</TableCell>
                            <TableCell align="right">{peer.pb.toFixed(1)}</TableCell>
                            <TableCell align="right">{peer.ps.toFixed(1)}</TableCell>
                            <TableCell align="right">{peer.roe.toFixed(1)}%</TableCell>
                            <TableCell align="right">{peer.margin.toFixed(1)}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Footer */}
      <Paper sx={{ mt: 3, p: 2, bgcolor: 'background.default' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Data for {selectedStock} • Fiscal Year {fiscalYear === 'all' ? 'All Years' : fiscalYear} • Updated {format(new Date(), 'MMM dd, yyyy HH:mm')}
          </Typography>
          <Chip 
            icon={<Info />} 
            label="All data for informational purposes only" 
            size="small" 
            variant="outlined" 
          />
        </Box>
      </Paper>
    </motion.div>
  );
};

export default FinancialStatements;