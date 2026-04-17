// src/components/Analysis/NewsFeed.jsx
import React from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemText, Divider, CircularProgress, Link } from '@mui/material';
import FeedIcon from '@mui/icons-material/Feed';
import { useStock } from '../../context/StockContext';

const NewsFeed = ({ compact = false }) => {
  const { news, loading, selectedStock } = useStock();

  if (loading) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      </Paper>
    );
  }

  const displayNews = news?.slice(0, compact ? 3 : 5) || [];

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FeedIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Latest News - {selectedStock}</Typography>
      </Box>

      {displayNews.length > 0 ? (
        <List>
          {displayNews.map((item, index) => (
            <React.Fragment key={item.id || index}>
              <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemText
                  primary={
                    <Link 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener" 
                      color="inherit" 
                      underline="hover"
                      sx={{ fontWeight: 500 }}
                    >
                      {item.title}
                    </Link>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {item.source} • {new Date(item.publishedAt).toLocaleDateString()}
                    </Typography>
                  }
                />
              </ListItem>
              {index < displayNews.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          No news available for {selectedStock}
        </Typography>
      )}
    </Paper>
  );
};

export default NewsFeed;