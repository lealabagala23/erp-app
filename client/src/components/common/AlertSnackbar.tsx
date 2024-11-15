import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert, { AlertColor } from '@mui/material/Alert';

interface IProps {
  open: boolean;
  toggleSnackbar: () => void;
  message: string;
  type: AlertColor;
}

export default function AlertSnackbar({
  open,
  toggleSnackbar,
  message,
  type,
}: IProps) {
  return (
    <div>
      <Snackbar open={open} autoHideDuration={6000} onClose={toggleSnackbar}>
        <Alert
          onClose={toggleSnackbar}
          severity={type}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
}
