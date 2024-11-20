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
import { Controller, useForm } from 'react-hook-form';
import AuthContext from '../../auth/AuthContext';
import { Inventory, Product } from './types';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { FETCH_PRODUCTS_QUERY_KEY } from './constants';
import { fetchProducts } from './apis';

interface IProps {
  onFormSubmit: (d: Inventory) => void;
  isLoading: boolean;
  onCancel: () => void;
  initialData?: Inventory | null;
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
  } = useForm();
  const [productId, setProductId] = useState('');
  const [supplierId, setSupplierId] = useState('');

  const { data: products = [], isLoading: isLoadingProducts } = useQuery(
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
      product_id: productId,
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
      } = initialData;
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
      // eslint-disable-next-line
      setProductId((product_id as any)?._id);
      // eslint-disable-next-line
      setSupplierId((supplier_id as any)?._id);
    }
  }, [initialData]);

  return (
    <Box component={Card} width={'100%'}>
      <Stack component="form" onSubmit={handleSubmit(onSubmit)}>
        <FormControl fullWidth>
          <FormLabel>Arrival Date</FormLabel>
          <Controller
            name="stock_arrival_date"
            control={control}
            rules={{ required: 'Arrival Date is required' }}
            render={({ field: { onChange, ...restField } }) => (
              <DatePicker
                onChange={onChange}
                slots={{
                  textField: (textFieldProps) => (
                    <TextField
                      {...textFieldProps}
                      autoFocus
                      error={Boolean(errors.stock_arrival_date)}
                      helperText={<>{errors.stock_arrival_date?.message}</>}
                    />
                  ),
                }}
                {...restField}
                sx={{
                  '.MuiIconButton-root': {
                    border: 0,
                    width: '38px',
                    height: '38px',
                  },
                }}
              />
            )}
          />
        </FormControl>

        {!initialData?._id && (
          <FormControl fullWidth margin="dense">
            <FormLabel>Product</FormLabel>
            <TextField
              select
              {...register('product_id', {
                required: 'Product is required',
              })}
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                setValue('product_id', e.target.value);
              }}
              placeholder={
                isLoadingProducts ? 'Loading Products...' : 'Select Product'
              }
              variant="outlined"
              fullWidth
              error={Boolean(errors.product_id)}
              helperText={<>{errors.product_id?.message}</>}
            >
              {products.map((s: Product) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.product_name}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>
        )}

        <FormControl fullWidth margin="dense">
          <FormLabel>Expiry Date</FormLabel>
          <Controller
            name="expiry_date"
            control={control}
            rules={{ required: 'Expiry Date is required' }}
            render={({ field: { onChange, ...restField } }) => (
              <DatePicker
                onChange={onChange}
                slots={{
                  textField: (textFieldProps) => (
                    <TextField
                      {...textFieldProps}
                      error={Boolean(errors.expiry_date)}
                      helperText={<>{errors.expiry_date?.message}</>}
                    />
                  ),
                }}
                {...restField}
                sx={{
                  '.MuiIconButton-root': {
                    border: 0,
                    width: '38px',
                    height: '38px',
                  },
                }}
              />
            )}
          />
        </FormControl>

        <FormControl fullWidth margin="dense">
          <FormLabel>Quantity on Order</FormLabel>
          <TextField
            {...register('quantity_on_order', {
              required: 'Quantity on Order is required',
            })}
            type="number"
            placeholder="20"
            variant="outlined"
            fullWidth
            error={Boolean(errors.quantity_on_order)}
            helperText={<>{errors.quantity_on_order?.message}</>}
          />
        </FormControl>

        <FormControl fullWidth margin="dense">
          <FormLabel>Supplier</FormLabel>
          <TextField
            select
            {...register('supplier_id', {
              required: 'Supplier is required',
            })}
            value={supplierId}
            onChange={(e) => {
              setSupplierId(e.target.value);
              setValue('supplier_id', e.target.value);
            }}
            placeholder="Select Supplier"
            variant="outlined"
            fullWidth
            error={Boolean(errors.supplier_id)}
            helperText={<>{errors.supplier_id?.message}</>}
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
            {...register('status', {
              required: 'Status is required',
            })}
            onChange={(e) => {
              setValue('status', e.target.value);
            }}
            defaultValue={'active'}
            variant="outlined"
            placeholder="Select product status"
            fullWidth
            error={Boolean(errors.status)}
            helperText={<>{errors.status?.message}</>}
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
