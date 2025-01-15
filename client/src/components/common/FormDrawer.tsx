import React, { useState } from 'react';
import { Drawer, Typography, Stack, IconButton, Divider } from '@mui/material';
import { CloseOutlined as CloseIcon } from '@mui/icons-material';

type FormDrawerTab = {
  label: string;
  icon: React.ReactNode;
  // eslint-disable-next-line
  Component: any;
  // eslint-disable-next-line
  componentProps: any;
  hidden?: boolean;
};

interface IProps {
  open: boolean;
  toggleDrawer: () => void;
  title: string;
  tabs: FormDrawerTab[];
}

export default function FormDrawer({
  open,
  toggleDrawer,
  title,
  tabs,
}: IProps) {
  if (tabs.length === 0) return <></>;

  const [selectedTab, setSelectedTab] = useState(tabs[0].label);

  const selectedStyles = {
    backgroundColor: 'hsl(220, 30%, 94%)',
    borderColor: 'hsl(220, 20%, 80%)',
  };

  const renderContent = () => {
    const tab = tabs.find((t) => t.label === selectedTab);
    const { Component, componentProps } = tab as FormDrawerTab;
    return <Component {...componentProps} />;
  };

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
        <Stack direction={'column'} width={56}>
          {tabs.map(({ label, icon, hidden }) => (
            <IconButton
              key={label}
              sx={{
                margin: 1,
                border: 0,
                ...(selectedTab === label ? selectedStyles : {}),
                display: hidden ? 'none' : undefined,
              }}
              onClick={() => setSelectedTab(label)}
            >
              {icon}
            </IconButton>
          ))}
        </Stack>
        <Divider orientation="vertical" />
        {renderContent()}
      </Stack>
      <Divider />
    </Drawer>
  );
}
