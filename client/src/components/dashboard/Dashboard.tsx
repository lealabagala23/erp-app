import * as React from 'react';
import axios from 'axios';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import { alpha, Theme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from '../common/AppNavbar';
import Header from '../common/Header';
import MainGrid from '../common/MainGrid';
import SideMenu from '../common/SideMenu';
import AppTheme from '../../theme/AppTheme';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../../theme/customizations';
import { useLocation } from 'react-router-dom';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export type UserInfo = {
  first_name: string;
  last_name: string;
  user_name: string;
};

export default function Dashboard(props: { disableCustomTheme?: boolean }) {
  const { pathname } = useLocation();
  const [userInfo, setUserInfo] = React.useState<UserInfo | null>(null);
  const fetchUserInfo = async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    );
    setUserInfo(response?.data);
  };

  React.useEffect(() => {
    fetchUserInfo();
  }, []);

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu userInfo={userInfo as UserInfo} />
        <AppNavbar />
        {/* Main content */}
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
          {pathname === '/dashboard' && (
            <Stack
              spacing={2}
              sx={{
                alignItems: 'center',
                mx: 3,
                pb: 5,
                mt: { xs: 8, md: 0 },
              }}
            >
              <Header />
              <MainGrid />
            </Stack>
          )}
          {pathname === '/transactions' && (
            <Stack
              spacing={2}
              sx={{
                alignItems: 'center',
                mx: 3,
                pb: 5,
                mt: { xs: 8, md: 0 },
              }}
            >
              <Header />
            </Stack>
          )}
        </Box>
      </Box>
    </AppTheme>
  );
}
