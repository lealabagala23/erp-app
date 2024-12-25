import React from 'react';
import { useForm, Controller } from 'react-hook-form';
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
} from '@mui/material';
import { Doctor, Referrer } from '../accounts/types';

interface IProps {
  open: boolean;
  handleClose: () => void;
  onReferrerSubmit: (p: Referrer) => void;
  isLoading: boolean;
  doctors: Doctor[];
}

const ReferrerForm = ({
  open,
  handleClose,
  onReferrerSubmit,
  isLoading,
  doctors,
}: IProps) => {
  const { handleSubmit, control, reset } = useForm();

  // eslint-disable-next-line
  const onSubmit = (data: any) => {
    onReferrerSubmit(data);
    handleClose();
    reset();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Referrer</DialogTitle>
      <DialogContent>
        <Box mt={2} component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <FormLabel>Referrer Name</FormLabel>
              <Controller
                name="referrer_name"
                control={control}
                render={({ field }) => <TextField {...field} fullWidth />}
              />
            </Grid>

            <Grid size={6}>
              <FormLabel>Associated Doctor</FormLabel>
              <Controller
                name="doctor_id"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth select>
                    {doctors.map((d) => (
                      <MenuItem value={d._id} key={d._id}>
                        {/* eslint-disable-next-line */}
                        {(d.customer_id as any)?.customer_name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={12}>
              <FormLabel>Contact Info</FormLabel>
              <Controller
                name="contact_info"
                control={control}
                render={({ field }) => <TextField {...field} fullWidth />}
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

export default ReferrerForm;
