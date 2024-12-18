import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { AddCircleOutline, Close } from '@mui/icons-material';
import { Payment } from './types';
import { formatCurrency, formatEmptyString } from '../../../utils/auth';
import dayjs from 'dayjs';

interface IProps {
  payments: Payment[];
  open: boolean;
  handleClose: () => void;
  onAddPayment: () => void;
}

export default function PaymentsList({
  payments,
  open,
  handleClose,
  onAddPayment,
}: IProps) {
  const columns: GridColDef<Payment>[] = [
    {
      field: 'payment_date',
      headerName: 'Payment Date',
      flex: 1,
      valueFormatter: (value) => dayjs(value).format('MM/DD/YYYY'),
    },
    {
      field: 'amount_paid',
      headerName: 'Amount',
      flex: 1,
      valueFormatter: formatCurrency,
    },
    {
      field: 'payment_method',
      headerName: 'Payment Method',
      flex: 1,
      valueFormatter: (value: string) => (value || '')?.toUpperCase(),
    },
    {
      field: 'bank_name',
      headerName: 'Bank Name',
      flex: 1,
      valueFormatter: formatEmptyString,
    },
    {
      field: 'trans_ref_no',
      headerName: 'Trans. Ref.',
      flex: 1,
      valueFormatter: formatEmptyString,
    },
    {
      field: 'collection_receipt_no',
      headerName: 'Collect. Receipt No.',
      flex: 1,
      valueFormatter: formatEmptyString,
    },
  ];

  const getTotal = () =>
    (payments || []).reduce((accum, o) => accum + o.amount_paid, 0) || 0;

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md" // Options: 'xs', 'sm', 'md', 'lg', 'xl'
        fullWidth // Ensures the dialog takes up full width of `maxWidth`
        PaperProps={{
          style: {
            minHeight: '600px', // Set custom height
          },
        }}
      >
        <DialogTitle>Payments List</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
            border: 0,
          })}
        >
          <Close />
        </IconButton>
        <DialogContent sx={{ paddingTop: '3px !important' }}>
          <Box
            style={{
              height: '100%',
              width: '100%',
              maxWidth: '1700px',
              marginTop: '16px',
            }}
          >
            <DataGrid
              checkboxSelection={false}
              rows={payments}
              columns={columns}
              getRowId={(row) => row._id || 0}
              getRowClassName={(params) =>
                params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
              }
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
                sorting: {
                  sortModel: [{ field: 'payment_date', sort: 'asc' }],
                },
              }}
              pageSizeOptions={[10, 20, 50]}
              disableColumnResize
              density="compact"
              sx={{
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'var(--template-palette-info-light)',
                  cursor: 'pointer',
                },
                '& .MuiDataGrid-row.data-disabled': {
                  pointerEvents: 'none',
                  backgroundColor: 'var(--template-palette-grey-100)',
                  color: '#9e9e9e',
                },
              }}
              slotProps={{
                loadingOverlay: {
                  variant: 'skeleton',
                  noRowsVariant: 'skeleton',
                },
                filterPanel: {
                  filterFormProps: {
                    logicOperatorInputProps: {
                      variant: 'outlined',
                      size: 'small',
                    },
                    columnInputProps: {
                      variant: 'outlined',
                      size: 'small',
                      sx: { mt: 'auto' },
                    },
                    operatorInputProps: {
                      variant: 'outlined',
                      size: 'small',
                      sx: { mt: 'auto' },
                    },
                    valueInputProps: {
                      InputComponentProps: {
                        variant: 'outlined',
                        size: 'small',
                      },
                    },
                  },
                },
              }}
            />
            <Stack
              direction="row"
              gap={4}
              padding={1}
              justifyContent={'flex-end'}
            >
              <Typography variant={'h6'}>Total Payment:</Typography>
              <Typography variant={'h6'}>
                {formatCurrency(getTotal())}
              </Typography>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onAddPayment}
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutline />}
          >
            Add Payment
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
