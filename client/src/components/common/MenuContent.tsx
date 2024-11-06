import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { MoneyRounded, PeopleAltRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const mainListItems = [
  { text: 'Dashboard', icon: <HomeRoundedIcon />, route: '/dashboard' },
  { text: 'Transactions', icon: <MoneyRounded />, route: '/transactions' },
  { text: 'Inventory', icon: <AssignmentRoundedIcon />, route: '/inventory' },
  { text: 'Customers', icon: <PeopleRoundedIcon />, route: '/customers' },
  { text: 'Suppliers', icon: <PeopleAltRounded />, route: '/suppliers' },
  { text: 'Reports', icon: <AnalyticsRoundedIcon />, route: '/reports' },
];

const secondaryListItems = [
  { text: 'Settings', icon: <SettingsRoundedIcon />, route: '/settings' },
];

export default function MenuContent() {
  const navigate = useNavigate();
  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={index === 0}
              onClick={() => navigate(item.route)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton onClick={() => navigate(item.route)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
