import React, { useContext } from 'react';
import PageTemplate from '../../common/PageTemplate';
import { fetchOrders } from './apis';
import AuthContext from '../../auth/AuthContext';
import { GridColDef } from '@mui/x-data-grid';
import { InfoOutlined } from '@mui/icons-material';
import CustomerForm from '../accounts/CustomerForm';
import { useNavigate } from 'react-router-dom';
import { Chip } from '@mui/material';
import { getOrderStatusColor } from '../generate-sales/constants';
import { formatCurrency } from '../../../utils/auth';
import toLower from 'lodash/toLower';

export const FETCH_ORDERS_QUERY_KEY = 'fetchOrders';

export type Order = {
  customer_id: string;
  initiator_id: string;
  company_id: string;
  invoice_number?: string;
  billing_address?: string;
  payment_type?: string;
  payment_status?: string;
  referrer_id?: string;
  referring_doctor_id?: string;
  approver_id?: string;
  created_at?: string;
};

const COLUMNS: GridColDef<Order>[] = [
  {
    field: 'created_at',
    headerName: 'Transaction Date',
    valueGetter: (value, row) =>
      `${new Date(row.created_at || '').toLocaleDateString('en-US')}`,
    sortComparator: (v1, v2) => new Date(v1).getTime() - new Date(v2).getTime(),
    flex: 1,
  },
  {
    field: 'invoice_number',
    headerName: 'Invoice ID',
    flex: 1,
  },
  {
    field: 'customer_name',
    headerName: 'Customer Name',
    minWidth: 300,
    flex: 1,
    // eslint-disable-next-line
    valueGetter: (value, row) => (row?.customer_id as any)?.customer_name,
  },
  {
    field: 'net_total',
    headerName: 'Total Amount',
    flex: 1,
    valueGetter: (value) => formatCurrency(value || 0),
  },
  {
    field: 'payment_type',
    headerName: 'Payment Type',
    flex: 1,
    valueGetter: (value) => ((value || '') as string).toUpperCase(),
  },
  {
    field: 'status',
    headerName: 'Status',
    flex: 1,
    // eslint-disable-next-line
    renderCell: ({ row }: any) => (
      <Chip
        label={row.status?.toUpperCase()?.replaceAll('_', ' ')}
        color={getOrderStatusColor(row.status)}
      />
    ),
  },
  {
    field: 'initiator_id',
    headerName: 'Transacted By',
    flex: 1,
    valueGetter: (value, row) =>
      // eslint-disable-next-line
      `${(row?.initiator_id as any)?.first_name} ${(row?.initiator_id as any)?.last_name}`,
  },
];

export default function Orders() {
  const { activeCompany } = useContext(AuthContext);
  const navigate = useNavigate();
  return (
    <PageTemplate
      fetchAPI={fetchOrders}
      fetchParams={{ company_id: activeCompany?._id as string }}
      // createAPI={createCustomer}
      // updateAPI={updateCustomer}
      // deleteAPI={deleteCustomer}
      // uploadCSVAPI={uploadCustomersCSV}
      // eslint-disable-next-line
      viewItem={(item: any) => navigate(`/orders/${item._id}`)}
      queryKey={FETCH_ORDERS_QUERY_KEY}
      itemName="order"
      searchPlaceholder="Search by invoice number or customer name..."
      searchAttr="invoice_number"
      searchFunc={(data: Order[], value: string) =>
        data.filter(
          ({ invoice_number, customer_id }) =>
            toLower(invoice_number).includes(toLower(value)) ||
            // eslint-disable-next-line
            toLower((customer_id as any)?.customer_name).includes(
              toLower(value),
            ),
        )
      }
      sortField="status"
      sortDir="desc"
      columns={COLUMNS}
      menuActions={['View']}
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
