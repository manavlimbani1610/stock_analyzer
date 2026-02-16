import React from 'react';
import { Box, Container } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3, px: { xs: 2, sm: 3 } }}>
          {children}
        </Container>
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;