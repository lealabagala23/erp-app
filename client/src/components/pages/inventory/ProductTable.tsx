import React, { Dispatch, SetStateAction, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, IconButton, Menu, MenuItem } from '@mui/material';
import { Product } from './types';
import { DeleteOutline, EditOutlined, MoreHoriz } from '@mui/icons-material';
import { formatCurrency } from '../../../utils/auth';

const COLUMNS: GridColDef<Product>[] = [
  {
    field: 'product_name',
    headerName: 'Product Name',
    minWidth: 300,
    flex: 1,
  },
  {
    field: 'product_description',
    headerName: 'Description',
    flex: 1,
  },
  {
    field: 'product_unit',
    headerName: 'Unit',
    flex: 1,
  },
  {
    field: 'generic_name',
    headerName: 'Generic Name',
    flex: 1,
  },
  {
    field: 'purchase_price',
    headerName: 'Purchase Price',
    flex: 1,
    valueGetter: formatCurrency,
  },
  {
    field: 'patient_price',
    headerName: 'Patient Price',
    flex: 1,
    valueGetter: formatCurrency,
  },
  {
    field: 'doctor_price',
    headerName: 'Doctor Price',
    flex: 1,
    valueGetter: formatCurrency,
  },
  {
    field: 'agency_price',
    headerName: 'Agency Price',
    flex: 1,
    valueGetter: formatCurrency,
  },
  { field: 'barcode', headerName: 'Barcode', flex: 1 },
  {
    field: 'created_at',
    headerName: 'Created at',
    valueGetter: (value, row) =>
      `${new Date(row.created_at || '').toLocaleDateString('en-US')}`,
    flex: 1,
  },
];

interface IProps {
  searchText: string;
  products: Product[];
  isLoading: boolean;
  setSelectedRow: Dispatch<SetStateAction<Product | null>>;
  onActionClick: (action: string) => void;
}

export default function ProductTable({
  searchText,
  isLoading,
  products,
  setSelectedRow,
  onActionClick,
}: IProps) {
  const [anchorEl, setAnchorEl] = useState<
    (EventTarget & HTMLButtonElement) | null
  >(null);

  const columns = [
    ...COLUMNS,
    {
      field: 'actions',
      headerName: '',
      width: 50,
      // eslint-disable-next-line
      renderCell: ({ row }: any) => (
        <IconButton
          onClick={(event) => handleMenuOpen(event, row)}
          sx={{
            width: '30px',
            height: '20px',
            border: 0,
          }}
        >
          <MoreHoriz />
        </IconButton>
      ),
    },
  ];

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    row: unknown,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row as Product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleActionClick = (action: string) => {
    onActionClick(action);
    handleMenuClose();
  };

  return (
    <Box style={{ height: '100%', width: '100%', maxWidth: '1700px' }}>
      <DataGrid
        checkboxSelection={false}
        loading={isLoading}
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
          params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
        }
        initialState={{
          pagination: { paginationModel: { pageSize: 20 } },
          sorting: {
            sortModel: [{ field: 'product_name', sort: 'asc' }],
          },
        }}
        pageSizeOptions={[10, 20, 50]}
        disableColumnResize
        disableRowSelectionOnClick
        density="compact"
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
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleActionClick('Edit')}>
          <EditOutlined sx={{ width: 20, height: 20, marginRight: '8px' }} />{' '}
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => handleActionClick('Delete')}
          sx={{ color: 'var(--template-palette-error-main)' }}
        >
          <DeleteOutline sx={{ width: 20, height: 20, marginRight: '8px' }} />{' '}
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
