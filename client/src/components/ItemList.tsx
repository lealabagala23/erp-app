import React, { useEffect } from 'react';

type InventoryItem = {
    _id: string
    name: string
    quantity: number
    category: string
}

interface IProps {
    items: InventoryItem[]
    fetchItems: () => void
}

const ItemList = ({ items, fetchItems }: IProps) => {

    useEffect(() => {
        fetchItems();
    }, []);

    return (
        <div>
            <h2>Inventory Items</h2>
            <ul>
                {items.map(item => (
                    <li key={item._id}>
                        {item.name} - {item.quantity} (Category: {item.category})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ItemList;
