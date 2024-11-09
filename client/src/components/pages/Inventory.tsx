import * as React from 'react';
import AppNavbar from '../common/AppNavbar';
import Header from '../common/Header';
import PageContainer from '../layout/PageContainer';

export default function Inventory() {
  return (
    <>
      <AppNavbar title={'Inventory'} />
      <PageContainer>
        <>
          <Header title={'Inventory'} />
        </>
      </PageContainer>
    </>
  );
}
