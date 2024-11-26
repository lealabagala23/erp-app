import React, { useContext } from 'react';
import MuiAvatar from '@mui/material/Avatar';
import MuiListItemAvatar from '@mui/material/ListItemAvatar';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
// import ListItemIcon from '@mui/material/ListItemIcon';
import ListSubheader from '@mui/material/ListSubheader';
import Select, { SelectChangeEvent, selectClasses } from '@mui/material/Select';
// import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
// import AddRoundedIcon from '@mui/icons-material/AddRounded';
// import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded';
import AuthContext from '../auth/AuthContext';
import { Company } from '../auth/types';
import { Box, CircularProgress } from '@mui/material';
import lamorenetaSmallLogo from '../../assets/la_moreneta_small.png';
import lhctSmallLogo from '../../assets/lhct_small.png';
// import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';

const Avatar = styled(MuiAvatar)(({ theme }) => ({
  width: 28,
  height: 28,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.secondary,
  border: `1px solid ${theme.palette.divider}`,
}));

const ListItemAvatar = styled(MuiListItemAvatar)({
  minWidth: 0,
  marginRight: 12,
});

const icons = {
  'La Moreneta': lamorenetaSmallLogo,
  'LHCT Pharmaceutical': lhctSmallLogo,
};

export default function SelectContent() {
  const { companies, activeCompany, setActiveCompany } =
    useContext(AuthContext);

  const handleChange = (event: SelectChangeEvent) => {
    const company = companies.find(
      (c) => c.company_display_name === event.target.value,
    );
    setActiveCompany(company as Company);
  };
  console.log('activeCompany', activeCompany, companies);
  if (!activeCompany || companies.length === 0) {
    return (
      <Box height={'56px'} margin={'auto'}>
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  return (
    <Select
      labelId="company-select"
      id="company-simple-select"
      value={activeCompany?.company_display_name}
      onChange={handleChange}
      displayEmpty
      inputProps={{ 'aria-label': 'Select company' }}
      fullWidth
      sx={{
        maxHeight: 56,
        width: 215,
        '&.MuiList-root': {
          p: '8px',
        },
        [`& .${selectClasses.select}`]: {
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          pl: 1,
        },
        '.MuiSelect-select': {
          paddingLeft: 0,
        },
        '.MuiListItemText-secondary': {
          textOverflow: 'ellipsis',
          width: '130px',
          overflow: 'hidden',
        },
      }}
    >
      <ListSubheader sx={{ pt: 0 }}>Company</ListSubheader>
      {companies.map((c) => (
        <MenuItem key={c._id} value={c.company_display_name}>
          <ListItemAvatar>
            <Avatar alt={c.company_display_name}>
              {/* <DevicesRoundedIcon sx={{ fontSize: '1rem' }} /> */}
              <img
                // eslint-disable-next-line
                src={(icons as any)[c.company_display_name]}
                width={20}
                height={20}
              />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={c.company_display_name}
            secondary={c.company_name}
          />
        </MenuItem>
      ))}
      {/* <MenuItem value={10}>
        <ListItemAvatar>
          <Avatar alt="Sitemark App">
            <SmartphoneRoundedIcon sx={{ fontSize: '1rem' }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary="Sitemark-app" secondary="Mobile application" />
      </MenuItem> */}
      {/* <MenuItem value={20}>
        <ListItemAvatar>
          <Avatar alt="Sitemark Store">
            <DevicesRoundedIcon sx={{ fontSize: '1rem' }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary="Sitemark-Store" secondary="Web app" />
      </MenuItem>
      <ListSubheader>Development</ListSubheader>
      <MenuItem value={30}>
        <ListItemAvatar>
          <Avatar alt="Sitemark Store">
            <ConstructionRoundedIcon sx={{ fontSize: '1rem' }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary="Sitemark-Admin" secondary="Web app" />
      </MenuItem>
      <Divider sx={{ mx: -1 }} />
      <MenuItem value={40}>
        <ListItemIcon>
          <AddRoundedIcon />
        </ListItemIcon>
        <ListItemText primary="Add product" secondary="Web app" />
      </MenuItem> */}
    </Select>
  );
}
