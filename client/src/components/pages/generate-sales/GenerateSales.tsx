import React, { useEffect, useState } from 'react';
import AppNavbar from '../../common/AppNavbar';
import Header from '../../common/Header';
import PageWrapper from '../../wrappers/PageWrapper';
import {
  FormControl,
  FormLabel,
  Grid2 as Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { fetchCustomers } from '../accounts/apis';
import { useQuery } from '@tanstack/react-query';
import { Customer } from '../accounts/types';
import { useForm } from 'react-hook-form';
import FormAutocomplete from '../../common/FormAutocomplete';
import ItemTable from './ItemTable';
import { TableItem } from './types';
import { fetchProducts } from '../inventory/apis';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  color: theme.palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));

const DEFAULT_ITEM = {
  item_number: 1,
  product_id: null,
  quantity: 1,
  unit_price: 0,
  custom_discount: 0,
  total_price: 0,
};

export default function GenerateSales() {
  const { register, setValue, watch } = useForm();
  const { data: customers = [] } = useQuery(
    ['fetchCustomers'],
    () => fetchCustomers(),
    {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );

  const { data: products = [] } = useQuery(
    ['fetchProducts'],
    () => fetchProducts(),
    {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );

  const { customer_id } = watch();

  const [orderItems, setOrderItems] = useState<TableItem[]>([DEFAULT_ITEM]);

  const getCustomer = () =>
    customers.find(({ _id }: Customer) => _id === customer_id);

  const { customer_type, customer_details } = getCustomer() || {};

  const addOrderItem = () => {
    setOrderItems((v) => [
      ...v,
      { ...DEFAULT_ITEM, item_number: v.length + 1 },
    ]);
  };

  const updateOrderItem = (item: TableItem) => {
    const updated = orderItems.map((obj) =>
      obj.item_number === item.item_number ? item : obj,
    );
    setOrderItems(updated);
  };

  const deleteOrderItem = (item: TableItem) => {
    const updated =
      orderItems.length === 1
        ? [DEFAULT_ITEM]
        : orderItems
            .filter((obj) => obj.item_number !== item.item_number)
            .map((obj, key) => ({ ...obj, item_number: key + 1 }));
    setOrderItems(updated);
  };

  const clearAllOrderItems = () => {
    setOrderItems([DEFAULT_ITEM]);
  };

  useEffect(() => {
    if (customer_details) {
      setValue('discount_card', customer_details?.discount_card);
      setValue('discount_card_number', customer_details?.discount_card_number);
    }
  }, [customer_details]);

  return (
    <>
      <AppNavbar title={'Generate Sales'} />
      <PageWrapper>
        <>
          <Header />
          <Grid container spacing={2} width={'100%'}>
            <Grid size={12}>
              <Item>
                <Typography variant="h3" fontWeight="bold">
                  Invoice #0001
                </Typography>
              </Item>
            </Grid>
            <Grid size={8}>
              <Item>
                <Grid container size={12} spacing={2}>
                  <Grid size={6}>
                    <FormControl fullWidth margin="dense">
                      <FormLabel>Customer</FormLabel>
                      <FormAutocomplete
                        options={customers.map(
                          ({ _id, customer_name }: Customer) => ({
                            label: customer_name,
                            value: _id,
                          }),
                        )}
                        register={register}
                        setValue={setValue}
                        name="customer_id"
                        autoFocus
                        placeholder={'Select Customer'}
                      />
                    </FormControl>
                  </Grid>
                  <Grid size={2}>
                    <FormControl fullWidth margin="dense">
                      <FormLabel>Customer Type</FormLabel>
                      <TextField
                        value={customer_type}
                        fullWidth
                        variant="outlined"
                        disabled
                        sx={{
                          '.MuiInputBase-input': {
                            cursor: 'not-allowed',
                            color: 'var(--template-palette-grey-600)',
                            '-webkit-text-fill-color': 'unset',
                          },
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid size={4}>
                    <FormControl fullWidth margin="dense">
                      <FormLabel>Payment Type</FormLabel>
                      <TextField
                        select
                        {...register('payment_type', {
                          required: 'Payment Type is required',
                        })}
                        sx={{
                          width: '300px',
                          '& .MuiSelect-select span': {
                            color: 'var(--template-palette-grey-400)',
                          },
                          '& .MuiSelect-select span::before': {
                            content: "'Select Payment Type'",
                          },
                        }}
                        variant="outlined"
                        fullWidth
                      >
                        <MenuItem key={'payment-type-cash'} value={'cash'}>
                          CASH
                        </MenuItem>
                        <MenuItem key={'payment-type-cash'} value={'charge'}>
                          CHARGE
                        </MenuItem>
                      </TextField>
                    </FormControl>
                  </Grid>
                  {customer_type === 'PATIENT' && customer_details && (
                    <>
                      <Grid size={4}>
                        <FormControl fullWidth margin="dense">
                          <FormLabel>Discount Card</FormLabel>
                          <TextField
                            {...register('discount_card')}
                            placeholder={'Enter Discount Card'}
                            variant="outlined"
                            fullWidth
                          />
                        </FormControl>
                      </Grid>
                      <Grid size={4}>
                        <FormControl fullWidth margin="dense">
                          <FormLabel>Discount Card No.</FormLabel>
                          <TextField
                            {...register('discount_card_number')}
                            placeholder={'Enter Discount Card Number'}
                            variant="outlined"
                            fullWidth
                          />
                        </FormControl>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Item>
            </Grid>
            <Grid size={4}>
              <Item
                sx={{ textAlign: 'right', height: '100%', padding: '16px' }}
              >
                <Typography>BALANCE DUE</Typography>
                <Typography variant="h1">₱ 1,000.00</Typography>
                <FormControl margin="dense">
                  <FormLabel>Invoice No.</FormLabel>
                  <TextField
                    {...register('invoice_number')}
                    placeholder={'Enter Invoice Number'}
                    variant="outlined"
                  />
                </FormControl>
              </Item>
            </Grid>
            <Grid size={12}>
              <Item>
                <Grid container spacing={2}>
                  <Grid size={4}>
                    <FormControl fullWidth margin="dense">
                      <FormLabel>Billing Address</FormLabel>
                      <TextField
                        {...register('billing_address')}
                        placeholder={'Enter billing address'}
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        sx={{ '.MuiInputBase-root': { height: 'unset' } }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid size={4}>
                    <FormControl fullWidth margin="dense">
                      <FormLabel>TIN</FormLabel>
                      <TextField
                        {...register('tin')}
                        placeholder={'Enter TIN'}
                        variant="outlined"
                        fullWidth
                      />
                    </FormControl>
                  </Grid>
                  <Grid size={4}>
                    <FormControl fullWidth margin="dense">
                      <FormLabel>Referrer</FormLabel>
                      <FormAutocomplete
                        options={[]} // TODO: add referrers list
                        register={register}
                        setValue={setValue}
                        name="referrer"
                        placeholder={'Enter Referrer Name'}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </Item>
            </Grid>
            <Grid size={12}>
              <Item>
                <ItemTable
                  customerType={customer_type}
                  customerDiscount={
                    customer_details?.discount_card &&
                    customer_details?.discount_card_number
                      ? 20
                      : 0
                  }
                  products={products}
                  orderItems={orderItems}
                  addOrderItem={addOrderItem}
                  updateOrderItem={updateOrderItem}
                  deleteOrderItem={deleteOrderItem}
                  clearAllOrderItems={clearAllOrderItems}
                  disabled={!customer_id}
                />
              </Item>
            </Grid>
          </Grid>
        </>
      </PageWrapper>
    </>
  );
}
