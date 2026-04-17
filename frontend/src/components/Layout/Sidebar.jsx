// src/components/Layout/Sidebar.jsx
import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Collapse,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance as PortfolioIcon,
  Analytics as AnalysisIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  CompareArrows as CompareArrowsIcon,
  ShowChart,
  Timeline,
  BarChart,
  TrendingUp as PredictionIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const mainItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Portfolio', icon: <PortfolioIcon />, path: '/portfolio' },
    { text: 'Prediction', icon: <PredictionIcon />, path: '/prediction' },
  ];

  const analysisItems = [
    { text: 'Stock Comparison', icon: <CompareArrowsIcon />, path: '/analysis/comparison' },
    { text: 'Technical Analysis', icon: <ShowChart />, path: '/analysis/technical' },
    { text: 'Financial Statements', icon: <Timeline />, path: '/analysis/financials' },
    { text: 'Market Overview', icon: <BarChart />, path: '/analysis/market' },
  ];

  const bottomItems = [
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const handleAnalysisClick = () => {
    setAnalysisOpen(!analysisOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const drawerContent = (
    <Box sx={{ overflow: 'auto', mt: { xs: 2, md: 8 } }}>
      {/* Logo Section */}
      <Box sx={{ px: 2, py: 1, mb: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-dark))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          StockAnalyzer
        </Typography>
      </Box>

      <List>
        {mainItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                color: 'var(--text-primary)',
                '&.Mui-selected': {
                  backgroundColor: 'var(--sidebar-item-active)',
                  borderRight: '3px solid var(--color-primary)',
                  color: 'var(--color-primary)',
                },
                '&:hover': {
                  backgroundColor: 'var(--sidebar-item-hover)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon sx={{
                color: location.pathname === item.path
                  ? 'var(--color-primary)'
                  : 'var(--text-secondary)'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}

        <ListItem disablePadding>
          <ListItemButton
            onClick={handleAnalysisClick}
            sx={{
              color: 'var(--text-primary)',
              '&:hover': {
                backgroundColor: 'var(--sidebar-item-hover)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'var(--text-secondary)' }}>
              <AnalysisIcon />
            </ListItemIcon>
            <ListItemText primary="Analysis" />
            {analysisOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>

        <Collapse in={analysisOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {analysisItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  sx={{
                    pl: 4,
                    color: 'var(--text-secondary)',
                    '&.Mui-selected': {
                      backgroundColor: 'var(--sidebar-item-active)',
                      color: 'var(--color-primary)',
                    },
                    '&:hover': {
                      backgroundColor: 'var(--sidebar-item-hover)',
                    },
                  }}
                  selected={location.pathname === item.path}
                  onClick={() => handleNavigation(item.path)}
                >
                  <ListItemIcon sx={{
                    minWidth: 36,
                    color: location.pathname === item.path
                      ? 'var(--color-primary)'
                      : 'var(--text-muted)'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>

      <Divider sx={{ my: 2, borderColor: 'var(--divider-color)' }} />

      <List>
        {bottomItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                color: 'var(--text-primary)',
                '&.Mui-selected': {
                  backgroundColor: 'var(--sidebar-item-active)',
                  borderRight: '3px solid var(--color-primary)',
                  color: 'var(--color-primary)',
                },
                '&:hover': {
                  backgroundColor: 'var(--sidebar-item-hover)',
                },
              }}
            >
              <ListItemIcon sx={{
                color: location.pathname === item.path
                  ? 'var(--color-primary)'
                  : 'var(--text-secondary)'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'var(--sidebar-bg)',
            borderRight: '1px solid var(--sidebar-border)',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'var(--sidebar-bg)',
            borderRight: '1px solid var(--sidebar-border)',
            transition: 'background-color 0.3s ease, border-color 0.3s ease',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
