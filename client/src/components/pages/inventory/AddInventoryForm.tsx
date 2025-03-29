import {
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  FormLabel,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import React, { useContext, useEffect, useState } from 'react';
import { Controller, FieldError, useForm } from 'react-hook-form';
import AuthContext from '../../auth/AuthContext';
import { Inventory, Product } from './types';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { FETCH_PRODUCTS_QUERY_KEY } from './constants';
import { fetchProducts } from './apis';
import ErrorMessage from '../../common/ErrorMessage';
import FormAutocomplete from '../../common/FormAutocomplete';

interface IProps {
  onFormSubmit: (d: Inventory) => void;
  isLoading: boolean;
  onCancel: () => void;
  initialData?: Inventory | { product_id?: string } | null;
}

export default function AddInventoryForm({
  onFormSubmit,
  isLoading,
  onCancel,
  initialData,
}: IProps) {
  const { suppliers } = useContext(AuthContext);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    getValues,
  } = useForm();
  const [supplierId, setSupplierId] = useState('');
  const { data: products = [] } = useQuery(
    [FETCH_PRODUCTS_QUERY_KEY],
    () => fetchProducts(),
    {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );

  const onSubmit = (data: unknown) => {
    onFormSubmit({
      ...(data as Inventory),
      supplier_id: supplierId,
    });
    reset();
  };

  useEffect(() => {
    if (initialData) {
      const {
        _id,
        product_id,
        stock_arrival_date,
        expiry_date,
        quantity_on_order,
        supplier_id,
        status,
      } = initialData as Inventory;
      reset({
        _id,
        // eslint-disable-next-line
        product_id: (product_id as any)?._id,
        stock_arrival_date: dayjs(stock_arrival_date),
        expiry_date: dayjs(expiry_date),
        quantity_on_order,
        // eslint-disable-next-line
        supplier_id: (supplier_id as any)?._id,
        status,
      });

      // setProductId((product_id as any)?._id);
      // eslint-disable-next-line
      setSupplierId((supplier_id as any)?._id);
    }
  }, [initialData]);

  return (
    <Box component={Card} width={'100%'}>
      <Stack component="form" onSubmit={handleSubmit(onSubmit)}>
        {!initialData?.product_id && (
          <FormControl fullWidth margin="dense">
            <FormLabel>Product</FormLabel>
            <FormAutocomplete
              options={products.map((s: Product) => ({
                label: `${s.product_name} ${s.product_description} ${s.product_unit}`,
                value: s._id,
              }))}
              getValues={getValues}
              name="product_id"
              placeholder={'Select Product'}
              control={control}
              autoFocus
            />
          </FormControl>
        )}

        <FormControl fullWidth>
          <FormLabel>Arrival Date</FormLabel>
          <Controller
            name="stock_arrival_date"
            control={control}
            rules={{ required: 'Arrival Date is required' }}
            render={({ field: { onChange, ...restField } }) => (
              <DatePicker
                onChange={onChange}
                {...restField}
                sx={{
                  '.MuiIconButton-root': {
                    border: 0,
                    width: '38px',
                    height: '38px',
                  },
                }}
                slotProps={{
                  calendarHeader: {
                    sx: {
                      '.MuiIconButton-root': {
                        border: 0,
                        width: '38px',
                        height: '38px',
                      },
                    },
                  },
                }}
              />
            )}
          />
        </FormControl>

        <FormControl fullWidth margin="dense">
          <FormLabel>Expiry Date</FormLabel>
          <Controller
            name="expiry_date"
            control={control}
            rules={{ required: 'Expiry Date is required' }}
            render={({ field: { onChange, ...restField } }) => (
              <DatePicker
                onChange={onChange}
                {...restField}
                sx={{
                  '.MuiIconButton-root': {
                    border: 0,
                    width: '38px',
                    height: '38px',
                  },
                }}
                slotProps={{
                  calendarHeader: {
                    sx: {
                      '.MuiIconButton-root': {
                        border: 0,
                        width: '38px',
                        height: '38px',
                      },
                    },
                  },
                }}
              />
            )}
          />
        </FormControl>

        <FormControl fullWidth margin="dense">
          <FormLabel>Batch No.</FormLabel>
          <TextField
            {...register('batch_number')}
            placeholder="Enter batch number"
            variant="outlined"
            fullWidth
            error={Boolean(errors.batch_number)}
            helperText={
              <ErrorMessage error={errors.batch_number as FieldError} />
            }
          />
        </FormControl>

        <FormControl fullWidth margin="dense">
          <FormLabel>Quantity on Order</FormLabel>
          <TextField
            {...register('quantity_on_order')}
            type="number"
            placeholder="20"
            variant="outlined"
            fullWidth
            error={Boolean(errors.quantity_on_order)}
            helperText={
              <ErrorMessage error={errors.quantity_on_order as FieldError} />
            }
          />
        </FormControl>

        <FormControl fullWidth margin="dense">
          <FormLabel>Supplier</FormLabel>
          <TextField
            select
            {...register('supplier_id')}
            value={supplierId}
            onChange={(e) => {
              setSupplierId(e.target.value);
              setValue('supplier_id', e.target.value);
            }}
            placeholder="Select Supplier"
            variant="outlined"
            fullWidth
            error={Boolean(errors.supplier_id)}
            helperText={
              <ErrorMessage error={errors.supplier_id as FieldError} />
            }
          >
            {suppliers.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.supplier_name}
              </MenuItem>
            ))}
          </TextField>
        </FormControl>

        <FormControl fullWidth margin="dense">
          <FormLabel>Status</FormLabel>
          <TextField
            select
            {...register('status')}
            onChange={(e) => {
              setValue('status', e.target.value);
            }}
            defaultValue={'active'}
            variant="outlined"
            placeholder="Select product status"
            fullWidth
            error={Boolean(errors.status)}
            helperText={<ErrorMessage error={errors.status as FieldError} />}
          >
            <MenuItem value={'active'}>ACTIVE</MenuItem>
            <MenuItem value={'out_of_stock'}>OUT OF STOCK</MenuItem>
            <MenuItem value={'discontinued'}>DISCONTINUED</MenuItem>
          </TextField>
        </FormControl>

        <Stack direction={'row'} gap={2} justifyContent={'center'} padding={2}>
          <Button variant="outlined" color="primary" onClick={onCancel}>
            Cancel
          </Button>
          <Tooltip
            title={!isValid ? 'Please fill the required fields' : undefined}
          >
            <Button
              type="submit"
              variant="contained"
              color="primary"
              endIcon={
                isLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : undefined
              }
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
}
