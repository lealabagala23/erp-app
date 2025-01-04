import React, { useContext, useState } from 'react';
import AppNavbar from '../../common/AppNavbar';
import Header from '../../common/Header';
import PageWrapper from '../../wrappers/PageWrapper';
import ColorToggleButton from '../../common/ColorToggleButton';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Box,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { fetchSalesReports } from './apis';
import { GetSalesReportsResponse } from './types';
import { formatCurrency } from '../../../utils/auth';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import AuthContext from '../../auth/AuthContext';

const TIME_PERIOD_OPTIONS = [
  {
    label: 'Daily',
    value: 'day',
  },
  {
    label: 'Weekly',
    value: 'week',
  },
  {
    label: 'Monthly',
    value: 'month',
  },
  {
    label: 'Yearly',
    value: 'year',
  },
];

export default function SalesReports() {
  const { activeCompany } = useContext(AuthContext);
  const [timePeriod, setTimePeriod] = useState(TIME_PERIOD_OPTIONS[0].value);
  const [startDate, setStartDate] = useState(
    dayjs().startOf('week').format('MM-DD-YYYY'),
  );
  const [endDate, setEndDate] = useState(
    dayjs().endOf('week').format('MM-DD-YYYY'),
  );

  const { data: salesData, isLoading } = useQuery(
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
      field: '_id',
      headerName: 'Date',
      flex: 1,
      valueFormatter: (value: string) => dayjs(value).format('MM-DD-YYYY'),
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
      headerName: 'Transactions',
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

  const handleDateToggle = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string,
  ) => {
    console.log('new', newAlignment);
    if (newAlignment === 'prevDateRange') {
      setStartDate((v) =>
        dayjs(v).subtract(1, 'week').startOf('week').format('MM-DD-YYYY'),
      );
      setEndDate((v) =>
        dayjs(v).subtract(1, 'week').endOf('week').format('MM-DD-YYYY'),
      );
    } else {
      setStartDate((v) =>
        dayjs(v).add(1, 'week').startOf('week').format('MM-DD-YYYY'),
      );
      setEndDate((v) =>
        dayjs(v).add(1, 'week').endOf('week').format('MM-DD-YYYY'),
      );
    }
  };

  const disableNextDate = () =>
    dayjs(startDate).add(1, 'week').startOf('week').isAfter(dayjs());

  return (
    <>
      <AppNavbar title={'Home'} />
      <PageWrapper>
        <>
          <Header />
          <Stack
            direction="row"
            sx={{
              display: { xs: 'none', md: 'flex' },
              width: '100%',
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              maxWidth: { sm: '100%', md: '1700px' },
              pt: 1.5,
            }}
            spacing={2}
          >
            <ColorToggleButton
              alignment={timePeriod}
              setAlignment={setTimePeriod}
              options={TIME_PERIOD_OPTIONS}
            />
            <Typography variant="h6">{getTitle()} Sales Report</Typography>
            <ToggleButtonGroup
              color="primary"
              exclusive
              onChange={handleDateToggle}
            >
              <ToggleButton value={'prevDateRange'}>
                <ChevronLeft />
              </ToggleButton>
              <ToggleButton value={''} sx={{ pointerEvents: 'none' }}>
                {dayjs(startDate).format('MMMM D, YYYY')}
              </ToggleButton>
              <ToggleButton value={''} sx={{ pointerEvents: 'none' }}>
                {dayjs(endDate).format('MMMM D, YYYY')}
              </ToggleButton>
              <ToggleButton
                value={'nextDateRange'}
                disabled={disableNextDate()}
              >
                <ChevronRight />
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
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
        </>
      </PageWrapper>
    </>
  );
}
