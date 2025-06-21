import * as React from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';

interface StyledTextProps {
  variant: 'primary' | 'secondary';
}

const StyledText = styled('text', {
  shouldForwardProp: (prop) => prop !== 'variant',
})<StyledTextProps>(({ theme }) => ({
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fill: theme.palette.text.secondary,
  variants: [
    {
      props: {
        variant: 'primary',
      },
      style: {
        fontSize: theme.typography.h5.fontSize,
      },
    },
    {
      props: ({ variant }) => variant !== 'primary',
      style: {
        fontSize: theme.typography.body2.fontSize,
      },
    },
    {
      props: {
        variant: 'primary',
      },
      style: {
        fontWeight: theme.typography.h5.fontWeight,
      },
    },
    {
      props: ({ variant }) => variant !== 'primary',
      style: {
        fontWeight: theme.typography.body2.fontWeight,
      },
    },
  ],
}));

interface PieCenterLabelProps {
  primaryText: string;
  secondaryText: string;
}

function PieCenterLabel({ primaryText, secondaryText }: PieCenterLabelProps) {
  const { width, height, left, top } = useDrawingArea();
  const primaryY = top + height / 2 - 10;
  const secondaryY = primaryY + 24;

  return (
    <React.Fragment>
      <StyledText variant="primary" x={left + width / 2} y={primaryY}>
        {primaryText}
      </StyledText>
      <StyledText variant="secondary" x={left + width / 2} y={secondaryY}>
        {secondaryText}
      </StyledText>
    </React.Fragment>
  );
}

const colors = [
  'hsl(0, 70%, 50%)', // bright red
  'hsl(30, 90%, 55%)', // vivid orange
  'hsl(120, 55%, 45%)', // green
  'hsl(210, 90%, 60%)', // sky blue
  'hsl(270, 60%, 60%)', // purple
  'hsl(300, 70%, 60%)', // pink
  'hsl(180, 70%, 40%)', // teal
  'hsl(45, 85%, 50%)', // golden yellow
];

interface IProps {
  title: string;
  data: { label: string; value: number }[];
  totalValue: string;
}

export default function MetricsPieChart({ title, data, totalValue }: IProps) {
  const getPercentage = (value: number) => {
    const total = data.reduce((accum, { value }) => accum + value, 0);
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  React.useEffect(() => {
    const elements = Array.from(document.querySelectorAll('*')).filter(
      (el) => el !== null && el.textContent?.trim() === 'No data to display',
    ) as SVGTextElement[];
    if (elements.length > 0) {
      elements.forEach((element) => {
        element.style.visibility = 'hidden';
      });
    }
  }, [data]);

  return (
    <Card
      variant="outlined"
      sx={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}
    >
      <CardContent>
        <Typography component="h2" variant="subtitle2">
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PieChart
            colors={colors}
            margin={{
              left: 80,
              right: 80,
              top: 80,
              bottom: 80,
            }}
            series={[
              {
                data,
                arcLabel: (item) => getPercentage(item.value),
                arcLabelMinAngle: 10,
                innerRadius: 75,
                outerRadius: 100,
                paddingAngle: 0,
                highlightScope: { faded: 'global', highlighted: 'item' },
              },
            ]}
            height={260}
            width={260}
            slotProps={{
              legend: { hidden: true },
            }}
            sx={{
              [`& .${pieArcLabelClasses.root}`]: {
                fontSize: '14px',
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
              },
            }}
          >
            <PieCenterLabel primaryText={totalValue} secondaryText="Total" />
          </PieChart>
        </Box>
      </CardContent>
    </Card>
  );
}
