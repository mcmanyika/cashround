import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SendToReferrers from '../src/components/forms/SendToReferrers';
import { useActiveWallet, useActiveAccount } from "thirdweb/react";
import { LayoutLoading } from '../src/components/layout/Layout';
import { PriceProvider } from '../src/contexts/PriceContext';

export default function SendToReferrersPage() {
  const router = useRouter();
  const activeAccount = useActiveAccount();
  const activeWallet = useActiveWallet();
  
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync thirdweb connection state with local state
  useEffect(() => {
    if (activeAccount?.address && activeWallet) {
      console.log('Thirdweb wallet connected in SendToReferrers page:', activeAccount.address);
      setAccount(activeAccount.address);
      setIsConnected(true);
      
      // Create web3 instance if it doesn't exist
      if (window.ethereum) {
        const Web3 = require('web3');
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
      }
      setLoading(false);
    } else {
      console.log('Thirdweb wallet disconnected in SendToReferrers page');
      // Redirect to home if not connected
      router.push('/');
    }
  }, [activeAccount, activeWallet, router]);

  if (loading) {
    return <LayoutLoading />;
  }

  if (!isConnected) {
    return <LayoutLoading />;
  }

  return (
    <PriceProvider>
      <SendToReferrers web3={web3} account={account} />
    </PriceProvider>
  );
} 