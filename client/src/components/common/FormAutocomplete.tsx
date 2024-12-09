import { Autocomplete, TextField } from '@mui/material';
import React, { useState } from 'react';
import { FieldValues, UseFormRegister, UseFormSetValue } from 'react-hook-form';

interface IProps {
  setValue: UseFormSetValue<FieldValues>;
  register: UseFormRegister<FieldValues>;
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
}: IProps) {
  const [inputValue, setInputValue] = useState('');

  // eslint-disable-next-line
  const handleAutocompleteChange = (_: any, newValue: any) => {
    const value =
      typeof newValue === 'string' ? newValue : newValue?.value || '';
    setValue(name, value);
  };

  // eslint-disable-next-line
  const handleInputChange = (_: any, newInputValue: any) => {
    setInputValue(newInputValue);
    setValue(name, newInputValue); // Update form state with the current input
  };

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
        inputValue={inputValue}
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
