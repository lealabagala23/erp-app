import * as React from 'react';
import PageTemplate from '../../common/PageTemplate';
import { fetchReferrers } from './apis';
import { FETCH_CUSTOMERS_QUERY_KEY } from './constants';
import { InfoOutlined } from '@mui/icons-material';
import CustomerForm from './CustomerForm';
import { Referrer } from './types';
import { GridColDef } from '@mui/x-data-grid';

const COLUMNS: GridColDef<Referrer>[] = [
  {
    field: 'referrer_name',
    headerName: 'Referrer Name',
    flex: 1,
  },
  {
    field: 'doctor_id',
    headerName: 'Affiliated Doctor',
    flex: 1,
    valueGetter: (value, row) =>
      // eslint-disable-next-line
      (row?.doctor_id as any)?.customer_id?.customer_name,
  },
  {
    field: 'contact_info',
    headerName: 'Contact Info',
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

export default function Referrers() {
  return (
    <PageTemplate
      fetchAPI={fetchReferrers}
      queryKey={FETCH_CUSTOMERS_QUERY_KEY}
      itemName="referrer"
      searchAttr="customer_name"
      sortField="customer_name"
      columns={COLUMNS}
      menuActions={[]}
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
