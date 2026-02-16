// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import bcrypt from 'bcryptjs';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [cookies, setCookie, removeCookie] = useCookies(['auth_token']);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize empty users array - NO DEMO USER AUTO-CREATED
  useEffect(() => {
    const initializeUsers = async () => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.length === 0) {
        // Just initialize empty array, no demo user
        localStorage.setItem('users', JSON.stringify([]));
      }
    };
    initializeUsers();
  }, []);

  // Load user from cookie on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (cookies.auth_token) {
          const decoded = jwtDecode(cookies.auth_token);
          
          // Check if token is expired
          if (decoded.exp && decoded.exp < Date.now()) {
            removeCookie('auth_token', { path: '/' });
            setLoading(false);
            return;
          }

          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const foundUser = users.find(u => u.id === decoded.id);
          
          if (foundUser) {
            setUser({
              id: foundUser.id,
              name: foundUser.name,
              email: foundUser.email,
              avatar: foundUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(foundUser.name)}&background=00d4ff&color=fff`,
              portfolio: foundUser.portfolio || [],
              watchlist: foundUser.watchlist || ['AAPL', 'MSFT', 'GOOGL'],
              settings: foundUser.settings || {
                theme: 'dark',
                notifications: true,
                autoRefresh: true,
                refreshInterval: 30
              }
            });
          } else {
            // User not found in localStorage, clear cookie
            removeCookie('auth_token', { path: '/' });
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        removeCookie('auth_token', { path: '/' });
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [cookies, removeCookie]);

  // Sign Up
  const signUp = async (name, email, password) => {
    setError(null);
    try {
      // Validate inputs
      if (!name || !email || !password) {
        throw new Error('All fields are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (!email.includes('@') || !email.includes('.')) {
        throw new Error('Please enter a valid email address');
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if user already exists
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=00d4ff&color=fff`,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        portfolio: [],
        watchlist: ['AAPL', 'MSFT', 'GOOGL'],
        settings: {
          theme: 'dark',
          notifications: true,
          autoRefresh: true,
          refreshInterval: 30,
          chartType: 'candle',
          showVolume: true
        }
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // Create token
      const token = btoa(JSON.stringify({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
      }));

      // Set cookie
      setCookie('auth_token', token, {
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });

      // Set user state
      setUser({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        portfolio: newUser.portfolio,
        watchlist: newUser.watchlist,
        settings: newUser.settings
      });

      return { success: true, user: newUser };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Sign In
  const signIn = async (email, password) => {
    setError(null);
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Find user
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      user.lastLogin = new Date().toISOString();
      const userIndex = users.findIndex(u => u.id === user.id);
      users[userIndex] = user;
      localStorage.setItem('users', JSON.stringify(users));

      // Create token
      const token = btoa(JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
      }));

      // Set cookie
      setCookie('auth_token', token, {
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });

      // Set user state
      setUser({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        portfolio: user.portfolio || [],
        watchlist: user.watchlist || ['AAPL', 'MSFT', 'GOOGL'],
        settings: user.settings || {
          theme: 'dark',
          notifications: true,
          autoRefresh: true,
          refreshInterval: 30,
          chartType: 'candle',
          showVolume: true
        }
      });

      return { success: true, user };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Sign Out
  const signOut = () => {
    removeCookie('auth_token', { path: '/' });
    setUser(null);
    setError(null);
  };

  // Update User Portfolio
  const updatePortfolio = async (portfolio) => {
    if (!user) return false;
    
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex !== -1) {
        users[userIndex].portfolio = portfolio;
        localStorage.setItem('users', JSON.stringify(users));
        
        setUser(prev => ({
          ...prev,
          portfolio
        }));
        
        return true;
      }
    } catch (error) {
      console.error('Error updating portfolio:', error);
    }
    return false;
  };

  // Update User Watchlist
  const updateWatchlist = async (watchlist) => {
    if (!user) return false;
    
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex !== -1) {
        users[userIndex].watchlist = watchlist;
        localStorage.setItem('users', JSON.stringify(users));
        
        setUser(prev => ({
          ...prev,
          watchlist
        }));
        
        return true;
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
    return false;
  };

  // Update User Settings
  const updateSettings = async (settings) => {
    if (!user) return false;
    
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex !== -1) {
        users[userIndex].settings = { ...users[userIndex].settings, ...settings };
        localStorage.setItem('users', JSON.stringify(users));
        
        setUser(prev => ({
          ...prev,
          settings: { ...prev.settings, ...settings }
        }));
        
        return true;
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
    return false;
  };

  // Delete User Account
  const deleteAccount = async () => {
    if (!user) return false;
    
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.filter(u => u.id !== user.id);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Clear cookies and state
      removeCookie('auth_token', { path: '/' });
      setUser(null);
      
      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      return false;
    }
  };

  // Get all users (for admin purposes - can be removed if not needed)
  const getUsers = () => {
    return JSON.parse(localStorage.getItem('users') || '[]');
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updatePortfolio,
    updateWatchlist,
    updateSettings,
    deleteAccount,
    getUsers
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};