import React, { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from 'yti-common-ui/theme';
import {
  ContentContainer,
  SiteContainer,
  MarginContainer,
} from './layout.styles';
import { useTranslation } from 'next-i18next';
import SmartHeader from '../smart-header';
import { useBreakpoints } from 'yti-common-ui/media-query';
import SkipLink from 'yti-common-ui/skip-link';
import { FakeableUser } from '../../interfaces/fakeable-user.interface';
import generateFakeableUsers from 'yti-common-ui/utils/generate-impersonate';
import SideNavigationPanel from '../side-navigation';
import { MscrUser } from '@app/common/interfaces/mscr-user.interface';
import { SearchContext } from '@app/common/components/search-context-provider';
import SearchScreen from 'src/modules/search/search-screen';

export default function Layout({
  children,
  sideNavigationHidden,
  user,
  fakeableUsers,
  alerts,
}: {
  children: React.ReactNode;
  sideNavigationHidden: boolean;
  user?: MscrUser;
  fakeableUsers?: FakeableUser[] | null;
  alerts?: React.ReactNode;
  fullScreenElements?: React.ReactNode;
}) {
  const { t, i18n } = useTranslation('common');
  const { breakpoint } = useBreakpoints();
  const [isSearchActive, setIsSearchActive] = useState(false);

  return (
    <ThemeProvider theme={lightTheme}>
      <SearchContext.Provider
        value={{
          isSearchActive,
          setIsSearchActive,
        }}
      >
        <SkipLink href="#main">{t('skip-link-main')}</SkipLink>
        <SiteContainer>
          <SmartHeader
            user={user}
            fakeableUsers={generateFakeableUsers(
              i18n.language,
              fakeableUsers
            )}
          />
          {!sideNavigationHidden && user && !user.anonymous ? (
            <div className={'d-flex w-100'}>
              <SideNavigationPanel user={user}/>
              <ContentContainer className={'w-100'}>
                {alerts && alerts}
                <MarginContainer
                  $breakpoint={breakpoint}
                  className={isSearchActive ? 'hidden' : ''}
                >
                  {isSearchActive && <SearchScreen/>}
                  {children}
                </MarginContainer>
              </ContentContainer>
            </div>
          ) : (
            <ContentContainer className={'w-100'}>
              {alerts && alerts}
              <MarginContainer
                $breakpoint={breakpoint}
                className={isSearchActive ? 'hidden' : ''}
              >
                {isSearchActive && <SearchScreen />}
                {children}
              </MarginContainer>
            </ContentContainer>
          )}
        </SiteContainer>
      </SearchContext.Provider>
    </ThemeProvider>
  );
}
