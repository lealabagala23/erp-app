import React, { Dispatch, SetStateAction } from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

interface IProps {
  options: { label: string; value: string }[];
  alignment: string;
  setAlignment: Dispatch<SetStateAction<string>>;
}

export default function ColorToggleButton({
  options,
  alignment,
  setAlignment,
}: IProps) {
  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string,
  ) => {
    if (newAlignment !== null) setAlignment(newAlignment);
  };

  return (
    <ToggleButtonGroup
      color="primary"
      value={alignment}
      exclusive
      onChange={handleChange}
    >
      {options.map(({ label, value }, key) => (
        <ToggleButton key={`toggle-btn-${key}`} value={value}>
          {label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
