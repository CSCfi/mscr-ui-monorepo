import Link from 'next/link';
import { useRouter } from 'next/router';
import { MouseEventHandler, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useTheme } from 'styled-components';
import {
  IconChevronDown,
  IconChevronUp,
  Link as SuomiFiLink,
} from 'suomifi-ui-components';
import {
  NavigationDropdownItem,
  NavigationDropdownList,
  NavigationDropdownWrapper,
  NavigationItem,
  NavigationWrapper,
} from './navigation.styles';
import ClickOutsideListener from '../click-outside-listener';

export default function DesktopNavigation({
  isLoggedIn,
}: {
  isLoggedIn: boolean;
}) {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDropdown: MouseEventHandler = (e) => {
    e.preventDefault();
    setOpen(!open);
  };

  const theme = useTheme();

  return (
    <NavigationWrapper id="top-navigation">
      <NavigationItem
        active={router.pathname === '/'}
        id="top-navigation-front-page"
        className="top-navigation-li"
      >
        <Link href="/" passHref>
          <SuomiFiLink className="main" href="">
            {t('site-frontpage')}
          </SuomiFiLink>
        </Link>
      </NavigationItem>
      {/* <NavigationItem
        id="top-navigation-site-information"
        className="top-navigation-li"
        active={router.pathname === '/site-information'}
      >
        <Link href="/site-information" passHref>
          <SuomiFiLink className="main" href="">
            {t('site-information')}
          </SuomiFiLink>
        </Link>
      </NavigationItem> */}
      {isLoggedIn && (
        <NavigationItem
          active={router.pathname === '/own-information'}
          id="top-navigation-own-information"
          className="top-navigation-li"
        >
          <Link href="/own-information" passHref>
            <SuomiFiLink className="main" href="">
              {t('own-information')}
            </SuomiFiLink>
          </Link>
        </NavigationItem>
      )}
    </NavigationWrapper>
  );
}
