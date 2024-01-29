import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { Link, Text } from 'suomifi-ui-components';
import LoginButtons from '../authentication-panel/login-buttons';
import MobileImpersonateWrapper from '../impersonate/mobile-impersonate-wrapper';
import MobileLocaleChooser from '../locale-chooser/mobile-locale-chooser';
import { MobileMenuItem, MobileMenuSection } from './navigation.styles';
import { FakeableUser } from '../../interfaces/fakeable-user.interface';

interface MobileNavigationProps {
  isLoggedIn: boolean;
  fakeableUsers?: FakeableUser[];
  handleLoginModalClick?: () => void;
}

export default function MobileNavigation({
  isLoggedIn,
  fakeableUsers,
  handleLoginModalClick,
}: MobileNavigationProps) {
  const { t } = useTranslation('common');
  const router = useRouter();

  return (
    <>
      <LoginButtons handleLoginModalClick={handleLoginModalClick} />

      <MobileMenuSection>
        <MobileMenuItem $active={router.pathname === '/'}>
          <Link href="/">{t('site-frontpage')}</Link>
        </MobileMenuItem>
        <MobileMenuItem>
          <Text>{t('site-services')}</Text>
        </MobileMenuItem>
        {isLoggedIn && (
          <MobileMenuItem $active={router.pathname === '/own-information'}>
            <Link className="main" href="/own-information">
              {t('own-information')}
            </Link>
          </MobileMenuItem>
        )}
      </MobileMenuSection>

      <MobileLocaleChooser />
      <MobileImpersonateWrapper fakeableUsers={fakeableUsers} />
    </>
  );
}
