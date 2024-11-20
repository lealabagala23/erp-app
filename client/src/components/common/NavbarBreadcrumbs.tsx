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
  },
  '/generate-sales': {
    primary: 'Dashboard',
  },
  '/orders': {
    primary: 'Dashboard',
  },
  '/products': {
    primary: 'Inventory',
    secondary: 'Products',
  },
  '/stocks': {
    primary: 'Inventory',
    secondary: 'Stocks',
  },
  '/accounts': {
    primary: 'Dashboard',
  },
};

export default function NavbarBreadcrumbs() {
  const { pathname } = useLocation();
  // eslint-disable-next-line
  const mapping = (labelRouteMapping as any)[pathname];
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
