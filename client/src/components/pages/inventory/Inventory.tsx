import React, { useState } from 'react';
import AppNavbar from '../../common/AppNavbar';
import Header from './Header';
import PageWrapper from '../../wrappers/PageWrapper';
import InventoryTable from './InventoryTable';
import { Button, Stack } from '@mui/material';
import SearchBar from './SearchBar';
import FormDrawer from '../../common/FormDrawer';
import ProductForm from './ProductForm';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProduct, fetchProducts } from './apis';
import { Product } from './types';
import SuccessSnackbar from '../../common/SuccessSnackbar';
import ErrorSnackbar from '../../common/ErrorSnackbar';
import { FETCH_PRODUCTS_QUERY_KEY } from './constants';

export default function Inventory() {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [openDrawer, setOpenDrawer] = useState(false);
  const [createProdRes, setCreateProdRes] = useState({
    success: false,
    error: false,
  });

  const { data = [], isLoading: isLoadingProducts } = useQuery(
    [FETCH_PRODUCTS_QUERY_KEY],
    () => fetchProducts(),
    {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );

  const { mutateAsync: mutateCreateProduct, isLoading: isLoadingCreate } =
    useMutation({
      mutationFn: createProduct,
      onSuccess: () => {
        setCreateProdRes({ success: true, error: false });
        toggleDrawer();
        queryClient.invalidateQueries([FETCH_PRODUCTS_QUERY_KEY]);
      },
      onError: (err) => {
        console.error(err);
        setCreateProdRes({ success: false, error: true });
      },
    });

  const toggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  const toggleSnackbar = (status: 'success' | 'error') => () => {
    setCreateProdRes((v) => ({ ...v, [status]: !v[status] }));
  };

  const handleSaveProduct = async (product: Product) => {
    await mutateCreateProduct(product);
  };

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
            <Button size="small" variant="contained" onClick={toggleDrawer}>
              Add New Product
            </Button>
            <FormDrawer
              open={openDrawer}
              toggleDrawer={toggleDrawer}
              title={'Add New Product'}
            >
              <ProductForm
                onFormSubmit={handleSaveProduct}
                isLoading={isLoadingCreate}
              />
            </FormDrawer>
          </Stack>
          <InventoryTable
            searchText={searchText}
            products={data}
            isLoading={isLoadingProducts}
          />
          <SuccessSnackbar
            open={createProdRes.success}
            toggleSnackbar={toggleSnackbar('success')}
            message={'Added new product successfully.'}
          />
          <ErrorSnackbar
            open={createProdRes.error}
            toggleSnackbar={toggleSnackbar('error')}
            message={
              'Add new product was not successful. Please try again later.'
            }
          />
        </>
      </PageWrapper>
    </>
  );
}
