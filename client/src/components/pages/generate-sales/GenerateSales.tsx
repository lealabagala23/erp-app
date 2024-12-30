import React, { useContext, useEffect, useMemo, useState } from 'react';
import AppNavbar from '../../common/AppNavbar';
import Header from '../../common/Header';
import PageWrapper from '../../wrappers/PageWrapper';
import {
  Button,
  Checkbox,
  Chip,
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
import { fetchCustomers, fetchCustomerType } from '../accounts/apis';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Customer, Doctor } from '../accounts/types';
import { Controller, useForm, useWatch } from 'react-hook-form';
import FormAutocomplete from '../../common/FormAutocomplete';
import ItemTable from './ItemTable';
import { CancelItem, Order, OrderItem, Payment, TableItem } from './types';
import { fetchProducts } from '../inventory/apis';
import lhctPDF from '../../../assets/lhct_invoice.pdf';
import lmtPDF from '../../../assets/lmt_invoice.pdf';
import { formatCurrency, getUnitPrice } from '../../../utils/auth';
import {
  Approval,
  Cancel,
  Edit,
  EditNote,
  MoneyOutlined,
  Person,
  Print,
  Send,
} from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FETCH_PRODUCTS_QUERY_KEY } from '../inventory/constants';
import { FETCH_CUSTOMERS_QUERY_KEY } from '../accounts/constants';
import {
  addOrderPayment,
  cancelOrder,
  createOrder,
  fetchOrderById,
  updateOrder,
  updateOrderStatus,
} from './apis';
import AuthContext from '../../auth/AuthContext';
import { debounce } from 'lodash';
import {
  FETCH_ORDER_BY_ID_QUERY_KEY,
  getOrderStatusColor,
  OrderStatus,
} from './constants';
import PaymentForm from './PaymentForm';
import { modifyPdf } from '../../../utils/pdfWriter';
import PaymentsList from './PaymentsList';
import LiveDateAndTime from '../../common/LiveDateAndTime';
import CancelOrder from './CancelOrder';

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
  total_price: 0,
};

