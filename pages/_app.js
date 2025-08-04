import Head from 'next/head';
// Import custom styles
import '../src/components/styles/App.css';
import '../src/components/styles/Landing.css';
import '../src/components/styles/ReferralInfo.css';
import '../src/components/styles/SendToReferrers.css';
import '../src/components/styles/UserDashboard.css';
import '../src/components/layout/Layout.css';
import 'react-toastify/dist/ReactToastify.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Cash Round</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="description" content="Connect with your referrer and start earning rewards" />
      </Head>
        <Component {...pageProps} />
    </>
  );
}

export default MyApp; 