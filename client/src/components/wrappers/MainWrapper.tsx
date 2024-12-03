import * as React from 'react';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import Box from '@mui/material/Box';
import SideMenu from '../common/SideMenu';
import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Products from '../pages/inventory/Products';
import GenerateSales from '../pages/GenerateSales';
import Orders from '../pages/Orders';
import Customers from '../pages/accounts/Customers';
import { AuthProvider } from '../auth/AuthContext';
import Stocks from '../pages/inventory/stocks/Stocks';
import ChangePassword from '../settings/ChangePassword';
import Patients from '../pages/accounts/Patients';
import Doctors from '../pages/accounts/Doctors';
import Agencies from '../pages/accounts/Agencies';

export default function MainWrapper() {
  return (
    <AuthProvider>
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/generate-sales" element={<GenerateSales />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/products" element={<Products />} />
          <Route path="/stocks" element={<Stocks />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/agencies" element={<Agencies />} />
          <Route path="/settings" element={<ChangePassword />} />
        </Routes>
      </Box>
    </AuthProvider>
  );
}
