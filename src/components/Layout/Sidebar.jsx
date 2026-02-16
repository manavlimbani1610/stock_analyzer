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
} from '@mui/material';  // ✅ Removed 'Tooltip' from imports
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
} from '@mui/icons-material';  // ✅ Removed 'TrendingUp' from imports
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [analysisOpen, setAnalysisOpen] = useState(false);

  const mainItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Portfolio', icon: <PortfolioIcon />, path: '/portfolio' },
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

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0, 212, 255, 0.1)',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 8 }}>
        <List>
          {mainItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    borderRight: '3px solid #00d4ff',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 212, 255, 0.05)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: location.pathname === item.path ? '#00d4ff' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}

          <ListItem disablePadding>
            <ListItemButton onClick={handleAnalysisClick}>
              <ListItemIcon>
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
                    sx={{ pl: 4 }}
                    selected={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </List>

        <Divider sx={{ my: 2 }} />

        <List>
          {bottomItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;