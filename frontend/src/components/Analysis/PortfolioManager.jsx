// src/components/Portfolio/PortfolioManager.jsx
import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

const PortfolioManager = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AccountBalanceIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Portfolio Manager</Typography>
      </Box>
      <Typography color="text.secondary">
        Portfolio management feature coming soon...
      </Typography>
    </Paper>
  );
};

export default PortfolioManager;