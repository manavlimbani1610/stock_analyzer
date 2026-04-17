// src/pages/Login.jsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  CircularProgress,
  InputAdornment,
  IconButton,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { signIn, signUp } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!isLogin) {
      // Sign Up validation
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      const result = await signUp(formData.name, formData.email, formData.password);

      if (result.success) {
        toast.success('Account created successfully!');
        navigate('/');
      } else {
        toast.error(result.error);
      }

    } else {
      // Sign In
      const result = await signIn(formData.email, formData.password);

      if (result.success) {
        toast.success('Welcome back!');
        navigate('/');
      } else {
        toast.error(result.error);
      }
    }

    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: darkMode
          ? 'radial-gradient(circle at 50% 50%, #1a3a5f 0%, #0a1929 100%)'
          : 'radial-gradient(circle at 50% 50%, #e3f2fd 0%, #bbdefb 100%)',
        p: 2,
        transition: 'background 0.3s ease',
      }}
    >
      {/* Theme Toggle Button */}
      <IconButton
        onClick={toggleTheme}
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          bgcolor: 'var(--bg-elevated)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          '&:hover': {
            bgcolor: 'var(--bg-hover)',
          },
        }}
      >
        {darkMode ? <LightMode /> : <DarkMode />}
      </IconButton>

      <Zoom in timeout={500}>
        <Paper
          component={motion.div}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          sx={{
            maxWidth: 450,
            width: '100%',
            p: 4,
            borderRadius: 4,
            background: 'var(--bg-modal)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              component={motion.h3}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              StockAnalyzer
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </Typography>
          </Box>

          {/* Form */}
          <form onSubmit={handleSubmit}>

            {!isLogin && (
              <Fade in={!isLogin}>
                <TextField
                  fullWidth
                  name="name"
                  label="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'var(--input-bg)',
                      '& fieldset': {
                        borderColor: 'var(--input-border)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'var(--input-border-hover)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--input-border-focus)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'var(--text-secondary)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'var(--text-primary)',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: 'var(--color-primary)' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Fade>
            )}

            <TextField
              fullWidth
              name="email"
              type="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'var(--input-bg)',
                  '& fieldset': {
                    borderColor: 'var(--input-border)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'var(--input-border-hover)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--input-border-focus)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'var(--text-secondary)',
                },
                '& .MuiInputBase-input': {
                  color: 'var(--text-primary)',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: 'var(--color-primary)' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={formData.password}
              onChange={handleChange}
              required
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'var(--input-bg)',
                  '& fieldset': {
                    borderColor: 'var(--input-border)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'var(--input-border-hover)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--input-border-focus)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'var(--text-secondary)',
                },
                '& .MuiInputBase-input': {
                  color: 'var(--text-primary)',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'var(--color-primary)' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: 'var(--text-secondary)' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {!isLogin && (
              <Fade in={!isLogin}>
                <TextField
                  fullWidth
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'var(--input-bg)',
                      '& fieldset': {
                        borderColor: 'var(--input-border)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'var(--input-border-hover)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--input-border-focus)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'var(--text-secondary)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'var(--text-primary)',
                    },
                  }}
                />
              </Fade>
            )}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                height: 56,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'var(--button-primary-bg)',
                boxShadow: 'var(--button-shadow)',
                '&:hover': {
                  background: 'var(--button-primary-hover)',
                  boxShadow: 'var(--button-shadow-hover)',
                },
                mb: 2
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>

            <Divider sx={{ my: 2, borderColor: 'var(--divider-color)' }}>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                OR
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
              }}
              sx={{
                height: 48,
                borderColor: 'var(--color-primary)',
                color: 'var(--color-primary)',
                '&:hover': {
                  borderColor: 'var(--color-primary-light)',
                  bgcolor: 'var(--bg-hover)',
                },
              }}
            >
              {isLogin ? 'Create New Account' : 'Back to Sign In'}
            </Button>

          </form>
        </Paper>
      </Zoom>
    </Box>
  );
};

export default Login;
