import * as React from 'react';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import Box from '@mui/material/Box';
import SideMenu from '../common/SideMenu';
import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Inventory from '../pages/inventory/Inventory';
import GenerateSales from '../pages/GenerateSales';
import Orders from '../pages/Orders';
import Accounts from '../pages/Accounts';
import { AuthProvider } from '../auth/AuthContext';

export default function MainWrapper() {
  return (
    <AuthProvider>
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/generate-sales" element={<GenerateSales />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/products" element={<Inventory />} />
          <Route path="/stocks" element={<Inventory />} />
          <Route path="/accounts" element={<Accounts />} />
        </Routes>
      </Box>
    </AuthProvider>
  );
}
