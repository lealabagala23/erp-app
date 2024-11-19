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
import React, { useContext } from 'react';
import { Controller, useForm } from 'react-hook-form';
import AuthContext from '../../auth/AuthContext';
import { Inventory } from './types';

interface IProps {
  onFormSubmit: (d: Inventory) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export default function AddInventoryForm({
  onFormSubmit,
  isLoading,
  onCancel,
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

  const onSubmit = (data: unknown) => {
    onFormSubmit(data as Inventory);
    reset();
  };

  return (
    <Box component={Card} marginTop="8px">
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
            onChange={(e) => {
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
