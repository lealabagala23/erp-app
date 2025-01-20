import React, { Dispatch, SetStateAction, useContext, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, IconButton, Menu, MenuItem } from '@mui/material';
import { Product } from './types';
import { DeleteOutline, EditOutlined, MoreHoriz } from '@mui/icons-material';
import { formatCurrency } from '../../../utils/auth';
import AuthContext from '../../auth/AuthContext';
import toLower from 'lodash/toLower';

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
  const { activeCompany } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState<
    (EventTarget & HTMLButtonElement) | null
  >(null);

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
      field: 'unit_price',
      headerName: 'Unit Price',
      flex: 1,
      valueGetter: formatCurrency,
    },
    {
      field: 'total_quantity_on_hand',
      headerName: 'Available Stock',
      flex: 1,
      valueGetter: (_, row) =>
        row.total_quantity_on_hand[activeCompany?._id as string] || 0,
    },
    {
      field: 'created_at',
      headerName: 'Created at',
      valueGetter: (value, row) =>
        `${new Date(row.created_at || '').toLocaleDateString('en-US')}`,
      flex: 1,
    },
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
                toLower(p.product_name).includes(toLower(searchText)),
              )
            : products
        }
        onRowClick={({ row }) => {
          setSelectedRow(row);
          handleActionClick('Edit');
        }}
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
