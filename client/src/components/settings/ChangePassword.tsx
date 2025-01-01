import {
  AlertColor,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormLabel,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import { FieldError, FieldValues, useForm } from 'react-hook-form';
import { changePassword } from './apis';
import AlertSnackbar from '../common/AlertSnackbar';
import AppNavbar from '../common/AppNavbar';
import PageWrapper from '../wrappers/PageWrapper';
import Header from '../common/Header';
import ErrorMessage from '../common/ErrorMessage';

export default function ChangePassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm();

  const [snackbarProps, setSnackbarProps] = useState<{
    open: boolean;
    message: string;
    type: AlertColor;
  }>({ open: false, message: '', type: 'success' });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutateAsync: mutateUpdatePassword, isLoading } = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setSnackbarProps({
        open: true,
        message: 'Changed password successfully.',
        type: 'success',
      });
      reset();
    },
    // eslint-disable-next-line
    onError: (err: any) => {
      if (err?.response?.data === 'Incorrect password') {
        setErrorMessage('Old password is incorrect');
      }

      setSnackbarProps({
        open: true,
        message: 'Change password was not successful.',
        type: 'error',
      });
    },
  });

  const onSubmit = (data: FieldValues) => {
    mutateUpdatePassword(data as { oldPassword: string; newPassword: string });
    reset();
  };

  const toggleSnackbar = () => {
    setSnackbarProps((v) => ({ open: !v.open, type: 'success', message: '' }));
  };

  return (
    <>
      <AppNavbar title={'Settings'} />
      <PageWrapper>
        <>
          <Header />
          <Stack
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{
              maxWidth: '500px',
              height: '100%',
              justifyContent: 'space-between',
            }}
          >
            <Box padding={2}>
              <FormControl fullWidth error={Boolean(errors.oldPassword)}>
                <FormLabel>Old Password</FormLabel>
                <TextField
                  {...register('oldPassword', {
                    required: 'Old Password is required',
                  })}
                  variant="outlined"
                  fullWidth
                  error={Boolean(errors.oldPassword)}
                  helperText={
                    <ErrorMessage error={errors.oldPassword as FieldError} />
                  }
                  type="password"
                />
              </FormControl>

              <FormControl
                fullWidth
                error={Boolean(errors.oldPassword)}
                margin="normal"
              >
                <FormLabel>New Password</FormLabel>
                <TextField
                  {...register('newPassword', {
                    required: 'New Password is required',
                  })}
                  variant="outlined"
                  fullWidth
                  error={Boolean(errors.newPassword)}
                  helperText={
                    <ErrorMessage error={errors.newPassword as FieldError} />
                  }
                  type="password"
                />
              </FormControl>
              {errorMessage && (
                <Typography color="error">{errorMessage}</Typography>
              )}

              <Tooltip
                title={!isValid ? 'Please fill the required fields' : undefined}
              >
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{
                    width: 100,
                    marginTop: '8px',
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
            </Box>

            <AlertSnackbar
              open={snackbarProps.open}
              type={snackbarProps.type}
              toggleSnackbar={toggleSnackbar}
              message={snackbarProps.message}
            />
          </Stack>
        </>
      </PageWrapper>
    </>
  );
}
