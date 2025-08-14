import Head from 'next/head';
import { ThirdwebProvider } from "thirdweb/react";

// Import Tailwind CSS first
import '../src/styles/tailwind.css';

// Import only essential styles for initial load
import '../src/components/layout/Layout.css';
import '../src/styles/App.module.css'; // Global styles to prevent white flash

// Lazy load non-critical styles
const loadNonCriticalStyles = () => {
  import('../src/components/styles/App.css');
  import('../src/components/styles/Landing.css');
  import('../src/components/styles/ReferralInfo.css');
  import('../src/components/styles/SendToReferrers.css');
  import('../src/components/styles/UserDashboard.css');
  import('react-toastify/dist/ReactToastify.css');
};

function MyApp({ Component, pageProps }) {
  // Load non-critical styles after initial render
  if (typeof window !== 'undefined') {
    // Use requestIdleCallback for better performance, fallback to setTimeout
    if (window.requestIdleCallback) {
      window.requestIdleCallback(loadNonCriticalStyles);
    } else {
      setTimeout(loadNonCriticalStyles, 1000);
    }
  }

  return (
    <>
      <Head>
        <title>Mukando</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="description" content="Connect with your referrer and start earning rewards" />
        {/* Preload critical resources */}
        <link rel="dns-prefetch" href="//polygon-rpc.com" />
        <link rel="dns-prefetch" href="//polygon-amoy.infura.io" />
      </Head>
      <ThirdwebProvider>
        <Component {...pageProps} />
      </ThirdwebProvider>
    </>
  );
}

export default MyApp; 