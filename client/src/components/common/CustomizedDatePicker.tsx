import { TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import React from 'react';
import ErrorMessage from './ErrorMessage';
import { FieldError } from 'react-hook-form';

interface IProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  error?: FieldError;
}

const CustomizedDatePicker = ({
  value,
  error,
  label,
  onChange,
  ...props
}: IProps) => {
  return (
    <DatePicker
      {...props}
      value={value ? dayjs(value) : null}
      onChange={(newDate) => {
        onChange(newDate ? newDate.toISOString() : ''); // Convert date to ISO string
      }}
      slots={{
        textField: (textFieldProps) => (
          <TextField
            {...textFieldProps}
            error={Boolean(error)}
            placeholder={label}
            helperText={<ErrorMessage error={error as FieldError} />}
          />
        ),
      }}
      sx={{
        '.MuiIconButton-root': {
          border: 0,
          width: '38px',
          height: '38px',
        },
      }}
    />
  );
};

export default CustomizedDatePicker;
