// src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Avatar,
  IconButton,
  Slider,
  Chip,
  Stack,
  Tooltip,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  RadioGroup,
  Radio,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Save as SaveIcon,
  Restore as RestoreIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon,
  TrendingUp as TrendingUpIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  ShowChart as ChartIcon,
  TableChart as TableIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  DeleteSweep as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Speed as SpeedIcon,
  AccountCircle as AccountIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  NotificationsOff as NotificationsOffIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import { useStock } from '../context/StockContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const { darkMode, toggleTheme } = useTheme();
  const { fetchStockData, setTimeframe } = useStock();
  const { user, updateSettings, signOut, deleteAccount } = useAuth();
  const { clearAllNotifications } = useNotifications();
  const navigate = useNavigate();
  
  // Settings state
  const [settings, setSettings] = useState({
    // Display Settings
    theme: darkMode ? 'dark' : 'light',
    notifications: true,
    autoRefresh: true,
    refreshInterval: 30,
    chartType: 'candle',
    chartColors: 'professional',
    
    // Data Settings
    defaultSymbols: ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN'],
    defaultTimeframe: '1mo',
    showVolume: true,
    showIndicators: true,
    
    // Portfolio Settings
    portfolioView: 'grid',
    showPerformance: true,
    showSectors: true,
    
    // Notification Settings
    priceAlerts: true,
    newsAlerts: true,
    earningsAlerts: true,
    emailNotifications: false,
    
    // Advanced Settings
    cacheData: true,
    cacheDuration: 5,
    reduceAnimations: false,
    debugMode: false,
  });

  const [activeTab, setActiveTab] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddSymbolDialog, setShowAddSymbolDialog] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [editSymbolIndex, setEditSymbolIndex] = useState(-1);
  const [tempSymbols, setTempSymbols] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);

  // Load settings from localStorage and user preferences on mount
  useEffect(() => {
    // Load from user settings first (if logged in)
    if (user?.settings) {
      setSettings(prev => ({ ...prev, ...user.settings }));
    }
    
    // Then load from localStorage (overrides user settings)
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Error loading settings');
      }
    }
    
    setTempSymbols(settings.defaultSymbols);
  }, [user]);

  // Save settings to localStorage and user profile
  const saveSettings = async () => {
    // Save to localStorage
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    // Save to user profile if logged in
    if (user) {
      await updateSettings(settings);
    }
    
    // Apply settings immediately
    applySettings();
    
    toast.success('✅ Settings saved successfully!', {
      icon: '⚙️',
      duration: 3000,
    });
  };

  // Apply settings to the app
  const applySettings = () => {
    // Apply theme
    if (settings.theme === 'light' && darkMode) {
      toggleTheme();
    } else if (settings.theme === 'dark' && !darkMode) {
      toggleTheme();
    }
    
    // Apply default timeframe
    setTimeframe(settings.defaultTimeframe);
    
    // Apply chart settings will be handled by individual components
    
    toast.success('Settings applied', { icon: '✅' });
  };

  // Reset to defaults
  const resetToDefaults = () => {
    const defaultSettings = {
      theme: darkMode ? 'dark' : 'light',
      notifications: true,
      autoRefresh: true,
      refreshInterval: 30,
      chartType: 'candle',
      chartColors: 'professional',
      defaultSymbols: ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN'],
      defaultTimeframe: '1mo',
      showVolume: true,
      showIndicators: true,
      portfolioView: 'grid',
      showPerformance: true,
      showSectors: true,
      priceAlerts: true,
      newsAlerts: true,
      earningsAlerts: true,
      emailNotifications: false,
      cacheData: true,
      cacheDuration: 5,
      reduceAnimations: false,
      debugMode: false,
    };
    
    setSettings(defaultSettings);
    setTempSymbols(defaultSettings.defaultSymbols);
    localStorage.setItem('appSettings', JSON.stringify(defaultSettings));
    
    if (user) {
      updateSettings(defaultSettings);
    }
    
    applySettings();
    toast.success('🔄 Settings reset to defaults');
    setShowResetConfirm(false);
  };

  // Export settings
  const exportSettings = () => {
    setExportLoading(true);
    
    setTimeout(() => {
      const exportData = {
        ...settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `stock-analyzer-settings-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setExportLoading(false);
      toast.success('📤 Settings exported successfully');
    }, 500);
  };

  // Import settings
  const importSettings = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setImportLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        
        // Validate imported data
        if (!imported.chartType || !imported.defaultSymbols) {
          throw new Error('Invalid settings file format');
        }
        
        setSettings(prev => ({ ...prev, ...imported }));
        setTempSymbols(imported.defaultSymbols || settings.defaultSymbols);
        localStorage.setItem('appSettings', JSON.stringify(imported));
        
        if (user) {
          updateSettings(imported);
        }
        
        applySettings();
        toast.success('📥 Settings imported successfully');
      } catch (error) {
        toast.error('❌ Invalid settings file');
        console.error('Import error:', error);
      }
      setImportLoading(false);
    };
    
    reader.readAsText(file);
    event.target.value = null; // Reset input
  };

  // Clear all data
  const clearAllData = () => {
    // Clear localStorage
    localStorage.removeItem('portfolio');
    localStorage.removeItem('watchlist');
    localStorage.removeItem('stockAlerts');
    localStorage.removeItem('savedComparisons');
    localStorage.removeItem('appSettings');
    localStorage.removeItem('theme');
    
    // Clear notifications
    clearAllNotifications();
    
    // Reset to defaults
    resetToDefaults();
    
    toast.success('🧹 All data cleared successfully');
    setShowClearDataConfirm(false);
    
    // Reload the page after a delay
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  // Handle input changes
  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  // Handle default symbols
  const handleSymbolsChange = (e) => {
    const symbols = e.target.value.split(',').map(s => s.trim().toUpperCase()).filter(s => s);
    handleChange('defaultSymbols', symbols);
    setTempSymbols(symbols);
  };

  // Add symbol to list
  const handleAddSymbol = () => {
    if (!newSymbol.trim()) {
      toast.error('Please enter a symbol');
      return;
    }
    
    const symbol = newSymbol.toUpperCase().trim();
    if (settings.defaultSymbols.includes(symbol)) {
      toast.error('Symbol already exists');
      return;
    }
    
    const updatedSymbols = [...settings.defaultSymbols, symbol];
    handleChange('defaultSymbols', updatedSymbols);
    setTempSymbols(updatedSymbols);
    setNewSymbol('');
    setShowAddSymbolDialog(false);
    toast.success(`Added ${symbol} to default symbols`);
  };

  // Remove symbol from list
  const handleRemoveSymbol = (symbol) => {
    const updatedSymbols = settings.defaultSymbols.filter(s => s !== symbol);
    handleChange('defaultSymbols', updatedSymbols);
    setTempSymbols(updatedSymbols);
    toast.success(`Removed ${symbol} from default symbols`);
  };

  // Edit symbol
  const handleEditSymbol = (index) => {
    setEditSymbolIndex(index);
    setNewSymbol(settings.defaultSymbols[index]);
    setShowAddSymbolDialog(true);
  };

  // Update edited symbol
  const handleUpdateSymbol = () => {
    if (!newSymbol.trim() || editSymbolIndex === -1) return;
    
    const symbol = newSymbol.toUpperCase().trim();
    const updatedSymbols = [...settings.defaultSymbols];
    updatedSymbols[editSymbolIndex] = symbol;
    
    handleChange('defaultSymbols', updatedSymbols);
    setTempSymbols(updatedSymbols);
    setNewSymbol('');
    setEditSymbolIndex(-1);
    setShowAddSymbolDialog(false);
    toast.success(`Updated symbol to ${symbol}`);
  };

  // Theme toggle
  const handleThemeToggle = () => {
    toggleTheme();
    handleChange('theme', !darkMode ? 'dark' : 'light');
    toast.success(darkMode ? '☀️ Light mode activated' : '🌙 Dark mode activated');
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (passwordConfirm !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    
    const success = await deleteAccount();
    if (success) {
      toast.success('Account deleted successfully');
      navigate('/login');
    } else {
      toast.error('Failed to delete account');
    }
    setShowDeleteConfirm(false);
    setPasswordConfirm('');
  };

  // Settings cards data
  const settingCategories = [
    {
      id: 0,
      title: 'Appearance',
      icon: <PaletteIcon />,
      color: '#00d4ff',
      description: 'Customize how the app looks',
      settings: [
        {
          type: 'custom',
          render: () => (
            <Card sx={{ mb: 3, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: darkMode ? '#ff9800' : '#2196f3' }}>
                      {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">Theme Mode</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {darkMode ? 'Dark mode is active' : 'Light mode is active'}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={handleThemeToggle}
                    startIcon={darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                    sx={{ borderRadius: 3 }}
                  >
                    Switch to {darkMode ? 'Light' : 'Dark'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ),
        },
        {
          type: 'radio',
          label: 'Chart Type',
          field: 'chartType',
          icon: <ChartIcon />,
          options: [
            { value: 'line', label: 'Line Chart' },
            { value: 'candle', label: 'Candlestick' },
            { value: 'area', label: 'Area Chart' },
          ],
        },
        {
          type: 'radio',
          label: 'Chart Colors',
          field: 'chartColors',
          icon: <PaletteIcon />,
          options: [
            { value: 'professional', label: 'Professional' },
            { value: 'vibrant', label: 'Vibrant' },
            { value: 'minimal', label: 'Minimal' },
          ],
        },
        {
          type: 'switch',
          label: 'Show Volume',
          field: 'showVolume',
          icon: <BarChartIcon />,
          description: 'Display volume bars below charts',
        },
        {
          type: 'switch',
          label: 'Show Technical Indicators',
          field: 'showIndicators',
          icon: <TrendingUpIcon />,
          description: 'Display SMA, EMA, RSI on charts',
        },
      ],
    },
    {
      id: 1,
      title: 'Data & Updates',
      icon: <RefreshIcon />,
      color: '#4caf50',
      description: 'Configure how data is loaded and refreshed',
      settings: [
        {
          type: 'switch',
          label: 'Auto Refresh Data',
          field: 'autoRefresh',
          icon: <RefreshIcon />,
          description: 'Automatically fetch latest stock prices',
        },
        {
          type: 'slider',
          label: 'Refresh Interval',
          field: 'refreshInterval',
          icon: <SpeedIcon />,
          min: 10,
          max: 120,
          step: 10,
          unit: 'seconds',
          condition: settings.autoRefresh,
        },
        {
          type: 'custom',
          label: 'Default Stocks',
          field: 'defaultSymbols',
          icon: <StorageIcon />,
          render: () => (
            <Box sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                  <StorageIcon />
                </Avatar>
                <Typography variant="body1">Default Stocks</Typography>
              </Box>
              <Box sx={{ ml: 6 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {settings.defaultSymbols.map((symbol, index) => (
                    <Chip
                      key={symbol}
                      label={symbol}
                      onDelete={() => handleRemoveSymbol(symbol)}
                      deleteIcon={<CloseIcon />}
                      color="primary"
                      variant="outlined"
                      onClick={() => handleEditSymbol(index)}
                    />
                  ))}
                  <Chip
                    icon={<AddIcon />}
                    label="Add Symbol"
                    onClick={() => {
                      setEditSymbolIndex(-1);
                      setNewSymbol('');
                      setShowAddSymbolDialog(true);
                    }}
                    variant="outlined"
                    sx={{ borderStyle: 'dashed' }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Click on chips to edit, or use the add button to include more symbols
                </Typography>
              </Box>
            </Box>
          ),
        },
        {
          type: 'select',
          label: 'Default Timeframe',
          field: 'defaultTimeframe',
          icon: <TimelineIcon />,
          options: [
            { value: '1d', label: '1 Day' },
            { value: '5d', label: '5 Days' },
            { value: '1mo', label: '1 Month' },
            { value: '3mo', label: '3 Months' },
            { value: '6mo', label: '6 Months' },
            { value: '1y', label: '1 Year' },
          ],
        },
        {
          type: 'switch',
          label: 'Cache Data',
          field: 'cacheData',
          icon: <StorageIcon />,
          description: 'Store data locally for faster loading',
        },
        {
          type: 'slider',
          label: 'Cache Duration',
          field: 'cacheDuration',
          icon: <StorageIcon />,
          min: 1,
          max: 30,
          step: 1,
          unit: 'minutes',
          condition: settings.cacheData,
        },
      ],
    },
    {
      id: 2,
      title: 'Notifications',
      icon: <NotificationsIcon />,
      color: '#ff9800',
      description: 'Manage your alert preferences',
      settings: [
        {
          type: 'switch',
          label: 'Enable Notifications',
          field: 'notifications',
          icon: <NotificationsIcon />,
          description: 'Show notification toasts',
        },
        {
          type: 'switch',
          label: 'Price Alerts',
          field: 'priceAlerts',
          icon: <TrendingUpIcon />,
          description: 'Get notified when stocks reach target prices',
          condition: settings.notifications,
        },
        {
          type: 'switch',
          label: 'News Alerts',
          field: 'newsAlerts',
          icon: <LanguageIcon />,
          description: 'Get notified about important company news',
          condition: settings.notifications,
        },
        {
          type: 'switch',
          label: 'Earnings Alerts',
          field: 'earningsAlerts',
          icon: <InfoIcon />,
          description: 'Get notified before earnings releases',
          condition: settings.notifications,
        },
        {
          type: 'switch',
          label: 'Email Notifications',
          field: 'emailNotifications',
          icon: <EmailIcon />,
          description: 'Receive alerts via email',
          condition: settings.notifications,
        },
      ],
    },
    {
      id: 3,
      title: 'Portfolio',
      icon: <AccountIcon />,
      color: '#9c27b0',
      description: 'Customize your portfolio view',
      settings: [
        {
          type: 'radio',
          label: 'Portfolio View',
          field: 'portfolioView',
          icon: <TableIcon />,
          options: [
            { value: 'grid', label: 'Grid View' },
            { value: 'table', label: 'Table View' },
            { value: 'cards', label: 'Card View' },
          ],
        },
        {
          type: 'switch',
          label: 'Show Performance',
          field: 'showPerformance',
          icon: <TrendingUpIcon />,
          description: 'Display portfolio performance metrics',
        },
        {
          type: 'switch',
          label: 'Show Sector Allocation',
          field: 'showSectors',
          icon: <PieChartIcon />,
          description: 'Display sector distribution chart',
        },
      ],
    },
    {
      id: 4,
      title: 'Advanced',
      icon: <SecurityIcon />,
      color: '#f44336',
      description: 'Advanced settings and data management',
      settings: [
        {
          type: 'switch',
          label: 'Reduce Animations',
          field: 'reduceAnimations',
          icon: <SpeedIcon />,
          description: 'Disable animations for better performance',
        },
        {
          type: 'switch',
          label: 'Debug Mode',
          field: 'debugMode',
          icon: <InfoIcon />,
          description: 'Show console logs and debug information',
        },
        {
          type: 'custom',
          render: () => (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Data Management
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 1, mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={exportLoading ? <CircularProgress size={20} /> : <DownloadIcon />}
                  onClick={exportSettings}
                  disabled={exportLoading}
                  sx={{ flex: 1 }}
                >
                  Export
                </Button>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={importLoading ? <CircularProgress size={20} /> : <UploadIcon />}
                  disabled={importLoading}
                  sx={{ flex: 1 }}
                >
                  Import
                  <input type="file" hidden accept=".json" onChange={importSettings} />
                </Button>
              </Stack>
              
              <Button
                variant="outlined"
                color="warning"
                startIcon={<DeleteIcon />}
                onClick={() => setShowClearDataConfirm(true)}
                sx={{ mb: 2, width: '100%' }}
              >
                Clear All Data
              </Button>
              
              {user && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setShowDeleteConfirm(true)}
                  sx={{ width: '100%' }}
                >
                  Delete Account
                </Button>
              )}
            </Box>
          ),
        },
      ],
    },
  ];

  // Render setting based on type
  const renderSetting = (setting) => {
    if (setting.type === 'custom') {
      return setting.render();
    }

    if (setting.condition === false) return null;

    switch (setting.type) {
      case 'switch':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: `${setting.color || 'primary'}.main`, width: 32, height: 32 }}>
                {setting.icon}
              </Avatar>
              <Box>
                <Typography variant="body1">{setting.label}</Typography>
                {setting.description && (
                  <Typography variant="caption" color="text.secondary">
                    {setting.description}
                  </Typography>
                )}
              </Box>
            </Box>
            <Switch
              checked={settings[setting.field]}
              onChange={(e) => handleChange(setting.field, e.target.checked)}
              color="primary"
            />
          </Box>
        );

      case 'slider':
        return (
          <Box sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                {setting.icon}
              </Avatar>
              <Box>
                <Typography variant="body1">{setting.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {settings[setting.field]} {setting.unit}
                </Typography>
              </Box>
            </Box>
            <Slider
              value={settings[setting.field]}
              onChange={(e, val) => handleChange(setting.field, val)}
              min={setting.min}
              max={setting.max}
              step={setting.step}
              valueLabelDisplay="auto"
              disabled={!settings.autoRefresh && setting.field === 'refreshInterval'}
              sx={{ ml: 6, width: '90%' }}
            />
          </Box>
        );

      case 'radio':
        return (
          <Box sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                {setting.icon}
              </Avatar>
              <Typography variant="body1">{setting.label}</Typography>
            </Box>
            <RadioGroup
              value={settings[setting.field]}
              onChange={(e) => handleChange(setting.field, e.target.value)}
              sx={{ ml: 6 }}
            >
              {setting.options.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio size="small" />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
          </Box>
        );

      case 'select':
        return (
          <Box sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                {setting.icon}
              </Avatar>
              <FormControl fullWidth size="small">
                <InputLabel>{setting.label}</InputLabel>
                <Select
                  value={settings[setting.field]}
                  label={setting.label}
                  onChange={(e) => handleChange(setting.field, e.target.value)}
                >
                  {setting.options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Customize your Stock Analyzer experience
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Reset to defaults">
            <Button
              variant="outlined"
              color="warning"
              startIcon={<RestoreIcon />}
              onClick={() => setShowResetConfirm(true)}
            >
              Reset
            </Button>
          </Tooltip>
          <Tooltip title="Save settings">
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={saveSettings}
              sx={{
                bgcolor: '#00d4ff',
                '&:hover': { bgcolor: '#00b4d8' },
              }}
            >
              Save Changes
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Reset Confirmation Dialog */}
      <Collapse in={showResetConfirm}>
        <Alert
          severity="warning"
          action={
            <Box>
              <Button color="inherit" size="small" onClick={resetToDefaults}>
                Confirm
              </Button>
              <Button color="inherit" size="small" onClick={() => setShowResetConfirm(false)}>
                Cancel
              </Button>
            </Box>
          }
          sx={{ mb: 3 }}
        >
          Are you sure you want to reset all settings to defaults?
        </Alert>
      </Collapse>

      {/* Settings Categories */}
      <Grid container spacing={3}>
        {settingCategories.map((category) => (
          <Grid item xs={12} md={6} key={category.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: category.id * 0.1 }}
            >
              <Card sx={{ 
                height: '100%',
                borderTop: `4px solid ${category.color}`,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 30px ${category.color}20`,
                },
              }}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: category.color }}>
                      {category.icon}
                    </Avatar>
                  }
                  title={category.title}
                  subheader={category.description}
                  titleTypographyProps={{ fontWeight: 'bold' }}
                />
                <Divider />
                <CardContent>
                  {category.settings.map((setting, idx) => (
                    <Box key={idx}>
                      {renderSetting(setting)}
                      {idx < category.settings.length - 1 && setting.type !== 'custom' && (
                        <Divider sx={{ my: 1 }} />
                      )}
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Footer */}
      <Paper sx={{ mt: 4, p: 3, bgcolor: 'background.default' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#00d4ff' }}>
                <CheckCircleIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Settings Auto-Save
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your settings are automatically saved to your browser's local storage
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<StorageIcon />}
                label="Local Storage"
                size="small"
                variant="outlined"
              />
              <Chip
                icon={<CheckCircleIcon />}
                label="Auto-Save"
                size="small"
                color="success"
              />
              <Chip
                icon={settings.notifications ? <NotificationsIcon /> : <NotificationsOffIcon />}
                label={settings.notifications ? 'Notifications On' : 'Notifications Off'}
                size="small"
                color={settings.notifications ? 'primary' : 'default'}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Add/Edit Symbol Dialog */}
      <Dialog 
        open={showAddSymbolDialog} 
        onClose={() => {
          setShowAddSymbolDialog(false);
          setNewSymbol('');
          setEditSymbolIndex(-1);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editSymbolIndex >= 0 ? 'Edit Symbol' : 'Add New Symbol'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Stock Symbol"
            fullWidth
            variant="outlined"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., AAPL"
            helperText="Enter a valid stock symbol"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowAddSymbolDialog(false);
            setNewSymbol('');
            setEditSymbolIndex(-1);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={editSymbolIndex >= 0 ? handleUpdateSymbol : handleAddSymbol}
            variant="contained"
            disabled={!newSymbol.trim()}
            sx={{ bgcolor: '#00d4ff' }}
          >
            {editSymbolIndex >= 0 ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear Data Confirmation Dialog */}
      <Dialog open={showClearDataConfirm} onClose={() => setShowClearDataConfirm(false)}>
        <DialogTitle>Clear All Data?</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography>
            This will remove all your:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><DeleteIcon color="error" /></ListItemIcon>
              <ListItemText primary="Portfolio holdings" />
            </ListItem>
            <ListItem>
              <ListItemIcon><DeleteIcon color="error" /></ListItemIcon>
              <ListItemText primary="Watchlist items" />
            </ListItem>
            <ListItem>
              <ListItemIcon><DeleteIcon color="error" /></ListItemIcon>
              <ListItemText primary="Price alerts" />
            </ListItem>
            <ListItem>
              <ListItemIcon><DeleteIcon color="error" /></ListItemIcon>
              <ListItemText primary="Saved comparisons" />
            </ListItem>
            <ListItem>
              <ListItemIcon><DeleteIcon color="error" /></ListItemIcon>
              <ListItemText primary="App settings" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowClearDataConfirm(false)}>Cancel</Button>
          <Button onClick={clearAllData} color="error" variant="contained">
            Clear All Data
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <DialogTitle>Delete Account?</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action is permanent and cannot be undone!
          </Alert>
          <Typography variant="body2" gutterBottom>
            To confirm, type <strong>DELETE</strong> in the box below:
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="DELETE"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowDeleteConfirm(false);
            setPasswordConfirm('');
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccount} 
            color="error" 
            variant="contained"
            disabled={passwordConfirm !== 'DELETE'}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;