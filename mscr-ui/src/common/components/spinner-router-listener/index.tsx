import { useEffect, useState } from 'react';
import { Router } from 'next/router';
import SpinnerOverlay from '@app/common/components/spinner-overlay';

export default function SpinnerRouterListener() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleRouteChangeStart = () => setIsLoading(true);
    const handleRouteChangeComplete = () => setIsLoading(false);

    Router.events.on('routeChangeStart', handleRouteChangeStart);
    Router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      Router.events.off('routeChangeStart', handleRouteChangeStart);
      Router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, []);

  if (isLoading) {
    return (
      <SpinnerOverlay
        animationVisible={isLoading}
        transparentBackground={true}
      />
    );
  } else {
    return <></>;
  }
}
