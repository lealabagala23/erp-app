import React, { useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import HomeRoundedIcon from '@mui/icons-material/DashboardRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { ExpandLess, MoneyRounded } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { GridExpandMoreIcon } from '@mui/x-data-grid';

const secondaryListItems = [
  { text: 'Settings', icon: <SettingsRoundedIcon />, route: '/settings' },
];

const nestedMainItems = [
  { text: 'Home', icon: <HomeRoundedIcon />, route: '/home' },
  {
    text: 'Generate Sales',
    icon: <AnalyticsRoundedIcon />,
    route: '/generate-sales',
  },
  { text: 'Orders', icon: <MoneyRounded />, route: '/orders' },
  {
    text: 'Inventory',
    icon: <AssignmentRoundedIcon />,
    route: null,
    children: [
      {
        text: 'Products',
        route: '/products',
      },
      {
        text: 'Stocks',
        route: '/stocks',
      },
    ],
  },
  {
    text: 'Accounts',
    icon: <PeopleRoundedIcon />,
    route: null,
    children: [
      {
        text: 'Customers',
        route: '/accounts',
      },
      {
        text: 'Patients',
        route: '/patients',
      },
      {
        text: 'Doctors',
        route: '/doctors',
      },
      {
        text: 'Agencies',
        route: '/agencies',
      },
      {
        text: 'Referrals',
        route: '/referrals',
      },
    ],
  },
];

export default function MenuContent() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | boolean>(false);

  const handleAccordionChange =
    (panel: string) => (e: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const isSelected = (item: (typeof nestedMainItems)[2]) =>
    item.route
      ? pathname.includes(item.route)
      : item.children?.some((subItem) => pathname.includes(subItem.route));

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List>
        {nestedMainItems.map((item, index) => (
          <ListItem
            key={index}
            disablePadding
            sx={{ display: 'block', marginBottom: '4px' }}
          >
            <Accordion
              expanded={expanded === item.text}
              onChange={handleAccordionChange(item.text)}
              disableGutters
              elevation={0}
              sx={{
                boxShadow: 'none', // Remove shadow
                backgroundColor: 'transparent', // Remove background color
                border: 'none', // Remove border
                padding: 0,
                '& .MuiAccordionSummary-root': {
                  minHeight: 'unset',
                  padding: 0,
                },
                '.MuiButtonBase-root': { opacity: 1 },
              }}
            >
              <AccordionSummary
                aria-controls={`${item.text}-content`}
                id={`${item.text}-header`}
                sx={{
                  margin: 0,
                  '> .MuiAccordionSummary-content': { margin: 0 },
                  '.MuiListItemButton-root': {
                    opacity: isSelected(item) ? 1 : 0.7,
                  },
                }}
              >
                <ListItemButton
                  selected={isSelected(item)}
                  onClick={() => (item.route ? navigate(item.route) : null)}
                  sx={{ padding: 0 }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                  {item.children &&
                    (expanded === item.text ? (
                      <ExpandLess />
                    ) : (
                      <GridExpandMoreIcon />
                    ))}
                </ListItemButton>
              </AccordionSummary>
              {item.children && (
                <AccordionDetails
                  sx={{
                    paddingTop: 0,
                    paddingBottom: 0,
                    '.MuiListItemButton-root': {
                      opacity: 0.7,
                    },
                  }}
                >
                  <List
                    sx={{
                      paddingTop: 0,
                      paddingBottom: 0,
                      '.Mui-selected': {
                        backgroundColor: 'transparent !important',
                      },
                      '.MuiListItemButton-root:hover': {
                        backgroundColor: 'transparent !important',
                        opacity: 1,
                      },
                    }}
                  >
                    {item.children.map((subItem, idx) => (
                      <ListItem
                        key={idx}
                        disablePadding
                        sx={{
                          display: 'block',
                        }}
                      >
                        <ListItemButton
                          selected={pathname.includes(subItem.route)}
                          onClick={() => navigate(subItem.route)}
                        >
                          <ListItemText primary={subItem.text} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              )}
            </Accordion>
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
