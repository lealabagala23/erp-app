import React, { useState } from 'react';
import './App.css';
import ItemForm from './components/ItemForm';
import ItemList from './components/ItemList';
import axios from 'axios';

function App() {
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
    </div>
  );
}

export default App;
