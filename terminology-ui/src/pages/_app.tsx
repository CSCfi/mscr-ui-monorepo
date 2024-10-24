import { SWRConfig } from 'swr';
import '../../styles/globals.scss';
import type { AppProps } from 'next/app';
import { appWithTranslation, useTranslation } from 'next-i18next';
import axios from 'axios';
import React, { useEffect } from 'react';
import { useStoreDispatch, wrapper } from '@app/store';
import '@fontsource/source-sans-pro/300.css';
import '@fontsource/source-sans-pro/400.css';
import '@fontsource/source-sans-pro/600.css';
import { VisuallyHidden } from 'suomifi-ui-components';
import { useSelector } from 'react-redux';
import { selectTitle } from '@app/common/components/title/title.slice';
import { selectLogin } from '@app/common/components/login/login.slice';
import { setAlert } from '@app/common/components/alert/alert.slice';

// https://nextjs.org/docs/advanced-features/custom-app
function App({ Component, pageProps }: AppProps) {
  const title = useSelector(selectTitle());
  const { t } = useTranslation('common');
  const login = useSelector(selectLogin());
  const dispatch = useStoreDispatch();

  useEffect(() => {
    if (!login.anonymous) {
      window.localStorage.setItem('user-signed', 'true');
    } else if (login.anonymous && window.localStorage.getItem('user-signed')) {
      window.localStorage.removeItem('user-signed');
      dispatch(
        setAlert(
          [
            {
              note: {
                status: 0,
                data: 'logged-out',
              },
              displayText: t('logged-out'),
            },
          ],
          []
        )
      );
    }
  }, [dispatch, login.anonymous, t]);

  return (
    <SWRConfig
      value={{
        fetcher: async (url: string, init?: RequestInit) =>
          axios.get(url).then((res) => res.data),
        onError: (err) => {
          console.error(err);
        },
      }}
    >
      <VisuallyHidden>
        <div role="region" aria-live="assertive">
          {t('navigated-to')} {title}
        </div>
      </VisuallyHidden>
      <Component {...pageProps} />
    </SWRConfig>
  );
}
export default wrapper.withRedux(appWithTranslation(App));

// axe-core is disabled for time being as it is too broken currently
// Problems:
// - Fills server logs with unnecessary logs
//   ^ This has had a ticket open from November without any progress so far (1.12.2022)
//
// - Throws unnecessary client errors (like findDOMnode that don't occur without it)
//   when strict mode is enabled and we don't have any reason to disable it
//   ^ Deque has had a ticket open from 2020 to fix this problem so no need to get
//     hopes up anytime soon

// setup a11y checker for development
// if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
//   import('@axe-core/react').then(({ default: axe }) =>
//     axe(React, ReactDOM, 1000, undefined, undefined, (results) => {
//       if (results.violations.length > 0) {
//         console.warn(
//           'Potential a11y violations found by axe',
//           results.violations
//         );
//       }
//     })
//   );
// }
