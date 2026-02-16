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
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
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
        background: 'radial-gradient(circle at 50% 50%, #1a3a5f 0%, #0a1929 100%)',
        p: 2
      }}
    >
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
            background: 'rgba(19, 47, 76, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 212, 255, 0.2)'
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
                background: 'linear-gradient(135deg, #00d4ff 0%, #ff6b6b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              StockAnalyzer
            </Typography>
            <Typography variant="body2" color="text.secondary">
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
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: '#00d4ff' }} />
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
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#00d4ff' }} />
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
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#00d4ff' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
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
                  sx={{ mb: 2 }}
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
                background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #00b4e0 0%, #0088b3 100%)',
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

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
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
              sx={{ height: 48 }}
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
