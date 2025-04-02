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
  Tooltip,
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
// import blankPDF from '../../../assets/blank.pdf';
import { formatCurrency } from '../../../utils/auth';
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
import { modifyPdf } from '../../../utils/pdfInvoiceWriter';
import PaymentsList from './PaymentsList';
import LiveDateAndTime from '../../common/LiveDateAndTime';
import CancelOrder from './CancelOrder';

export const Item = styled(Paper)(({ theme }) => ({
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
  inventory_id: null,
  quantity: 1,
  unit_price: 0,
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
  const [hasSpecialDisc, setHasSpecialDisc] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
        setIsSaving(false);
      },
      onError: (err) => {
        console.error(err);
        setIsSaving(false);
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

  const { customer_id, invoice_number, vat_exempted, sc_pwd_discount } =
    watch();

  const [orderItems, setOrderItems] = useState<TableItem[]>([DEFAULT_ITEM]);

  const getCustomer = () =>
    customers.find(({ _id }: Customer) => _id === customer_id);

  const disableSendForApproval = () =>
    order.status !== OrderStatus.DRAFT ||
    !order.invoice_number ||
    !order.customer_id ||
    !order.order_items.some((oItem: OrderItem) => !!oItem.product_id);

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

  // eslint-disable-next-line
  const saveHandler = (formValues: { [x: string]: any }) => {
    mutateUpdateOrder({
      _id: orderId,
      ...order,
      ...formValues,
      status: order?.status,
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

  const onCancelSubmit = (
    cancel_items: CancelItem[],
    cancel_all: boolean,
    invoice_number: string,
  ) => {
    mutateCancelOrder({
      order_id: order?._id,
      cancel_items,
      cancel_all,
      invoice_number,
    });
  };

  useEffect(() => {
    if (customer_details) {
      setValue('co_doctor_name', customer_details?.co_doctor_name);
      setValue('discount_card', customer_details?.discount_card);
      setValue('discount_card_number', customer_details?.discount_card_number);
    }
  }, [customer_details]);

  useEffect(() => {
    if (formValues.discount_card_number && !sc_pwd_discount) {
      setValue('sc_pwd_discount', true);
    }
  }, [formValues.discount_card_number]);

  useEffect(() => {
    if (order && !isLoadingOrder) {
      reset({
        customer_id: order.customer_id?._id,
        payment_type: order.payment_type,
        billing_address: order.billing_address ?? order.customer_id?.address,
        tin: order.tin ?? order.customer_id?.tin,
        referrer_id: order.referrer_id?._id,
        referring_doctor_id: order.referring_doctor_id?._id,
        invoice_number: order.invoice_number,
        discount_card: order.discount_card,
        discount_card_number: order.discount_card_number,
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
    if (isDirty && !isLoadingOrder) {
      setIsSaving(true);
      handleSave({ ...formValues, order_items: orderItems });
    }
  }, [formValues, orderItems]);

  useEffect(() => {
    if (orderId === 'new' && activeCompany?._id && userInfo?._id) {
      mutateCreateOrder({
        company_id: activeCompany?._id,
        initiator_id: userInfo?._id,
        payment_type: 'cash',
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
                  {isSaving ? (
                    <Typography variant="h6" fontStyle={'italic'}>
                      Saving...
                    </Typography>
                  ) : (
                    <Typography variant="h6" fontWeight="bold">
                      Date: <LiveDateAndTime />
                    </Typography>
                  )}
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
                          ![OrderStatus.DRAFT, OrderStatus.UNAPPROVED].includes(
                            order?.status,
                          )
                        }
                        required
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
                          ![OrderStatus.DRAFT, OrderStatus.UNAPPROVED].includes(
                            order?.status,
                          )
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
                  {customer_type === 'PATIENT' && (
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
                              OrderStatus.UNAPPROVED,
                            ].includes(order?.status)
                          }
                          control={control}
                        />
                      </FormControl>
                    </Grid>
                  )}
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
                                OrderStatus.UNAPPROVED,
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
                                OrderStatus.UNAPPROVED,
                              ].includes(order?.status)
                            }
                          />
                        </FormControl>
                      </Grid>
                    </>
                  )}
                  {customer_type === 'CO_DOCTOR' && (
                    <>
                      <Grid size={4}>
                        <FormControl fullWidth margin="dense">
                          <FormLabel>C/O Doctor Name</FormLabel>
                          <TextField
                            {...register('co_doctor_name')}
                            placeholder={'Enter Doctor Name:'}
                            variant="outlined"
                            fullWidth
                            disabled={
                              !customer_id ||
                              ![
                                OrderStatus.DRAFT,
                                OrderStatus.UNAPPROVED,
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
                  {formatCurrency(order?.net_total - order?.total_amount_paid)}
                </Typography>
                <Typography>
                  (Amount Paid: ₱ {formatCurrency(order?.total_amount_paid)})
                </Typography>
                <FormControl
                  margin="dense"
                  sx={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}
                >
                  <FormLabel sx={{ margin: 0 }}>Invoice No.</FormLabel>
                  <TextField
                    {...register('invoice_number')}
                    placeholder={'Enter Invoice Number'}
                    variant="outlined"
                    autoFocus
                    // eslint-disable-next-line
                    sx={(theme: any) => ({
                      '.MuiInputBase-input': { textAlign: 'right' },
                      ...{
                        '.MuiInputBase-root':
                          invoice_number === null ||
                          invoice_number === undefined ||
                          invoice_number === ''
                            ? {
                                outline: '3px solid hsl(210, 98%, 42%, 0.5)',
                              }
                            : theme['.MuiInputBase-root'],
                      },
                    })}
                    disabled={
                      ![OrderStatus.DRAFT, OrderStatus.UNAPPROVED].includes(
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
                          ![OrderStatus.DRAFT, OrderStatus.UNAPPROVED].includes(
                            order?.status,
                          )
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
                          ![OrderStatus.DRAFT, OrderStatus.UNAPPROVED].includes(
                            order?.status,
                          )
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
                  subtotal={order.sub_total}
                  disabled={
                    !customer_id ||
                    ![OrderStatus.DRAFT, OrderStatus.UNAPPROVED].includes(
                      order?.status,
                    )
                  }
                />
                <Grid container spacing={2} justifyContent={'flex-end'}>
                  <Grid size={{ xs: 4, md: 3 }}>
                    <Item>
                      <Stack direction="row" alignItems={'center'} gap={1}>
                        <Controller
                          name="vat_exempted"
                          control={control}
                          defaultValue={false}
                          render={({ field }) => (
                            <Checkbox
                              {...field}
                              checked={field.value}
                              sx={{ padding: 0 }}
                            />
                          )}
                          disabled={
                            ![
                              OrderStatus.DRAFT,
                              OrderStatus.UNAPPROVED,
                            ].includes(order?.status)
                          }
                        />
                        <Typography
                          variant="body1"
                          fontWeight={'bold'}
                          color={vat_exempted ? undefined : 'textDisabled'}
                        >
                          VAT Exempt (-12%):
                        </Typography>
                      </Stack>
                    </Item>
                  </Grid>
                  <Grid
                    size={{ xs: 3, md: 2, xl: 1 }}
                    alignItems={'center'}
                    textAlign={'right'}
                  >
                    <Item>
                      <Typography variant="body1" fontWeight={'bold'}>
                        {`-${formatCurrency(order.vat_exempt_amount)}`}
                      </Typography>
                    </Item>
                  </Grid>
                </Grid>
                <Grid container spacing={2} justifyContent={'flex-end'}>
                  <Grid size={{ xs: 4, md: 3 }}>
                    <Item>
                      <Stack direction="row" alignItems={'center'} gap={1}>
                        <Controller
                          name="sc_pwd_discount"
                          control={control}
                          defaultValue={false}
                          render={({ field }) => (
                            <Checkbox
                              {...field}
                              checked={field.value}
                              sx={{ padding: 0 }}
                            />
                          )}
                          disabled={
                            ![
                              OrderStatus.DRAFT,
                              OrderStatus.UNAPPROVED,
                            ].includes(order?.status)
                          }
                        />
                        <Typography
                          variant="body1"
                          fontWeight={'bold'}
                          color={sc_pwd_discount ? undefined : 'textDisabled'}
                        >
                          Less SC/PWD/NAAC/MOV Discount (-20%):
                        </Typography>
                      </Stack>
                    </Item>
                  </Grid>

                  <Grid
                    size={{ xs: 3, md: 2, xl: 1 }}
                    alignItems={'center'}
                    textAlign={'right'}
                  >
                    <Item>
                      <Typography variant="body1" fontWeight={'bold'}>
                        {'-'}
                        {formatCurrency(order.sc_pwd_disc_amount)}
                      </Typography>
                    </Item>
                  </Grid>
                </Grid>

                <Grid container spacing={2} justifyContent={'flex-end'}>
                  <Grid size={{ xs: 4, md: 3 }}>
                    <Item>
                      <Stack direction="row" alignItems={'center'} gap={1}>
                        <Checkbox
                          checked={hasSpecialDisc}
                          onClick={() => {
                            setHasSpecialDisc((v) => !v);
                            setValue('vat_exempted', false);
                            setValue('sc_pwd_discount', false);
                          }}
                          sx={{ padding: 0 }}
                          disabled={
                            ![
                              OrderStatus.DRAFT,
                              OrderStatus.UNAPPROVED,
                            ].includes(order?.status)
                          }
                        />
                        <Typography
                          variant="body1"
                          fontWeight={'bold'}
                          color={hasSpecialDisc ? undefined : 'textDisabled'}
                        >
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
                                OrderStatus.UNAPPROVED,
                              ].includes(order?.status) ||
                              !hasSpecialDisc
                            }
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    ₱
                                  </InputAdornment>
                                ),
                              },
                            }}
                          />
                        </FormControl>
                      </Stack>
                    </Item>
                  </Grid>
                  <Grid
                    size={{ xs: 3, md: 2, xl: 1 }}
                    alignItems={'center'}
                    textAlign={'right'}
                  >
                    <Item>
                      <Typography variant="body1" fontWeight={'bold'}>
                        {formatCurrency(order.special_discount)}
                      </Typography>
                    </Item>
                  </Grid>
                </Grid>
                <Grid container spacing={2} justifyContent={'flex-end'}>
                  <Grid size={{ xs: 4, md: 3 }} textAlign={'right'}>
                    <Item>
                      <Typography variant="h6">TOTAL AMOUNT DUE:</Typography>
                    </Item>
                  </Grid>
                  <Grid
                    size={{ xs: 4, md: 3, xl: 2 }}
                    alignItems={'center'}
                    textAlign={'right'}
                  >
                    <Item>
                      <Typography variant="h6">
                        ₱ {formatCurrency(order?.net_total || 0)}
                      </Typography>
                    </Item>
                  </Grid>
                </Grid>
              </Item>
            </Grid>
            <Grid
              container
              size={12}
              alignItems={'center'}
              justifyContent={'center'}
            >
              <Button
                variant={
                  [OrderStatus.UNPAID, OrderStatus.PARTIALLY_PAID].includes(
                    order?.status,
                  )
                    ? 'contained'
                    : 'outlined'
                }
                startIcon={<MoneyOutlined />}
                sx={{
                  cursor: [
                    OrderStatus.UNPAID,
                    OrderStatus.PARTIALLY_PAID,
                  ].includes(order?.status)
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
                  order?.status === OrderStatus.UNAPPROVED &&
                  userInfo?.role === 'admin'
                    ? 'contained'
                    : 'outlined'
                }
                onClick={() => onUpdateOrderStatus(OrderStatus.APPROVED)}
                startIcon={<Approval />}
                sx={{
                  cursor:
                    order?.status === OrderStatus.UNAPPROVED &&
                    userInfo?.role === 'admin'
                      ? undefined
                      : 'not-allowed',
                }}
              >
                Approve Order
              </Button>
              <Button
                variant={
                  ![OrderStatus.DRAFT, OrderStatus.UNAPPROVED].includes(
                    order?.status,
                  )
                    ? 'contained'
                    : 'outlined'
                }
                startIcon={<Print />}
                sx={{
                  cursor: ![OrderStatus.DRAFT, OrderStatus.UNAPPROVED].includes(
                    order?.status,
                  )
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
                  if (order.status === OrderStatus.APPROVED) {
                    onUpdateOrderStatus(OrderStatus.UNPAID);
                  }
                }}
              >
                Generate Sales Invoice
              </Button>
              <Tooltip
                title={`Invoice No., Customer, and Order Items are required fields.`}
              >
                <Button
                  variant={disableSendForApproval() ? 'outlined' : 'contained'}
                  startIcon={
                    isLoadingUpdateStatus ? (
                      <CircularProgress color="inherit" size={16} />
                    ) : (
                      <Send />
                    )
                  }
                  onClick={() => onUpdateOrderStatus(OrderStatus.UNAPPROVED)}
                  sx={{
                    cursor: disableSendForApproval()
                      ? 'not-allowed'
                      : undefined,
                  }}
                >
                  Send Order for Approval
                </Button>
              </Tooltip>
              {[
                OrderStatus.COMPLETED,
                OrderStatus.APPROVED,
                OrderStatus.UNPAID,
                OrderStatus.PARTIALLY_PAID,
              ].includes(order.status) && (
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
          <Grid container size={12} alignItems={'center'} gap={2}>
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
              label={order?.status?.toUpperCase().replaceAll('_', ' ')}
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
            {order?.last_updated_by?._id && (
              <>
                <Typography variant={'h6'}>Last Updated by:</Typography>
                <Chip
                  icon={<Person />}
                  color={'default'}
                  variant="filled"
                  size="medium"
                  label={`${order?.last_updated_by?.first_name} ${order?.last_updated_by?.last_name}`}
                />
              </>
            )}
            {order?.cancel_initiator_id?._id && (
              <>
                <Typography variant={'h6'}>Cancelled by:</Typography>
                <Chip
                  icon={<Person />}
                  color={'default'}
                  variant="filled"
                  size="medium"
                  label={`${order?.cancel_initiator_id?.first_name} ${order?.cancel_initiator_id?.last_name}`}
                />
              </>
            )}
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
