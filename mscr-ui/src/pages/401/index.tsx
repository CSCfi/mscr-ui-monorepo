import { CommonContextProvider, CommonContextState } from 'yti-common-ui/components/common-context-provider';
import { SSRConfig, useTranslation } from 'next-i18next';
import PageHead from 'yti-common-ui/components/page-head';
import Layout from '@app/common/components/layout';
import { MscrUser } from '@app/common/interfaces/mscr-user.interface';
import { createCommonGetServerSideProps } from '@app/common/utils/create-getserversideprops';

interface unauthorizedPageProps extends CommonContextState {
  _netI18Next: SSRConfig;
  user: MscrUser;
}
export default function UnauthorizedPage(props: unauthorizedPageProps) {
  const { t } = useTranslation('common');

  return (
    <CommonContextProvider value={props}>
      <Layout
        user={props.user ?? undefined}
        fakeableUsers={props.fakeableUsers}
      >
        <PageHead
          baseUrl="https://mscr-test.rahtiapp.fi"
          title={t('mscr-title')}
          description={t('service-description')}
        />
        <p>You need to be logged in to view this content</p>
      </Layout>

    </CommonContextProvider>
  );
}

export const getServerSideProps = createCommonGetServerSideProps();
