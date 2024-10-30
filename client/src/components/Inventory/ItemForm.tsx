import React, { useState } from 'react';
import axios from 'axios';

interface IProps {
    fetchItems: () => void
}

const ItemForm = ({ fetchItems }: IProps) => {
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        const newItem = { name, quantity, category, description };
        await axios.post(`${process.env.REACT_APP_API_URL}/api/items`, newItem);
        fetchItems(); // Refresh the item list
        setName('');
        setQuantity('');
        setCategory('');
        setDescription('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Item Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
            <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
            <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <button type="submit">Add Item</button>
        </form>
    );
};

export default ItemForm;
