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
    field: 'date_of_birth',
    headerName: 'Date of Birth',
    flex: 1,
  },
  {
    field: 'discount_card',
    headerName: 'Discount Card',
    flex: 1,
  },
  {
    field: 'discount_card_number',
    headerName: 'Discount Card Number',
    flex: 1,
  },
  {
    field: 'referring_doctor_id',
    headerName: 'Referring Doctor',
    flex: 1,
    valueGetter: (value, row) =>
      // eslint-disable-next-line
      (row?.referring_doctor_id as any)?.customer_id?.customer_name,
  },
  {
    field: 'status',
    headerName: 'Status',
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

export default function Patients() {
  const navigate = useNavigate();
  return (
    <PageTemplate
      fetchAPI={() => fetchCustomerType({ customer_type: 'PATIENT' })}
      // eslint-disable-next-line
      viewItem={(item: any) =>
        navigate(`/customers?id=${item.customer_id?._id}`)
      }
      queryKey={FETCH_CUSTOMERS_QUERY_KEY}
      itemName="patient"
      searchAttr="customer_name"
      sortField="customer_name"
      menuActions={['Show']}
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
