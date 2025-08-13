import { useState, useEffect, useCallback } from 'react';
import TreeContract from '../abis/Tree.json';

export const useReferralStatus = (activeAccount, activeWallet) => {
  const [web3, setWeb3] = useState(null);
  const [hasReferrer, setHasReferrer] = useState(false);
  const [checkingReferrer, setCheckingReferrer] = useState(true);
  const [isMember, setIsMember] = useState(false);

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
      
      if (networkData && networkData.address) {
        const contract = new web3Instance.eth.Contract(
          TreeContract.abi,
          networkData.address
        );
        
        // Check if user has a referrer
        const referrer = await contract.methods.getReferrer(accountAddress).call();
        const hasReferrer = referrer !== '0x0000000000000000000000000000000000000000';
        
        // Check if user is already a member of the tree
        const userData = await contract.methods.tree(accountAddress).call();
        const isMember = userData.inviter !== '0x0000000000000000000000000000000000000000';
        
        setHasReferrer(hasReferrer);
        setIsMember(isMember);
        setCheckingReferrer(false);
      } else {
        // Show network info for debugging
        console.log(`No contract found on ${currentNetworkName}. Available networks:`, Object.keys(TreeContract.networks));
        setCheckingReferrer(false);
      }
    } catch (error) {
      // Silent error handling
      setCheckingReferrer(false);
    }
  }, []);

  // Sync thirdweb connection state with local state
  useEffect(() => {
    if (activeAccount?.address && activeWallet) {
      console.log('Thirdweb wallet connected:', activeAccount.address);
      
      // Create web3 instance if it doesn't exist
      if (window.ethereum) {
        const Web3 = require('web3');
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        checkReferrerStatus(web3Instance, activeAccount.address);
      }
    } else {
      console.log('Thirdweb wallet disconnected');
    }
  }, [activeAccount, activeWallet, checkReferrerStatus]);

  return { 
    web3, 
    hasReferrer, 
    checkingReferrer, 
    isMember,
    checkReferrerStatus 
  };
};
