import React, { useContext, useState } from 'react';
import {
  DataGrid,
  GridColDef,
  GridEventListener,
  GridRowClassNameParams,
  GridRowIdGetter,
  GridSortingInitialState,
} from '@mui/x-data-grid';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { formatCurrency, getUnitPrice } from '../../../utils/auth';
import { Inventory, Product } from '../inventory/types';
import SearchBar from '../../common/SearchBar';
import { Close } from '@mui/icons-material';
import AuthContext from '../../auth/AuthContext';
import toLower from 'lodash/toLower';
import dayjs from 'dayjs';
import { toUpper } from 'lodash';

interface IProps {
  products: Product[];
  open: boolean;
  handleClose: () => void;
  onSelectProduct: (p: string, s: string) => void;
}

interface ISelectProps {
  // eslint-disable-next-line
  rows: readonly any[];
  // eslint-disable-next-line
  columns: readonly GridColDef<any>[];
  onRowClick: GridEventListener<'rowClick'>;
  sorting?: GridSortingInitialState;
  // eslint-disable-next-line
  getRowClassName?: (params: GridRowClassNameParams<any>) => string;
  // eslint-disable-next-line
  getRowId?: GridRowIdGetter<any>;
}

const SelectionDataGrid = ({
  rows,
  columns,
  onRowClick,
  sorting,
  getRowClassName,
  getRowId,
}: ISelectProps) => (
  <DataGrid
    checkboxSelection={false}
    rows={rows}
    columns={columns}
    getRowId={getRowId}
    getRowClassName={getRowClassName}
    initialState={{
      // pagination: { paginationModel: { pageSize: 10 } },
      sorting,
    }}
    onRowClick={onRowClick}
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
);

export default function ProductSelector({
  products,
  open,
  handleClose,
  onSelectProduct,
}: IProps) {
  const { activeCompany } = useContext(AuthContext);
  const [searchText, setSearchText] = useState('');
  const [selectedProd, setSelectedProd] = useState<Product | null>(null);
  const [stocksList, setStocksList] = useState<Inventory[] | null>(null);

  // eslint-disable-next-line
  const handleRowClick = ({ row }: any) => {
    if (
      !row.total_quantity_on_hand[activeCompany?._id as string] ||
      row.total_quantity_on_hand[activeCompany?._id as string] === 0
    ) {
      return;
    }

    setSelectedProd(row);
    setStocksList((row.stocks || {})[activeCompany?._id as string] || []);
  };

  // eslint-disable-next-line
  const handleStockRowClick = ({ row }: any) => {
    onSelectProduct(row.product_id, row._id);
    onClose();
  };

  const onClose = () => {
    setSelectedProd(null);
    setStocksList(null);
    handleClose();
  };

  // eslint-disable-next-line
  const stockColumns: GridColDef<any>[] = [
    {
      field: 'batch_number',
      headerName: 'Batch No.',
      minWidth: 150,
      flex: 1,
      valueFormatter: (value) => value || 'N/A',
    },
    {
      field: 'expiry_date',
      headerName: 'Expiry Date',
      minWidth: 150,
      flex: 1,
      valueFormatter: (value) => dayjs(value).format('MM-DD-YYYY'),
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      flex: 1,
      valueFormatter: (value) => toUpper(value),
    },
    {
      field: 'quantity_on_hand',
      headerName: 'Quantity',
      minWidth: 120,
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
  ];

  // eslint-disable-next-line
  const columns: GridColDef<any>[] = [
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
        formatCurrency(getUnitPrice(products, row._id as string)),
    },
    {
      field: 'total_quantity_on_hand',
      headerName: 'Available Stock',
      flex: 1,
      minWidth: 100,
      align: 'center',
      valueGetter: (_, row) =>
        // eslint-disable-next-line
        (row as any).total_quantity_on_hand[activeCompany?._id as string] || 0,
    },
  ];

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md" // Options: 'xs', 'sm', 'md', 'lg', 'xl'
        fullWidth // Ensures the dialog takes up full width of `maxWidth`
        PaperProps={{
          style: {
            minHeight: '600px', // Set custom height
          },
        }}
      >
        <DialogTitle>
          Select{' '}
          {selectedProd
            ? `from ${selectedProd.generic_name} ${selectedProd.product_description} ${selectedProd.product_unit} Inventory`
            : 'Product'}
        </DialogTitle>
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

        {selectedProd ? (
          <DialogContent sx={{ paddingTop: '3px !important' }}>
            <SelectionDataGrid
              // eslint-disable-next-line
              rows={stocksList as readonly any[]}
              columns={stockColumns}
              onRowClick={handleStockRowClick}
              // eslint-disable-next-line
              getRowClassName={(params: any) => {
                console.log('params', params);
                // eslint-disable-next-line
                return `${params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'}${' '}${(params.row as any).status === 'EXPIRED' ? 'data-disabled' : ''}`;
              }}
              getRowId={(row) => row?._id || 0}
            />
          </DialogContent>
        ) : (
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
              <SelectionDataGrid
                rows={
                  searchText !== ''
                    ? products?.filter((p) =>
                        toLower(p.product_name).includes(toLower(searchText)),
                      )
                    : products
                }
                columns={columns}
                onRowClick={handleRowClick}
                sorting={{
                  sortModel: [{ field: 'product_name', sort: 'asc' }],
                }}
                // eslint-disable-next-line
                getRowClassName={(params: any) =>
                  // eslint-disable-next-line
                  `${params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'}${' '}${!(params.row as any).total_quantity_on_hand[activeCompany?._id as string] ? 'data-disabled' : ''}`
                }
                getRowId={(row) => row?._id || 0}
              />
            </Box>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
