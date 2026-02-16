import React from 'react';
import { Box, Typography, Link, IconButton, Stack } from '@mui/material';
import {
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Email as EmailIcon,
} from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ maxWidth: 'xl', mx: 'auto' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Stock Analyzer. All rights reserved.
          </Typography>

          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkedInIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <TwitterIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              href="mailto:contact@stockanalyzer.com"
            >
              <EmailIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Link
              href="#"
              color="text.secondary"
              variant="body2"
              underline="hover"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              color="text.secondary"
              variant="body2"
              underline="hover"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              color="text.secondary"
              variant="body2"
              underline="hover"
            >
              Contact
            </Link>
          </Stack>
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', mt: 2 }}
        >
          Data provided by financial data providers. This is for educational purposes only.
          Past performance is not indicative of future results.
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;