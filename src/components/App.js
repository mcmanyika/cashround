import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Web3 from 'web3';
import ReferralForm from './forms/ReferralForm';
import MetaMaskConnect from './wallet/MetaMaskConnect';
import SendToReferrers from './forms/SendToReferrers';
import TreeContract from '../abis/Tree.json';
import Layout, { 
  LayoutCard, 
  LayoutHeader,
  LayoutLogo, 
  LayoutLogoText, 
  LayoutLogoBadge, 
  LayoutTitle, 
  LayoutSubtitle,
  LayoutLoading 
} from './layout/Layout';


function App() {

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

  useEffect(() => {
    const finishLoading = () => {
      setLoading(false);
    };
    if (window.ethereum && !localStorage.getItem('logout')) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
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
  }, []);

  const checkReferrerStatus = async (web3Instance, accountAddress) => {
    if (!web3Instance || !accountAddress) return;

    try {
      const networkId = await web3Instance.eth.net.getId();
      const networkData = TreeContract.networks[networkId];
      
      // Network name mapping for better UX
      const networkNames = {
        1: 'Ethereum Mainnet',
        5: 'Goerli Testnet',
        11155111: 'Sepolia Testnet',
        137: 'Polygon Mainnet',
        80001: 'Mumbai Testnet',
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

        // If user has a referrer or is already a member, redirect to SendToReferrers
        if (hasReferrer || isMember) {
          window.location.href = '/send-to-referrers';
        }
      } else {
        // Show network info for debugging
        console.log(`No contract found on ${currentNetworkName}. Available networks:`, Object.keys(TreeContract.networks));
        setCheckingReferrer(false);
      }
    } catch (error) {
      // Silent error handling
      setCheckingReferrer(false);
    }
  };

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
    <Router>
      <Layout>
        <Switch>
          <Route path="/send-to-referrers">
            <SendToReferrers web3={web3} account={account} />
          </Route>
          <Route path="/">
            <LayoutCard>
              <LayoutHeader>
                <LayoutLogo>
                  <LayoutLogoText>CR</LayoutLogoText>
                  <LayoutLogoBadge>$</LayoutLogoBadge>
                </LayoutLogo>
                <LayoutTitle>Cash Round</LayoutTitle>
                <LayoutSubtitle>Connect with your referrer and start earning rewards.</LayoutSubtitle>
              </LayoutHeader>
              
              {isConnected ? (
                <div style={{ width: '100%' }}>
                  <div style={{
                    background: 'rgba(0, 184, 148, 0.1)',
                    border: '1px solid rgba(0, 184, 148, 0.2)',
                    borderRadius: '12px',
                    padding: '12px',
                    marginBottom: '24px',
                    fontSize: '14px',
                    color: '#00b894',
                    fontWeight: '500',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}>
                    Connected: {formatAddress(account)}
                    <span 
                      style={{ 
                        cursor: 'pointer', 
                        marginLeft: '5px', 
                        fontSize: '14px',
                        color: copyClicked ? '#00b894' : '#636e72',
                        transition: 'all 0.2s ease',
                        background: copyClicked ? '#e8f5e8' : '#f5f5f5',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: copyClicked ? '1px solid #00b894' : '1px solid #e0e0e0'
                      }} 
                      onClick={() => copyAddress(account)}
                    >
                      📋
                    </span>
                  </div>
                  
                  {checkingReferrer ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '20px'
                    }}>
                      <div style={{
                        width: '30px',
                        height: '30px',
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
                        Checking your referral status...
                      </p>
                    </div>
                  ) : hasReferrer ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '20px'
                    }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        background: 'rgba(0, 184, 148, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                      }}>
                        <span style={{ fontSize: '24px' }}>✅</span>
                      </div>
                      <p style={{
                        color: '#2d3436',
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: '0 0 8px 0'
                      }}>
                        You already have a referrer!
                      </p>
                      <p style={{
                        color: '#636e72',
                        fontSize: '14px',
                        margin: '0 0 20px 0'
                      }}>
                        Redirecting you to the dashboard...
                      </p>
                      <button
                        onClick={() => window.location.href = '/send-to-referrers'}
                        style={{
                          padding: '12px 24px',
                          background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
                          border: 'none',
                          borderRadius: '12px',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Go to Dashboard
                      </button>
                    </div>
                  ) : isMember ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '20px'
                    }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        background: 'rgba(0, 184, 148, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                      }}>
                        <span style={{ fontSize: '24px' }}>✅</span>
                      </div>
                      <p style={{
                        color: '#2d3436',
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: '0 0 8px 0'
                      }}>
                        You are already a member!
                      </p>
                      <p style={{
                        color: '#636e72',
                        fontSize: '14px',
                        margin: '0 0 20px 0'
                      }}>
                        Redirecting you to the dashboard...
                      </p>
                      <button
                        onClick={() => window.location.href = '/send-to-referrers'}
                        style={{
                          padding: '12px 24px',
                          background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
                          border: 'none',
                          borderRadius: '12px',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Go to Dashboard
                      </button>
                    </div>
                  ) : (
                    <ReferralForm web3={web3} account={account} />
                  )}
                </div>
              ) : (
                <div>
                  <p style={{
                    color: '#636e72',
                    marginBottom: '20px',
                    fontSize: '16px'
                  }}>
                    Please connect your wallet to continue
                  </p>
                  <MetaMaskConnect
                    account={account}
                    setAccount={setAccount}
                    isConnected={isConnected}
                    setIsConnected={setIsConnected}
                    error={error}
                    setError={setError}
                    web3={web3}
                    setWeb3={setWeb3}
                  />
                </div>
              )}
            </LayoutCard>
          </Route>
        </Switch>
      </Layout>
    </Router>
  );
}

export default App;
