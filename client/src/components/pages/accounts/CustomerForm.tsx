import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  TextField,
  MenuItem,
  Button,
  FormControl,
  FormLabel,
  Box,
  Stack,
  Divider,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Customer, Doctor } from './types';
import pick from 'lodash/pick';
import dayjs from 'dayjs';
import { fetchCustomerType } from './apis';
import { useQuery } from '@tanstack/react-query';

interface IProps {
  onCancel: () => void;
  onFormSubmit: (c: Customer) => void;
  isLoading: boolean;
  initialData: Customer | null;
}

export default function CustomerForm({
  onCancel,
  onFormSubmit,
  isLoading,
  initialData,
}: IProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
    watch,
  } = useForm({
    defaultValues: {
      customer_name: '',
      customer_type: null,
      contact_info: '',
      tin: '',
      address: '',
      date_of_birth: null,
      discount_card: '',
      discount_card_number: '',
      referring_doctor_id: null,
      status: null,
      specialization: '',
      license_number: '',
      clinic_address: '',
      agency_address: '',
      industry_type: '',
      contact_person_name: '',
    },
  });

  const customerType = watch('customer_type');

  const { data: referringDoctors = [] } = useQuery(
    ['fetchReferringDoctors'],
    () =>
      fetchCustomerType({
        customer_type: 'DOCTOR',
      }),
    {
      enabled: true,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );

  useEffect(() => {
    if (initialData) {
      const { customer_details, ...rest } = initialData;
      reset({
        ...customer_details,
        ...rest,
        date_of_birth: dayjs(customer_details.date_of_birth || ''),
      });
    }
  }, [initialData]);

  const onSubmit = (data: unknown) => {
    const payload = pick(data, [
      'customer_name',
      'customer_type',
      'contact_info',
      'tin',
      'address',
    ]);
    const customer_details = pick(data, [
      'date_of_birth',
      'discount_card',
      'discount_card_number',
      'referring_doctor_id',
      'status',
      'specialization',
      'license_number',
      'clinic_address',
      'agency_address',
      'industry_type',
      'contact_person_name',
    ]);
    if (onFormSubmit) {
      onFormSubmit({
        _id: (data as Customer)._id,
        ...payload,
        customer_details,
      } as Customer);
    }
  };

  return (
    <Stack
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{ width: '100%', height: '100%', justifyContent: 'space-between' }}
    >
      <Box padding={2}>
        <FormControl fullWidth margin="none" required>
          <FormLabel>Customer Name</FormLabel>
          <Controller
            name="customer_name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                autoFocus
                variant="outlined"
                placeholder="Enter Name"
              />
            )}
          />
        </FormControl>

        <FormControl fullWidth margin="dense">
          <FormLabel>Contact Info</FormLabel>
          <Controller
            name="contact_info"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                variant="outlined"
                placeholder="Enter Contact Info"
              />
            )}
          />
        </FormControl>

        <FormControl fullWidth margin="dense">
          <FormLabel>TIN</FormLabel>
          <Controller
            name="tin"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                variant="outlined"
                placeholder="Enter TIN"
              />
            )}
          />
        </FormControl>

        <FormControl fullWidth margin="dense">
          <FormLabel>Address</FormLabel>
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                variant="outlined"
                placeholder="Enter Address"
              />
            )}
          />
        </FormControl>

        <FormControl fullWidth margin="dense" required>
          <FormLabel>Customer Type</FormLabel>
          <Controller
            name="customer_type"
            control={control}
            render={({ field }) => (
              <TextField select {...field} variant="outlined">
                <MenuItem value="PATIENT">PATIENT</MenuItem>
                <MenuItem value="DOCTOR">DOCTOR</MenuItem>
                <MenuItem value="AGENCY">AGENCY</MenuItem>
              </TextField>
            )}
          />
        </FormControl>

        {customerType === 'PATIENT' && (
          <>
            <FormControl fullWidth margin="dense">
              <FormLabel>Date of Birth</FormLabel>
              <Controller
                name="date_of_birth"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    slots={{
                      textField: (textFieldProps) => (
                        <TextField {...textFieldProps} />
                      ),
                    }}
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
              <FormLabel>Discount Card</FormLabel>
              <Controller
                name="discount_card"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    variant="outlined"
                    placeholder="Enter Discount Card"
                  />
                )}
              />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <FormLabel>Discount Card Number</FormLabel>
              <Controller
                name="discount_card_number"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    variant="outlined"
                    placeholder="Enter Discount Card Number"
                  />
                )}
              />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <FormLabel>Referring Doctor</FormLabel>
              <Controller
                name="referring_doctor_id"
                control={control}
                render={({ field }) => (
                  <TextField select {...field} variant="outlined">
                    {referringDoctors.map((doc: Doctor) => (
                      <MenuItem
                        // eslint-disable-next-line
                        key={(doc.customer_id as any)?._id}
                        // eslint-disable-next-line
                        value={(doc.customer_id as any)?._id}
                      >
                        {
                          // eslint-disable-next-line
                          (doc.customer_id as any)?.customer_name
                        }
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <FormLabel>Status</FormLabel>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField select {...field} variant="outlined">
                    <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                    <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                  </TextField>
                )}
              />
            </FormControl>
          </>
        )}

        {customerType === 'DOCTOR' && (
          <>
            <FormControl fullWidth margin="dense">
              <FormLabel>Specialization</FormLabel>
              <Controller
                name="specialization"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    variant="outlined"
                    placeholder="Enter Specialization"
                  />
                )}
              />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <FormLabel>License Number</FormLabel>
              <Controller
                name="license_number"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    variant="outlined"
                    placeholder="Enter License Number"
                  />
                )}
              />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <FormLabel>Clinic Address</FormLabel>
              <Controller
                name="clinic_address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    variant="outlined"
                    placeholder="Enter Clinic Address"
                  />
                )}
              />
            </FormControl>
          </>
        )}

        {customerType === 'AGENCY' && (
          <>
            <FormControl fullWidth margin="dense">
              <FormLabel>Agency Address</FormLabel>
              <Controller
                name="agency_address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    variant="outlined"
                    placeholder="Enter Agency Address"
                  />
                )}
              />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <FormLabel>Industry Type</FormLabel>
              <Controller
                name="industry_type"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    variant="outlined"
                    placeholder="Enter Industry Type"
                  />
                )}
              />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <FormLabel>Contact Person Name</FormLabel>
              <Controller
                name="contact_person_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    variant="outlined"
                    placeholder="Enter Contact Person Name"
                  />
                )}
              />
            </FormControl>
          </>
        )}
      </Box>

      <Box>
        <Divider />
        <Stack direction={'row'} gap={2} justifyContent={'center'} padding={2}>
          <Button
            variant="outlined"
            color="primary"
            sx={{ width: 100 }}
            onClick={onCancel}
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
