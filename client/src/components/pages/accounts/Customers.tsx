import * as React from 'react';
import PageTemplate from '../../common/PageTemplate';
import {
  createCustomer,
  deleteCustomer,
  fetchCustomers,
  updateCustomer,
  uploadCustomersCSV,
} from './apis';
import { FETCH_CUSTOMERS_QUERY_KEY } from './constants';
import { InfoOutlined } from '@mui/icons-material';
import CustomerForm from './CustomerForm';
import { Customer } from './types';
import { GridColDef } from '@mui/x-data-grid';

const COLUMNS: GridColDef<Customer>[] = [
  {
    field: 'customer_name',
    headerName: 'Customer Name',
    minWidth: 300,
    flex: 1,
  },
  {
    field: 'customer_type',
    headerName: 'Customer Type',
    flex: 1,
  },
  {
    field: 'contact_info',
    headerName: 'Contact Info',
    flex: 1,
  },
  {
    field: 'tin',
    headerName: 'TIN',
    flex: 1,
  },
  {
    field: 'address',
    headerName: 'Address',
    flex: 1,
  },
  {
    field: 'created_at',
    headerName: 'Created at',
    valueGetter: (value, row) =>
      `${new Date(row.created_at || '').toLocaleDateString('en-US')}`,
    flex: 1,
  },
];

export default function Customers() {
  return (
    <PageTemplate
      fetchAPI={fetchCustomers}
      createAPI={createCustomer}
      updateAPI={updateCustomer}
      deleteAPI={deleteCustomer}
      uploadCSVAPI={uploadCustomersCSV}
      queryKey={FETCH_CUSTOMERS_QUERY_KEY}
      itemName="customer"
      searchAttr="customer_name"
      sortField="customer_name"
      columns={COLUMNS}
      drawerTabs={[
        {
          label: 'Info',
          icon: <InfoOutlined />,
          Component: CustomerForm,
        },
      ]}
    />
  );
}
