import React, { useContext, useState } from 'react';
import AppNavbar from '../../../common/AppNavbar';
import Header from '../../../common/Header';
import PageWrapper from '../../../wrappers/PageWrapper';
import { AlertColor, Button, Stack } from '@mui/material';
import SearchBar from '../../../common/SearchBar';
import FormDrawer from '../../../common/FormDrawer';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Inventory } from '../types';
import { FETCH_INVENTORY_QUERY_KEY } from '../constants';
import AlertSnackbar from '../../../common/AlertSnackbar';
import { AddBoxOutlined, InfoOutlined } from '@mui/icons-material';
import { createInventory, fetchInventory, updateInventory } from './apis';
import AuthContext from '../../../auth/AuthContext';
import AddInventoryForm from '../AddInventoryForm';
import StocksTable from './StocksTable';
import { useNavigate } from 'react-router-dom';
import AlertDialog from '../../../common/AlertDialog';

export default function Stocks() {
  const navigate = useNavigate();
  const { activeCompany } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [openDrawer, setOpenDrawer] = useState(false);
  const [snackbarProps, setSnackbarProps] = useState<{
    open: boolean;
    message: string;
    type: AlertColor;
  }>({ open: false, message: '', type: 'success' });
  const [dialogProps, setDialogProps] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({ open: false, title: '', message: '' });
  const [selectedRow, setSelectedRow] = useState<Inventory | null>(null);

  const { data = [], isLoading: isLoadingInventory } = useQuery(
    [FETCH_INVENTORY_QUERY_KEY, activeCompany?._id],
    () => fetchInventory({ company_id: activeCompany?._id as string }),
    {
      enabled: !!activeCompany?._id,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );

  const { mutateAsync: mutateCreateInventory, isLoading: isLoadingCreate } =
    useMutation({
      mutationFn: createInventory,
      onSuccess: () => {
        setSnackbarProps({
          open: true,
          message: 'Added new inventory successfully.',
          type: 'success',
        });
        toggleDrawer();
        queryClient.invalidateQueries([FETCH_INVENTORY_QUERY_KEY]);
      },
      onError: (err) => {
        console.error(err);
        setSnackbarProps({
          open: true,
          message: 'Add new inventory was not successful.',
          type: 'error',
        });
      },
    });

  const { mutateAsync: mutateUpdateInventory, isLoading: isLoadingUpdate } =
    useMutation({
      mutationFn: updateInventory,
      onSuccess: ({ status }: Inventory) => {
        setSnackbarProps({
          open: true,
          message: 'Updated inventory successfully.',
          type: 'success',
        });
        // eslint-disable-next-line
        status !== 'EXPIRED' && toggleDrawer();
        queryClient.invalidateQueries([FETCH_INVENTORY_QUERY_KEY]);
      },
      onError: (err) => {
        console.error(err);
        setSnackbarProps({
          open: true,
          message: 'Update inventory was not successful.',
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

  const handleSaveInventory = async (inventory: Inventory) => {
    if (inventory._id) {
      await mutateUpdateInventory({
        product_id: selectedRow?.product_id,
        ...inventory,
        company_id: activeCompany?._id,
      });
    } else {
      await mutateCreateInventory({
        ...inventory,
        company_id: activeCompany?._id,
      });
    }
  };

  const onActionClick = async (action: string) => {
    switch (action) {
      case 'Acknowledge':
        setDialogProps({
          open: true,
          title: 'Acknowledge Stock Expiry',
          message:
            'Are you sure you want to remove this stock from the current inventory?',
        });
        break;
      case 'Edit':
        toggleDrawer();
        break;
      case 'View':
        // eslint-disable-next-line
        navigate(`/products?id=${(selectedRow?.product_id as any)?._id}`);
        break;
      default:
    }
  };

  const onCancelForm = () => {
    toggleDrawer();
    setSelectedRow(null);
  };

  const handleCloseDialog = () => {
    setDialogProps((v) => ({ ...v, open: false }));
  };

  return (
    <>
      <AppNavbar title={'Stocks List'} />
      <PageWrapper>
        <>
          <Header />
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
            <SearchBar
              itemName="product"
              searchText={searchText}
              setSearchText={setSearchText}
            />
            <Button
              size="small"
              variant="contained"
              onClick={toggleDrawer}
              startIcon={<AddBoxOutlined />}
            >
              Add New Stocks
            </Button>
            <FormDrawer
              open={openDrawer}
              toggleDrawer={toggleDrawer}
              title={selectedRow ? 'Edit Inventory' : 'Add New Inventory'}
              tabs={[
                {
                  label: 'Info',
                  icon: <InfoOutlined />,
                  Component: AddInventoryForm,
                  componentProps: {
                    onFormSubmit: handleSaveInventory,
                    isLoading: isLoadingCreate || isLoadingUpdate,
                    onCancel: onCancelForm,
                    initialData: selectedRow,
                  },
                },
              ]}
            />
          </Stack>
          <StocksTable
            searchText={searchText}
            inventory={data}
            isLoading={isLoadingInventory}
            selectedRow={selectedRow}
            setSelectedRow={setSelectedRow}
            onActionClick={onActionClick}
          />
          <AlertSnackbar
            open={snackbarProps.open}
            type={snackbarProps.type}
            toggleSnackbar={toggleSnackbar}
            message={snackbarProps.message}
          />
          <AlertDialog
            open={dialogProps.open}
            handleClose={handleCloseDialog}
            title={dialogProps.title}
            message={dialogProps.message}
            cancelBtnProps={{
              label: 'Cancel',
              action: () => handleCloseDialog(),
            }}
            proceedBtnProps={{
              label: 'Set as Expired',
              action: () =>
                mutateUpdateInventory({
                  ...selectedRow,
                  product_id: selectedRow?.product_id,
                  status: 'EXPIRED',
                } as Inventory),
              danger: true,
            }}
          />
        </>
      </PageWrapper>
    </>
  );
}
