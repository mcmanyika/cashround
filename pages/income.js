import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import UserDashboard from '../src/components/dashboard/UserDashboard';
import { useActiveWallet, useActiveAccount } from "thirdweb/react";
import { LayoutLoading, LayoutWithHeader } from '../src/components/layout/Layout';
import { PriceProvider } from '../src/contexts/PriceContext';

export default function IncomePage() {
  const router = useRouter();
  const activeAccount = useActiveAccount();
  const activeWallet = useActiveWallet();
  
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);

  // Sync thirdweb connection state with local state
  useEffect(() => {
    if (activeAccount?.address && activeWallet) {
      console.log('Thirdweb wallet connected in Income page:', activeAccount.address);
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
      console.log('Thirdweb wallet disconnected in Income page');
      // Redirect to home if not connected
      router.push('/');
    }
  }, [activeAccount, activeWallet, router]);

  // Check if user is a member
  useEffect(() => {
    const checkMembership = async () => {
      if (!web3 || !account) return;
      
      try {
        const TreeContract = require('../src/abis/Tree.json');
        const networkId = await web3.eth.net.getId();
        const networkData = TreeContract.networks[networkId];
        
        if (networkData && networkData.address) {
          const contract = new web3.eth.Contract(TreeContract.abi, networkData.address);
          const userInfo = await contract.methods.tree(account).call();
          const member = userInfo.inviter !== '0x0000000000000000000000000000000000000000';
          setIsMember(member);
        }
      } catch (error) {
        console.error('Error checking membership:', error);
        setIsMember(false);
      }
    };
    
    checkMembership();
  }, [web3, account]);

  if (loading) {
    return <LayoutLoading />;
  }

  if (!isConnected) {
    return <LayoutLoading />;
  }

  return (
    <PriceProvider>
      <LayoutWithHeader showSignout={true} isMember={isMember}>
        <UserDashboard web3={web3} account={account} />
      </LayoutWithHeader>
    </PriceProvider>
  );
}
