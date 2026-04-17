// src/context/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to dark
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme !== null) {
      return savedTheme === 'dark';
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Update localStorage and DOM when theme changes
  useEffect(() => {
    const theme = darkMode ? 'dark' : 'light';
    localStorage.setItem('theme', theme);

    // Update data-theme attribute on document root for CSS variables
    document.documentElement.setAttribute('data-theme', theme);

    // Also maintain body classes for backward compatibility
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Initialize theme on mount
  useEffect(() => {
    const theme = darkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.add(darkMode ? 'dark-mode' : 'light-mode');
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  // Set specific theme
  const setTheme = (isDark) => {
    setDarkMode(isDark);
  };

  const value = {
    darkMode,
    toggleTheme,
    setTheme,
    theme: darkMode ? 'dark' : 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};