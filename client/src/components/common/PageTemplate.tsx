import React, { useEffect, useState } from 'react';
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
import { useLocation, useNavigate } from 'react-router-dom';

interface IProps {
  // eslint-disable-next-line
  fetchAPI: (() => Promise<any>) | ((s: any) => Promise<any>);
  // eslint-disable-next-line
  fetchParams?: { [key: string]: any };
  // eslint-disable-next-line
  createAPI?: (p: any) => Promise<any>;
  // eslint-disable-next-line
  updateAPI?: (p: any) => Promise<any>;
  // eslint-disable-next-line
  deleteAPI?: (p: any) => Promise<any>;
  // eslint-disable-next-line
  uploadCSVAPI?: (p: any) => Promise<any>;
  // eslint-disable-next-line
  viewItem?: (i: any) => void;
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
  sortDir?: string;
  // eslint-disable-next-line
  columns: GridColDef<any>[];
  menuActions?: string[];
  isCreateNew?: boolean;
  redirectOnCreate?: (id: string) => void;
}

export default function PageTemplate({
  fetchAPI,
  createAPI,
  updateAPI,
  deleteAPI,
  uploadCSVAPI,
  viewItem,
  drawerTabs,
  itemName,
  queryKey,
  searchAttr,
  sortField,
  sortDir,
  columns,
  menuActions,
  fetchParams,
  isCreateNew,
  redirectOnCreate,
}: IProps) {
  const location = useLocation();
  const navigate = useNavigate();
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

  const queryParams = fetchParams
    ? [queryKey, ...Object.values(fetchParams)]
    : [queryKey];

  const { data = [], isLoading: isLoadingFetch } = useQuery(
    queryParams,
    () => fetchAPI(fetchParams ? fetchParams : undefined),
    {
      enabled: fetchParams ? Object.values(fetchParams).some((v) => !!v) : true,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );

  const { mutateAsync: mutateCreate, isLoading: isLoadingCreate } = useMutation(
    {
      mutationFn: createAPI,
      onSuccess: ({ _id }) => {
        if (redirectOnCreate) {
          return redirectOnCreate(_id);
        }
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
      case 'View':
        // eslint-disable-next-line
        viewItem && viewItem(selectedRow);
        break;
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

  useEffect(() => {
    if (location.search?.includes('id') && data.length > 0) {
      const id = location.search.split('=')[1];
      // eslint-disable-next-line
      const selected = data.find(({ _id }: any) => _id === id);

      if (selected) {
        setSelectedRow(selected);
        toggleDrawer();
        navigate({ search: '' });
      }
    }
  }, [location, data]);

  useEffect(() => {
    if (isCreateNew && !openDrawer) {
      toggleDrawer();
    }
  }, [isCreateNew]);

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
              {uploadCSVAPI && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setOpenCSVUploader(true)}
                  startIcon={<Upload />}
                >
                  Upload CSV
                </Button>
              )}
              {createAPI && (
                <Button
                  size="small"
                  variant="contained"
                  onClick={toggleDrawer}
                  startIcon={<AddBoxOutlined />}
                >
                  Add New {capitalize(itemName)}
                </Button>
              )}
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
            sortDir={sortDir}
            menuActions={menuActions}
          />
          {uploadCSVAPI && (
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
          )}
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
