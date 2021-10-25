import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { SSRConfig, useTranslation } from 'next-i18next';
import { Heading } from 'suomifi-ui-components';
import Layout from '../common/components/layout/layout';
import { TerminologySearchInput } from '../common/components/terminology-search/terminology-search-input';
import { TerminologySearchResults } from '../common/components/terminology-search/terminology-search-results';
import { UserProps } from '../common/interfaces/user-interface';
import withSession, { NextIronRequest } from '../common/utils/session';
import { GetServerSideProps, NextApiResponse } from 'next';

import { selectFilter, useGetSearchResultQuery } from '../common/components/terminology-search/terminology-search-slice';
import { useSelector } from 'react-redux';

export default function Search(props: {
  _netI18Next: SSRConfig;
}) {
  const { t } = useTranslation('common');
  const input = useSelector(selectFilter());

  const {data, error, isLoading} = useGetSearchResultQuery(input);

  return (
    <Layout>
      <Head>
        <title>{t('search-title')}</title>
      </Head>
      <Heading variant="h1">{t('terminology-title')}</Heading>

      <TerminologySearchInput />

      <TerminologySearchResults results={data} />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = withSession<{ props: UserProps | {} }>(
  async ({ req, res, locale }: { req: NextIronRequest, res: NextApiResponse, locale: string }) => {
    const props: any = {
      ...(await serverSideTranslations(locale, ['common'])),
    };

    return { props: props };
  },
);
