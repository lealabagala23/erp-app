import {
  AlertColor,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import React, { useContext, useState } from 'react';
import CollapsibleTable from './CollapsibleTable';
import { FETCH_PRODUCT_INVENTORY_QUERY_KEY } from './constants';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProductInventory, fetchProductInventory } from './apis';
import AuthContext from '../../auth/AuthContext';
import { AddBox } from '@mui/icons-material';
import AddInventoryForm from './AddInventoryForm';
import AlertSnackbar from '../../common/AlertSnackbar';
import { Inventory } from './types';

interface IProps {
  item_id: string;
}

export default function ProductInventory({ item_id }: IProps) {
  const queryClient = useQueryClient();
  const [addInventory, setAddInventory] = useState(false);
  const { activeCompany } = useContext(AuthContext);

  const [snackbarProps, setSnackbarProps] = useState<{
    open: boolean;
    message: string;
    type: AlertColor;
  }>({ open: false, message: '', type: 'success' });
  const { data = [], isLoading } = useQuery(
    [FETCH_PRODUCT_INVENTORY_QUERY_KEY, item_id],
    () =>
      fetchProductInventory({
        product_id: item_id,
        company_id: activeCompany?._id as string,
      }),
    {
      enabled: !!item_id,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );

  const { mutateAsync: mutateCreate, isLoading: isLoadingCreate } = useMutation(
    {
      mutationFn: createProductInventory,
      onSuccess: () => {
        setSnackbarProps({
          open: true,
          message: 'Added new product successfully.',
          type: 'success',
        });
        queryClient.invalidateQueries([FETCH_PRODUCT_INVENTORY_QUERY_KEY]);
      },
      onError: (err) => {
        console.error(err);
        setSnackbarProps({
          open: true,
          message: 'Add new product was not successful.',
          type: 'error',
        });
      },
    },
  );

  const toggleSnackbar = () => {
    setSnackbarProps((v) => ({ open: !v.open, type: 'success', message: '' }));
  };

  const onFormSubmit = async (data: Inventory) => {
    await mutateCreate({
      ...data,
      product_id: item_id,
      company_id: activeCompany?._id,
    });
    setAddInventory(false);
  };

  return (
    <Stack direction="column" padding={2} width={'100%'}>
      <Typography variant="body2" fontWeight={'500'} marginBottom={2}>
        Arrived Stocks
      </Typography>
      {isLoading ? (
        <CircularProgress color="inherit" sx={{ margin: '0 auto' }} />
      ) : data.length === 0 ? (
        <Typography align="center" marginBottom={'12px'}>
          No inventory data recorded.
        </Typography>
      ) : !addInventory ? (
        <CollapsibleTable data={data} />
      ) : (
        <></>
      )}
      {addInventory ? (
        <AddInventoryForm
          onFormSubmit={onFormSubmit}
          isLoading={isLoadingCreate}
          onCancel={() => setAddInventory(false)}
          initialData={{ product_id: item_id }}
        />
      ) : (
        <Button
          variant="contained"
          sx={{
            width: 'fit-content',
            alignSelf: 'flex-end',
            marginTop: '16px',
          }}
          onClick={() => setAddInventory(true)}
        >
          <AddBox sx={{ marginRight: '8px' }} /> Add Stocks
        </Button>
      )}
      <AlertSnackbar
        open={snackbarProps.open}
        type={snackbarProps.type}
        toggleSnackbar={toggleSnackbar}
        message={snackbarProps.message}
      />
    </Stack>
  );
}
