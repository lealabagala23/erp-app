import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const FullPageLoader = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300,
      }}
    >
      <CircularProgress color="inherit" />
    </Box>
  );
};

export default FullPageLoader;
