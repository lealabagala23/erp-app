import React from 'react';
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
import { MoneyRounded } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
// import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
// import { GridExpandMoreIcon } from '@mui/x-data-grid';

const mainListItems = [
  { text: 'Home', icon: <HomeRoundedIcon />, route: '/home' },
  {
    text: 'Generate Sales',
    icon: <AnalyticsRoundedIcon />,
    route: '/generate-sales',
  },
  { text: 'Orders', icon: <MoneyRounded />, route: '/orders' },
  { text: 'Inventory', icon: <AssignmentRoundedIcon />, route: '/inventory' },
  { text: 'Accounts', icon: <PeopleRoundedIcon />, route: '/accounts' },
];

const secondaryListItems = [
  { text: 'Settings', icon: <SettingsRoundedIcon />, route: '/settings' },
];

export default function MenuContent() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // const [expanded, setExpanded] = useState<string | boolean>(false);

  // const handleAccordionChange =
  //   (panel: string) => (e: React.SyntheticEvent, isExpanded: boolean) => {
  //     setExpanded(isExpanded ? panel : false);
  //   };

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={pathname.includes(item.route)}
              onClick={() => navigate(item.route)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        {/* <ListItem
          key={mainListItems.length}
          disablePadding
          sx={{ display: 'block' }}
        >
          <Accordion
            expanded={expanded === 'panel1'}
            onChange={handleAccordionChange('panel1')}
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
            }}
          >
            <AccordionSummary
              aria-controls="panel1-content"
              id="panel1-header"
              sx={{
                margin: 0,
                '> .MuiAccordionSummary-content': { margin: 0 },
                '.MuiListItemButton-root': { opacity: 1 },
              }}
            >
              <ListItemButton
                selected={mainListItems.length === 0}
                onClick={() => navigate('/inventory')}
                sx={{ padding: 0 }}
              >
                <ListItemIcon>
                  <AssignmentRoundedIcon />
                </ListItemIcon>
                <ListItemText primary={'Inventory'} />
              </ListItemButton>
            </AccordionSummary>
            <AccordionDetails sx={{ paddingTop: 0, paddingBottom: 0 }}>
              <List sx={{ paddingTop: 0, paddingBottom: 0 }}>
                <ListItem
                  key={mainListItems.length + 1}
                  disablePadding
                  sx={{ display: 'block' }}
                >
                  <ListItemButton
                    selected={mainListItems.length + 1 === 0}
                    onClick={() => navigate('/orders')}
                  >
                    <ListItemText primary={'Orders'} />
                  </ListItemButton>
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
        </ListItem> */}
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
