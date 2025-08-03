import React from 'react';

const MetaMaskConnect = ({ account, setAccount, isConnected, setIsConnected, error, setError, web3, setWeb3 }) => {
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const Web3 = require('web3');
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        setAccount(accounts[0]);
        setIsConnected(true);
        setError('');
        localStorage.removeItem('logout');
      } else {
        setError('Please install MetaMask to use this feature');
      }
    } catch (error) {
      setError('Error connecting to MetaMask');
      console.error(error);
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
        <button className="btn btn-outline-secondary btn-sm ml-2" onClick={connectWallet}>
          Sign in
        </button>
      ) : (
        <button className="btn btn-outline-secondary btn-sm ml-2" onClick={logout}>
          Logout
        </button>
      )}
      {error && <p className="text-danger">{error}</p>}
    </div>
  );
};

export default MetaMaskConnect; 