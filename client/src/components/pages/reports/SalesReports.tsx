import React, { useContext, useState } from 'react';
import AppNavbar from '../../common/AppNavbar';
import Header from '../../common/Header';
import PageWrapper from '../../wrappers/PageWrapper';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { fetchSalesReports } from './apis';
import { GetSalesReportsResponse, SalesReport } from './types';
import { formatCurrency } from '../../../utils/auth';
import AuthContext from '../../auth/AuthContext';
import SalesDataChart from './SalesDataChart';
import DateRangeSwitcher, { TIME_PERIOD_OPTIONS } from './DateRangeSwitcher';

export default function SalesReports() {
  const theme = useTheme();
  const { activeCompany } = useContext(AuthContext);
  const [timePeriod, setTimePeriod] = useState(TIME_PERIOD_OPTIONS[0].value);
  const [startDate, setStartDate] = useState(
    dayjs().startOf('week').format('MM-DD-YYYY'),
  );
  const [endDate, setEndDate] = useState(
    dayjs().endOf('week').format('MM-DD-YYYY'),
  );

  const { data: salesData } = useQuery(
    ['fetchSalesReports', startDate, endDate],
    () =>
      fetchSalesReports({
        time_period: timePeriod,
        start_date: startDate,
        end_date: endDate,
        company_id: activeCompany?._id as string,
      }),
    {
      enabled: !!activeCompany?._id,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );

  const columns: GridColDef[] = [
    {
      field: 'start_date',
      headerName: 'Date',
      flex: 1,
      // eslint-disable-next-line
      valueGetter: (_, row: any) =>
        `${dayjs(row.start_date).format('MM-DD-YYYY')}${timePeriod === 'day' ? '' : ` - ${dayjs(row.end_date).format('MM-DD-YYYY')}`}`,
    },
    {
      field: 'total_sales',
      headerName: 'Total Sales',
      type: 'number',
      flex: 1,
      valueFormatter: formatCurrency,
    },
    {
      field: 'order_count',
      headerName: 'Orders',
      type: 'number',
      flex: 1,
    },
    {
      field: 'avg_order_value',
      headerName: 'Avg Order Value',
      type: 'number',
      flex: 1,
      valueFormatter: formatCurrency,
    },
    {
      field: 'sales_growth',
      headerName: 'Sales Growth (%)',
      type: 'number',
      flex: 1,
      valueFormatter: (value: number) => `${value?.toFixed(1) || 0}%`,
      cellClassName: (params) =>
        params.value > 0 ? 'text-success' : 'text-error',
    },
    {
      field: 'cancelled_qty',
      headerName: 'Item Cancellations',
      type: 'number',
      flex: 1,
    },
    {
      field: 'net_sales',
      headerName: 'Net Sales',
      type: 'number',
      flex: 1,
      valueFormatter: formatCurrency,
    },
  ];

  const { data = [] } = (salesData || {}) as GetSalesReportsResponse;

  const getTitle = () =>
    TIME_PERIOD_OPTIONS.find((o) => o.value === timePeriod)?.label;

  const getSalesData = (data: SalesReport[]) => {
    return {
      xAxis: data.map((d) => dayjs(d.start_date).format('MMM D')),
      yAxis: [
        {
          id: 'totalSales',
          label: 'Total Sales',
          data: data.map((d) => d.total_sales),
          color: theme.palette.primary.dark,
        },
        {
          id: 'netSales',
          label: 'Net Sales',
          data: data.map((d) => d.net_sales),
          color: theme.palette.primary.main,
        },
        {
          id: 'avgOrderValue',
          label: 'Avg Order Value',
          data: data.map((d) => d.avg_order_value),
          color: theme.palette.primary.light,
        },
      ],
      average:
        data.reduce((accum, { net_sales }) => accum + net_sales, 0) /
        data.length,
    };
  };

  const { xAxis, yAxis, average } = getSalesData(data);

  return (
    <>
      <AppNavbar title={'Sales Reports'} />
      <PageWrapper>
        <>
          <Header />
          <DateRangeSwitcher
            timePeriod={timePeriod}
            setTimePeriod={setTimePeriod}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            title={`${getTitle()} Sales Report`}
          />
          <Box
            sx={{
              height: '100%',
              width: '100%',
              maxWidth: '1700px',
              '.text-success': {
                color: 'green',
              },
              '.text-error': {
                color: 'red',
              },
            }}
          >
            <DataGrid
              checkboxSelection={false}
              loading={false}
              rows={data}
              columns={columns}
              getRowId={(row) => row._id || 0}
              getRowClassName={(params) =>
                params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
              }
              initialState={{
                pagination: { paginationModel: { pageSize: 20 } },
                sorting: {
                  sortModel: [
                    {
                      field: 'date_range',
                      sort: 'asc',
                    },
                  ],
                },
              }}
              pageSizeOptions={[10, 20, 50]}
              disableColumnResize
              disableRowSelectionOnClick
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
          </Box>
          <Stack direction={'row'} gap={2} width={'100%'} maxWidth={'1700px'}>
            <SalesDataChart
              label={`Total and Net Sales`}
              averageValue={`Php ${formatCurrency(average)}`}
              unitDescription={`Net Sales`}
              xAxisData={xAxis}
              yAxisData={yAxis}
              timePeriod={timePeriod}
            />
            <SalesDataChart
              label={`Sales Growth`}
              averageValue={`${(data.reduce((accum, { sales_growth = 0 }) => accum + sales_growth, 0) / (data.length || 1)).toFixed(1)}%`}
              unitDescription={`Sales Growth`}
              xAxisData={xAxis}
              yAxisData={[
                {
                  id: 'salesGrowth',
                  label: 'Sales Growth',
                  data: data.map((d) => d.sales_growth || 0),
                  color: theme.palette.primary.dark,
                },
              ]}
              timePeriod={timePeriod}
            />
          </Stack>
          <Stack direction={'row'} gap={2} width={'100%'} maxWidth={'1700px'}>
            <SalesDataChart
              label={`Orders`}
              averageValue={`${(data.reduce((accum, { order_count = 0 }) => accum + order_count, 0) / (data.length || 1)).toFixed(1)}`}
              unitDescription={`Orders`}
              xAxisData={xAxis}
              yAxisData={[
                {
                  id: 'orders',
                  label: 'Orders',
                  data: data.map((d) => d.order_count || 0),
                  color: theme.palette.primary.dark,
                },
              ]}
              timePeriod={timePeriod}
            />
            <SalesDataChart
              label={`Item Cancellations`}
              averageValue={`${(data.reduce((accum, { cancelled_qty = 0 }) => accum + cancelled_qty, 0) / (data.length || 1)).toFixed(1)}`}
              unitDescription={`Item Cancellations`}
              xAxisData={xAxis}
              yAxisData={[
                {
                  id: 'itemCancellations',
                  label: 'Item Cancellations',
                  data: data.map((d) => d.cancelled_qty || 0),
                  color: theme.palette.primary.dark,
                },
              ]}
              timePeriod={timePeriod}
            />
          </Stack>
        </>
      </PageWrapper>
    </>
  );
}
