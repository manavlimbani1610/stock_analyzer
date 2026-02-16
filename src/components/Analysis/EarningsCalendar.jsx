// src/components/Analysis/EarningsCalendar.jsx
import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import stockApi from '../../services/stockApi';

const EarningsCalendar = () => {
  const [earnings, setEarnings] = useState([]);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const data = await stockApi.getEarningsCalendar();
        setEarnings(data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching earnings:', error);
      }
    };
    fetchEarnings();
  }, []);

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <EventIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Earnings Calendar</Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Symbol</TableCell>
              <TableCell align="right">Estimate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {earnings.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                <TableCell>{item.symbol}</TableCell>
                <TableCell align="right">${item.estimate?.toFixed(2) || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default EarningsCalendar;