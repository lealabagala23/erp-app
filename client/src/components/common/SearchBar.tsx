import React, { Dispatch, SetStateAction } from 'react';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

interface IProps {
  itemName: string;
  searchText: string;
  setSearchText: Dispatch<SetStateAction<string>>;
}

export default function SearchBar({
  itemName,
  searchText,
  setSearchText,
}: IProps) {
  return (
    <FormControl sx={{ width: { xs: '100%', md: '35ch' } }} variant="outlined">
      <OutlinedInput
        size="small"
        id="search"
        placeholder={`Search ${itemName} name…`}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        sx={{ flexGrow: 1 }}
        startAdornment={
          <InputAdornment position="start" sx={{ color: 'text.primary' }}>
            <SearchRoundedIcon fontSize="small" />
          </InputAdornment>
        }
        inputProps={{
          'aria-label': 'search',
        }}
      />
    </FormControl>
  );
}
