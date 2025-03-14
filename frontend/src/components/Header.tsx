import React from 'react';
import { Box, Typography } from '@mui/material';

const Header: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mb: 2
      }}
    >
      <img
        src="/images/sabanci-logo.jpeg"
        alt="Sabanci University Logo"
        style={{
          width: '150px',
          marginBottom: '8px'
        }}
      />
      <Typography component="h1" variant="h6" sx={{ mb: 1 }}>
        Inter-Club
      </Typography>
    </Box>
  );
};

export default Header;