export default function GenerateSales() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const loadCustomerId = params.get('customer_id');

  const { activeCompany, userInfo } = useContext(AuthContext);
  const { id: orderId } = useParams();
  const {
    register,
    setValue,
    reset,
    watch,
    control,
    getValues,
    formState: { isDirty },
  } = useForm();
  const formValues = useWatch({ control });
  const [paymentType, setPaymentType] = useState('');
  const [openPaymentList, setOpenPaymentList] = useState(false);
  const [openPaymentForm, setOpenPaymentForm] = useState(false);
  const [openCancelOrder, setOpenCancelOrder] = useState(false);

  const { data: order = {}, isLoading: isLoadingOrder } = useQuery(
    [FETCH_ORDER_BY_ID_QUERY_KEY, orderId],
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

  const { data: referringDoctors = [] } = useQuery(
    ['fetchReferringDoctors'],
    () =>
      fetchCustomerType({
        customer_type: 'DOCTOR',
      }),
    {
      enabled: true,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );

  const { mutateAsync: mutateCreateOrder, isLoading: isLoadingCreate } =
    useMutation({
      mutationFn: createOrder,
      onSuccess: ({ _id }) => {
        window.location.assign(`/orders/${_id}`);
      },
      onError: (err) => {
        console.error(err);
      },
    });

  const { mutateAsync: mutateUpdateOrder, isLoading: isLoadingUpdate } =
    useMutation({
      mutationFn: updateOrder,
      onSuccess: () => {
        queryClient.invalidateQueries([FETCH_ORDER_BY_ID_QUERY_KEY]);
      },
      onError: (err) => {
        console.error(err);
      },
    });

  const {
    mutateAsync: mutateUpdateOrderStatus,
    isLoading: isLoadingUpdateStatus,
  } = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries([FETCH_ORDER_BY_ID_QUERY_KEY]);
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const {
    mutateAsync: mutateUpdateOrderPayment,
    isLoading: isLoadingUpdatePayment,
  } = useMutation({
    mutationFn: addOrderPayment,
    onSuccess: () => {
      queryClient.invalidateQueries([FETCH_ORDER_BY_ID_QUERY_KEY]);
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const { mutateAsync: mutateCancelOrder } = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries([FETCH_ORDER_BY_ID_QUERY_KEY]);
      setOpenCancelOrder(false);
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const {
    customer_id,
    invoice_number,
    vat_exempted,
    sc_pwd_discount,
    discount_card_number,
    special_discount,
  } = watch();

  const [orderItems, setOrderItems] = useState<TableItem[]>([DEFAULT_ITEM]);

  const getCustomer = () =>
    customers.find(({ _id }: Customer) => _id === customer_id);

  const { customer_type, customer_details } = getCustomer() || {};

  const addOrderItem = () => {
    setOrderItems((v) => {
      const newOrderItems = [
        ...v,
        { ...DEFAULT_ITEM, item_number: v.length + 1 },
      ];
      handleSave({ ...formValues, order_items: newOrderItems });
      return newOrderItems;
    });
  };

  const updateOrderItem = (item: TableItem) => {
    const updated = orderItems.map((obj) =>
      obj.item_number === item.item_number ? item : obj,
    );
    setOrderItems(updated);
    handleSave({ ...formValues, order_items: updated });
  };

  const deleteOrderItem = (item: TableItem) => {
    const updated =
      orderItems.length === 1
        ? [DEFAULT_ITEM]
        : orderItems
            .filter((obj) => obj.item_number !== item.item_number)
            .map((obj, key) => ({ ...obj, item_number: key + 1 }));
    setOrderItems(updated);
    handleSave({ ...formValues, order_items: updated });
  };

  const clearAllOrderItems = () => {
    setOrderItems([DEFAULT_ITEM]);
    handleSave({ ...formValues, order_items: [DEFAULT_ITEM] });
  };

  const computeSubtotal = () =>
    orderItems.reduce((accum, obj) => {
      const totalPrice =
        getUnitPrice(products, obj.product_id as string, customer_type) *
        obj.quantity;
      return accum + totalPrice;
    }, 0);

  const computeVATExemptAmount = () =>
    vat_exempted ? computeSubtotal() * (12 / 100) : 0;

  const computeLessDiscAmount = () =>
    sc_pwd_discount ? computeVATExemptAmount() * (20 / 100) : 0;

  const computeSpecialDiscAmount = () =>
    special_discount ? special_discount * -1 : 0;

  // eslint-disable-next-line
  const saveHandler = (formValues: { [x: string]: any }) => {
    mutateUpdateOrder({
      _id: orderId,
      ...formValues,
      status: order?.status || 'draft',
      sc_pwd_discount: !!discount_card_number,
    } as Order);
  };

  const handleSave = useMemo(() => debounce(saveHandler, 1000), []);

  const onUpdateOrderStatus = (status: OrderStatus) => {
    mutateUpdateOrderStatus({ ...order, status });
  };

  const handleClosePaymentForm = () => setOpenPaymentForm(false);
  const handleClosePaymentList = () => setOpenPaymentList(false);

  const onPaymentSubmit = (payment: Payment) => {
    mutateUpdateOrderPayment({ ...payment, order_id: order?._id });
  };

  const onCancelSubmit = (cancel_items: CancelItem[], total: number) => {
    const cancel_all =
      total >=
      order.order_items.reduce(
        (accum: number, obj: OrderItem) => accum + obj.quantity,
        0,
      );
    mutateCancelOrder({ order_id: order?._id, cancel_items, cancel_all });
  };

  useEffect(() => {
    if (customer_details) {
      setValue('discount_card', customer_details?.discount_card);
      setValue('discount_card_number', customer_details?.discount_card_number);
    }
  }, [customer_details]);

  useEffect(() => {
    if (order) {
      reset({
        customer_id: order.customer_id?._id,
        payment_type: order.payment_type,
        billing_address: order.billing_address ?? order.customer_id?.address,
        tin: order.tin ?? order.customer_id?.tin,
        referrer_id: order.referrer_id?._id,
        referring_doctor_id: order.referring_doctor_id?._id,
        invoice_number: order.invoice_number,
        special_discount: order.special_discount,
        vat_exempted: order.vat_exempted || false,
        sc_pwd_discount: order.sc_pwd_discount || false,
      });
      setPaymentType(order.payment_type);
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
    if (isDirty) handleSave({ ...formValues, order_items: orderItems });
  }, [formValues, orderItems]);

  useEffect(() => {
    if (orderId === 'new' && activeCompany?._id && userInfo?._id) {
      mutateCreateOrder({
        company_id: activeCompany?._id,
        initiator_id: userInfo?._id,
      });
    }
  }, [orderId, activeCompany, userInfo]);

  useEffect(() => {
    if (loadCustomerId && !customer_id) {
      setValue('customer_id', loadCustomerId);
    }
  }, [loadCustomerId]);

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
                    Date: <LiveDateAndTime />
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
                        options={[
                          { label: 'Add New Customer...', value: 'new' },
                          ...customers.map(
                            ({
                              _id,
                              customer_name,
                              customer_type,
                            }: Customer) => ({
                              label: customer_name,
                              value: _id,
                              category: customer_type,
                            }),
                          ),
                        ]}
                        onCreateNew={() =>
                          navigate(`/customers?create=true&orderId=${orderId}`)
                        }
                        getValues={getValues}
                        name="customer_id"
                        autoFocus
                        placeholder={'Select Customer'}
                        control={control}
                        disabled={
                          ![
                            OrderStatus.DRAFT,
                            OrderStatus.FOR_APPROVAL,
                          ].includes(order?.status)
                        }
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
                            WebkitTextFillColor: 'unset',
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
                        disabled={
                          !customer_id ||
                          ![
                            OrderStatus.DRAFT,
                            OrderStatus.FOR_APPROVAL,
                          ].includes(order?.status)
                        }
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
                  <Grid size={4}>
                    <FormControl fullWidth margin="dense">
                      <FormLabel>Referring Doctor</FormLabel>
                      <FormAutocomplete
                        options={[
                          ...referringDoctors.map(
                            ({ _id, customer_id }: Doctor) => ({
                              // eslint-disable-next-line
                              label: (customer_id as any)?.customer_name,
                              value: _id,
                            }),
                          ),
                        ]}
                        getValues={getValues}
                        name="referring_doctor_id"
                        placeholder={'Select Doctor'}
                        disabled={
                          !customer_id ||
                          ![
                            OrderStatus.DRAFT,
                            OrderStatus.FOR_APPROVAL,
                          ].includes(order?.status)
                        }
                        control={control}
                      />
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
                            disabled={
                              !customer_id ||
                              ![
                                OrderStatus.DRAFT,
                                OrderStatus.FOR_APPROVAL,
                              ].includes(order?.status)
                            }
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
                            disabled={
                              !customer_id ||
                              ![
                                OrderStatus.DRAFT,
                                OrderStatus.FOR_APPROVAL,
                              ].includes(order?.status)
                            }
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
                  ₱{' '}
                  {formatCurrency(
                    order?.total_amount - order?.total_amount_paid,
                  )}
                </Typography>
                <Typography>
                  (Amount Paid: ₱ {formatCurrency(order?.total_amount_paid)})
                </Typography>
                <FormControl margin="dense">
                  <FormLabel>Invoice No.</FormLabel>
                  <TextField
                    {...register('invoice_number')}
                    placeholder={'Enter Invoice Number'}
                    variant="outlined"
                    sx={{ '.MuiInputBase-input': { textAlign: 'right' } }}
                    disabled={
                      !customer_id ||
                      ![OrderStatus.DRAFT, OrderStatus.FOR_APPROVAL].includes(
                        order?.status,
                      )
                    }
                  />
                </FormControl>
              </Item>
            </Grid>
            <Grid size={12}>
              <Item>
                <Grid container spacing={2}>
                  <Grid size={8}>
                    <FormControl fullWidth margin="dense">
                      <FormLabel>Billing Address</FormLabel>
                      <TextField
                        {...register('billing_address')}
                        placeholder={'Enter billing address'}
                        variant="outlined"
                        fullWidth
                        // multiline
                        // rows={1}
                        disabled={
                          !customer_id ||
                          ![
                            OrderStatus.DRAFT,
                            OrderStatus.FOR_APPROVAL,
                          ].includes(order?.status)
                        }
                        // sx={{ '.MuiInputBase-root': { height: 'unset' } }}
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
                        disabled={
                          !customer_id ||
                          ![
                            OrderStatus.DRAFT,
                            OrderStatus.FOR_APPROVAL,
                          ].includes(order?.status)
                        }
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
                  disabled={
                    !customer_id ||
                    ![OrderStatus.DRAFT, OrderStatus.FOR_APPROVAL].includes(
                      order?.status,
                    )
                  }
                />
                <Stack direction="column">
                  <Stack
                    direction="row"
                    gap={4}
                    padding={1}
                    justifyContent={'flex-end'}
                    alignItems={'center'}
                  >
                    <Stack direction="row" alignItems={'center'}>
                      <Controller
                        name="vat_exempted"
                        control={control}
                        render={({ field }) => (
                          <Checkbox {...field} checked={field.value} />
                        )}
                      />
                      <Typography variant="body1" fontWeight={'bold'}>
                        VAT Exempt (-12%):
                      </Typography>
                    </Stack>
                    <Typography variant="body1" fontWeight={'bold'}>
                      {`-${formatCurrency(computeVATExemptAmount())}`}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    gap={4}
                    padding={1}
                    justifyContent={'flex-end'}
                    alignItems={'center'}
                  >
                    <Typography variant="body1" fontWeight={'bold'}>
                      Less SC/PWD/NAAC/MOV Discount (-20%):
                    </Typography>
                    <Typography variant="body1" fontWeight={'bold'}>
                      {'-'}
                      {formatCurrency(computeLessDiscAmount())}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    gap={4}
                    padding={1}
                    justifyContent={'flex-end'}
                    alignItems={'center'}
                  >
                    <Typography variant="body1" fontWeight={'bold'}>
                      Special Discount:
                    </Typography>
                    <FormControl margin="dense">
                      <TextField
                        {...register('special_discount')}
                        sx={{ width: '150px' }}
                        inputProps={{
                          style: { textAlign: 'right' },
                        }}
                        type={'number'}
                        disabled={
                          !customer_id ||
                          ![
                            OrderStatus.DRAFT,
                            OrderStatus.FOR_APPROVAL,
                          ].includes(order?.status)
                        }
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                Php
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </FormControl>
                    <Typography variant="body1" fontWeight={'bold'}>
                      {formatCurrency(computeSpecialDiscAmount())}
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
                      ₱ {formatCurrency(order?.total_amount || 0)}
                    </Typography>
                  </Stack>
                </Stack>
              </Item>
            </Grid>
            <Grid container size={12} alignItems={'center'}>
              <Typography variant={'h6'}>Status:</Typography>
              <Chip
                icon={
                  isLoadingUpdate ? (
                    <Edit fontSize="inherit" />
                  ) : (
                    <EditNote fontSize="inherit" />
                  )
                }
                color={getOrderStatusColor(order?.status)}
                variant="filled"
                size="medium"
                label={
                  isLoadingUpdate
                    ? 'Saving...'
                    : order?.status?.toUpperCase().replaceAll('_', ' ')
                }
              />
              {order?.approver_id?._id && (
                <>
                  <Typography variant={'h6'}>Approved by:</Typography>
                  <Chip
                    icon={<Person />}
                    color={'default'}
                    variant="filled"
                    size="medium"
                    label={`${order?.approver_id?.first_name} ${order?.approver_id?.last_name}`}
                  />
                </>
              )}
              <Button
                variant={
                  order?.status === OrderStatus.UNPAID
                    ? 'contained'
                    : 'outlined'
                }
                startIcon={<MoneyOutlined />}
                sx={{
                  cursor:
                    order?.status === OrderStatus.UNPAID
                      ? undefined
                      : 'not-allowed',
                }}
                onClick={() =>
                  (order?.payments || []).length > 0
                    ? setOpenPaymentList(true)
                    : setOpenPaymentForm(true)
                }
              >
                {(order?.payments || []).length > 0
                  ? 'See Payments'
                  : 'Add Payment'}
              </Button>
              <Button
                variant={
                  order?.status === OrderStatus.FOR_APPROVAL &&
                  userInfo?.role === 'admin'
                    ? 'contained'
                    : 'outlined'
                }
                onClick={() => onUpdateOrderStatus(OrderStatus.FOR_PRINTING)}
                startIcon={<Approval />}
                sx={{
                  cursor:
                    order?.status === OrderStatus.FOR_APPROVAL &&
                    userInfo?.role === 'admin'
                      ? undefined
                      : 'not-allowed',
                }}
              >
                Approve Order
              </Button>
              <Button
                variant={
                  order?.status === OrderStatus.FOR_PRINTING
                    ? 'contained'
                    : 'outlined'
                }
                startIcon={<Print />}
                sx={{
                  cursor:
                    order?.status === OrderStatus.FOR_PRINTING
                      ? undefined
                      : 'not-allowed',
                }}
                onClick={() => {
                  modifyPdf(
                    activeCompany?.company_name?.includes('LHCT')
                      ? lhctPDF
                      : lmtPDF,
                    order,
                  );
                  onUpdateOrderStatus(OrderStatus.UNPAID);
                }}
              >
                Generate Sales Invoice
              </Button>
              <Button
                variant={
                  order.status !== OrderStatus.DRAFT ? 'outlined' : 'contained'
                }
                startIcon={
                  isLoadingUpdateStatus ? (
                    <CircularProgress color="inherit" size={16} />
                  ) : (
                    <Send />
                  )
                }
                onClick={() => onUpdateOrderStatus(OrderStatus.FOR_APPROVAL)}
                sx={{
                  cursor:
                    order.status !== OrderStatus.DRAFT
                      ? 'not-allowed'
                      : undefined,
                }}
              >
                Send Order for Approval
              </Button>
              {[OrderStatus.COMPLETED, OrderStatus.PARTIAL_CANCELLED].includes(
                order.status,
              ) && (
                <Button
                  variant={'contained'}
                  startIcon={<Cancel />}
                  onClick={() => setOpenCancelOrder(true)}
                >
                  Cancel Order
                </Button>
              )}
            </Grid>
          </Grid>
          <PaymentForm
            open={openPaymentForm}
            handleClose={handleClosePaymentForm}
            onPaymentSubmit={onPaymentSubmit}
            isLoading={isLoadingUpdatePayment}
          />
          <PaymentsList
            payments={order?.payments || []}
            open={openPaymentList}
            handleClose={handleClosePaymentList}
            onAddPayment={() => setOpenPaymentForm(true)}
          />
          <CancelOrder
            open={openCancelOrder}
            handleClose={() => setOpenCancelOrder(false)}
            orderItems={order.order_items as OrderItem[]}
            onCancel={onCancelSubmit}
          />
        </>
      </PageWrapper>
    </>
  );
}
