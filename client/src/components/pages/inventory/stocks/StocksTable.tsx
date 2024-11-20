import React, { Dispatch, SetStateAction, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, IconButton, Menu, MenuItem } from '@mui/material';
import { Inventory } from '../types';
import { EditOutlined, MoreHoriz, SearchOutlined } from '@mui/icons-material';

const COLUMNS: GridColDef<Inventory>[] = [
  {
    field: 'stock_arrival_date',
    headerName: 'Arrival Date',
    valueGetter: (value, row) =>
      `${new Date(row.stock_arrival_date || '').toLocaleDateString('en-US')}`,
    flex: 1,
    minWidth: 150,
  },
  {
    field: 'product_name',
    headerName: 'Product Name',
    editable: true,
    minWidth: 300,
    flex: 1,
    // eslint-disable-next-line
    valueGetter: (value, row) => (row as any).product_id.product_name,
  },
  {
    field: 'quantity_on_hand',
    headerName: 'Quantity on Hand',
    minWidth: 150,
    flex: 1,
  },
  {
    field: 'quantity_on_order',
    headerName: 'Quantity on Order',
    minWidth: 150,
    flex: 1,
  },
  {
    field: 'expiry_date',
    headerName: 'Expiry Date',
    valueGetter: (value, row) =>
      `${new Date(row.expiry_date || '').toLocaleDateString('en-US')}`,
    flex: 1,
  },
  {
    field: 'status',
    headerName: 'Status',
    flex: 1,
    valueGetter: (value) => (value as string).toUpperCase(),
  },
  {
    field: 'supplier_id',
    headerName: 'Supplier Name',
    flex: 1,
    // eslint-disable-next-line
    valueGetter: (value, row) => (row as any).supplier_id.supplier_name,
  },
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
  inventory: Inventory[];
  isLoading: boolean;
  setSelectedRow: Dispatch<SetStateAction<Inventory | null>>;
  onActionClick: (action: string) => void;
}

export default function StocksTable({
  searchText,
  isLoading,
  inventory,
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
    setSelectedRow(row as Inventory);
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
            ? inventory?.filter((p) =>
                // eslint-disable-next-line
                (p.product_id as any)?.product_name
                  .toLowerCase()
                  ?.includes(searchText?.toLowerCase()),
              )
            : inventory
        }
        columns={columns}
        getRowId={(row) => row._id || 0}
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
        }
        initialState={{
          pagination: { paginationModel: { pageSize: 20 } },
          sorting: {
            sortModel: [{ field: 'stock_arrival_date', sort: 'desc' }],
          },
        }}
        pageSizeOptions={[10, 20, 50]}
        disableColumnResize
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
        <MenuItem onClick={() => handleActionClick('View Inventory')}>
          <SearchOutlined sx={{ width: 20, height: 20, marginRight: '8px' }} />{' '}
          View Product
        </MenuItem>
      </Menu>
    </Box>
  );
}
