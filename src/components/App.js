import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import logo from '../logo.png';
import './App.css';
import './Landing.css';
import MetaMaskConnect from './MetaMaskConnect';
import ReferralForm from './ReferralForm';
import ReferralInfo from './ReferralInfo';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserDashboard from './UserDashboard';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      isConnected: false,
      error: '',
      web3: null,
      hasJoined: false,
      loading: true
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
            }, finishLoading);
          } else {
            finishLoading();
          }
        })
        .catch(finishLoading);
    } else {
      finishLoading();
    }
  }

  formatAddress = (address) => {
    if (!address) return '';
    return address.slice(0, 5) + '...' + address.slice(-5);
  };

  render() {
    const { account, isConnected, error, web3, hasJoined, loading } = this.state;
    if (loading) {
      return (
        <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="spinner-border text-secondary" role="status" style={{width: '2rem', height: '2rem'}}>
          </div>
        </div>
      );
    }
    return (
      <Router>
        <div className="landing-page">
          <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
          <nav className="navbar navbar-dark bg-dark fixed-top shadow">
            <div className="container d-flex align-items-center position-relative">
              <div className="flex-grow-1 d-flex justify-content-center">
                <Link to="/" className="navbar-brand text-center">
                  KUMUSHA ASSOCIATES
                </Link>
              </div>
              {isConnected && (
                <>
                  <span className="navbar-text text-light bg-dark px-3 py-1 rounded shadow-sm d-flex align-items-center" style={{fontWeight: 500, fontFamily: 'monospace', fontSize: '0.8rem'}}>
                    {this.formatAddress(account)}
                  </span>
                  <Link to="/dashboard" className="btn btn-outline-info btn-sm ml-3">
                    Dashboard
                  </Link>
                </>
              )}
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
          </nav>
          <div style={{height: '56px'}} />
          <Switch>
            <Route path="/dashboard">
              <UserDashboard web3={web3} account={account} />
            </Route>
            <Route path="/">
              <div className="container">
                <div className="hero-section text-center p-4">
                  <img src={logo} className="App-logo mb-3" alt="logo" style={{width: '120px'}} />
                  <h1 className="hero-title">Connect. Refer. Invest in Africa's Future.</h1>
                  <p className="hero-subtitle">Join Kumusha Investments' affiliate program. Refer others, and help channel diaspora capital into high-impact opportunities across Africa.</p>
                </div>
                <div className="steps-section mt-5">
                  <div className="row text-center">
                    <div className="col-md-4 step">
                      <div className="step-icon mb-2"><span role="img" aria-label="link">🔗</span></div>
                      <h3>1. Connect</h3>
                      <p>Join Kumusha Investments' affiliate program and start your journey to making an impact.</p>
                    </div>
                    <div className="col-md-4 step">
                      <div className="step-icon mb-2"><span role="img" aria-label="refer">🤝</span></div>
                      <h3>2. Refer</h3>
                      <p>Invite friends, family, and fellow diaspora members to join Kumusha and grow our investment community together.</p>
                    </div>
                    <div className="col-md-4 step">
                      <div className="step-icon mb-2"><span role="img" aria-label="invest">🌍</span></div>
                      <h3>3. Invest & Earn</h3>
                      <p>Help channel capital into Africa's future. Earn rewards for every successful referral and investment made through your network.</p>
                    </div>
                  </div>
                </div>
                <div className="faq-section mt-5 mb-5">
                  <h2 className="faq-title text-center mb-4">Frequently Asked Questions</h2>
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <h4>What is Kumusha Investments?</h4>
                      <p>Kumusha Investments is a platform that brings together capital from the African diaspora to invest in high-impact opportunities across Africa.</p>
                      <h4>How does the affiliate program work?</h4>
                      <p>By joining our affiliate program, you can refer others to Kumusha Investments. When your referrals join and invest, you earn rewards and help grow Africa's economic future.</p>
                      <h4>Who can join?</h4>
                      <p>Anyone in the diaspora or locally who wants to make a difference by investing in Africa's growth can join the program.</p>
                    </div>
                    <div className="col-md-6 mb-4">
                      <h4>How do I earn rewards?</h4>
                      <p>You earn rewards for every successful referral who joins and invests through Kumusha Investments. The more you refer, the more you can earn while supporting Africa's development.</p>
                      <h4>How do I get started?</h4>
                      <p>Simply connect your wallet, join the affiliate program, and start referring others. Together, we can build a brighter future for Africa.</p>
                    </div>
                  </div>
                </div>
                <div className="bottom-banner d-flex align-items-center justify-content-center">
                  <div className="banner-content container d-flex align-items-center py-4">
                    <div className="banner-logo pr-4 text-center">
                      <img src={logo} alt="Kumusha logo" style={{width: '90px'}} />
                    </div>
                    <div className="banner-divider mx-4" />
                    <div className="banner-text flex-grow-1">
                      <h2 className="mb-3">Refer, Invest, and Build Africa's Future.</h2>
                      {isConnected && (
                        <div className="mt-4">
                          <ReferralInfo web3={web3} account={account} onJoinStatusChange={this.setHasJoined} />
                          {!hasJoined && <ReferralForm web3={web3} account={account} />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Route>
          </Switch>
          {/* Footer */}
          <footer className="footer-section text-center mt-4 py-3">
            <div className="footer-links mb-2">
              <a href="javascript:void(0)">Operating agreement</a> &nbsp; | &nbsp;
              <a href="javascript:void(0)">Program policies</a> &nbsp; | &nbsp;
              <a href="javascript:void(0)">Conditions of use</a> &nbsp; | &nbsp;
              <a href="javascript:void(0)">Contact us</a>
            </div>
            <div className="footer-copyright">
              © {new Date().getFullYear()} Kumusha Investments. Empowering Africa's Future.
            </div>
          </footer>
        </div>
      </Router>
    );
  }
}

export default App;
