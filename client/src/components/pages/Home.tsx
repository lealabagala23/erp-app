import * as React from 'react';
import AppNavbar from '../common/AppNavbar';
import Header from '../common/Header';
import MainGrid from '../common/MainGrid';
import PageContainer from '../layout/PageContainer';

export default function Home() {
  return (
    <>
      <AppNavbar title={'Home'} />
      <PageContainer>
        <>
          <Header title={'Home'} />
          <MainGrid />
        </>
      </PageContainer>
    </>
  );
}
