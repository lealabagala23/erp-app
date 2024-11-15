import React, { useState } from 'react';
import AppNavbar from '../../common/AppNavbar';
import Header from './Header';
import PageWrapper from '../../wrappers/PageWrapper';
import InventoryTable from './InventoryTable';
import { AlertColor, Button, Stack } from '@mui/material';
import SearchBar from './SearchBar';
import FormDrawer from '../../common/FormDrawer';
import ProductForm from './ProductForm';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProduct, fetchProducts, updateProduct } from './apis';
import { Product } from './types';
import { FETCH_PRODUCTS_QUERY_KEY } from './constants';
import AlertSnackbar from '../../common/AlertSnackbar';

export default function Inventory() {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [openDrawer, setOpenDrawer] = useState(false);
  const [snackbarProps, setSnackbarProps] = useState<{
    open: boolean;
    message: string;
    type: AlertColor;
  }>({ open: false, message: '', type: 'success' });
  const [selectedRow, setSelectedRow] = useState<Product | null>(null);

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
        setSnackbarProps({
          open: true,
          message: 'Added new product successfully.',
          type: 'success',
        });
        toggleDrawer();
        queryClient.invalidateQueries([FETCH_PRODUCTS_QUERY_KEY]);
      },
      onError: (err) => {
        console.error(err);
        setSnackbarProps({
          open: true,
          message: 'Add new product was not successful.',
          type: 'error',
        });
      },
    });

  const { mutateAsync: mutateUpdateProduct, isLoading: isLoadingUpdate } =
    useMutation({
      mutationFn: updateProduct,
      onSuccess: () => {
        setSnackbarProps({
          open: true,
          message: 'Updated product successfully.',
          type: 'success',
        });
        toggleDrawer();
        queryClient.invalidateQueries([FETCH_PRODUCTS_QUERY_KEY]);
      },
      onError: (err) => {
        console.error(err);
        setSnackbarProps({
          open: true,
          message: 'Update product was not successful.',
          type: 'error',
        });
      },
    });

  const toggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  const toggleSnackbar = () => {
    setSnackbarProps((v) => ({ open: !v.open, type: 'success', message: '' }));
  };

  const handleSaveProduct = async (product: Product) => {
    if (product._id) {
      await mutateUpdateProduct(product);
    } else {
      await mutateCreateProduct(product);
    }
  };

  const onActionClick = (action: string) => {
    switch (action) {
      case 'Edit':
        toggleDrawer();
        break;
      default:
    }
  };

  const onCancel = () => {
    toggleDrawer();
    setSelectedRow(null);
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
              title={selectedRow ? 'Edit Product' : 'Add New Product'}
            >
              <ProductForm
                onFormSubmit={handleSaveProduct}
                isLoading={isLoadingCreate || isLoadingUpdate}
                initialData={selectedRow}
                onCancel={onCancel}
              />
            </FormDrawer>
          </Stack>
          <InventoryTable
            searchText={searchText}
            products={data}
            isLoading={isLoadingProducts}
            setSelectedRow={setSelectedRow}
            onActionClick={onActionClick}
          />
          <AlertSnackbar
            open={snackbarProps.open}
            type={snackbarProps.type}
            toggleSnackbar={toggleSnackbar}
            message={snackbarProps.message}
          />
        </>
      </PageWrapper>
    </>
  );
}
