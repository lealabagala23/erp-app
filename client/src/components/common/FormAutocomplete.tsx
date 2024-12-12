import { Autocomplete, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
  FieldValues,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';

interface IProps {
  setValue: UseFormSetValue<FieldValues>;
  register: UseFormRegister<FieldValues>;
  getValues: UseFormGetValues<FieldValues>;
  options: { label: string; value: string }[];
  name: string;
  autoFocus?: boolean;
  placeholder?: string;
}

export default function FormAutocomplete({
  setValue,
  register,
  options,
  name,
  autoFocus,
  placeholder,
  getValues,
}: IProps) {
  const [inputValue, setInputValue] = useState<string | null>(null);
  const value = getValues(name);

  // eslint-disable-next-line
  const handleAutocompleteChange = (_: any, newValue: any) => {
    const value =
      typeof newValue === 'string' ? newValue : newValue?.value || '';
    setValue(name, value);
  };

  // eslint-disable-next-line
  const handleInputChange = (_: any, newInputValue: any) => {
    setInputValue(newInputValue);
    // setValue(name, newInputValue); // TODO: add new strings
  };

  useEffect(() => {
    if (!!value && value !== '' && inputValue === null) {
      setInputValue(options.find((o) => o.value === value)?.label || null);
    }
  }, [value, options, inputValue]);

  return (
    <>
      <input
        type="hidden"
        {...register(name, { required: 'This field is required' })}
        value={inputValue as unknown as string}
      />

      <Autocomplete
        freeSolo
        options={options}
        // eslint-disable-next-line
        getOptionLabel={(option: any) => option.label || ''}
        isOptionEqualToValue={(option, value) => option.value === value?.value}
        // value={selectedValue}
        onChange={handleAutocompleteChange}
        inputValue={inputValue || ''}
        onInputChange={handleInputChange}
        renderInput={(params) => (
          <TextField
            {...params}
            autoFocus={autoFocus}
            placeholder={placeholder}
            sx={{
              '.MuiButtonBase-root': {
                border: 0,
                height: '38px',
                width: '38px',
              },
            }}
          />
        )}
      />
    </>
  );
}
