import React, { useState, useEffect } from 'react';
import TreeContract from '../abis/Tree.json';
import SendToReferrers from './SendToReferrers';

const ReferralInfo = ({ web3, account, onJoinStatusChange }) => {
  const [referralChain, setReferralChain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [networkId, setNetworkId] = useState(null);

  useEffect(() => {
    const getNetworkId = async () => {
      if (web3) {
        try {
          const id = await web3.eth.net.getId();
          setNetworkId(id);
        } catch (error) {
          // Silent error handling
        }
      }
    };
    getNetworkId();
  }, [web3]);

  useEffect(() => {
    const getReferrerInfo = async () => {
      if (!web3 || !account || !networkId) {
        setLoading(false);
        if (onJoinStatusChange) onJoinStatusChange(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const networkData = TreeContract.networks[networkId];
        if (!networkData || !networkData.address) {
          setError('Contract not found on current network');
          setLoading(false);
          if (onJoinStatusChange) onJoinStatusChange(false);
          return;
        }

        const contract = new web3.eth.Contract(
          TreeContract.abi,
          networkData.address
        );

        const userInfo = await contract.methods.tree(account).call();
        const joined = userInfo.inviter !== '0x0000000000000000000000000000000000000000';
        if (onJoinStatusChange) onJoinStatusChange(joined);

        const chain = [];
        let currentAddress = account;
        let maxDepth = 5; // Limit to 5 levels
        let depth = 0;

        while (depth < maxDepth) {
          const userInfo = await contract.methods.tree(currentAddress).call();
          
          if (userInfo.inviter === '0x0000000000000000000000000000000000000000') {
            break;
          }

          chain.push({
            address: currentAddress,
            inviter: userInfo.inviter
          });

          currentAddress = userInfo.inviter;
          depth++;
        }

        setReferralChain(chain);
      } catch (err) {
        // Silent error handling
        setError(err.message || 'Error fetching referrer information');
        if (onJoinStatusChange) onJoinStatusChange(false);
      } finally {
        setLoading(false);
      }
    };

    getReferrerInfo();
  }, [web3, account, networkId, onJoinStatusChange]);

  if (loading) {
    return null;
  }

  if (error) {
    return null;
  }

  return (
    <SendToReferrers 
      web3={web3} 
      account={account} 
      referralChain={referralChain}
    />
  );
};

export default ReferralInfo; 