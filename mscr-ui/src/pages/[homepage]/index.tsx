import {
  CommonContextProvider,
  CommonContextState,
} from 'yti-common-ui/common-context-provider';
import Layout from '@app/common/components/layout';
import { SSRConfig, useTranslation } from 'next-i18next';
import { createCommonGetServerSideProps } from '@app/common/utils/create-getserversideprops';
import FrontPage from '@app/modules/front-page';
import {
  getOrganizations,
  getRunningQueriesThunk as getOrganizationsRunningQueriesThunk,
} from '@app/common/components/organizations/organizations.slice';
import {
  getServiceCategories,
  getRunningQueriesThunk as getServiceCategoriesRunningQueriesThunk,
} from '@app/common/components/service-categories/service-categories.slice';
import { initialUrlState } from 'yti-common-ui/utils/hooks/use-url-state';
import PageHead from 'yti-common-ui/page-head';
import {
  getCount,
  getRunningQueriesThunk as getCountRunningQueriesThunk,
} from '@app/common/components/counts/counts.slice';

import { useRouter } from 'next/router';
import { User } from 'yti-common-ui/interfaces/user.interface';
import GroupWorkspace from '../../modules/group-home-component';
import PersonalWorkspace from '../../modules/personal-home';
import {
  useEffect,
  useState,
  useContext,
  createContext,
  SetStateAction,
} from 'react';
import BasicTable from '@app/common/components/table';
import SearchScreen from '@app/modules/search-screen';
import MSCRSideBar from '@app/common/components/sidebar/MSCRSideBar';
import { TableAndSidebarWrapper } from './homepage.styles';
import { useBreakpoints } from 'yti-common-ui/media-query';
import { Container } from '@mui/material';
import SideNavigationPanel from '@app/common/components/side-navigation';

interface IndexPageProps extends CommonContextState {
  _netI18Next: SSRConfig;
}

type SearchContextType = {
  isSearchScreenVisible: boolean;
  setSearchScreenVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const iSearchContextState = {
  isSearchScreenVisible: false,
  setSearchScreenVisible: () => {},
};

export const SearchContext =
  createContext<SearchContextType>(iSearchContextState);

export default function IndexPage(props: IndexPageProps) {
  const { t } = useTranslation('common');

  const router = useRouter();

  const { breakpoint } = useBreakpoints();

  const [isSearchScreenVisible, setSearchScreenVisible] = useState(false);

  const toggleVisibility = () => {
    setSearchScreenVisible((prevState: boolean) => !prevState);
  };

  function DisplayedComponent({
    slug,
    user,
  }: {
    slug?: string;
    user?: User;
  }): React.ReactElement {
    if (slug === 'group-home') {
      return <GroupWorkspace />;
    } else {
      return <PersonalWorkspace user={user} />;
    }
  }

  return (
    <CommonContextProvider value={props}>
      <Layout
        user={props.user ?? undefined}
        fakeableUsers={props.fakeableUsers}
      >
        <PageHead
          baseUrl="https://tietomallit.suomi.fi"
          title={t('datamodel-title')}
          description={t('service-description')}
        />
        <div id="main" style={{ display: 'flex' }}>
          <SideNavigationPanel user={props.user ?? undefined} />

          <SearchContext.Provider
            value={{ isSearchScreenVisible, setSearchScreenVisible }}
          >
            {isSearchScreenVisible ? <SearchScreen /> : null}
          </SearchContext.Provider>

          <div
            id="default-screen"
            style={{
              display: isSearchScreenVisible ? 'none' : 'block',
              margin: 15,
            }}
          >
            <button onClick={toggleVisibility}>
              {isSearchScreenVisible
                ? 'Hide SearchScreen'
                : 'Show SearchScreen'}
            </button>
            <FrontPage />

            <DisplayedComponent
              slug={(router.query.homepage as string) ?? undefined}
              user={props.user ?? undefined}
            />

            <TableAndSidebarWrapper
              $breakpoint={breakpoint}
              id="table-and-sidebar"
            >
              <MSCRSideBar />
              <BasicTable />
            </TableAndSidebarWrapper>
          </div>
        </div>
      </Layout>
    </CommonContextProvider>
  );
}

export const getServerSideProps = createCommonGetServerSideProps(
  async ({ store, query, locale }) => {
    const urlState = Object.assign({}, initialUrlState);

    if (query) {
      if (query.q !== undefined) {
        urlState.q = Array.isArray(query.q) ? query.q[0] : query.q;
      }

      if (query.page !== undefined) {
        const pageValue = Array.isArray(query.page)
          ? parseInt(query.page[0], 10)
          : parseInt(query.page, 10);
        urlState.page = !isNaN(pageValue) ? pageValue : initialUrlState.page;
      }

      if (query.status !== undefined) {
        urlState.status = Array.isArray(query.status)
          ? query.status
          : [query.status];
      }

      if (query.types !== undefined) {
        urlState.types = Array.isArray(query.types)
          ? query.types
          : [query.types];
      }

      if (query.domain) {
        urlState.domain = Array.isArray(query.domain)
          ? query.domain
          : [query.domain];
      }

      if (query.organization) {
        urlState.organization = Array.isArray(query.organization)
          ? query.organization[0]
          : query.organization;
      }

      if (query.lang) {
        urlState.lang = Array.isArray(query.lang) ? query.lang[0] : query.lang;
      }
    }

    store.dispatch(getServiceCategories.initiate(locale ?? 'fi'));
    store.dispatch(getOrganizations.initiate(locale ?? 'fi'));
    store.dispatch(getCount.initiate());

    await Promise.all(
      store.dispatch(getServiceCategoriesRunningQueriesThunk())
    );
    await Promise.all(store.dispatch(getOrganizationsRunningQueriesThunk()));
    await Promise.all(store.dispatch(getCountRunningQueriesThunk()));

    return {};
  }
);
