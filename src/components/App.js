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
          <ToastContainer position="bottom-center" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
          <nav className="navbar navbar-dark bg-dark fixed-top shadow">
            <div className="container d-flex align-items-center position-relative">
              <div className="flex-grow-1 d-flex justify-content-center">
                <Link to="/" className="navbar-brand text-center">
                  <img src={logo} alt="TokenHub" style={{height: '32px', marginRight: '12px'}} />
                  TOKENHUB
                </Link>
              </div>
              {isConnected && (
                <>
                  <span className="navbar-text text-light bg-dark px-3 py-1 rounded shadow-sm d-flex align-items-center" style={{fontWeight: 500, fontFamily: 'monospace', fontSize: '0.8rem'}}>
                    <span className="mr-2">●</span>
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

            <div className="hero-image-container items-center justify-content-center d-flex" style={{
              backgroundImage: "url('/banner.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              display: 'flex',
              alignItems: 'flex-end'
            }}>
            </div>
              
            <div className="container">
                <div className="hero-section w-full text-center p-4">
                  <h1 className="hero-title">Transform Your Membership & Affiliate Programs with Blockchain</h1>
                  <p className="hero-subtitle">TokenHub helps organizations streamline their membership management and affiliate programs using cutting-edge blockchain technology. Join us to revolutionize how you engage with your community.</p>
                  <div className="container">
              {isConnected && (
                <div className="container d-flex justify-content-center align-items-center w-100 mb-4">
                  <div className="text-center w-100" style={{maxWidth: '800px'}}>
                      <ReferralInfo web3={web3} account={account} onJoinStatusChange={this.setHasJoined} />
                      {!hasJoined && (
                        <div className="mt-4">
                          <ReferralForm web3={web3} account={account} />
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
                </div>
                
                <div className="steps-section">
                  <div className="row text-center">
                    <div className="col-md-4 step">
                      <div className="step-icon mb-3">
                        <div className="step-number">1</div>
                        <span role="img" aria-label="link">🔗</span>
                      </div>
                      <h3>Connect</h3>
                      <p>Integrate your organization with TokenHub's blockchain-powered platform and start managing memberships with unprecedented efficiency.</p>
                    </div>
                    <div className="col-md-4 step">
                      <div className="step-icon mb-3">
                        <div className="step-number">2</div>
                        <span role="img" aria-label="refer">🤝</span>
                      </div>
                      <h3>Manage</h3>
                      <p>Leverage our blockchain technology to track memberships, manage affiliate relationships, and automate reward distributions with complete transparency.</p>
                    </div>
                    <div className="col-md-4 step">
                      <div className="step-icon mb-3">
                        <div className="step-number">3</div>
                        <span role="img" aria-label="invest">🌍</span>
                      </div>
                      <h3>Grow</h3>
                      <p>Expand your community with secure, verifiable membership tracking and automated affiliate program management powered by blockchain.</p>
                    </div>
                  </div>
                </div>
                <div className="client-logos-section py-5">
                  <div className="container">
                    <p className="text-center text-muted mb-4">Trusted by leading organizations worldwide</p>
                    <div className="row align-items-center justify-content-center">
                      <div className="col-4 col-md-2 mb-4 mb-md-0">
                        <img src="/logo.png" alt="Client 1" className="img-fluid" style={{filter: 'grayscale(100%)', opacity: 0.7}} />
                      </div>
                      <div className="col-4 col-md-2 mb-4 mb-md-0">
                        <img src="/logo.png" alt="Client 2" className="img-fluid" style={{filter: 'grayscale(100%)', opacity: 0.7}} />
                      </div>
                      <div className="col-4 col-md-2 mb-4 mb-md-0">
                        <img src="/logo.png" alt="Client 3" className="img-fluid" style={{filter: 'grayscale(100%)', opacity: 0.7}} />
                      </div>
                      <div className="col-4 col-md-2 mb-4 mb-md-0">
                        <img src="/logo.png" alt="Client 4" className="img-fluid" style={{filter: 'grayscale(100%)', opacity: 0.7}} />
                      </div>
                      <div className="col-4 col-md-2 mb-4 mb-md-0">
                        <img src="/logo.png" alt="Client 5" className="img-fluid" style={{filter: 'grayscale(100%)', opacity: 0.7}} />
                      </div>
                      <div className="col-4 col-md-2 mb-4 mb-md-0">
                        <img src="/logo.png" alt="Client 6" className="img-fluid" style={{filter: 'grayscale(100%)', opacity: 0.7}} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="faq-section mt-5 mb-5">
                  <h2 className="faq-title text-center mb-4">Frequently Asked Questions</h2>
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <div className="faq-item">
                        <h4>What is TokenHub?</h4>
                        <p>TokenHub is a blockchain-based platform that helps organizations manage their memberships and affiliate programs. We provide secure, transparent, and efficient solutions for tracking members, managing relationships, and automating rewards.</p>
                      </div>
                      <div className="faq-item">
                        <h4>How does the platform work?</h4>
                        <p>Our platform uses blockchain technology to create immutable records of memberships and affiliate relationships. This ensures transparency, security, and automated reward distribution while eliminating manual tracking and verification processes.</p>
                      </div>
                    </div>
                    <div className="col-md-6 mb-4">
                      <div className="faq-item">
                        <h4>What are the benefits?</h4>
                        <p>Organizations benefit from reduced administrative overhead, increased transparency, and automated reward distribution. Members and affiliates enjoy secure verification of their status and instant access to their rewards.</p>
                      </div>
                      <div className="faq-item">
                        <h4>Who can use TokenHub?</h4>
                        <p>Any organization looking to modernize their membership management or affiliate program can benefit from our platform. We serve businesses, associations, and communities of all sizes.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bottom-banner d-flex align-items-center justify-content-center">
                  <div className="banner-content container d-flex align-items-center py-4">
                    <div className="banner-logo pr-4 text-center">
                      <img src={logo} alt="TokenHub logo" style={{width: '90px'}} />
                    </div>
                    <div className="banner-divider mx-4" />
                    <div className="banner-text flex-grow-1">
                      <h2 className="mb-3 text-muted">Transform Your Membership Management with Blockchain Technology.</h2>
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
              © {new Date().getFullYear()} TokenHub. Revolutionizing Membership Management.
            </div>
          </footer>
        </div>
      </Router>
    );
  }
}

export default App;
