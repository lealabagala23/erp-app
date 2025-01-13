import {
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import React, { Dispatch, SetStateAction } from 'react';
import ColorToggleButton from '../../common/ColorToggleButton';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import dayjs from 'dayjs';

export const TIME_PERIOD_OPTIONS = [
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
];

interface IProps {
  timePeriod: string;
  setTimePeriod: Dispatch<SetStateAction<string>>;
  startDate: string;
  setStartDate: Dispatch<SetStateAction<string>>;
  endDate: string;
  setEndDate: Dispatch<SetStateAction<string>>;
  title: string;
}

const DateRangeSwitcher = ({
  timePeriod,
  setTimePeriod,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  title,
}: IProps) => {
  const getTimePeriodForDayJS = (newTimePeriod?: string) => {
    const value = newTimePeriod ?? timePeriod;
    switch (value) {
      case 'week':
        return 'month';
      case 'month':
        return 'year';
      default:
        return 'week';
    }
  };

  const handleTimePeriodChange = (newTimePeriod: string) => {
    setTimePeriod(newTimePeriod);
    setStartDate(
      dayjs()
        .startOf(getTimePeriodForDayJS(newTimePeriod))
        .format('MM-DD-YYYY'),
    );
    setEndDate(
      dayjs().endOf(getTimePeriodForDayJS(newTimePeriod)).format('MM-DD-YYYY'),
    );
  };

  const handleDateToggle = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string,
  ) => {
    const timePeriodDayJS = getTimePeriodForDayJS();
    if (newAlignment === 'prevDateRange') {
      setStartDate((v) =>
        dayjs(v)
          .subtract(1, timePeriodDayJS)
          .startOf(timePeriodDayJS)
          .format('MM-DD-YYYY'),
      );
      setEndDate((v) =>
        dayjs(v)
          .subtract(1, timePeriodDayJS)
          .endOf(timePeriodDayJS)
          .format('MM-DD-YYYY'),
      );
    } else {
      setStartDate((v) =>
        dayjs(v)
          .add(1, timePeriodDayJS)
          .startOf(timePeriodDayJS)
          .format('MM-DD-YYYY'),
      );
      setEndDate((v) =>
        dayjs(v)
          .add(1, timePeriodDayJS)
          .endOf(timePeriodDayJS)
          .format('MM-DD-YYYY'),
      );
    }
  };

  const disableNextDate = () =>
    dayjs(startDate)
      .add(1, getTimePeriodForDayJS())
      .startOf(getTimePeriodForDayJS())
      .isAfter(dayjs());

  return (
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
        handleAlignment={handleTimePeriodChange}
        options={TIME_PERIOD_OPTIONS}
      />
      <Typography variant="h6">{title}</Typography>
      <ToggleButtonGroup color="primary" exclusive onChange={handleDateToggle}>
        <ToggleButton value={'prevDateRange'}>
          <ChevronLeft />
        </ToggleButton>
        <ToggleButton value={''} sx={{ pointerEvents: 'none' }}>
          {dayjs(startDate).format('MMMM D, YYYY')}
        </ToggleButton>
        <ToggleButton value={''} sx={{ pointerEvents: 'none' }}>
          {dayjs(endDate).format('MMMM D, YYYY')}
        </ToggleButton>
        <ToggleButton value={'nextDateRange'} disabled={disableNextDate()}>
          <ChevronRight />
        </ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
};

export default DateRangeSwitcher;
