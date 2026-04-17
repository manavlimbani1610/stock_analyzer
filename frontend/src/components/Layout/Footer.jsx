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
        backgroundColor: 'var(--bg-paper)',
        borderTop: '1px solid var(--border-color)',
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
      }}
    >
      <Box sx={{ maxWidth: 'xl', mx: 'auto' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            © {currentYear} Stock Analyzer. All rights reserved.
          </Typography>

          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'var(--text-secondary)',
                '&:hover': {
                  color: 'var(--color-primary)',
                  bgcolor: 'var(--bg-hover)',
                },
              }}
            >
              <GitHubIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'var(--text-secondary)',
                '&:hover': {
                  color: 'var(--color-primary)',
                  bgcolor: 'var(--bg-hover)',
                },
              }}
            >
              <LinkedInIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'var(--text-secondary)',
                '&:hover': {
                  color: 'var(--color-primary)',
                  bgcolor: 'var(--bg-hover)',
                },
              }}
            >
              <TwitterIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              href="mailto:contact@stockanalyzer.com"
              sx={{
                color: 'var(--text-secondary)',
                '&:hover': {
                  color: 'var(--color-primary)',
                  bgcolor: 'var(--bg-hover)',
                },
              }}
            >
              <EmailIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Link
              href="#"
              variant="body2"
              underline="hover"
              sx={{
                color: 'var(--text-secondary)',
                '&:hover': { color: 'var(--color-primary)' },
              }}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              variant="body2"
              underline="hover"
              sx={{
                color: 'var(--text-secondary)',
                '&:hover': { color: 'var(--color-primary)' },
              }}
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              variant="body2"
              underline="hover"
              sx={{
                color: 'var(--text-secondary)',
                '&:hover': { color: 'var(--color-primary)' },
              }}
            >
              Contact
            </Link>
          </Stack>
        </Stack>

        <Typography
          variant="caption"
          sx={{ display: 'block', textAlign: 'center', mt: 2, color: 'var(--text-muted)' }}
        >
          Data provided by financial data providers. This is for educational purposes only.
          Past performance is not indicative of future results.
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
