import {
  ArrowCircleRightSharp,
  WarningAmberRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import React, { useContext } from 'react';
import AuthContext from '../../auth/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { fetchOrders } from '../orders/apis';
import { FETCH_ORDERS_QUERY_KEY } from '../orders/Orders';
import { OrderStatus } from '../generate-sales/constants';
import { Order } from '../generate-sales/types';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

export default function OrderApprovals() {
  const navigate = useNavigate();
  const { activeCompany } = useContext(AuthContext);

  const { data = [], isLoading } = useQuery(
    [FETCH_ORDERS_QUERY_KEY, activeCompany?._id],
    () =>
      fetchOrders({
        company_id: activeCompany?._id as string,
        status: OrderStatus.UNAPPROVED,
      }),
    {
      enabled: !!activeCompany?._id,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );

  if (data.length === 0 && !isLoading) return <></>;

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Stack direction={'row'} gap={1} alignItems={'center'}>
          <WarningAmberRounded />
          <Typography component="h2" variant="subtitle2">
            Orders Awaiting Approval
          </Typography>
        </Stack>
        <Stack direction="column">
          <Typography sx={{ marginBottom: 2 }}>
            The following orders are awaiting approval from admin:
          </Typography>
          {isLoading ? (
            <Box height={'56px'} margin={'auto'}>
              <CircularProgress color="inherit" />
            </Box>
          ) : (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {data.map((order: Order, key: number) => (
                <ListItem key={key}>
                  <ListItemText
                    // eslint-disable-next-line
                    primary={`Invoice #${order.invoice_number || ''} ${(order.customer_id as any)?.customer_name}`}
                    secondary={`Created at ${dayjs(order.created_at).format('MM/DD/YYYY')}`}
                    sx={{ color: 'var(--template-palette-error-main)' }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Stack>
      </CardContent>
      <CardActions
        sx={{ marginTop: 2, display: 'flex', justifyContent: 'flex-end' }}
      >
        <Button
          variant="text"
          endIcon={<ArrowCircleRightSharp />}
          onClick={() => navigate('/orders/list')}
        >
          Go to Orders Page
        </Button>
      </CardActions>
    </Card>
  );
}
