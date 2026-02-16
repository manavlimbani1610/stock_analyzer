// src/components/Layout/Header.jsx
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  InputBase,
  alpha,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Brightness4,
  Brightness7,
  AccountBalanceWallet as PortfolioIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  TrendingUp,
  TrendingDown,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import { useStock } from '../../context/StockContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const Header = () => {
  const { darkMode, toggleTheme } = useTheme();
  const { selectedStock, fetchStockData, loading } = useStock();
  const { user, signOut } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // 🔍 SEARCH FUNCTION
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      try {
        await fetchStockData(searchTerm.toUpperCase());
        toast.success(`✅ Loaded ${searchTerm.toUpperCase()}`);
        setSearchTerm('');
      } catch (error) {
        toast.error(`❌ Error loading ${searchTerm.toUpperCase()}`);
      }
    }
  };

  // 👤 PROFILE MENU
  const handleProfileMenuOpen = (event) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchor(null);
  };

  const handleNavigate = (path) => {
    handleProfileMenuClose();
    navigate(path);
  };

  // 🔔 NOTIFICATIONS
  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleNotificationClick_ = (notification) => {
    // Mark as read
    markAsRead(notification.id);
    
    // Navigate based on notification action
    if (notification.symbol) {
      fetchStockData(notification.symbol);
      navigate('/');
    } else if (notification.action === 'portfolio') {
      navigate('/portfolio');
    } else if (notification.action === 'earnings') {
      navigate('/analysis');
    }
    
    handleNotificationClose();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast.success('All notifications marked as read');
  };

  const handleDeleteNotification = (e, notificationId) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  // 🚪 LOGOUT
  const handleLogout = () => {
    handleProfileMenuClose();
    signOut();
    toast.success('👋 Logged out successfully');
    navigate('/login');
  };

  // 🌙 DARK MODE
  const handleThemeToggle = () => {
    toggleTheme();
    toast.success(darkMode ? '☀️ Light mode activated' : '🌙 Dark mode activated');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const popularStocks = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN'];

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'success':
        return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      case 'warning':
        return <WarningIcon sx={{ color: '#ff9800' }} />;
      case 'error':
        return <WarningIcon sx={{ color: '#f44336' }} />;
      case 'price_alert':
        return <TrendingUp sx={{ color: '#00d4ff' }} />;
      default:
        return <InfoIcon sx={{ color: '#2196f3' }} />;
    }
  };

  return (
    <>
      <AppBar position="static" sx={{ zIndex: 1201 }}>
        <Toolbar>
          {/* Mobile Menu Icon */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo - Click to go home */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            onClick={() => navigate('/')}
            sx={{ 
              flexGrow: 1, 
              display: { xs: 'none', sm: 'block' },
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            <Box component="span" sx={{ color: '#00d4ff' }}>
              Stock
            </Box>
            Analyzer
          </Typography>

          {/* 🔍 SEARCH BAR */}
          <Box
            sx={{
              position: 'relative',
              borderRadius: 2,
              backgroundColor: alpha('#fff', 0.15),
              '&:hover': { backgroundColor: alpha('#fff', 0.25) },
              mr: 2,
              ml: { sm: 3 },
              width: { xs: '100%', sm: 300 },
            }}
          >
            <Box sx={{ px: 2, py: 0.5, display: 'flex', alignItems: 'center' }}>
              <SearchIcon />
              <form onSubmit={handleSearch} style={{ width: '100%' }}>
                <InputBase
                  placeholder="Search stocks... (e.g., AAPL)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                  sx={{
                    color: 'inherit',
                    ml: 1,
                    flex: 1,
                    '& .MuiInputBase-input': { width: '100%' },
                  }}
                />
              </form>
              {loading && <CircularProgress size={20} sx={{ ml: 1, color: '#00d4ff' }} />}
            </Box>
          </Box>

          {/* Popular Stocks Quick Access */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {popularStocks.map((symbol) => (
              <Tooltip title={`View ${symbol}`} key={symbol}>
                <IconButton
                  size="small"
                  onClick={() => fetchStockData(symbol)}
                  sx={{
                    color: selectedStock === symbol ? '#00d4ff' : 'inherit',
                    border: selectedStock === symbol ? '1px solid #00d4ff' : 'none',
                    bgcolor: selectedStock === symbol ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(0, 212, 255, 0.2)',
                    },
                  }}
                >
                  {symbol}
                </IconButton>
              </Tooltip>
            ))}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* 🌙 DARK MODE TOGGLE - FIXED */}
          <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton 
              color="inherit" 
              onClick={handleThemeToggle}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'rotate(180deg)',
                }
              }}
            >
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>

          {/* 🔔 NOTIFICATIONS - REAL-TIME */}
          <Tooltip title="Notifications">
            <IconButton 
              color="inherit" 
              onClick={handleNotificationClick}
              sx={{
                animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.1)' },
                  '100%': { transform: 'scale(1)' },
                }
              }}
            >
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* 👤 PROFILE with User Info */}
          <Tooltip title={user?.name || 'Account'}>
            <IconButton onClick={handleProfileMenuOpen} color="inherit">
              <Avatar 
                sx={{ 
                  width: 35, 
                  height: 35, 
                  bgcolor: '#00d4ff',
                  border: '2px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  }
                }}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  getUserInitials()
                )}
              </Avatar>
            </IconButton>
          </Tooltip>

          {/* Profile Menu */}
          <Menu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 240,
                background: darkMode ? 'rgba(19, 47, 76, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${darkMode ? 'rgba(0, 212, 255, 0.3)' : 'rgba(0, 212, 255, 0.5)'}`,
                borderRadius: 2,
              }
            }}
          >
            {/* User Info Header */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    bgcolor: '#00d4ff',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                  }}
                >
                  {getUserInitials()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: darkMode ? '#fff' : '#000' }}>
                    {user?.name || 'User'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                    {user?.email || 'user@example.com'}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Divider sx={{ borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
            
            {/* Menu Items */}
            <MenuItem onClick={() => handleNavigate('/')} sx={{ py: 1 }}>
              <DashboardIcon sx={{ mr: 2, fontSize: 20, color: '#00d4ff' }} />
              <Typography variant="body2">Dashboard</Typography>
            </MenuItem>
            
            <MenuItem onClick={() => handleNavigate('/portfolio')} sx={{ py: 1 }}>
              <PortfolioIcon sx={{ mr: 2, fontSize: 20, color: '#4caf50' }} />
              <Typography variant="body2">My Portfolio</Typography>
            </MenuItem>
            
            <MenuItem onClick={() => handleNavigate('/settings')} sx={{ py: 1 }}>
              <SettingsIcon sx={{ mr: 2, fontSize: 20, color: '#ff9800' }} />
              <Typography variant="body2">Settings</Typography>
            </MenuItem>
            
            <Divider sx={{ borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
            
            <MenuItem onClick={handleLogout} sx={{ py: 1 }}>
              <LogoutIcon sx={{ mr: 2, fontSize: 20, color: '#f44336' }} />
              <Typography variant="body2" color="#f44336">Logout</Typography>
            </MenuItem>
          </Menu>

          {/* Notifications Menu - REAL-TIME */}
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleNotificationClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                width: 380,
                maxHeight: 480,
                background: darkMode ? 'rgba(19, 47, 76, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${darkMode ? 'rgba(0, 212, 255, 0.3)' : 'rgba(0, 212, 255, 0.5)'}`,
                borderRadius: 2,
              }
            }}
          >
            {/* Header */}
            <Box sx={{ 
              px: 2, 
              py: 1.5, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
            }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Notifications
                {unreadCount > 0 && (
                  <Chip 
                    label={`${unreadCount} new`} 
                    size="small" 
                    color="primary" 
                    sx={{ ml: 1, bgcolor: '#00d4ff', color: '#000' }}
                  />
                )}
              </Typography>
              {notifications.length > 0 && (
                <Button 
                  size="small" 
                  onClick={handleMarkAllAsRead}
                  startIcon={<DoneAllIcon />}
                  sx={{ color: '#00d4ff' }}
                >
                  Mark all read
                </Button>
              )}
            </Box>

            {/* Notifications List */}
            {notifications.length > 0 ? (
              <List sx={{ p: 0 }}>
                {notifications.slice(0, 10).map((notification) => (
                  <ListItem
                    key={notification.id}
                    onClick={() => handleNotificationClick_(notification)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      cursor: 'pointer',
                      bgcolor: !notification.read 
                        ? darkMode 
                          ? 'rgba(0, 212, 255, 0.1)' 
                          : 'rgba(0, 212, 255, 0.05)'
                        : 'transparent',
                      '&:hover': {
                        bgcolor: darkMode 
                          ? 'rgba(255,255,255,0.05)' 
                          : 'rgba(0,0,0,0.02)',
                      },
                      borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: !notification.read ? '#00d4ff' : 'transparent',
                        color: !notification.read ? '#000' : 'inherit',
                      }}>
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={!notification.read ? 'bold' : 'normal'}>
                          {notification.title || notification.message}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {notification.message !== notification.title && notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                          </Typography>
                        </Box>
                      }
                    />
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleDeleteNotification(e, notification.id)}
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No notifications yet
                </Typography>
              </Box>
            )}

            {/* Footer */}
            {notifications.length > 5 && (
              <Box sx={{ 
                p: 1, 
                borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                textAlign: 'center'
              }}>
                <Button 
                  size="small" 
                  sx={{ color: '#00d4ff' }}
                  onClick={() => {
                    handleNotificationClose();
                    // Navigate to full notifications page
                  }}
                >
                  View all notifications
                </Button>
              </Box>
            )}
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Snackbar for feedback */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Header;