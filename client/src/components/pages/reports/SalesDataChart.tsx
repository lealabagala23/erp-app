import React from 'react';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { LineChart } from '@mui/x-charts/LineChart';

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="50%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

interface IProps {
  label: string;
  averageValue: string;
  unitDescription: string;
  xAxisData: string[];
  yAxisData: { id: string; label: string; data: number[]; color: string }[];
  timePeriod: string;
}

export default function SalesDataChart({
  label,
  averageValue,
  unitDescription,
  xAxisData,
  yAxisData,
  timePeriod,
}: IProps) {
  const theme = useTheme();

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
          {label}
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
              {averageValue}
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Average {unitDescription} per {timePeriod}
          </Typography>
        </Stack>
        <LineChart
          colors={colorPalette}
          xAxis={[
            {
              scaleType: 'point',
              data: xAxisData,
              tickInterval: (index, i) => (i + 1) % 1 === 0,
            },
          ]}
          series={yAxisData.map(({ ...d }) => ({
            id: d.id,
            label: d.label,
            showMark: false,
            curve: 'linear',
            stack: 'total',
            stackOrder: 'ascending',
            area: true,
            data: d.data,
          }))}
          height={250}
          margin={{ left: 50, right: 20, top: 20, bottom: 20 }}
          grid={{ horizontal: true }}
          sx={yAxisData.reduce((map, { id }) => {
            return {
              ...map,
              [`& .MuiAreaElement-series-${id}`]: { fill: `url('#${id}')` },
            };
          }, {})}
          slotProps={{
            legend: {
              hidden: true,
            },
          }}
        >
          {yAxisData.map((d, key) => (
            <AreaGradient
              key={`area-gradient-${key}`}
              color={d.color}
              id={d.id}
            />
          ))}
        </LineChart>
      </CardContent>
    </Card>
  );
}
