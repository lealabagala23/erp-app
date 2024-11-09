import * as React from 'react';
import AppNavbar from '../common/AppNavbar';
import Header from '../common/Header';
import PageContainer from '../layout/PageContainer';

export default function Accounts() {
  return (
    <>
      <AppNavbar title={'Accounts'} />
      <PageContainer>
        <>
          <Header title={'Accounts'} />
        </>
      </PageContainer>
    </>
  );
}
