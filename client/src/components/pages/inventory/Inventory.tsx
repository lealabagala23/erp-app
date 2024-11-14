import React, { useState } from 'react';
import AppNavbar from '../../common/AppNavbar';
import Header from './Header';
import PageWrapper from '../../wrappers/PageWrapper';
import InventoryTable from './InventoryTable';
import { Button, Stack } from '@mui/material';
import SearchBar from './SearchBar';

export default function Inventory() {
  const [searchText, setSearchText] = useState('');
  return (
    <>
      <AppNavbar title={'Inventory'} />
      <PageWrapper>
        <>
          <Header title={'Inventory'} />
          <Stack
            direction="row"
            sx={{
              display: { xs: 'none', md: 'flex' },
              width: '100%',
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              maxWidth: { sm: '100%', md: '1700px' },
              pt: 1.5,
            }}
            spacing={2}
          >
            <SearchBar searchText={searchText} setSearchText={setSearchText} />
            <Button size="small" variant="contained">
              Add New Product
            </Button>
          </Stack>
          <InventoryTable searchText={searchText} />
        </>
      </PageWrapper>
    </>
  );
}
