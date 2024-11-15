import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  Stack,
  IconButton,
  Divider,
} from '@mui/material';
import {
  CloseOutlined as CloseIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';

interface IProps {
  open: boolean;
  toggleDrawer: () => void;
  children: React.ReactChild;
  title: string;
}

export default function FormDrawer({
  open,
  toggleDrawer,
  children,
  title,
}: IProps) {
  return (
    <Drawer anchor="right" open={open} onClose={toggleDrawer}>
      <Stack direction={'row'}>
        <IconButton sx={{ border: 0, margin: 1 }} onClick={toggleDrawer}>
          <CloseIcon />
        </IconButton>
        <Divider orientation="vertical" sx={{ marginRight: 2 }} />
        <Typography
          variant="body1"
          fontWeight={'bold'}
          fontSize={'16px'}
          gutterBottom
          sx={{ margin: 'auto 0' }}
        >
          {title}
        </Typography>
      </Stack>
      <Divider />

      <Stack direction={'row'} sx={{ width: 500, height: '100%' }}>
        <Box width={56}>
          <InfoIcon sx={{ margin: 2 }} />
        </Box>
        <Divider orientation="vertical" />
        {children}
      </Stack>
      <Divider />
    </Drawer>
  );
}
