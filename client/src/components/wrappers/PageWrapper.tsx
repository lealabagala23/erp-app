import * as React from 'react';
import { alpha, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { Stack } from '@mui/material';

interface IProps {
  children: React.ReactChild;
}

export default function PageWrapper({ children }: IProps) {
  return (
    <Box
      component="main"
      sx={(theme: Theme) => ({
        flexGrow: 1,
        backgroundColor: theme
          ? `rgba(${theme.palette.background.default} / 1)`
          : // eslint-disable-next-line
            // @ts-ignore
            alpha(theme.palette.background.default, 1),
        overflow: 'auto',
      })}
    >
      <Stack
        spacing={2}
        sx={{
          alignItems: 'center',
          mx: 3,
          pb: 5,
          mt: { xs: 8, md: 0 },
        }}
      >
        {children}
      </Stack>
    </Box>
  );
}
