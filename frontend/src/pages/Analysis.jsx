// src/pages/Analysis.jsx - FIXED VERSION
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Grid } from '@mui/material';
import StockComparison from '../components/Analysis/StockComparison';
import TechnicalAnalysis from '../components/Analysis/TechnicalAnalysis'; // ✅ IMPORTED (KEEP THIS)
import FinancialStatements from '../components/Analysis/FinancialStatements';
import NewsFeed from '../components/Analysis/NewsFeed';
import EarningsCalendar from '../components/Analysis/EarningsCalendar';
import MarketOverview from '../components/Analysis/MarketOverview';

// ❌ DELETE THIS ENTIRE BLOCK - It's duplicate!
/*
const TechnicalAnalysis = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Technical Analysis
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography>Technical analysis features coming soon...</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};
*/

const Analysis = () => {
  return (
    <Box>
      <Routes>
        <Route path="/" element={<Navigate to="/analysis/comparison" replace />} />
        
        <Route path="comparison" element={
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <StockComparison />
              <FinancialStatements />
            </Grid>
            <Grid item xs={12} lg={4}>
              <MarketOverview />
              <EarningsCalendar />
              <NewsFeed />
            </Grid>
          </Grid>
        } />
        
        <Route path="technical" element={
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TechnicalAnalysis /> {/* ✅ Using imported component */}
            </Grid>
            <Grid item xs={12} lg={4}>
              <NewsFeed />
            </Grid>
          </Grid>
        } />
        
        <Route path="financials" element={
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <FinancialStatements />
            </Grid>
            <Grid item xs={12} lg={4}>
              <MarketOverview />
              <NewsFeed />
            </Grid>
          </Grid>
        } />
        
        <Route path="market" element={
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MarketOverview />
            </Grid>
            <Grid item xs={12}>
              <EarningsCalendar />
            </Grid>
            <Grid item xs={12}>
              <NewsFeed />
            </Grid>
          </Grid>
        } />
        
        <Route path="*" element={<Navigate to="/analysis/comparison" replace />} />
      </Routes>
    </Box>
  );
};

export default Analysis;