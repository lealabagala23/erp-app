import * as React from 'react';
import axios from 'axios';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import Box from '@mui/material/Box';
import SideMenu from '../common/SideMenu';
import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Inventory from '../pages/Inventory';
import GenerateSales from '../pages/GenerateSales';
import Orders from '../pages/Orders';
import Accounts from '../pages/Accounts';

export type UserInfo = {
  first_name: string;
  last_name: string;
  user_name: string;
};

export default function Dashboard() {
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
    <Box sx={{ display: 'flex' }}>
      <SideMenu userInfo={userInfo as UserInfo} />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/generate-sales" element={<GenerateSales />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/accounts" element={<Accounts />} />
      </Routes>
    </Box>
  );
}
