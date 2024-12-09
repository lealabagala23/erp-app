import * as React from 'react';
import PageTemplate from '../../common/PageTemplate';
import { fetchCustomerType } from './apis';
import { FETCH_CUSTOMERS_QUERY_KEY } from './constants';
import { InfoOutlined } from '@mui/icons-material';
import CustomerForm from './CustomerForm';
import { Patient } from './types';
import { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';

const COLUMNS: GridColDef<Patient>[] = [
  {
    field: 'customer_name',
    headerName: 'Customer Name',
    minWidth: 300,
    flex: 1,
    // eslint-disable-next-line
    valueGetter: (value, row) => (row?.customer_id as any)?.customer_name,
  },
  {
    field: 'specialization',
    headerName: 'Specialization',
    flex: 1,
  },
  {
    field: 'license_number',
    headerName: 'License Number',
    flex: 1,
  },
  {
    field: 'clinic_address',
    headerName: 'Clinic Address',
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

export default function Doctors() {
  const navigate = useNavigate();
  return (
    <PageTemplate
      fetchAPI={() => fetchCustomerType({ customer_type: 'DOCTOR' })}
      // eslint-disable-next-line
      viewItem={(item: any) =>
        navigate(`/customers?id=${item.customer_id?._id}`)
      }
      queryKey={FETCH_CUSTOMERS_QUERY_KEY}
      itemName="doctor"
      searchAttr="customer_name"
      sortField="customer_name"
      menuActions={['View']}
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
