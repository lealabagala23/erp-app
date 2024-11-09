import * as React from 'react';
import AppNavbar from '../common/AppNavbar';
import Header from '../common/Header';
import PageContainer from '../layout/PageContainer';

export default function Orders() {
  return (
    <>
      <AppNavbar title={'Orders'} />
      <PageContainer>
        <>
          <Header title={'Orders'} />
        </>
      </PageContainer>
    </>
  );
}
