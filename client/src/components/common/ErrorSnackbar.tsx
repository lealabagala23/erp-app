import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface IProps {
  open: boolean;
  toggleSnackbar: () => void;
  message: string;
}

export default function ErrorSnackbar({
  open,
  toggleSnackbar,
  message,
}: IProps) {
  return (
    <div>
      <Snackbar open={open} autoHideDuration={6000} onClose={toggleSnackbar}>
        <Alert
          onClose={toggleSnackbar}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
}
