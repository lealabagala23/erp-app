import React, { useContext, useEffect, useMemo, useState } from 'react';
import AppNavbar from '../../common/AppNavbar';
import Header from '../../common/Header';
import PageWrapper from '../../wrappers/PageWrapper';
import {
  Alert,
  Button,
  CircularProgress,
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
import { useMutation, useQuery } from '@tanstack/react-query';
import { Customer } from '../accounts/types';
import { useForm, useWatch } from 'react-hook-form';
import FormAutocomplete from '../../common/FormAutocomplete';
import ItemTable from './ItemTable';
import { Order, OrderItem, TableItem } from './types';
import { fetchProducts } from '../inventory/apis';
import dayjs from 'dayjs';
import {
  convertNaNToZero,
  formatCurrency,
  getUnitPrice,
} from '../../../utils/auth';
import {
  Approval,
  Edit,
  EditNote,
  MoneyOutlined,
  Print,
  Send,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { FETCH_PRODUCTS_QUERY_KEY } from '../inventory/constants';
import { FETCH_CUSTOMERS_QUERY_KEY } from '../accounts/constants';
import { createOrder, fetchOrderById, updateOrder } from './apis';
import AuthContext from '../../auth/AuthContext';
import { debounce } from 'lodash';

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
  const { activeCompany, userInfo } = useContext(AuthContext);
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  const { register, setValue, reset, watch, control, getValues } = useForm();
  const formValues = useWatch({ control });
  const [paymentType, setPaymentType] = useState('');

  const { data: order = {}, isLoading: isLoadingOrder } = useQuery(
    ['fetchOrderById', orderId],
    () => fetchOrderById({ id: orderId as string }),
    {
      enabled: !!orderId && orderId !== 'new',
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );

  const { data: customers = [] } = useQuery(
    [FETCH_CUSTOMERS_QUERY_KEY],
    () => fetchCustomers(),
    {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );

  const { data: products = [] } = useQuery(
    [FETCH_PRODUCTS_QUERY_KEY],
    () => fetchProducts(),
    {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );

  const { mutateAsync: mutateCreateOrder, isLoading: isLoadingCreate } =
    useMutation({
      mutationFn: createOrder,
      onSuccess: ({ _id }) => {
        navigate(`/orders/${_id}`);
      },
      onError: (err) => {
        console.error(err);
      },
    });

  const { mutateAsync: mutateUpdateOrder, isLoading: isLoadingUpdate } =
    useMutation({
      mutationFn: updateOrder,
      onSuccess: () => {
        // Do something
      },
      onError: (err) => {
        console.error(err);
      },
    });

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

  const computeSubtotal = () =>
    orderItems.reduce((accum, obj) => {
      const totalPrice =
        getUnitPrice(products, obj.product_id as string, customer_type) *
        obj.quantity;
      const totalPriceWDisc =
        totalPrice -
        (obj.custom_discount ? totalPrice * (obj.custom_discount / 100) : 0);
      return accum + totalPriceWDisc;
    }, 0);

  const computeDiscountAmount = () =>
    discount_type === 'amount'
      ? discount
      : computeSubtotal() * (discount / 100);

  const computeTotalSales = () =>
    convertNaNToZero(computeSubtotal() - computeDiscountAmount());

  // eslint-disable-next-line
  const saveHandler = (formValues: { [x: string]: any }) => {
    mutateUpdateOrder({
      _id: orderId,
      ...formValues,
    } as Order);
  };

  const handleSave = useMemo(() => debounce(saveHandler, 1000), []);

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

  useEffect(() => {
    if (order) {
      reset({
        customer_id: order.customer_id?._id,
        payment_type: order.payment_type,
        billing_address: order.billing_address,
        tin: order.tin,
        referrer_id: order.referrer_id?._id,
        invoice_number: order.invoice_number,
      });
      setPaymentType(order.payment_type);
      console.log('order.order_items', order.order_items);
      setOrderItems(
        (order.order_items || []).map((item: OrderItem, key: number) => ({
          ...DEFAULT_ITEM,
          ...item,
          // eslint-disable-next-line
          product_id: (item.product_id as any)?._id,
          item_number: key + 1,
        })),
      );
    }
  }, [order]);

  useEffect(() => {
    handleSave({ ...formValues, order_items: orderItems });
  }, [formValues, orderItems]);

  useEffect(() => {
    if (orderId === 'new' && activeCompany?._id && userInfo?._id) {
      mutateCreateOrder({
        company_id: activeCompany?._id,
        initiator_id: userInfo?._id,
      });
    }
  }, [orderId, activeCompany, userInfo]);

  return (
    <>
      <AppNavbar title={'Generate Sales'} />
      <PageWrapper>
        <>
          <Header />
          {(isLoadingCreate || isLoadingOrder) && (
            <CircularProgress color="inherit" />
          )}
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
                        setValue={setValue}
                        register={register}
                        getValues={getValues}
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
                        value={paymentType}
                        onChange={(e) => {
                          setPaymentType(e.target.value);
                          setValue('payment_type', e.target.value);
                        }}
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
                  ₱ {formatCurrency(computeTotalSales())}
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
                        getValues={getValues}
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
                      {'-'}
                      {formatCurrency(computeDiscountAmount())}
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
                      ₱ {formatCurrency(computeTotalSales())}
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
                    icon={
                      isLoadingUpdate ? (
                        <Edit fontSize="inherit" />
                      ) : (
                        <EditNote fontSize="inherit" />
                      )
                    }
                    severity="info"
                    variant="filled"
                  >
                    {isLoadingUpdate ? 'Saving...' : 'Draft'}
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
