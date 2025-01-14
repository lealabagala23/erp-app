import React, { useContext, useState } from 'react';
import AppNavbar from '../../common/AppNavbar';
import PageWrapper from '../../wrappers/PageWrapper';
import Header from '../../common/Header';
import DateRangeSwitcher, { TIME_PERIOD_OPTIONS } from './DateRangeSwitcher';
import dayjs from 'dayjs';
import { capitalize } from 'lodash';
import { useQuery } from '@tanstack/react-query';
import { fetchTopMetrics } from './apis';
import AuthContext from '../../auth/AuthContext';
import MetricsPieChart from './MetricsPieChart';
import { formatCurrency } from '../../../utils/auth';
import { Stack } from '@mui/material';

const TopMetrics = () => {
  const { activeCompany } = useContext(AuthContext);
  const [timePeriod, setTimePeriod] = useState(TIME_PERIOD_OPTIONS[0].value);
  const [startDate, setStartDate] = useState(
    dayjs().startOf('week').format('MM-DD-YYYY'),
  );
  const [endDate, setEndDate] = useState(
    dayjs().endOf('week').format('MM-DD-YYYY'),
  );

  const { data = {} } = useQuery(
    ['fetchTopMetrics', startDate, endDate],
    () =>
      fetchTopMetrics({
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

  const {
    products_by_quantity = [],
    products_by_sales = [],
    top_customers = [],
  } = data;

  return (
    <>
      <AppNavbar title={'Top Metrics'} />
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
            title={`Top Metrics of the ${capitalize(timePeriod)}`}
          />
          <Stack
            gap={2}
            direction={'row'}
            width={'100%'}
            sx={{ flexWrap: 'wrap' }}
          >
            <MetricsPieChart
              title={'Top Products by Quantity'}
              // eslint-disable-next-line
              data={products_by_quantity.map((d: any) => ({
                label: d.product_name,
                value: d.total_quantity,
              }))}
              totalValue={`${products_by_quantity.reduce(
                // eslint-disable-next-line
                (accum: number, { total_quantity }: any) =>
                  accum + total_quantity,
                0,
              )} Products`}
            />
            <MetricsPieChart
              title={'Top Products by Sales'}
              // eslint-disable-next-line
              data={products_by_sales.map((d: any) => ({
                label: d.product_name,
                value: d.total_sales,
              }))}
              totalValue={`₱ ${formatCurrency(
                products_by_sales.reduce(
                  // eslint-disable-next-line
                  (accum: number, { total_sales }: any) => accum + total_sales,
                  0,
                ),
              )}`}
            />
            <MetricsPieChart
              title={'Top Customers by Order Quantity'}
              // eslint-disable-next-line
              data={top_customers.map((d: any) => ({
                label: d.customer_name,
                value: d.total_quantity,
              }))}
              totalValue={`${top_customers.reduce(
                // eslint-disable-next-line
                (accum: number, { total_quantity }: any) =>
                  accum + total_quantity,
                0,
              )}`}
            />
            <MetricsPieChart
              title={'Top Customers by Total Sales'}
              // eslint-disable-next-line
              data={top_customers.map((d: any) => ({
                label: d.customer_name,
                value: d.total_sales,
              }))}
              totalValue={`₱ ${formatCurrency(
                top_customers.reduce(
                  // eslint-disable-next-line
                  (accum: number, { total_sales }: any) => accum + total_sales,
                  0,
                ),
              )}`}
            />
          </Stack>
        </>
      </PageWrapper>
    </>
  );
};

export default TopMetrics;
