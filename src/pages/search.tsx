import Head from 'next/head';
import React, { useState } from 'react';
import { SSRConfig, useTranslation } from 'next-i18next';
import { Heading } from 'suomifi-ui-components';
import Layout from '../common/components/layout/layout';
import { TerminologySearchInput } from '../common/components/terminology-search/terminology-search-input';
import useTerminologySearch from '../modules/terminology-search/hooks/terminology-search-api';
import { TerminologySearchResults } from '../common/components/terminology-search/terminology-search-results';
import { TerminologySearchResult } from '../common/interfaces/terminology.interface';
import { SearchContainer } from '../common/components/terminology-search/terminology-search-input.styles';
import { NextIronRequest } from '../common/utils/session';
import { NextApiResponse } from 'next';
import { createCommonGetServerSideProps } from '../common/utils/create-getserversideprops';
import User from '../common/interfaces/user-interface';
import useUser from '../common/hooks/useUser';

interface TerminologySearchProps {
  results: TerminologySearchResult | null;
  error: string | null;
  loading: boolean;
}

export default function SearchPage(props: {
  _netI18Next: SSRConfig;
  user: User;
}) {
  const { t } = useTranslation('common');
  const { user, } = useUser({ initialData: props.user });

  const [filter, setFilter] = useState<string | null>(null);
  const { results, error, loading }: TerminologySearchProps = useTerminologySearch(filter);

  return (
    <Layout user={user}>
      <Head>
        <title>{t('search-title')}</title>
      </Head>
      <Heading variant="h1">{t('terminology-title')}</Heading>

      <SearchContainer>
        <TerminologySearchInput
          setFilter={setFilter}
        />
      </SearchContainer>

      <TerminologySearchResults results={results} error={error} loading={loading}/>
    </Layout>
  );
}

export const getServerSideProps = createCommonGetServerSideProps(
  async ({ req, res, locale }: { req: NextIronRequest, res: NextApiResponse, locale: string }) => {
    return { props: { } };
  });
