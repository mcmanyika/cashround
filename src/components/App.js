import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { useActiveWallet, useActiveAccount } from 'thirdweb/react';
import ReferralForm from './forms/ReferralForm';
import SendToReferrers from './forms/SendToReferrers';
import { PriceProvider } from '../contexts/PriceContext';
import Layout, { 
  LayoutCard, 
  LayoutLoading,
  LayoutSignout 
} from './layout/Layout';
import { ConnectionStatus } from './common/ConnectionStatus';
import { LoadingSpinner } from './common/LoadingSpinner';
import { StatusCard } from './common/StatusCard';
import { WalletConnect } from './common/WalletConnect';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import { useReferralStatus } from '../hooks/useReferralStatus';
import { containerStyle } from '../styles/App.styles';

function App() {
  const activeWallet = useActiveWallet();
  const activeAccount = useActiveAccount();
  
  const { copyClicked, copyAddress } = useConnectionStatus();
  const { web3, hasReferrer, checkingReferrer, isMember } = useReferralStatus(activeAccount, activeWallet);

  // Show loading while checking referral status
  if (checkingReferrer) {
    return <LayoutLoading />;
  }

  // Give thirdweb more time to initialize before showing loading
  if (!activeAccount && (activeAccount === undefined || activeWallet === undefined)) {
    return <LayoutLoading />;
  }

  return (
    <PriceProvider>
      <Router>
        <Layout>
                    <Switch>
           {activeAccount ? (
             <>
               <Route path="/send-to-referrers">
                 <SendToReferrers web3={web3} account={activeAccount?.address} />
               </Route>
               <Route path="/referral">
                 <ReferralForm web3={web3} account={activeAccount?.address} />
               </Route>
               <Route path="/pools">
                 {isMember ? (
                   <div>Pool routes are handled by Next.js pages</div>
                 ) : (
                   <div style={containerStyle}>
                     <StatusCard 
                       title="Access Denied"
                       message="You must be a member to access pools. Redirecting to referral page..."
                       action={() => window.location.href = '/referral'}
                       actionText="Go to Referral"
                     />
                   </div>
                 )}
               </Route>
               <Route path="/">
                 <div style={containerStyle}>
                   <ConnectionStatus 
                     address={activeAccount.address}
                     onCopy={() => copyAddress(activeAccount.address)}
                     copyClicked={copyClicked}
                   />
                   
                   {checkingReferrer ? (
                     <LoadingSpinner message="Checking your referral status..." />
                   ) : hasReferrer ? (
                     <StatusCard 
                       title="You already have a referrer!"
                       message="Redirecting you to the dashboard..."
                       action={() => window.location.href = '/send-to-referrers'}
                       actionText="Go to Dashboard"
                     />
                   ) : isMember ? (
                     <StatusCard 
                       title="You are already a member!"
                       message="Redirecting you to the dashboard..."
                       action={() => window.location.href = '/send-to-referrers'}
                       actionText="Go to Dashboard"
                     />
                   ) : (
                     <LoadingSpinner message="Redirecting to referral page..." />
                   )}
                 </div>
               </Route>
             </>
           ) : (
             <WalletConnect />
           )}
          </Switch>
        </Layout>
      </Router>
    </PriceProvider>
  );
}

export default App;
