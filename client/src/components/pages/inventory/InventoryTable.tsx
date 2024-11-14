import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import { Product } from './types';
import { useMutation } from '@tanstack/react-query';
import { fetchProducts } from './apis';

const columns: GridColDef<Product>[] = [
  {
    field: 'product_name',
    headerName: 'Product Name',
    editable: true,
    minWidth: 300,
    flex: 1,
  },
  { field: 'barcode', headerName: 'Barcode', flex: 1 },
  {
    field: 'product_description',
    headerName: 'Description',
    editable: true,
    flex: 1,
  },
  {
    field: 'product_unit',
    headerName: 'Unit',
    editable: true,
    flex: 1,
  },
  {
    field: 'generic_name',
    headerName: 'Generic Name',
    editable: true,
    flex: 1,
  },
  {
    field: 'purchase_price',
    headerName: 'Purchase Price',
    editable: true,
    flex: 1,
  },
  {
    field: 'patient_price',
    headerName: 'Patient Price',
    editable: true,
    flex: 1,
  },
  {
    field: 'doctor_price',
    headerName: 'Doctor Price',
    editable: true,
    flex: 1,
  },
  {
    field: 'agency_price',
    headerName: 'Agency Price',
    editable: true,
    flex: 1,
  },
  {
    field: 'created_at',
    headerName: 'Created at',
    valueGetter: (value, row) =>
      `${new Date(row.created_at).toLocaleDateString('en-US')}`,
    flex: 1,
  },
];

interface IProps {
  searchText: string;
}

export default function InventoryTable({ searchText }: IProps) {
  const [products, setProducts] = useState<Product[]>([]);

  const { mutateAsync: mutateGetProducts } = useMutation({
    mutationFn: fetchProducts,
    onSuccess: (data) => setProducts(data),
  });

  useEffect(() => {
    mutateGetProducts();
  }, []);

  return (
    <Box style={{ height: '100%', width: '100%' }}>
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
        getRowId={(row) => row._id}
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
        density="compact"
        slotProps={{
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
  );
}
