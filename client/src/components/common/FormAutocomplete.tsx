import { Autocomplete, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
  Control,
  Controller,
  FieldValues,
  UseFormGetValues,
} from 'react-hook-form';

interface IProps {
  control: Control<FieldValues>;
  getValues: UseFormGetValues<FieldValues>;
  options: { label: string; value: string }[];
  name: string;
  autoFocus?: boolean;
  placeholder?: string;
  disabled?: boolean;
  onCreateNew?: () => void;
}

export default function FormAutocomplete({
  options,
  name,
  autoFocus,
  placeholder,
  getValues,
  disabled,
  control,
  onCreateNew,
}: IProps) {
  const [inputValue, setInputValue] = useState<string | null>(null);
  const value = getValues(name);

  // eslint-disable-next-line
  const handleInputChange = (_: any, newInputValue: any) => {
    setInputValue(newInputValue);
    // setValue(name, newInputValue); // TODO: add new strings
  };

  useEffect(() => {
    if (
      !!value &&
      value !== '' &&
      (inputValue === null || inputValue.includes('Add'))
    ) {
      setInputValue(options.find((o) => o.value === value)?.label || null);
    }
  }, [value, options, inputValue]);

  useEffect(() => {
    if (value === undefined) {
      setInputValue(null);
    }
  }, [value]);

  return (
    <>
      <Controller
        name={name}
        control={control}
        rules={{ required: 'This field is required' }}
        render={({ field }) => (
          <Autocomplete
            {...field}
            freeSolo
            options={options}
            disabled={disabled}
            // eslint-disable-next-line
            getOptionLabel={(option: any) => option.label || ''}
            isOptionEqualToValue={(option, value) =>
              option.value === value?.value
            }
            onChange={(_, newValue) => {
              if (newValue?.value === 'new' && onCreateNew) {
                return onCreateNew();
              }
              field.onChange(
                typeof newValue === 'string'
                  ? newValue
                  : newValue?.value || '' || '',
              );
            }}
            inputValue={inputValue || ''}
            onInputChange={handleInputChange}
            renderInput={(params) => (
              <TextField
                {...params}
                autoFocus={autoFocus}
                placeholder={placeholder}
                // eslint-disable-next-line
                sx={(theme: any) => ({
                  '.MuiButtonBase-root': {
                    border: 0,
                    height: '38px',
                    width: '38px',
                  },
                  ...{
                    '.MuiInputBase-root':
                      value === null || value === undefined || value === ''
                        ? {
                            outline: '3px solid hsl(210, 98%, 42%, 0.5)',
                          }
                        : theme['.MuiInputBase-root'],
                  },
                })}
              />
            )}
          />
        )}
      />
    </>
  );
}
