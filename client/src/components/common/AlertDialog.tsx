import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface IProps {
  open: boolean;
  handleClose: () => void;
  title: string;
  message: string;
  cancelBtnProps: {
    label: string;
    action: () => void;
  };
  proceedBtnProps: {
    label: string;
    action: () => void;
    danger?: boolean;
  };
}

export default function AlertDialog({
  open,
  handleClose,
  title,
  message,
  cancelBtnProps,
  proceedBtnProps,
}: IProps) {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            handleClose();
            cancelBtnProps.action();
          }}
        >
          {cancelBtnProps.label}
        </Button>
        <Button
          onClick={() => {
            handleClose();
            proceedBtnProps.action();
          }}
          autoFocus
          sx={{
            color: proceedBtnProps.danger
              ? 'var(--template-palette-error-main)'
              : undefined,
          }}
        >
          {proceedBtnProps.label}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
