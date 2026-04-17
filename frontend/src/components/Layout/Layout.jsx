import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      <Sidebar mobileOpen={mobileOpen} onMobileClose={handleDrawerToggle} />
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'var(--bg-primary)',
          width: { xs: '100%', md: 'calc(100% - 240px)' },
        }}
      >
        <Header onMenuClick={handleDrawerToggle} />
        <Container
          maxWidth="xl"
          sx={{
            flexGrow: 1,
            py: { xs: 2, sm: 3 },
            px: { xs: 1.5, sm: 2, md: 3 },
            bgcolor: 'var(--bg-primary)',
          }}
        >
          {children}
        </Container>
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;
