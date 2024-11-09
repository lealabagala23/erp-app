import * as React from 'react';
import AppNavbar from '../common/AppNavbar';
import Header from '../common/Header';
import PageWrapper from '../wrappers/PageWrapper';

export default function Inventory() {
  return (
    <>
      <AppNavbar title={'Inventory'} />
      <PageWrapper>
        <>
          <Header title={'Inventory'} />
        </>
      </PageWrapper>
    </>
  );
}
