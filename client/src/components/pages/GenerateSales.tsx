import * as React from 'react';
import AppNavbar from '../common/AppNavbar';
import Header from '../common/Header';
import PageWrapper from '../wrappers/PageWrapper';

export default function GenerateSales() {
  return (
    <>
      <AppNavbar title={'Generate Sales'} />
      <PageWrapper>
        <>
          <Header title={'Generate Sales'} />
        </>
      </PageWrapper>
    </>
  );
}
