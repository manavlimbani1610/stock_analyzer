// src/components/Common/LoadingSkeleton.jsx
import React from 'react';
import { Box, Paper, Skeleton, Grid } from '@mui/material';
import { motion } from 'framer-motion';

const LoadingSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ p: 3 }}>
        {/* Search Bar Skeleton */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={120} height={56} sx={{ borderRadius: 1 }} />
          </Box>
        </Paper>

        {/* Chart Skeleton */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Skeleton variant="text" width={200} height={40} />
              <Skeleton variant="text" width={150} height={30} />
            </Box>
            <Skeleton variant="rectangular" width={200} height={40} sx={{ borderRadius: 1 }} />
          </Box>
          <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={80} sx={{ borderRadius: 1, mt: 2 }} />
        </Paper>

        {/* Quick Actions Skeleton */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Skeleton variant="text" width={200} height={30} sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} variant="circular" width={56} height={56} />
                ))}
              </Box>
              <Skeleton variant="text" width={150} height={25} sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Skeleton variant="rectangular" width={160} height={40} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rectangular" width={160} height={40} sx={{ borderRadius: 2 }} />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Skeleton variant="text" width={150} height={30} sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {[1, 2, 3, 4].map((i) => (
                  <Grid item xs={6} key={i}>
                    <Skeleton variant="text" width={60} height={20} />
                    <Skeleton variant="text" width={80} height={30} />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
};

export default LoadingSkeleton;