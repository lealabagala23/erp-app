import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { LineChart } from '@mui/x-charts/LineChart';
import { SalesReport } from './types';
import dayjs from 'dayjs';
import { formatCurrency } from '../../../utils/auth';

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

function getSalesData(data: SalesReport[]) {
  return {
    xAxis: data.map((d) => dayjs(d.start_date).format('MMM D')),
    yAxis: [
      {
        id: 'total_sales',
        label: 'Total Sales',
        data: data.map((d) => d.total_sales),
      },
      {
        id: 'net_sales',
        label: 'Net Sales',
        data: data.map((d) => d.net_sales),
      },
    ],
    averageTotal:
      data.reduce((accum, { total_sales }) => accum + total_sales, 0) /
      data.length,
    averageNet:
      data.reduce((accum, { net_sales }) => accum + net_sales, 0) / data.length,
  };
}

interface IProps {
  data: SalesReport[];
  timePeriod: string;
}

export default function SalesChart({ data, timePeriod }: IProps) {
  const theme = useTheme();
  const { xAxis, yAxis, averageNet } = getSalesData(data);

  const colorPalette = [
    theme.palette.primary.light,
    theme.palette.primary.main,
    theme.palette.primary.dark,
  ];

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent
        sx={{ '.MuiChartsAxis-tickLabel': { fontSize: '10px !important' } }}
      >
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Net and Total Sales
        </Typography>
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              Php {formatCurrency(averageNet)}
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Average Net Sales per {timePeriod}
          </Typography>
        </Stack>
        <LineChart
          colors={colorPalette}
          xAxis={[
            {
              scaleType: 'point',
              data: xAxis,
              tickInterval: (index, i) => (i + 1) % 1 === 0,
            },
          ]}
          series={yAxis.map((d) => ({
            ...d,
            showMark: true,
            curve: 'linear',
            stack: 'total',
            stackOrder: 'ascending',
            area: true,
          }))}
          height={250}
          margin={{ left: 50, right: 20, top: 20, bottom: 20 }}
          grid={{ horizontal: true }}
          sx={{
            '& .MuiAreaElement-series-organic': {
              fill: "url('#organic')",
            },
            '& .MuiAreaElement-series-referral': {
              fill: "url('#referral')",
            },
            '& .MuiAreaElement-series-direct': {
              fill: "url('#direct')",
            },
          }}
          slotProps={{
            legend: {
              hidden: true,
            },
          }}
        >
          <AreaGradient color={theme.palette.primary.dark} id="total_sales" />
          <AreaGradient color={theme.palette.primary.main} id="net_sales" />
        </LineChart>
      </CardContent>
    </Card>
  );
}
