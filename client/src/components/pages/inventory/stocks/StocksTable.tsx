import React, { Dispatch, SetStateAction, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { Inventory } from '../types';
import {
  CheckOutlined,
  EditOutlined,
  MoreHoriz,
  SearchOutlined,
} from '@mui/icons-material';
import { dateDiffInDays, dateSortComparator } from '../../../../utils/auth';
import dayjs from 'dayjs';

// eslint-disable-next-line
const cellClassName = (params: any) =>
  dateDiffInDays(params.row.expiry_date) < 30 * 6
    ? params.row.status === 'EXPIRED'
      ? 'ack-expired-column'
      : 'expired-column'
    : '';

const COLUMNS: GridColDef<Inventory>[] = [
  {
    field: 'expiry_date',
    headerName: 'Expiry Date',
    valueGetter: (value, row) =>
      `${new Date(row.expiry_date || '').toLocaleDateString('en-US')}`,
    renderCell: ({ row }) => {
      const diffDays = dateDiffInDays(row.expiry_date);
      return (
        <Tooltip
          title={
            diffDays < 0
              ? 'Stock is expired'
              : diffDays < 30 * 6
                ? 'Stock is nearly expired'
                : undefined
          }
        >
          <Typography
            lineHeight={'unset'}
            fontWeight={diffDays < 0 ? 600 : 500}
          >
            {dayjs(row.expiry_date).format('MM/DD/YYYY')}
          </Typography>
        </Tooltip>
      );
    },
    cellClassName,
    sortComparator: dateSortComparator,
    flex: 1,
    minWidth: 150,
  },
  {
    field: 'stock_arrival_date',
    headerName: 'Arrival Date',
    valueGetter: (value, row) =>
      `${new Date(row.stock_arrival_date || '').toLocaleDateString('en-US')}`,
    cellClassName,
    sortComparator: dateSortComparator,
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
    cellClassName,
  },
  {
    field: 'quantity_on_hand',
    headerName: 'Quantity on Hand',
    cellClassName,
    minWidth: 150,
    align: 'center',
    flex: 1,
  },
  {
    field: 'quantity_on_order',
    headerName: 'Quantity on Order',
    cellClassName,
    minWidth: 150,
    align: 'center',
    flex: 1,
  },
  {
    field: 'status',
    headerName: 'Status',
    flex: 1,
    valueGetter: (value) => (value as string).toUpperCase(),
    cellClassName,
  },
  {
    field: 'supplier_id',
    headerName: 'Supplier Name',
    flex: 1,
    // eslint-disable-next-line
    valueGetter: (value, row) => (row as any).supplier_id.supplier_name,
    cellClassName,
  },
  {
    field: 'created_at',
    headerName: 'Created at',
    valueGetter: (value, row) =>
      `${new Date(row.created_at || '').toLocaleDateString('en-US')}`,
    cellClassName,
    flex: 1,
  },
];

interface IProps {
  searchText: string;
  inventory: Inventory[];
  isLoading: boolean;
  selectedRow: Inventory | null;
  setSelectedRow: Dispatch<SetStateAction<Inventory | null>>;
  onActionClick: (action: string) => void;
}

export default function StocksTable({
  searchText,
  isLoading,
  inventory,
  selectedRow,
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

  const isExpired = () => {
    if (!selectedRow?.expiry_date) return false;
    const diffDays = dateDiffInDays(selectedRow?.expiry_date || '');
    return diffDays < 30 * 6;
  };

  return (
    <Box
      style={{
        height: '100%',
        width: '100%',
        maxWidth: '1700px',
      }}
    >
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
            sortModel: [{ field: 'expiry_date', sort: 'desc' }],
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
        {selectedRow?.status !== 'EXPIRED' && isExpired() && (
          <MenuItem onClick={() => handleActionClick('Acknowledge')}>
            <CheckOutlined sx={{ width: 20, height: 20, marginRight: '8px' }} />{' '}
            Acknowledge Expiry
          </MenuItem>
        )}
        <MenuItem onClick={() => handleActionClick('Edit')}>
          <EditOutlined sx={{ width: 20, height: 20, marginRight: '8px' }} />{' '}
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleActionClick('View')}>
          <SearchOutlined sx={{ width: 20, height: 20, marginRight: '8px' }} />{' '}
          View Product
        </MenuItem>
      </Menu>
    </Box>
  );
}
