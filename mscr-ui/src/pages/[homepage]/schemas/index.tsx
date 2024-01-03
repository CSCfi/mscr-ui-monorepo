import {
  CommonContextProvider,
  CommonContextState,
} from 'yti-common-ui/components/common-context-provider';
import { MscrUser } from '@app/common/interfaces/mscr-user.interface';
import { SSRConfig, useTranslation } from 'next-i18next';
import Layout from '@app/common/components/layout';
import PageHead from 'yti-common-ui/components/page-head';
import { useRouter } from 'next/router';
import PersonalWorkspace from 'src/modules/workspace/personal-home';
import GroupWorkspace from 'src/modules/workspace/group-home';
import { createCommonGetServerSideProps } from '@app/common/utils/create-getserversideprops';

interface SchemasPageProps extends CommonContextState {
  user: MscrUser;
  _netI18Next: SSRConfig;
}

export default function SchemasPage(props: SchemasPageProps) {
  const { t } = useTranslation('common');
  const { query } = useRouter();
  const contentOwner = (query?.homepage ?? 'personal') as string;

  return (
    <CommonContextProvider value={props}>
      <Layout
        user={props.user ?? undefined}
        fakeableUsers={props.fakeableUsers}
      >
        <PageHead
          baseUrl="http:/localhost:3000"
          title={t('mscr-title')}
          description={t('service-description')}
        />
        {contentOwner == 'personal' ? (
          <PersonalWorkspace contentType={'SCHEMA'} />
        ) : (
          <GroupWorkspace user={props.user} pid={contentOwner} contentType={'SCHEMA'} />
        )}
      </Layout>
    </CommonContextProvider>
  );
}

export const getServerSideProps = createCommonGetServerSideProps(async () => {
  return {
    props: {
      requireAuthenticated: true,
    },
  };
});
