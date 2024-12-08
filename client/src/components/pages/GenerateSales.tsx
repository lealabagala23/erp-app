import * as React from 'react';
import AppNavbar from '../common/AppNavbar';
import Header from '../common/Header';
import PageWrapper from '../wrappers/PageWrapper';
import {
  createFilterOptions,
  FormControl,
  FormLabel,
  Grid2 as Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { fetchCustomers } from './accounts/apis';
import { useQuery } from '@tanstack/react-query';
import { Customer } from './accounts/types';
import { useForm } from 'react-hook-form';
import FormAutocomplete from '../common/FormAutocomplete';

// eslint-disable-next-line
const filter = createFilterOptions<any>();

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  color: theme.palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));

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

  console.log('watch', watch());

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
                  <Grid size={8}>
                    <FormControl fullWidth margin="dense">
                      <FormLabel>Customer</FormLabel>
                      <FormAutocomplete
                        options={customers.map(
                          ({ _id, customer_name }: Customer) => ({
                            label: customer_name,
                            value: _id,
                          }),
                        )} // TODO: add referrers list
                        register={register}
                        setValue={setValue}
                        name="referrer"
                      />
                      {/* <TextField
                        select
                        {...register('customer_id', {
                          required: 'Customer is required',
                        })}
                        value={customerId}
                        onChange={(e) => {
                          setCustomerId(e.target.value);
                          setValue('customer_id', e.target.value);
                        }}
                        placeholder={
                          isLoadingFetch
                            ? 'Loading Customers...'
                            : 'Select Customer'
                        }
                        variant="outlined"
                        fullWidth
                      >
                        {customers.map((s: Customer) => (
                          <MenuItem key={s._id} value={s._id}>
                            {s.customer_name}
                          </MenuItem>
                        ))}
                      </TextField> */}
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
                        placeholder={'Select Payment Type'}
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
                </Grid>
              </Item>
            </Grid>
            <Grid size={4}>
              <Item sx={{ textAlign: 'right' }}>
                <Typography>BALANCE DUE</Typography>
                <Typography variant="h1">₱ 1,000.00</Typography>
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
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </Item>
            </Grid>
            <Grid size={12}>
              <Item>table here</Item>
            </Grid>
          </Grid>
        </>
      </PageWrapper>
    </>
  );
}
