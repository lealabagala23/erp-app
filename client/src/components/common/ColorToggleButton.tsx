import React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

interface IProps {
  options: { label: string; value: string }[];
  alignment: string;
  handleAlignment: (s: string) => void;
}

export default function ColorToggleButton({
  options,
  alignment,
  handleAlignment,
}: IProps) {
  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string,
  ) => {
    if (newAlignment !== null) handleAlignment(newAlignment);
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
