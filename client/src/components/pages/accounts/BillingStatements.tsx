import React, { useContext } from 'react';
import AuthContext from '../../auth/AuthContext';
import { fetchBillings } from './apis';
import PageTemplate from '../../common/PageTemplate';
import { FETCH_BILLINGS_QUERY_KEY } from './constants';
import { GridColDef } from '@mui/x-data-grid';
import { BillingStatement } from './types';
import dayjs from 'dayjs';
import { dateSortComparator, formatCurrency } from '../../../utils/auth';
import { generateBillingPDF } from '../../../utils/pdfBillingWriter';

const COLUMNS: GridColDef<BillingStatement>[] = [
  {
    field: 'customer_name',
    headerName: 'Customer Name',
    minWidth: 300,
    flex: 1,
  },
  {
    field: 'min_created_at',
    headerName: 'First Order Created At',
    flex: 1,
    align: 'center',
    headerAlign: 'center',
    valueFormatter: (value) => dayjs(value).format('MM/DD/YYYY'),
    sortComparator: dateSortComparator,
  },
  {
    field: 'order_count',
    headerName: 'Unpaid Orders Count',
    flex: 1,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'total_balance',
    headerName: 'Total Outstanding Balance',
    flex: 1,
    valueFormatter: formatCurrency,
    align: 'right',
    headerAlign: 'right',
  },
];

export default function BillingStatements() {
  const { activeCompany, userInfo } = useContext(AuthContext);

  return (
    <>
      <PageTemplate
        fetchAPI={fetchBillings}
        fetchParams={{ company_id: activeCompany?._id as string }}
        viewItem={
          // eslint-disable-next-line
          (item: any) => {
            generateBillingPDF(item, userInfo);
          }
        }
        queryKey={FETCH_BILLINGS_QUERY_KEY}
        itemName="billing statements"
        searchAttr="min_created_at"
        sortField="min_created_at"
        columns={COLUMNS}
        menuActions={['View']}
        drawerTabs={[]}
      />
    </>
  );
}
