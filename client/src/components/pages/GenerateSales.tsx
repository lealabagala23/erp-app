import * as React from 'react';
import AppNavbar from '../common/AppNavbar';
import Header from '../common/Header';
import PageContainer from '../layout/PageContainer';

export default function GenerateSales() {
  return (
    <>
      <AppNavbar title={'Generate Sales'} />
      <PageContainer>
        <>
          <Header title={'Generate Sales'} />
        </>
      </PageContainer>
    </>
  );
}
