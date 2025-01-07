import { useEffect } from 'react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Remove the next-route-announcer after initial render
    const announcer = document.querySelector('[next-route-announcer]');
    if (announcer) {
      announcer.remove();
    }

    const handleRouteChange = () => {
      // Custom logic to handle route changes
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return <Component {...pageProps} />;
}

export default MyApp;
