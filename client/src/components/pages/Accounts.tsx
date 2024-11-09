import * as React from 'react';
import AppNavbar from '../common/AppNavbar';
import Header from '../common/Header';
import PageWrapper from '../wrappers/PageWrapper';

export default function Accounts() {
  return (
    <>
      <AppNavbar title={'Accounts'} />
      <PageWrapper>
        <>
          <Header title={'Accounts'} />
        </>
      </PageWrapper>
    </>
  );
}
