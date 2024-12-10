import React, { useEffect, useState } from 'react';
import AppNavbar from '../../common/AppNavbar';
import Header from '../../common/Header';
import PageWrapper from '../../wrappers/PageWrapper';
import {
  Alert,
  Button,
  FormControl,
  FormLabel,
  Grid2 as Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
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
import dayjs from 'dayjs';
import { formatCurrency } from '../../../utils/auth';
import {
  Approval,
  EditNote,
  MoneyOutlined,
  Print,
  Send,
} from '@mui/icons-material';

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

  const { customer_id, invoice_number, discount, discount_type } = watch();

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

  const getUnitPrice = (product_id: string) => {
    // eslint-disable-next-line
    const selectedProduct = products.find(({ _id }: any) => _id === product_id);
    switch (customer_type) {
      case 'PATIENT':
        return selectedProduct?.patient_price ?? 0;
      case 'DOCTOR':
        return selectedProduct?.doctor_price ?? 0;
      case 'AGENCY':
        return selectedProduct?.agency_price ?? 0;
      default:
        return 0;
    }
  };

  const computeSubtotal = () =>
    orderItems.reduce((accum, obj) => {
      const totalPrice = getUnitPrice(obj.product_id as string) * obj.quantity;
      const totalPriceWDisc =
        totalPrice -
        (obj.custom_discount ? totalPrice * (obj.custom_discount / 100) : 0);
      return accum + totalPriceWDisc;
    }, 0);

  const computeLessDiscount = () => {
    const subtotal = computeSubtotal();
    const discountAmount =
      discount_type === 'amount' ? discount : subtotal * (discount / 100);
    return isNaN(subtotal - discountAmount) ? 0 : subtotal - discountAmount;
  };

  useEffect(() => {
    if (customer_details) {
      setValue('discount_card', customer_details?.discount_card);
      setValue('discount_card_number', customer_details?.discount_card_number);

      if (customer_details?.discount_card_number) {
        setValue('discount_type', 'percent');
        setValue('discount', 20);
      }
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
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h3" fontWeight="bold">
                    Invoice #{invoice_number}
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    Date: {dayjs().format('MM-DD-YYYY hh:mm A')}
                  </Typography>
                </Stack>
              </Item>
            </Grid>
            <Grid size={8}>
              <Item sx={{ height: '100%' }}>
                <Grid container spacing={2}>
                  <Grid size={4}>
                    <FormControl fullWidth margin="dense">
                      <FormLabel>Customer</FormLabel>
                      <FormAutocomplete
                        options={customers.map(
                          ({
                            _id,
                            customer_name,
                            customer_type,
                          }: Customer) => ({
                            label: customer_name,
                            value: _id,
                            category: customer_type,
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
                  <Grid size={'auto'}>
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
                  <Grid size={'auto'}>
                    <FormControl fullWidth margin="dense">
                      <FormLabel>Payment Type</FormLabel>
                      <TextField
                        select
                        {...register('payment_type', {
                          required: 'Payment Type is required',
                        })}
                        sx={{
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
                <Typography variant="h1">
                  ₱ {formatCurrency(computeLessDiscount())}
                </Typography>
                <FormControl margin="dense">
                  <FormLabel>Invoice No.</FormLabel>
                  <TextField
                    {...register('invoice_number')}
                    placeholder={'Enter Invoice Number'}
                    variant="outlined"
                    sx={{ '.MuiInputBase-input': { textAlign: 'right' } }}
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
                  products={products}
                  orderItems={orderItems}
                  addOrderItem={addOrderItem}
                  updateOrderItem={updateOrderItem}
                  deleteOrderItem={deleteOrderItem}
                  clearAllOrderItems={clearAllOrderItems}
                  subtotal={computeSubtotal()}
                  getUnitPrice={getUnitPrice}
                  disabled={!customer_id}
                />
                <Stack direction="column">
                  <Stack
                    direction="row"
                    gap={4}
                    padding={1}
                    justifyContent={'flex-end'}
                    alignItems={'center'}
                  >
                    <Typography>Less:</Typography>
                    <FormControl margin="dense">
                      <TextField
                        {...register('discount_type')}
                        select
                        variant="outlined"
                        defaultValue={'percent'}
                      >
                        <MenuItem
                          key={'discount-type-percent'}
                          value={'percent'}
                        >
                          Discount Percentage
                        </MenuItem>
                        <MenuItem key={'discount-type-amount'} value={'amount'}>
                          Discount Amount
                        </MenuItem>
                      </TextField>
                    </FormControl>
                    <FormControl margin="dense">
                      <TextField
                        {...register('discount')}
                        sx={{ width: '150px' }}
                        type={'number'}
                        slotProps={{
                          input: {
                            startAdornment:
                              discount_type === 'amount' ? (
                                <InputAdornment position="start">
                                  Php
                                </InputAdornment>
                              ) : undefined,
                            endAdornment:
                              discount_type === 'percent' ? (
                                <InputAdornment position="end">
                                  %
                                </InputAdornment>
                              ) : undefined,
                          },
                        }}
                      />
                    </FormControl>
                    <Typography variant="h6">
                      {formatCurrency(computeLessDiscount())}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    gap={4}
                    padding={1}
                    justifyContent={'flex-end'}
                    alignItems={'center'}
                  >
                    <Typography variant="h6">TOTAL AMOUNT DUE:</Typography>
                    <Typography variant="h6">
                      ₱ {formatCurrency(computeLessDiscount())}
                    </Typography>
                  </Stack>
                </Stack>
              </Item>
            </Grid>
            <Grid size={12}>
              <Stack direction={'row'} gap={2} justifyContent={'space-between'}>
                <Stack direction={'row'} gap={2} alignItems={'center'}>
                  <Typography variant={'h6'}>Status:</Typography>
                  <Alert
                    icon={<EditNote fontSize="inherit" />}
                    severity="info"
                    variant="filled"
                  >
                    Draft
                  </Alert>
                </Stack>

                <Stack
                  direction={'row'}
                  gap={2}
                  justifyContent={'flex-end'}
                  alignItems={'center'}
                >
                  <Button
                    variant={'outlined'}
                    startIcon={<MoneyOutlined />}
                    sx={{ cursor: 'not-allowed' }}
                  >
                    Add Payment
                  </Button>
                  <Button
                    variant={'outlined'}
                    startIcon={<Approval />}
                    sx={{ cursor: 'not-allowed' }}
                  >
                    Approve Order
                  </Button>
                  <Button
                    variant={'outlined'}
                    startIcon={<Print />}
                    sx={{ cursor: 'not-allowed' }}
                  >
                    Generate Sales Invoice
                  </Button>
                  <Button variant={'contained'} startIcon={<Send />}>
                    Send Order for Approval
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </>
      </PageWrapper>
    </>
  );
}
