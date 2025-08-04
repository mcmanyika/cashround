import React from 'react';
import Web3 from 'web3';

const MetaMaskConnect = ({ account, setAccount, isConnected, setIsConnected, error, setError, web3, setWeb3 }) => {
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        if (accounts.length === 0) {
          setError('No accounts found. Please unlock MetaMask.');
          return;
        }
        
        // Create Web3 instance
        const web3Instance = new Web3(window.ethereum);
        
        // Set up event listeners for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length === 0) {
            setAccount('');
            setIsConnected(false);
            setWeb3(null);
          } else {
            setAccount(accounts[0]);
          }
        });
        
        // Set up network change listener
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });
        
        setWeb3(web3Instance);
        setAccount(accounts[0]);
        setIsConnected(true);
        setError('');
        localStorage.removeItem('logout');
      } else {
        setError('Please install MetaMask to use this feature');
      }
    } catch (error) {
      console.error('MetaMask connection error:', error);
      if (error.code === 4001) {
        setError('User rejected the connection request');
      } else if (error.code === -32002) {
        setError('Please check MetaMask and try again');
      } else {
        setError('Error connecting to MetaMask: ' + error.message);
      }
    }
  };

  const logout = () => {
    setAccount('');
    setIsConnected(false);
    setError('');
    setWeb3(null);
    localStorage.setItem('logout', 'true');
  };

  return (
    <div className="metamask-connect">
      {!isConnected ? (
        <button 
          style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={connectWallet}
        >
          Sign in
        </button>
      ) : (
        <button 
          style={{
            padding: '8px 16px',
            background: '#636e72',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={logout}
        >
          Logout
        </button>
      )}
      {error && <p style={{ color: '#e74c3c', fontSize: '14px', marginTop: '8px' }}>{error}</p>}
    </div>
  );
};

export default MetaMaskConnect; 