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
import { dateDiffInDays } from '../../../utils/auth';
import AuthContext from '../../auth/AuthContext';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

export default function ExpiringStocks() {
  const navigate = useNavigate();
  const { fetchingExpiringStocks, expiringStocks } = useContext(AuthContext);
  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Stack direction={'row'} gap={1} alignItems={'center'}>
          <WarningAmberRounded />
          <Typography component="h2" variant="subtitle2">
            Expiring / Expired Products
          </Typography>
        </Stack>
        <Stack direction="column">
          <Typography sx={{ marginBottom: 2 }}>
            The following products are expiring within 6 months:
          </Typography>
          {fetchingExpiringStocks ? (
            <Box height={'56px'} margin={'auto'}>
              <CircularProgress color="inherit" />
            </Box>
          ) : (
            <Box sx={{ maxHeight: '500px', overflow: 'auto' }}>
              <List
                sx={{
                  width: '100%',
                  bgcolor: 'background.paper',
                }}
              >
                {expiringStocks
                  .filter((s) => s.status !== 'EXPIRED')
                  .map((stock, key) => (
                    <ListItem key={key}>
                      <ListItemText
                        // eslint-disable-next-line
                        primary={`${(stock.product_id as any)?.product_name} ${(stock.product_id as any)?.product_description} (${stock.quantity_on_hand} ${(stock.product_id as any)?.product_unit}S)`}
                        secondary={`${dateDiffInDays(stock.expiry_date) < 0 ? 'Expired on' : 'Expiring on'} ${dayjs(stock.expiry_date).format('MM/DD/YYYY')}`}
                        sx={{ color: 'var(--template-palette-error-main)' }}
                      />
                    </ListItem>
                  ))}
              </List>
            </Box>
          )}
        </Stack>
      </CardContent>
      <CardActions
        sx={{ marginTop: 2, display: 'flex', justifyContent: 'flex-end' }}
      >
        <Button
          variant="text"
          endIcon={<ArrowCircleRightSharp />}
          onClick={() => navigate('/stocks')}
        >
          Go to Inventory Page
        </Button>
      </CardActions>
    </Card>
  );
}
