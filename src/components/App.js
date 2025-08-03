import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
import ReferralForm from './ReferralForm';
import MetaMaskConnect from './MetaMaskConnect';
import SendToReferrers from './SendToReferrers';
import TreeContract from '../abis/Tree.json';
import CONTRACT_ADDRESS from '../config/contractAddresses';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      isConnected: false,
      error: '',
      web3: null,
      hasJoined: false,
      loading: true,
      hasReferrer: false,
      checkingReferrer: true,
      isMember: false,
      copyClicked: false
    };
  }

  setAccount = (account) => this.setState({ account });
  setIsConnected = (isConnected) => this.setState({ isConnected });
  setError = (error) => this.setState({ error });
  setWeb3 = (web3) => this.setState({ web3 });
  setHasJoined = (hasJoined) => this.setState({ hasJoined });

  componentDidMount() {
    const finishLoading = () => {
      this.setState({ loading: false });
    };
    if (window.ethereum && !localStorage.getItem('logout')) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            const Web3 = require('web3');
            const web3Instance = new Web3(window.ethereum);
            this.setState({
              account: accounts[0],
              isConnected: true,
              web3: web3Instance
            }, () => {
              this.checkReferrerStatus();
              finishLoading();
            });
          } else {
            finishLoading();
          }
        })
        .catch(finishLoading);
    } else {
      finishLoading();
    }
  }

  checkReferrerStatus = async () => {
    const { web3, account } = this.state;
    if (!web3 || !account) return;

    try {
      const networkId = await web3.eth.net.getId();
      if (CONTRACT_ADDRESS[networkId]) {
        const contract = new web3.eth.Contract(
          TreeContract.abi,
          CONTRACT_ADDRESS[networkId]
        );
        
        // Check if user has a referrer
        const referrer = await contract.methods.getReferrer(account).call();
        const hasReferrer = referrer !== '0x0000000000000000000000000000000000000000';
        
        // Check if user is already a member of the tree
        const userData = await contract.methods.tree(account).call();
        const isMember = userData.inviter !== '0x0000000000000000000000000000000000000000';
        
        this.setState({ 
          hasReferrer,
          isMember,
          checkingReferrer: false
        });

        // If user has a referrer or is already a member, redirect to SendToReferrers
        if (hasReferrer || isMember) {
          window.location.href = '/send-to-referrers';
        }
      }
    } catch (error) {
      console.error('Error checking referrer status:', error);
      this.setState({ checkingReferrer: false });
    }
  };

  formatAddress = (address) => {
    if (!address) return '';
    return address.slice(0, 5) + '...' + address.slice(-5);
  };

  copyAddress = (address) => {
    this.setState({ copyClicked: true });
    navigator.clipboard.writeText(address).catch(() => {
      // Silent fail - no toast notification
    });
    // Reset the color after 500ms
    setTimeout(() => {
      this.setState({ copyClicked: false });
    }, 500);
  };

  render() {
    const { account, isConnected, error, web3, hasJoined, loading, hasReferrer, checkingReferrer, isMember } = this.state;
    
    if (loading) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #00b894 0%, #00a085 50%, #00cec9 100%)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      );
    }

    return (
      <Router>
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #00b894 0%, #00a085 50%, #00cec9 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <Switch>
            <Route path="/send-to-referrers">
              <SendToReferrers web3={web3} account={account} />
            </Route>
            <Route path="/">
              <div style={{
                background: 'rgba(255, 255, 255, 0.98)',
                borderRadius: '24px',
                padding: '40px 30px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                maxWidth: '400px',
                width: '100%',
                textAlign: 'center'
              }}>
                <div style={{
                  marginBottom: '30px'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: '0 8px 20px rgba(0, 184, 148, 0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: 'white',
                      textAlign: 'center',
                      lineHeight: '1'
                    }}>
                      CR
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      width: '16px',
                      height: '16px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8px',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      $
                    </div>
                  </div>
                  <h1 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#2d3436',
                    margin: '0 0 12px 0',
                    lineHeight: '1.2'
                  }}>
                    Cash Round Network
                  </h1>
                  <p style={{
                    fontSize: '16px',
                    color: '#636e72',
                    lineHeight: '1.5',
                    margin: '0',
                    fontWeight: '400'
                  }}>
                    Connect with your referrer and start earning rewards.
                  </p>
                </div>
                
                {isConnected ? (
                  <div>
                    <div style={{
                      background: 'rgba(0, 184, 148, 0.1)',
                      border: '1px solid rgba(0, 184, 148, 0.2)',
                      borderRadius: '12px',
                      padding: '12px',
                      marginBottom: '20px',
                      fontSize: '14px',
                      color: '#00b894',
                      fontWeight: '500'
                    }}>
                      Connected: {this.formatAddress(account)}
                      <span 
                        style={{ 
                          cursor: 'pointer', 
                          marginLeft: '5px', 
                          fontSize: '14px',
                          color: this.state.copyClicked ? '#00b894' : '#636e72',
                          transition: 'all 0.2s ease',
                          background: this.state.copyClicked ? '#e8f5e8' : '#f5f5f5',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: this.state.copyClicked ? '1px solid #00b894' : '1px solid #e0e0e0'
                        }} 
                        onClick={() => this.copyAddress(account)}
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
                      setAccount={this.setAccount}
                      isConnected={isConnected}
                      setIsConnected={this.setIsConnected}
                      error={error}
                      setError={this.setError}
                      web3={web3}
                      setWeb3={this.setWeb3}
                    />
                  </div>
                )}
              </div>
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
