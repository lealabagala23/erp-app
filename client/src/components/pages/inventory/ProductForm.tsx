import React, { useEffect, useState } from 'react';
import { FieldError, useForm } from 'react-hook-form';
import {
  Button,
  TextField,
  FormControl,
  FormLabel,
  Box,
  Stack,
  Divider,
  Typography,
  MenuItem,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { Product } from './types';
import ErrorMessage from '../../common/ErrorMessage';

const PRODUCT_UNIT_OPTIONS = [
  'AMPULE',
  'CAPSULE',
  'CAPSULE/BOTTLE',
  'CAPSULE/BOX',
  'TABLET',
  'TABLET/BOX',
  'TABLET/BOTTLE',
  'VIAL',
];

interface IProps {
  onFormSubmit: (d: Product) => void;
  isLoading: boolean;
  initialData: Product | null;
  onCancel: () => void;
}

export default function ProductForm({
  onFormSubmit,
  isLoading,
  initialData,
  onCancel,
}: IProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
  } = useForm();
  const [prodUnit, setProdUnit] = useState('');

  const onSubmit = (data: unknown) => {
    onFormSubmit(data as Product);
    reset();
  };

  const handleCancel = () => {
    onCancel();
  };

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setProdUnit(initialData.product_unit);
      setValue('product_unit', initialData.product_unit);
    }
  }, [initialData]);

  return (
    <Stack
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{ width: '100%', height: '100%', justifyContent: 'space-between' }}
    >
      <Box padding={2}>
        <FormControl
          fullWidth
          margin="dense"
          error={Boolean(errors.product_name)}
          required
        >
          <FormLabel>Product Name</FormLabel>
          <TextField
            {...register('product_name', {
              required: 'Product Name is required',
            })}
            variant="outlined"
            fullWidth
            error={Boolean(errors.product_name)}
            helperText={
              <ErrorMessage error={errors.product_name as FieldError} />
            }
          />
        </FormControl>

        <FormControl
          fullWidth
          margin="dense"
          error={Boolean(errors.product_description)}
          required
        >
          <FormLabel>Product Description</FormLabel>
          <TextField
            {...register('product_description', {
              required: 'Product Description is required',
            })}
            variant="outlined"
            fullWidth
            error={Boolean(errors.product_description)}
            helperText={
              <ErrorMessage error={errors.product_description as FieldError} />
            }
          />
        </FormControl>

        <FormControl
          fullWidth
          margin="dense"
          error={Boolean(errors.product_unit)}
          required
        >
          <FormLabel>Product Unit</FormLabel>
          <TextField
            select
            value={prodUnit}
            onChange={(e) => {
              setProdUnit(e.target.value);
              setValue('product_unit', e.target.value);
            }}
            variant="outlined"
            fullWidth
            error={Boolean(errors.product_unit)}
            helperText={
              <ErrorMessage error={errors.product_unit as FieldError} />
            }
          >
            {PRODUCT_UNIT_OPTIONS.map((unit) => (
              <MenuItem key={unit} value={unit}>
                {unit}
              </MenuItem>
            ))}
          </TextField>
        </FormControl>

        <FormControl
          fullWidth
          margin="dense"
          error={Boolean(errors.generic_name)}
          required
        >
          <FormLabel>Generic Name</FormLabel>
          <TextField
            {...register('generic_name', {
              required: 'Generic Name is required',
            })}
            variant="outlined"
            fullWidth
            error={Boolean(errors.generic_name)}
            helperText={
              <ErrorMessage error={errors.generic_name as FieldError} />
            }
          />
        </FormControl>

        <FormControl
          fullWidth
          margin="dense"
          error={Boolean(errors.purchase_price)}
          required
        >
          <FormLabel>Purchase Price</FormLabel>
          <TextField
            {...register('purchase_price', {
              required: 'Purchase Price must be a number',
            })}
            variant="outlined"
            fullWidth
            type="number"
            error={Boolean(errors.purchase_price)}
            helperText={
              <ErrorMessage error={errors.purchase_price as FieldError} />
            }
          />
        </FormControl>

        <FormControl
          fullWidth
          margin="dense"
          error={Boolean(errors.unit_price)}
          required
        >
          <FormLabel>Unit Price</FormLabel>
          <TextField
            {...register('unit_price', {
              required: 'Unit Price must be a number',
            })}
            variant="outlined"
            fullWidth
            type="number"
            error={Boolean(errors.unit_price)}
            helperText={
              <ErrorMessage error={errors.unit_price as FieldError} />
            }
          />
        </FormControl>

        <FormControl fullWidth margin="dense" error={Boolean(errors.barcode)}>
          <FormLabel>Barcode</FormLabel>
          <TextField
            {...register('barcode')}
            variant="outlined"
            fullWidth
            error={Boolean(errors.barcode)}
            helperText={<ErrorMessage error={errors.barcode as FieldError} />}
          />
        </FormControl>
        <Typography variant="caption" color="textSecondary">
          * Required Fields
        </Typography>
      </Box>
      <Box>
        <Divider />
        <Stack direction={'row'} gap={2} justifyContent={'center'} padding={2}>
          <Button
            variant="outlined"
            color="primary"
            sx={{ width: 100 }}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Tooltip
            title={!isValid ? 'Please fill the required fields' : undefined}
          >
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{
                width: 100,
              }}
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
      </Box>
    </Stack>
  );
}
