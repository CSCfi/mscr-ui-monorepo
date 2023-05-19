import InfoExpander from '@app/common/components/info-dropdown/info-expander';
import EditCollection from '@app/modules/edit-collection';
import { PageContent } from '@app/modules/own-information/own-information.styles';
import { SSRConfig } from 'next-i18next';
import React from 'react';
import {
  CommonContextProvider,
  CommonContextState,
  initialCommonContextState,
} from 'yti-common-ui/common-context-provider';
import Layout from 'yti-common-ui/layout/layout';

interface CrosswalkPageProps extends CommonContextState {
  _netI18Next: SSRConfig;
}

export default function Crosswalk(props: CrosswalkPageProps) {
  return (
    <CommonContextProvider value={props}>
      <Layout user={props.user} fakeableUsers={props.fakeableUsers}>
        <h2> List of Croswalks</h2>
        <EditCollection
          terminologyId={'1'}
          collectionName={'first crosswalk'}
        ></EditCollection>
      </Layout>
    </CommonContextProvider>
  );
}
