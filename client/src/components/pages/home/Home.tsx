import React from 'react';
import AppNavbar from '../../common/AppNavbar';
import Header from '../../common/Header';
import MainGrid from '../../common/MainGrid';
import PageWrapper from '../../wrappers/PageWrapper';

export default function Home() {
  return (
    <>
      <AppNavbar title={'Home'} />
      <PageWrapper>
        <>
          <Header />
          <MainGrid />
        </>
      </PageWrapper>
      {/* <AlertDialog
        open={showExpiryWarning}
        handleClose={hideExpiryWarning}
        title={
          <Stack direction={'row'} gap={1} alignItems={'center'}>
            <Warning />
            <Typography variant="h6">Expiring / Expired Products</Typography>
          </Stack>
        }
        message={
          <Stack direction="column">
            <Typography sx={{ marginBottom: 2 }}>
              The following products are expiring within 6 months:
            </Typography>
            {fetchingExpiringStocks ? (
              <Box height={'56px'} margin={'auto'}>
                <CircularProgress color="inherit" />
              </Box>
            ) : (
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {expiringStocks.map((stock, key) => (
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
            )}
          </Stack>
        }
        cancelBtnProps={{ label: 'Close', action: hideExpiryWarning }}
        proceedBtnProps={{
          label: 'Go to Inventory Page',
          action: () => navigate('/stocks'),
          endIcon: <ArrowCircleRightSharp />,
        }}
      /> */}
    </>
  );
}
