import React from 'react';
import { useForm } from 'react-hook-form';
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
}

export default function ProductForm({ onFormSubmit, isLoading }: IProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm();

  const onSubmit = (data: unknown) => {
    console.log('Form Data:', data);
    onFormSubmit(data as Product);
    reset();
  };

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
            helperText={<>{errors.product_name?.message}</>}
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
            helperText={<>{errors.product_description?.message}</>}
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
            {...register('product_unit', {
              required: 'Product Unit is required',
            })}
            select
            variant="outlined"
            fullWidth
            error={Boolean(errors.product_unit)}
            helperText={<>{errors.product_unit?.message}</>}
          >
            {PRODUCT_UNIT_OPTIONS.map((unit, key) => (
              <MenuItem key={`unit-${key}`} value={unit}>
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
            helperText={<>{errors.generic_name?.message}</>}
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
            helperText={<>{errors.purchase_price?.message}</>}
          />
        </FormControl>

        <FormControl
          fullWidth
          margin="dense"
          error={Boolean(errors.patient_price)}
          required
        >
          <FormLabel>Patient Price</FormLabel>
          <TextField
            {...register('patient_price', {
              required: 'Patient Price must be a number',
            })}
            variant="outlined"
            fullWidth
            type="number"
            error={Boolean(errors.patient_price)}
            helperText={<>{errors.patient_price?.message}</>}
          />
        </FormControl>

        <FormControl
          fullWidth
          margin="dense"
          error={Boolean(errors.doctor_price)}
          required
        >
          <FormLabel>Doctor Price</FormLabel>
          <TextField
            {...register('doctor_price', {
              required: 'Doctor Price must be a number',
            })}
            variant="outlined"
            fullWidth
            type="number"
            error={Boolean(errors.doctor_price)}
            helperText={<>{errors.doctor_price?.message}</>}
          />
        </FormControl>

        <FormControl
          fullWidth
          margin="dense"
          error={Boolean(errors.agency_price)}
          required
        >
          <FormLabel>Agency Price</FormLabel>
          <TextField
            {...register('agency_price', {
              required: 'Agency Price must be a number',
            })}
            variant="outlined"
            fullWidth
            type="number"
            error={Boolean(errors.agency_price)}
            helperText={<>{errors.agency_price?.message}</>}
          />
        </FormControl>

        <FormControl fullWidth margin="dense" error={Boolean(errors.barcode)}>
          <FormLabel>Barcode</FormLabel>
          <TextField
            {...register('barcode')}
            variant="outlined"
            fullWidth
            error={Boolean(errors.barcode)}
            helperText={<>{errors.barcode?.message}</>}
          />
        </FormControl>
        <Typography variant="caption" color="textSecondary">
          * Required Fields
        </Typography>
      </Box>
      <Box>
        <Divider />
        <Stack direction={'row'} gap={2} justifyContent={'center'} padding={2}>
          <Button variant="outlined" color="primary" sx={{ width: 100 }}>
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
