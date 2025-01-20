import * as React from 'react';
import PageTemplate from '../../common/PageTemplate';
import { fetchCustomerType } from './apis';
import { FETCH_CUSTOMERS_QUERY_KEY } from './constants';
import { InfoOutlined } from '@mui/icons-material';
import CustomerForm from './CustomerForm';
import { Agency } from './types';
import { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';

const COLUMNS: GridColDef<Agency>[] = [
  {
    field: 'customer_name',
    headerName: 'Customer Name',
    minWidth: 300,
    flex: 1,
    // eslint-disable-next-line
    valueGetter: (value, row) => (row?.customer_id as any)?.customer_name,
  },
  {
    field: 'agency_address',
    headerName: 'Agency Address',
    flex: 1,
  },
  {
    field: 'industry_type',
    headerName: 'Industry Type',
    flex: 1,
  },
  {
    field: 'contact_person_name',
    headerName: 'Contact Person Name',
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

export default function Agencies() {
  const navigate = useNavigate();
  return (
    <PageTemplate
      fetchAPI={() => fetchCustomerType({ customer_type: 'AGENCY' })}
      // eslint-disable-next-line
      viewItem={(item: any) =>
        navigate(`/customers?id=${item.customer_id?._id}`)
      }
      queryKey={FETCH_CUSTOMERS_QUERY_KEY}
      itemName="agency"
      searchAttr="customer_name"
      sortField="customer_name"
      columns={COLUMNS}
      menuActions={['Show']}
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
