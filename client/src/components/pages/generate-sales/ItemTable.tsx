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
import React, { useContext, useState } from 'react';
import { TableItem } from './types';
import { formatCurrency, getUnitPrice } from '../../../utils/auth';
import { Product } from '../inventory/types';
import ProductSelector from './ProductSelector';
import AuthContext from '../../auth/AuthContext';

interface IProps {
  products: Product[];
  orderItems: TableItem[];
  addOrderItem: () => void;
  updateOrderItem: (t: TableItem) => void;
  deleteOrderItem: (t: TableItem) => void;
  clearAllOrderItems: () => void;
  customerType?: string;
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
  subtotal,
  disabled,
}: IProps) {
  const { activeCompany } = useContext(AuthContext);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState<TableItem | null>(null);
  const [cellModesModel, setCellModesModel] =
    React.useState<GridCellModesModel>({});

  const handleCloseDialog = () => setOpenDialog(false);

  const handleCellClick = React.useCallback(
    (params: GridCellParams, event: React.MouseEvent) => {
      if (params.field === 'product_id') {
        setOpenDialog(true);
        setSelectedRow(params.row);
        return;
      }

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

  const formatTableItem = (item: TableItem) => {
    const { product_id, quantity } = item;

    if (!product_id) return item;

    const unit_price = getUnitPrice(
      products,
      product_id,
      customerType as string,
    );

    return {
      ...item,
      unit_price,
      total_price: unit_price * quantity,
    };
  };

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
      cellClassName: 'editable-cell',
      valueGetter: (_, row) =>
        products.find(({ _id }) => _id === row.product_id)?.product_name,
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
      type: 'number',
      preProcessEditCellProps: (params) => {
        const value = params.props.value;
        const qtyOnHand =
          products.find(({ _id }) => _id === params.row.product_id)
            ?.total_quantity_on_hand || {};

        const stockCount =
          // eslint-disable-next-line
          (qtyOnHand as any)[activeCompany?._id as string] || 0;

        const isValid = value <= stockCount;

        if (stockCount === 0) {
          alert(`This product is out of stock.`);
        } else if (!isValid) {
          alert(
            `Quantity must be lower than the remaining stock count (${stockCount})`,
          );
        }

        return {
          ...params.props,
          error: !isValid,
        };
      },
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
          row.unit_price,
        ),
    },
    {
      field: 'total_price',
      headerName: 'Total Price',
      flex: 1,
      align: 'right',
      headerAlign: 'right',
      // eslint-disable-next-line
      renderCell: ({ row }: any) => {
        return renderPriceCell('Unit Price x Quantity', row.total_price);
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
        '.MuiInputBase-root.Mui-error': {
          border: '2px solid var(--template-palette-error-main)',
        },
      }}
    >
      <DataGrid
        disableRowSelectionOnClick={disabled}
        checkboxSelection={false}
        loading={false}
        editMode="cell"
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
          const updatedRow = formatTableItem(newRow);
          updateOrderItem(updatedRow);
          return { ...updatedRow };
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
      <ProductSelector
        products={products}
        customerType={customerType as string}
        open={openDialog}
        handleClose={handleCloseDialog}
        onSelectProduct={(product_id: string) => {
          const newRow = formatTableItem({
            ...(selectedRow as TableItem),
            product_id,
          });
          updateOrderItem(newRow);
        }}
      />
    </Box>
  );
}
