// src/styles/theme.js
import { createTheme } from '@mui/material/styles';

// Professional Trading App Light Theme Palette
const lightPalette = {
  mode: 'light',
  primary: {
    main: '#0099cc',
    light: '#00bfff',
    dark: '#007399',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#ff6b6b',
    light: '#ff9e9e',
    dark: '#cc5252',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f0f4f8',
    paper: '#ffffff',
  },
  text: {
    primary: '#1a2634',
    secondary: '#5f6b7a',
  },
  success: {
    main: '#00c853',
    light: '#69f0ae',
    dark: '#00a344',
  },
  error: {
    main: '#ff1744',
    light: '#ff616f',
    dark: '#c4001d',
  },
  warning: {
    main: '#ff9100',
    light: '#ffc246',
    dark: '#c56200',
  },
  info: {
    main: '#2979ff',
    light: '#75a7ff',
    dark: '#004ecb',
  },
  divider: 'rgba(0, 0, 0, 0.08)',
};

// Professional Trading App Dark Theme Palette (Bloomberg/TradingView inspired)
const darkPalette = {
  mode: 'dark',
  primary: {
    main: '#00d4ff',
    light: '#66e3ff',
    dark: '#0099cc',
    contrastText: '#000000',
  },
  secondary: {
    main: '#ff6b6b',
    light: '#ff9e9e',
    dark: '#cc5252',
    contrastText: '#ffffff',
  },
  background: {
    default: '#0a1929',
    paper: '#0d2137',
  },
  text: {
    primary: '#ffffff',
    secondary: '#b0bec5',
  },
  success: {
    main: '#00e676',
    light: '#66ffa6',
    dark: '#00b248',
  },
  error: {
    main: '#ff5252',
    light: '#ff8a80',
    dark: '#c50e29',
  },
  warning: {
    main: '#ffab40',
    light: '#ffd180',
    dark: '#c77800',
  },
  info: {
    main: '#40c4ff',
    light: '#8bf6ff',
    dark: '#0094cc',
  },
  divider: 'rgba(255, 255, 255, 0.08)',
};

// Common typography settings
const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 700,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
  },
  body1: {
    fontSize: '0.875rem',
  },
  body2: {
    fontSize: '0.75rem',
  },
};

// Common shape settings
const shape = {
  borderRadius: 12,
};

// Common component overrides
const getComponents = (mode) => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarColor: mode === 'dark' ? '#00d4ff #1e1e1e' : '#00d4ff #e0e0e0',
        '&::-webkit-scrollbar-track': {
          backgroundColor: mode === 'dark' ? '#1e1e1e' : '#e0e0e0',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#00d4ff',
          borderRadius: '5px',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        boxShadow: mode === 'dark' 
          ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
          : '0 4px 20px rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: mode === 'dark'
            ? '0 8px 30px rgba(0, 212, 255, 0.2)'
            : '0 8px 30px rgba(0, 153, 204, 0.15)',
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 600,
        padding: '8px 16px',
      },
      contained: {
        boxShadow: mode === 'dark'
          ? '0 2px 10px rgba(0, 212, 255, 0.3)'
          : '0 2px 10px rgba(0, 153, 204, 0.2)',
        '&:hover': {
          boxShadow: mode === 'dark'
            ? '0 4px 20px rgba(0, 212, 255, 0.4)'
            : '0 4px 20px rgba(0, 153, 204, 0.3)',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: mode === 'dark'
          ? '1px solid rgba(255, 255, 255, 0.08)'
          : '1px solid rgba(0, 0, 0, 0.08)',
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: mode === 'dark'
          ? 'rgba(255, 255, 255, 0.12)'
          : 'rgba(0, 0, 0, 0.12)',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: mode === 'dark' ? '#0d2137' : '#ffffff',
        color: mode === 'dark' ? '#ffffff' : '#1a2634',
        borderBottom: mode === 'dark' ? '1px solid rgba(0, 212, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: mode === 'dark' ? '0 2px 10px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: mode === 'dark' ? '#0d2137' : '#ffffff',
        borderRight: mode === 'dark' ? '1px solid rgba(0, 212, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.08)',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: 500,
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)',
          },
          '&:hover fieldset': {
            borderColor: mode === 'dark' ? 'rgba(0, 212, 255, 0.5)' : 'rgba(0, 153, 204, 0.5)',
          },
        },
      },
    },
  },
});

// Theme generator function
export const getTheme = (mode = 'dark') => {
  const palette = mode === 'dark' ? darkPalette : lightPalette;
  const components = getComponents(mode);
  
  return createTheme({
    palette,
    typography,
    shape,
    components,
  });
};

// Default export for backward compatibility
export const theme = getTheme('dark');