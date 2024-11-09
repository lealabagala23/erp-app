import * as React from 'react';
import AppNavbar from '../common/AppNavbar';
import Header from '../common/Header';
import MainGrid from '../common/MainGrid';
import PageWrapper from '../wrappers/PageWrapper';

export default function Home() {
  return (
    <>
      <AppNavbar title={'Home'} />
      <PageWrapper>
        <>
          <Header title={'Home'} />
          <MainGrid />
        </>
      </PageWrapper>
    </>
  );
}
