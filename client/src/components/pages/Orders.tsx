import * as React from 'react';
import AppNavbar from '../common/AppNavbar';
import Header from '../common/Header';
import PageWrapper from '../wrappers/PageWrapper';

export default function Orders() {
  return (
    <>
      <AppNavbar title={'Orders'} />
      <PageWrapper>
        <>
          <Header title={'Orders'} />
        </>
      </PageWrapper>
    </>
  );
}
