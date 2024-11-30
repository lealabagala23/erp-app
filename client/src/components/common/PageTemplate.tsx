import React, { useState } from 'react';
import AppNavbar from './AppNavbar';
import Header from './Header';
import PageWrapper from '../wrappers/PageWrapper';
import { AlertColor, Button, Stack } from '@mui/material';
import SearchBar from './SearchBar';
import FormDrawer from './FormDrawer';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AlertSnackbar from './AlertSnackbar';
import AlertDialog from './AlertDialog';
import { AddBoxOutlined, Upload } from '@mui/icons-material';
import { capitalize } from 'lodash';
import DataTable from './DataTable';
import CSVUploader from './CSVUploader';
import { GridColDef } from '@mui/x-data-grid';

interface IProps {
  // eslint-disable-next-line
  fetchAPI: () => Promise<any>;
  // eslint-disable-next-line
  createAPI: (p: any) => Promise<any>;
  // eslint-disable-next-line
  updateAPI: (p: any) => Promise<any>;
  // eslint-disable-next-line
  deleteAPI: (p: any) => Promise<any>;
  // eslint-disable-next-line
  uploadCSVAPI: (p: any) => Promise<any>;
  drawerTabs: {
    label: string;
    icon: React.ReactNode;
    // eslint-disable-next-line
    Component: any;
    // eslint-disable-next-line
    componentProps?: any;
    hidden?: boolean;
  }[];
  itemName: string;
  queryKey: string;
  searchAttr: string;
  sortField: string;
  // eslint-disable-next-line
  columns: GridColDef<any>[];
}

export default function PageTemplate({
  fetchAPI,
  createAPI,
  updateAPI,
  deleteAPI,
  uploadCSVAPI,
  drawerTabs,
  itemName,
  queryKey,
  searchAttr,
  sortField,
  columns,
}: IProps) {
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
  const [openCSVUploader, setOpenCSVUploader] = useState(false);
  // eslint-disable-next-line
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const { data = [], isLoading: isLoadingFetch } = useQuery(
    [queryKey],
    () => fetchAPI(),
    {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );

  const { mutateAsync: mutateCreate, isLoading: isLoadingCreate } = useMutation(
    {
      mutationFn: createAPI,
      onSuccess: () => {
        setSnackbarProps({
          open: true,
          message: `Added new ${itemName} successfully.`,
          type: 'success',
        });
        toggleDrawer();
        queryClient.invalidateQueries([queryKey]);
      },
      onError: (err) => {
        console.error(err);
        setSnackbarProps({
          open: true,
          message: `Add new ${itemName} was not successful.`,
          type: 'error',
        });
      },
    },
  );

  const { mutateAsync: mutateUpdate, isLoading: isLoadingUpdate } = useMutation(
    {
      mutationFn: updateAPI,
      onSuccess: () => {
        setSnackbarProps({
          open: true,
          message: `Updated ${itemName} successfully.`,
          type: 'success',
        });
        toggleDrawer();
        queryClient.invalidateQueries([queryKey]);
      },
      onError: (err) => {
        console.error(err);
        setSnackbarProps({
          open: true,
          message: `Update ${itemName} was not successful.`,
          type: 'error',
        });
      },
    },
  );

  const { mutateAsync: mutateDelete, isLoading: isLoadingDelete } = useMutation(
    {
      mutationFn: deleteAPI,
      onSuccess: () => {
        setSnackbarProps({
          open: true,
          message: `Deleted ${itemName} successfully.`,
          type: 'success',
        });
        queryClient.invalidateQueries([queryKey]);
      },
      onError: (err) => {
        console.error(err);
        setSnackbarProps({
          open: true,
          message: `Delete ${itemName} was not successful.`,
          type: 'error',
        });
      },
    },
  );

  const toggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  const toggleSnackbar = () => {
    setSnackbarProps((v) => ({ open: !v.open, type: 'success', message: '' }));
  };

  // eslint-disable-next-line
  const handleSave = async (item: any) => {
    if (item._id) {
      await mutateUpdate(item);
    } else {
      await mutateCreate(item);
    }
  };

  const onActionClick = (action: string) => {
    switch (action) {
      case 'Edit':
        toggleDrawer();
        break;
      case 'Delete':
        setDialogProps({
          open: true,
          title: `Delete ${itemName}`,
          message: `Are you sure you want to delete this ${itemName}? (Note: This action cannot be reversed.)`,
        });
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
      <AppNavbar title={`${capitalize(itemName)} List`} />
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
              itemName={itemName}
              searchText={searchText}
              setSearchText={setSearchText}
            />
            <Stack direction={'row'} gap={2}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setOpenCSVUploader(true)}
                startIcon={<Upload />}
              >
                Upload CSV
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={toggleDrawer}
                startIcon={<AddBoxOutlined />}
              >
                Add New {capitalize(itemName)}
              </Button>
            </Stack>
            <FormDrawer
              open={openDrawer}
              toggleDrawer={toggleDrawer}
              title={
                selectedRow
                  ? `Edit ${capitalize(itemName)}`
                  : `Add New ${capitalize(itemName)}`
              }
              tabs={drawerTabs.map((tab) => ({
                ...tab,
                componentProps: {
                  onFormSubmit: handleSave,
                  isLoading: isLoadingCreate || isLoadingUpdate,
                  initialData: selectedRow,
                  onCancel: onCancelForm,
                  item_id: selectedRow?._id as string,
                },
              }))}
            />
          </Stack>
          <DataTable
            columns={columns}
            searchText={searchText}
            data={data}
            isLoading={isLoadingFetch || isLoadingDelete}
            setSelectedRow={setSelectedRow}
            onActionClick={onActionClick}
            searchAttr={searchAttr}
            sortField={sortField}
          />
          <CSVUploader
            open={openCSVUploader}
            handleClose={(isSubmit: boolean) => {
              if (isSubmit) {
                setSnackbarProps({
                  open: true,
                  message: 'Uploaded CSV successfully.',
                  type: 'success',
                });
              }
              setOpenCSVUploader((v) => !v);
            }}
            uploadAPI={uploadCSVAPI}
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
              label: 'Delete',
              // eslint-disable-next-line
              action: () => mutateDelete(selectedRow as any),
              danger: true,
            }}
          />
        </>
      </PageWrapper>
    </>
  );
}
