import Layout from '@app/common/components/layout';
import { MscrUser } from '@app/common/interfaces/mscr-user.interface';
import { createCommonGetServerSideProps } from '@app/common/utils/create-getserversideprops';
import PrivacyGuide from '@app/modules/privacy-guide';
import { SSRConfig } from 'next-i18next';

import {
  CommonContextProvider,
  CommonContextState,
} from 'yti-common-ui/common-context-provider';

interface PrivacyPageProps extends CommonContextState {
  _netI18Next: SSRConfig;
  user: MscrUser;
}

export default function PrivacyGuideComponent(props: PrivacyPageProps) {
  return (
    <CommonContextProvider value={props}>
      <Layout
        user={props.user ?? undefined}
        fakeableUsers={props.fakeableUsers}
      >
        <PrivacyGuide></PrivacyGuide>
      </Layout>
    </CommonContextProvider>
  );
}
export const getServerSideProps = createCommonGetServerSideProps();
