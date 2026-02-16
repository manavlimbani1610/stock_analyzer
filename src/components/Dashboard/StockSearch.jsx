// src/components/Dashboard/StockSearch.jsx
import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Box,
  Autocomplete,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useStock } from '../../context/StockContext';
import { stockList } from '../../data/stockList';

const StockSearch = () => {
  const { fetchStockData, selectedStock, quote, loading } = useStock();
  const [inputValue, setInputValue] = useState('');
  const [searchError, setSearchError] = useState('');

  const handleSearch = async (symbol) => {
    if (!symbol) {
      setSearchError('Please enter a stock symbol');
      return;
    }
    
    setSearchError('');
    try {
      await fetchStockData(symbol.toUpperCase(), undefined, false);
      setInputValue('');
    } catch (error) {
      setSearchError('Failed to fetch stock data. Please try again.');
    }
  };

  const formatVolume = (volume) => {
    if (!volume) return '0';
    if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(1)}B`;
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Autocomplete
              freeSolo
              options={stockList}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                return `${option.symbol} - ${option.name}`;
              }}
              sx={{ flexGrow: 1 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Stock Symbol"
                  variant="outlined"
                  error={!!searchError}
                  helperText={searchError}
                  placeholder="e.g., AAPL, MSFT, GOOGL"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading && <CircularProgress color="inherit" size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              value={inputValue}
              onChange={(event, newValue) => {
                if (newValue && typeof newValue === 'object') {
                  setInputValue(newValue.symbol);
                  handleSearch(newValue.symbol);
                } else {
                  setInputValue(newValue || '');
                }
              }}
              onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
              }}
            />
            
            <Button
              variant="contained"
              onClick={() => handleSearch(inputValue)}
              disabled={loading || !inputValue.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              sx={{ height: 56, minWidth: 120 }}
            >
              {loading ? 'Loading...' : 'Analyze'}
            </Button>
          </Box>

          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Popular:
            </Typography>
            {['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'NVDA'].map((symbol) => (
              <Chip
                key={symbol}
                label={symbol}
                onClick={() => handleSearch(symbol)}
                color={selectedStock === symbol ? 'primary' : 'default'}
                variant={selectedStock === symbol ? 'filled' : 'outlined'}
                size="small"
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: selectedStock === symbol ? 'primary.dark' : 'rgba(0, 212, 255, 0.1)',
                  }
                }}
              />
            ))}
          </Box>
        </Grid>

        {quote && (
          <Grid item xs={12} md={5}>
            <Card sx={{ 
              bgcolor: 'background.default', 
              border: '1px solid', 
              borderColor: 'divider',
              background: 'linear-gradient(135deg, rgba(19,47,76,0.8) 0%, rgba(19,47,76,0.4) 100%)',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    {selectedStock} Summary
                  </Typography>
                  <Chip 
                    label={quote.symbol || selectedStock} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 1 }}>
                  <Typography variant="h4" component="span" fontWeight="bold" sx={{ color: quote.change >= 0 ? '#4caf50' : '#f44336' }}>
                    ${quote.price?.toFixed(2) || '0.00'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {quote.change >= 0 ? (
                      <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5 }} />
                    ) : (
                      <TrendingDownIcon sx={{ color: 'error.main', mr: 0.5 }} />
                    )}
                    <Typography 
                      variant="h6" 
                      component="span"
                      color={quote.change >= 0 ? 'success.main' : 'error.main'}
                    >
                      {quote.change >= 0 ? '+' : ''}{quote.change?.toFixed(2)} 
                      ({quote.change >= 0 ? '+' : ''}{quote.changePercent?.toFixed(2)}%)
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Day High
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      ${quote.high?.toFixed(2) || '0.00'}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Day Low
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      ${quote.low?.toFixed(2) || '0.00'}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Volume
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatVolume(quote.volume)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default StockSearch;