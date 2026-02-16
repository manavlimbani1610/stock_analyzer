import React from 'react';
import {
  Paper,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Link,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Category as CategoryIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingIcon,
  ShowChart as ChartIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useStock } from '../../context/StockContext';

const StockInfo = () => {
  const { selectedStock, stockData } = useStock();

  // Mock company info - in real app, fetch from API
  const companyInfo = {
    name: `${selectedStock} Inc.`,
    sector: 'Technology',
    industry: 'Software',
    marketCap: '2.5T',
    peRatio: '28.5',
    dividendYield: '0.6%',
    beta: '1.2',
    description: 'A leading technology company specializing in innovative software solutions and consumer electronics.',
  };

  const metrics = stockData && stockData.length > 0 ? {
    currentPrice: stockData[stockData.length - 1].close,
    dayHigh: Math.max(...stockData.slice(-1).map(d => d.high)),
    dayLow: Math.min(...stockData.slice(-1).map(d => d.low)),
    volume: stockData.slice(-1)[0].volume,
    avgVolume: stockData.reduce((acc, d) => acc + d.volume, 0) / stockData.length,
    week52High: Math.max(...stockData.map(d => d.high)),
    week52Low: Math.min(...stockData.map(d => d.low)),
  } : null;

  const financials = [
    { label: 'Market Cap', value: `$${companyInfo.marketCap}`, icon: <MoneyIcon /> },
    { label: 'P/E Ratio', value: companyInfo.peRatio, icon: <ChartIcon /> },
    { label: 'Dividend Yield', value: companyInfo.dividendYield, icon: <TrendingIcon /> },
    { label: 'Beta', value: companyInfo.beta, icon: <InfoIcon /> },
    { label: 'Sector', value: companyInfo.sector, icon: <CategoryIcon /> },
    { label: 'Industry', value: companyInfo.industry, icon: <BusinessIcon /> },
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Company Information
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {companyInfo.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {companyInfo.description}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip label={companyInfo.sector} size="small" />
                <Chip label={companyInfo.industry} size="small" variant="outlined" />
                <Chip label="Large Cap" size="small" />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                {financials.map((item, index) => (
                  <Grid item xs={6} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {item.icon}
                      <Typography variant="body2" color="text.secondary">
                        {item.label}
                      </Typography>
                    </Box>
                    <Typography variant="h6">
                      {item.value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key Metrics
              </Typography>
              
              {metrics ? (
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Current Price</TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold">
                            ${metrics.currentPrice.toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Day's Range</TableCell>
                        <TableCell align="right">
                          ${metrics.dayLow.toFixed(2)} - ${metrics.dayHigh.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Volume</TableCell>
                        <TableCell align="right">
                          {(metrics.volume / 1e6).toFixed(2)}M
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Avg Volume</TableCell>
                        <TableCell align="right">
                          {(metrics.avgVolume / 1e6).toFixed(2)}M
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>52 Week Range</TableCell>
                        <TableCell align="right">
                          ${metrics.week52Low.toFixed(2)} - ${metrics.week52High.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">
                  No data available
                </Typography>
              )}

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Useful Links
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Link href="#" underline="hover">Financial Statements</Link>
                  <Link href="#" underline="hover">Earnings Reports</Link>
                  <Link href="#" underline="hover">SEC Filings</Link>
                  <Link href="#" underline="hover">Analyst Coverage</Link>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent News
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Company reports strong Q3 earnings
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • New product launch announced
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Analyst upgrades price target
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default StockInfo;