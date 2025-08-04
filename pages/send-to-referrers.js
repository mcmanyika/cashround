import React, { useState, useEffect } from 'react';
import SendToReferrers from '../src/components/forms/SendToReferrers';
import Layout from '../src/components/layout/Layout';

export default function SendToReferrersPage() {
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const [web3, setWeb3] = useState(null);
  const [loading, setLoading] = useState(true);

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
            finishLoading();
          } else {
            finishLoading();
          }
        })
        .catch(finishLoading);
    } else {
      finishLoading();
    }
  }, []);

  if (loading) {
    return (
      <Layout>
        <div style={{
          textAlign: 'center',
          padding: '40px 20px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(0, 184, 148, 0.3)',
            borderTop: '3px solid #00b894',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{
            color: '#636e72',
            fontSize: '14px',
            margin: '0'
          }}>
            Initializing wallet connection...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SendToReferrers web3={web3} account={account} />
    </Layout>
  );
} 