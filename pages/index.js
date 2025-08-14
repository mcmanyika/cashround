import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

import TreeContract from '../src/abis/Tree.json';
import { ConnectButton, useActiveWallet, useActiveAccount } from "thirdweb/react";
import { client } from '../src/client';
import { LayoutWithHeader, LayoutConnect, LayoutLoading } from '../src/components/layout/Layout';
import { PriceProvider } from '../src/contexts/PriceContext';

export default function Home() {
  const wallet = useActiveWallet();
  const activeAccount = useActiveAccount();
  const router = useRouter();
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const [web3, setWeb3] = useState(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasReferrer, setHasReferrer] = useState(false);
  const [checkingReferrer, setCheckingReferrer] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [copyClicked, setCopyClicked] = useState(false);

  const checkReferrerStatus = useCallback(async (web3Instance, accountAddress) => {
    if (!web3Instance || !accountAddress) return;

    try {
      const networkId = await web3Instance.eth.net.getId();
      const networkData = TreeContract.networks[networkId];
      
      // Network name mapping for better UX
      const networkNames = {
        137: 'Polygon Mainnet',
        80002: 'Amoy Testnet',
        5777: 'Local Ganache'
      };
      
      const currentNetworkName = networkNames[networkId] || `Network ${networkId}`;
      console.log(`Connected to: ${currentNetworkName}`);
      
      // Get contract address from environment variables based on network
      const addressBook = {
        80002: process.env.NEXT_PUBLIC_TREE_CONTRACT_ADDRESS_AMOY,
        137: process.env.NEXT_PUBLIC_TREE_CONTRACT_ADDRESS_POLYGON,
        5777: process.env.NEXT_PUBLIC_TREE_CONTRACT_ADDRESS_LOCAL,
        1337: process.env.NEXT_PUBLIC_TREE_CONTRACT_ADDRESS_LOCAL
      };
      const contractAddress = addressBook[networkId] || (networkData && networkData.address);
      if (contractAddress) {
        const contract = new web3Instance.eth.Contract(
          TreeContract.abi,
          contractAddress
        );
        // Check if user is already a member of the tree
        const userData = await contract.methods.tree(accountAddress).call();
        const isMember = userData.inviter !== '0x0000000000000000000000000000000000000000';
        setIsMember(isMember);
        setCheckingReferrer(false);
        if (isMember) {
          router.push('/send-to-referrers');
        }
      } else {
        console.log(`No contract found on ${currentNetworkName}. Available networks:`, Object.keys(TreeContract.networks));
        setCheckingReferrer(false);
      }
    } catch (error) {
      // Silent error handling
      setCheckingReferrer(false);
    }
  }, [router]);

  useEffect(() => {
    const finishLoading = () => {
      setLoading(false);
    };
    
    if (window.ethereum && !localStorage.getItem('logout')) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            const Web3 = require('web3');
            const web3Instance = new Web3(window.ethereum);
            setAccount(accounts[0]);
            setIsConnected(true);
            setWeb3(web3Instance);
            checkReferrerStatus(web3Instance, accounts[0]);
            finishLoading();
          } else {
            finishLoading();
          }
        })
        .catch(finishLoading);
    } else {
      finishLoading();
    }
  }, [checkReferrerStatus]);

  // Redirect to referral page when user connects via thirdweb
  useEffect(() => {
    if (activeAccount?.address && wallet) {
      console.log('User connected, redirecting to referral page...');
      router.push('/pools');
    }
  }, [activeAccount, wallet, router]);

  const formatAddress = (address) => {
    if (!address) return '';
    return address.slice(0, 5) + '...' + address.slice(-5);
  };

  const copyAddress = (address) => {
    setCopyClicked(true);
    navigator.clipboard.writeText(address).catch(() => {
      // Silent fail - no toast notification
    });
    // Reset the color after 500ms
    setTimeout(() => {
      setCopyClicked(false);
    }, 500);
  };

  if (loading) {
    return <LayoutLoading />;
  }

  return (
    <PriceProvider>
      <LayoutWithHeader>
        <LayoutConnect client={client} />
      </LayoutWithHeader>
    </PriceProvider>
  );
} 