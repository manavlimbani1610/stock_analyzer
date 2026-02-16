// src/App.js
import React, { Suspense, lazy, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CookiesProvider } from 'react-cookie';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout/Layout';
import LoadingSkeleton from './components/Common/LoadingSkeleton';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { getTheme } from './styles/theme';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { StockProvider } from './context/StockContext';
import { PortfolioProvider } from './context/PortfolioContext';
import { NotificationProvider } from './context/NotificationContext';
import './App.css';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Analysis = lazy(() => import('./pages/Analysis'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));
const TestAPI = lazy(() => import('./TestAPI'));

// Configure React Query client with optimal settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

// Main App Content with dynamic theme
const AppContent = () => {
  const { darkMode } = useTheme();
  const theme = getTheme(darkMode ? 'dark' : 'light');

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <ScrollToTop />
        <AnimatePresence mode="wait">
          <Layout>
            <Suspense fallback={<LoadingSkeleton />}>
              <Routes>
                {/* Public Route */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/portfolio" element={
                  <ProtectedRoute>
                    <Portfolio />
                  </ProtectedRoute>
                } />
                <Route path="/analysis/*" element={
                  <ProtectedRoute>
                    <Analysis />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="/test" element={
                  <ProtectedRoute>
                    <TestAPI />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
        </AnimatePresence>
      </Router>
      
      {/* Professional Toast Notifications - Themed */}
      <Toaster
        position="bottom-center"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          bottom: 40,
          left: 20,
          right: 20,
          zIndex: 9999,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: darkMode ? '#132f4c' : '#ffffff',
            color: darkMode ? '#fff' : '#000',
            border: `1px solid ${darkMode ? '#00d4ff' : '#0099cc'}`,
            borderRadius: '12px',
            padding: '16px 24px',
            boxShadow: darkMode 
              ? '0 8px 32px rgba(0, 212, 255, 0.2)' 
              : '0 8px 32px rgba(0, 153, 204, 0.15)',
            fontSize: '14px',
            fontWeight: 500,
            backdropFilter: 'blur(8px)',
          },
          success: {
            duration: 3000,
            icon: '✅',
            iconTheme: {
              primary: '#4caf50',
              secondary: darkMode ? '#fff' : '#000',
            },
            style: {
              background: darkMode 
                ? 'linear-gradient(135deg, #1b3a4b 0%, #1e4a3b 100%)' 
                : 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
              border: '1px solid #4caf50',
              color: darkMode ? '#fff' : '#1e3a3a',
            },
          },
          error: {
            duration: 4000,
            icon: '❌',
            iconTheme: {
              primary: '#f44336',
              secondary: darkMode ? '#fff' : '#000',
            },
            style: {
              background: darkMode 
                ? 'linear-gradient(135deg, #3b1e1e 0%, #4a1e1e 100%)' 
                : 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
              border: '1px solid #f44336',
              color: darkMode ? '#fff' : '#3e1e1e',
            },
          },
          loading: {
            duration: Infinity,
            icon: '🔄',
            style: {
              background: darkMode 
                ? 'linear-gradient(135deg, #1e3a4a 0%, #1e4a4a 100%)' 
                : 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
              border: '1px solid #ff9800',
              color: darkMode ? '#fff' : '#4a3a1e',
            },
          },
          custom: {
            duration: 3000,
            icon: 'ℹ️',
            style: {
              background: darkMode 
                ? 'linear-gradient(135deg, #1a3a5f 0%, #1a4a6f 100%)' 
                : 'linear-gradient(135deg, #e3f2fd 0%, #bbdef5 100%)',
              border: '1px solid #2196f3',
              color: darkMode ? '#fff' : '#1a3a5f',
            },
          },
        }}
      />
    </MuiThemeProvider>
  );
};

function App() {
  return (
    <CookiesProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <StockProvider>
              <NotificationProvider>
                <PortfolioProvider>
                  <AppContent />
                </PortfolioProvider>
              </NotificationProvider>
            </StockProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </CookiesProvider>
  );
}

export default App;