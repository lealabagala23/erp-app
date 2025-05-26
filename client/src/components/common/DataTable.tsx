import React, { Dispatch, SetStateAction, useState } from 'react';
import { DataGrid, GridColDef, GridSortDirection } from '@mui/x-data-grid';
import { Box, IconButton, Menu, MenuItem } from '@mui/material';
import {
  DeleteOutline,
  EditOutlined,
  MoreHoriz,
  RemoveRedEye,
} from '@mui/icons-material';

interface IProps {
  // eslint-disable-next-line
  columns: GridColDef<any>[];
  searchText: string;
  // eslint-disable-next-line
  data: any[];
  isLoading: boolean;
  // eslint-disable-next-line
  setSelectedRow: Dispatch<SetStateAction<any | null>>;
  // eslint-disable-next-line
  onActionClick: (action: string, row?: any) => void;
  searchAttr: string;
  sortField: string;
  sortDir?: string;
  menuActions?: string[];
}

export default function DataTable({
  columns,
  isLoading,
  data,
  setSelectedRow,
  onActionClick,
  sortField,
  sortDir,
  menuActions = ['Edit', 'Delete'],
}: IProps) {
  const [anchorEl, setAnchorEl] = useState<
    (EventTarget & HTMLButtonElement) | null
  >(null);

  const tableColumns = [
    ...columns,
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
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    // eslint-disable-next-line
    setSelectedRow(row as any);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // eslint-disable-next-line
  const handleActionClick = (action: string, row?: any) => {
    onActionClick(action, row);
    handleMenuClose();
  };

  return (
    <Box style={{ height: '100%', width: '100%', maxWidth: '1700px' }}>
      <DataGrid
        checkboxSelection={false}
        loading={isLoading}
        rows={data}
        columns={tableColumns}
        getRowId={(row) => row._id || 0}
        onRowClick={({ row }) => {
          if (menuActions?.includes('Edit') || menuActions?.includes('View')) {
            setSelectedRow(row);
            handleActionClick(
              menuActions?.includes('Edit') ? 'Edit' : 'View',
              row,
            );
          }
        }}
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
        }
        initialState={{
          pagination: { paginationModel: { pageSize: 20 } },
          sorting: {
            sortModel: [
              {
                field: sortField,
                sort: (sortDir as GridSortDirection) ?? 'asc',
              },
            ],
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
        {menuActions?.includes('View') && (
          <MenuItem onClick={() => handleActionClick('View')}>
            <RemoveRedEye sx={{ width: 20, height: 20, marginRight: '8px' }} />{' '}
            View
          </MenuItem>
        )}
        {menuActions?.includes('Show') && (
          <MenuItem onClick={() => handleActionClick('Show')}>
            <RemoveRedEye sx={{ width: 20, height: 20, marginRight: '8px' }} />{' '}
            Show
          </MenuItem>
        )}
        {menuActions?.includes('Edit') && (
          <MenuItem onClick={() => handleActionClick('Edit')}>
            <EditOutlined sx={{ width: 20, height: 20, marginRight: '8px' }} />{' '}
            Edit
          </MenuItem>
        )}
        {menuActions?.includes('Delete') && (
          <MenuItem
            onClick={() => handleActionClick('Delete')}
            sx={{ color: 'var(--template-palette-error-main)' }}
          >
            <DeleteOutline sx={{ width: 20, height: 20, marginRight: '8px' }} />{' '}
            Delete
          </MenuItem>
        )}
        {menuActions?.includes('Archive') && (
          <MenuItem
            onClick={() => handleActionClick('Archive')}
            sx={{ color: 'var(--template-palette-error-main)' }}
          >
            <DeleteOutline sx={{ width: 20, height: 20, marginRight: '8px' }} />{' '}
            Archive
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}
