import React, { useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { formatCurrency, getUnitPrice } from '../../../utils/auth';
import { Product } from '../inventory/types';
import SearchBar from '../../common/SearchBar';
import { Close } from '@mui/icons-material';

interface IProps {
  products: Product[];
  customerType: string;
  open: boolean;
  handleClose: () => void;
  onSelectProduct: (p: string) => void;
}

export default function ProductSelector({
  products,
  customerType,
  open,
  handleClose,
  onSelectProduct,
}: IProps) {
  const [searchText, setSearchText] = useState('');

  // eslint-disable-next-line
  const handleRowClick = ({ row }: any) => {
    if (row.total_quantity_on_hand === 0) {
      return;
    }
    onSelectProduct(row._id);
    handleClose();
  };

  const columns: GridColDef<Product>[] = [
    {
      field: 'product_name',
      headerName: 'Product Name',
      minWidth: 300,
      flex: 1,
    },
    {
      field: 'product_description',
      headerName: 'Description',
      minWidth: 150,
      flex: 1,
    },
    {
      field: 'product_unit',
      headerName: 'Unit',
      minWidth: 120,
      flex: 1,
    },
    {
      field: 'unit_price',
      headerName: 'Unit Price',
      minWidth: 100,
      flex: 1,
      headerAlign: 'right',
      align: 'right',
      valueGetter: (_, row) =>
        formatCurrency(getUnitPrice(products, row._id as string, customerType)),
    },
    {
      field: 'total_quantity_on_hand',
      headerName: 'Available Stock',
      flex: 1,
      minWidth: 100,
      align: 'center',
    },
  ];

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
        <DialogTitle>Select Product</DialogTitle>
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
          <SearchBar
            itemName="product"
            searchText={searchText}
            setSearchText={setSearchText}
            fullWidth
          />
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
              rows={
                searchText !== ''
                  ? products?.filter((p) =>
                      p.product_name
                        .toLowerCase()
                        ?.includes(searchText?.toLowerCase()),
                    )
                  : products
              }
              columns={columns}
              getRowId={(row) => row._id || 0}
              getRowClassName={(params) =>
                `${params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'}${' '}${params.row.total_quantity_on_hand === 0 ? 'data-disabled' : ''}`
              }
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
                sorting: {
                  sortModel: [{ field: 'product_name', sort: 'asc' }],
                },
              }}
              onRowClick={handleRowClick}
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
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
