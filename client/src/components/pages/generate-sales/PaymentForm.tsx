import React from 'react';
import { useForm, Controller, FieldError } from 'react-hook-form';
import {
  TextField,
  MenuItem,
  Button,
  Grid2 as Grid,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  FormLabel,
  FormControl,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Payment } from './types';
import dayjs from 'dayjs';
import ErrorMessage from '../../common/ErrorMessage';

interface IProps {
  open: boolean;
  handleClose: () => void;
  onPaymentSubmit: (p: Payment) => void;
  isLoading: boolean;
}

const PaymentForm = ({
  open,
  handleClose,
  onPaymentSubmit,
  isLoading,
}: IProps) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm();

  // eslint-disable-next-line
  const onSubmit = (data: any) => {
    onPaymentSubmit(data);
    handleClose();
    reset();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Payment</DialogTitle>
      <DialogContent>
        <Box mt={2} component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            {/* Payment Date */}
            <Grid size={12}>
              <FormControl>
                <FormLabel>Payment Date</FormLabel>
                <Controller
                  name="payment_date"
                  control={control}
                  defaultValue={dayjs()}
                  rules={{ required: 'Payment Date is required' }}
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
            </Grid>

            {/* Amount Paid */}
            <Grid size={6}>
              <FormLabel>Amount Paid</FormLabel>
              <Controller
                name="amount_paid"
                control={control}
                rules={{
                  required: 'Amount paid is required',
                  pattern: {
                    value: /^[0-9]+(\.[0-9]{1,2})?$/,
                    message: 'Enter a valid amount',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">Php</InputAdornment>
                        ),
                      },
                    }}
                    error={!!errors.amount_paid}
                    helperText={
                      <ErrorMessage error={errors.amount_paid as FieldError} />
                    }
                  />
                )}
              />
            </Grid>

            {/* Payment Method */}
            <Grid size={6}>
              <FormLabel>Payment Method</FormLabel>
              <Controller
                name="payment_method"
                control={control}
                rules={{ required: 'Payment method is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    error={!!errors.payment_method}
                    helperText={
                      <ErrorMessage
                        error={errors.payment_method as FieldError}
                      />
                    }
                  >
                    <MenuItem value="cash">CASH</MenuItem>
                    <MenuItem value="check">CHECK</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            {/* Bank Name */}
            <Grid size={6}>
              <FormLabel>Bank Name</FormLabel>
              <Controller
                name="bank_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    error={!!errors.bank_name}
                    helperText={
                      <ErrorMessage error={errors.bank_name as FieldError} />
                    }
                  />
                )}
              />
            </Grid>

            {/* Transaction Reference Number */}
            <Grid size={6}>
              <FormLabel>Transaction Reference No.</FormLabel>
              <Controller
                name="trans_ref_no"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    error={!!errors.trans_ref_no}
                    helperText={
                      <ErrorMessage error={errors.trans_ref_no as FieldError} />
                    }
                  />
                )}
              />
            </Grid>

            {/* Collection Receipt Number */}
            <Grid size={12}>
              <FormLabel>Collection Receipt No.</FormLabel>
              <Controller
                name="collection_receipt_no"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    error={!!errors.collection_receipt_no}
                    helperText={
                      <ErrorMessage
                        error={errors.collection_receipt_no as FieldError}
                      />
                    }
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          color="primary"
          endIcon={
            isLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : undefined
          }
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentForm;
