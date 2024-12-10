import { DeleteOutlineRounded } from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  DataGrid,
  GridCellModes,
  GridCellModesModel,
  GridCellParams,
  GridColDef,
} from '@mui/x-data-grid';
import React from 'react';
import { TableItem } from './types';
import { formatCurrency } from '../../../utils/auth';
import { Product } from '../inventory/types';

interface IProps {
  products: Product[];
  orderItems: TableItem[];
  addOrderItem: () => void;
  updateOrderItem: (t: TableItem) => void;
  deleteOrderItem: (t: TableItem) => void;
  clearAllOrderItems: () => void;
  customerType?: string;
  getUnitPrice: (s: string) => number;
  subtotal: number;
  disabled?: boolean;
}

export default function ItemTable({
  products,
  orderItems,
  addOrderItem,
  updateOrderItem,
  deleteOrderItem,
  clearAllOrderItems,
  customerType,
  getUnitPrice,
  subtotal,
  disabled,
}: IProps) {
  const [cellModesModel, setCellModesModel] =
    React.useState<GridCellModesModel>({});

  const handleCellClick = React.useCallback(
    (params: GridCellParams, event: React.MouseEvent) => {
      if (!params.isEditable) {
        return;
      }

      // Ignore portal
      if (
        // eslint-disable-next-line
        (event.target as any).nodeType === 1 &&
        !event.currentTarget.contains(event.target as Element)
      ) {
        return;
      }

      setCellModesModel((prevModel) => {
        return {
          // Revert the mode of the other cells from other rows
          ...Object.keys(prevModel).reduce(
            (acc, id) => ({
              ...acc,
              [id]: Object.keys(prevModel[id]).reduce(
                (acc2, field) => ({
                  ...acc2,
                  [field]: { mode: GridCellModes.View },
                }),
                {},
              ),
            }),
            {},
          ),
          [params.id]: {
            // Revert the mode of other cells in the same row
            ...Object.keys(prevModel[params.id] || {}).reduce(
              (acc, field) => ({
                ...acc,
                [field]: { mode: GridCellModes.View },
              }),
              {},
            ),
            [params.field]: { mode: GridCellModes.Edit },
          },
        };
      });
    },
    [],
  );

  const handleCellModesModelChange = React.useCallback(
    (newModel: GridCellModesModel) => {
      setCellModesModel(newModel);
    },
    [],
  );

  const renderPriceCell = (tooltipMsg: string, value: number) => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: '100%',
        cursor: 'not-allowed',
      }}
    >
      <Tooltip title={tooltipMsg}>
        <Typography
          fontWeight={'bold'}
          color={'var(--template-palette-grey-500)'}
        >
          {formatCurrency(value)}
        </Typography>
      </Tooltip>
    </Box>
  );

  const tableColumns: GridColDef<TableItem>[] = [
    {
      field: 'item_number',
      headerName: '#',
      align: 'right',
      headerAlign: 'right',
      width: 50,
    },
    {
      field: 'product_id',
      headerName: 'Product',
      flex: 1,
      valueOptions: products.map(({ product_name, _id }) => ({
        label: product_name,
        value: _id,
      })),
      // eslint-disable-next-line
      getOptionLabel: (option: any) => option.label, // Map object to its label
      // eslint-disable-next-line
      getOptionValue: (option: any) => option.value, // Map object to its value
      editable: true,
      type: 'singleSelect',
      cellClassName: 'editable-cell',
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      valueGetter: (_, row) =>
        products.find(({ _id }) => _id === row.product_id)?.product_description,
    },
    {
      field: 'unit',
      headerName: 'Unit',
      flex: 1,
      valueGetter: (_, row) =>
        products.find(({ _id }) => _id === row.product_id)?.product_unit,
    },
    {
      field: 'quantity',
      headerName: 'Qty',
      width: 100,
      align: 'right',
      headerAlign: 'right',
      editable: true,
      type: 'singleSelect',
      valueOptions: Array.from({ length: 20 }, (_, i) => i + 1),
      cellClassName: 'editable-cell',
    },
    {
      field: 'unit_price',
      headerName: 'Unit Price',
      flex: 1,
      align: 'right',
      headerAlign: 'right',
      // eslint-disable-next-line
      renderCell: ({ row }: any) =>
        renderPriceCell(
          `This is the ${customerType || ''} price set on Products page`,
          getUnitPrice(row.product_id),
        ),
    },
    {
      field: 'custom_discount',
      headerName: 'Custom Discount',
      flex: 1,
      align: 'right',
      headerAlign: 'right',
      editable: true,
      type: 'number',
      valueFormatter: (value) => (value === 0 ? '-' : `${value}%`),
      cellClassName: 'editable-cell',
    },
    {
      field: 'total_price',
      headerName: 'Total Price',
      flex: 1,
      align: 'right',
      headerAlign: 'right',
      // eslint-disable-next-line
      renderCell: ({ row }: any) => {
        const totalPrice = getUnitPrice(row.product_id) * row.quantity;
        return renderPriceCell(
          'Unit Price x Quantity',
          totalPrice - totalPrice * ((row.custom_discount || 0) / 100),
        );
      },
    },
    {
      field: 'actions',
      headerName: '',
      width: 50,
      // eslint-disable-next-line
      renderCell: ({ row }: any) => (
        <Stack
          direction="row"
          gap={1}
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <IconButton
            onClick={() => deleteOrderItem(row)}
            sx={{
              width: '30px',
              height: '20px',
              border: 0,
            }}
            disabled={disabled}
          >
            <DeleteOutlineRounded />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box
      sx={{
        '.editable-cell': {
          cursor: disabled ? 'not-allowed' : 'pointer',
          pointerEvents: disabled ? 'none' : undefined,
          background: 'var(--template-palette-primary-light)',
        },
      }}
    >
      <DataGrid
        disableRowSelectionOnClick={disabled}
        checkboxSelection={false}
        loading={false}
        rows={orderItems}
        columns={tableColumns}
        cellModesModel={cellModesModel}
        onCellModesModelChange={handleCellModesModelChange}
        onCellClick={handleCellClick}
        getRowId={(row: TableItem) => row.item_number || 0}
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
        }
        processRowUpdate={(newRow) => {
          // Update logic for inline editing
          console.log('new row', newRow);
          updateOrderItem(newRow);
          return { ...newRow };
        }}
        rowHeight={75}
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
      <Stack direction="row" marginTop={'8px'} justifyContent={'space-between'}>
        <Stack direction="row" gap={1}>
          <Button
            variant="outlined"
            size="small"
            onClick={addOrderItem}
            disabled={disabled}
          >
            Add lines
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={clearAllOrderItems}
            disabled={disabled}
          >
            Clear all lines
          </Button>
        </Stack>
        <Stack direction="row" gap={4} padding={1}>
          <Typography variant={'h6'}>Total Sales</Typography>
          <Typography variant={'h6'}>{formatCurrency(subtotal)}</Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
