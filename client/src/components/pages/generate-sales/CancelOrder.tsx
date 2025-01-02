import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  Stack,
  Checkbox,
  IconButton,
  Typography,
} from '@mui/material';
import RemoveIcon from '@mui/icons-material/RemoveCircleOutline';
import AddIcon from '@mui/icons-material/AddCircleOutline';
import { CancelItem, OrderItem } from './types';

interface IProps {
  open: boolean;
  handleClose: () => void;
  orderItems: OrderItem[];
  onCancel: (s: CancelItem[], t: number) => void;
}

const CancelOrder = ({ open, handleClose, orderItems, onCancel }: IProps) => {
  const [items, setItems] = useState<CancelItem[]>([]);

  const handleCheckboxChange = (id: string): void => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item._id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const handleQuantityChange = (id: string, delta: number): void => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item._id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  };

  useEffect(() => {
    if (orderItems?.length > 0) {
      const newItems = orderItems.map(
        ({ _id, unit_price, quantity, product_id }) => ({
          _id: _id || '',
          // eslint-disable-next-line
          product_id: (product_id as any)?._id,
          unit_price,
          checked: false,
          // eslint-disable-next-line
          label: `${(product_id as any)?.product_name} ${(product_id as any)?.product_description} ${(product_id as any)?.product_unit}`,
          quantity: 1,
          maxQty: quantity,
        }),
      );
      setItems(newItems);
    }
  }, [orderItems]);

  const getSelectedCount = () => {
    const products = items.filter(({ checked }) => !!checked);
    const totalCount = products.reduce((accum, obj) => accum + obj.quantity, 0);

    return { productCount: products?.length, totalCount };
  };

  const { productCount, totalCount } = getSelectedCount();

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Cancel Order Items</DialogTitle>
      <DialogContent>
        <List>
          {items.map((item) => (
            <ListItem
              key={item._id}
              sx={{
                justifyContent: 'space-between',
                padding: '8px 0',
                minWidth: '500px',
                '.MuiSvgIcon-root': { width: '24px', height: '24px' },
                gap: 2,
              }}
            >
              {/* <Stack direction="row" spacing={2} alignItems="center"> */}
              <Stack direction="row" alignItems="center" flex={1}>
                <Checkbox
                  checked={item.checked}
                  onChange={() => handleCheckboxChange(item._id)}
                  color="success"
                  sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                />
                <Typography
                  variant="body1"
                  fontWeight={'bold'}
                  color={item.checked ? 'textPrimary' : 'textDisabled'}
                >
                  {item.label}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center">
                <IconButton
                  onClick={() =>
                    item.checked &&
                    item.quantity < item.maxQty &&
                    handleQuantityChange(item._id, -1)
                  }
                  aria-label="decrease quantity"
                  sx={{
                    border: 0,
                    cursor: !item.checked ? 'not-allowed' : 'pointer',
                  }}
                >
                  <RemoveIcon />
                </IconButton>
                <Typography variant="h6" minWidth={'50px'} textAlign={'center'}>
                  {item.quantity}
                </Typography>
                <IconButton
                  onClick={() =>
                    item.checked &&
                    item.quantity < item.maxQty &&
                    handleQuantityChange(item._id, 1)
                  }
                  aria-label="increase quantity"
                  sx={{
                    border: 0,
                    cursor: !item.checked ? 'not-allowed' : 'pointer',
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Stack>
              {/* </Stack> */}
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        {productCount > 0 && (
          <Typography>
            {productCount} product/s ({totalCount} item/s) selected
          </Typography>
        )}
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
        <Button
          variant="contained"
          onClick={() =>
            productCount > 0 &&
            onCancel(
              items
                .filter((i) => !!i.checked)
                .map(({ unit_price, quantity, maxQty, ...rest }) => ({
                  ...rest,
                  unit_price,
                  maxQty,
                  quantity,
                  total_price: unit_price * (maxQty - quantity),
                })),
              totalCount,
            )
          }
          sx={{
            cursor: productCount > 0 ? 'pointer' : 'not-allowed',
          }}
        >
          Cancel Items
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelOrder;
