import React, { useState } from 'react';
import ItemForm from './ItemForm';
import ItemList from './ItemList';
import axios from 'axios';
import { Button } from '@mui/material';

function Inventory() {
  const [items, setItems] = useState([]);

  const fetchItems = async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/items`,
    );
    setItems(response.data);
  };

  return (
    <div>
      <h1>Inventory Tracker</h1>
      <ItemForm fetchItems={fetchItems} />
      <ItemList items={items} fetchItems={fetchItems} />
      <Button variant="contained">Contained</Button>
    </div>
  );
}

export default Inventory;
