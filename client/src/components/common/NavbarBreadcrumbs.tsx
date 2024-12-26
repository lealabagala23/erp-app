import * as React from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { useLocation } from 'react-router-dom';

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: theme.palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: 'center',
  },
}));

const labelRouteMapping = {
  '/home': {
    primary: 'Dashboard',
    secondary: 'Home',
  },
  '/generate-sales': {
    primary: 'Orders',
    secondary: 'Generate Sales Invoice',
  },
  '/orders/new': {
    primary: 'Orders',
    secondary: 'Generate Sales Invoice',
  },
  '/orders/list': {
    primary: 'Orders',
    secondary: 'Orders List',
  },
  '/products': {
    primary: 'Inventory',
    secondary: 'Products',
  },
  '/stocks': {
    primary: 'Inventory',
    secondary: 'Stocks',
  },
  '/customers': {
    primary: 'Accounts',
    secondary: 'Customers',
  },
  '/patients': {
    primary: 'Accounts',
    secondary: 'Patients',
  },
  '/doctors': {
    primary: 'Accounts',
    secondary: 'Doctors',
  },
  '/agencies': {
    primary: 'Accounts',
    secondary: 'Agencies',
  },
  '/referrals': {
    primary: 'Accounts',
    secondary: 'Referrals',
  },
  '/settings': {
    primary: 'Settings',
    secondary: 'Change Password',
  },
};

export default function NavbarBreadcrumbs() {
  const { pathname } = useLocation();
  const path =
    pathname.includes('/orders') &&
    !pathname.includes('/new') &&
    !pathname.includes('/list')
      ? '/orders/new'
      : pathname;
  // eslint-disable-next-line
  const mapping = (labelRouteMapping as any)[path];
  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
      <Typography variant="body1">{mapping.primary}</Typography>
      <Typography
        variant="body1"
        sx={{ color: 'text.primary', fontWeight: 600 }}
      >
        {mapping.secondary}
      </Typography>
    </StyledBreadcrumbs>
  );
}
