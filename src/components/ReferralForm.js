import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import TreeContract from '../abis/Tree.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReferralForm = ({ web3, account }) => {
  const history = useHistory();
  const [referrerAddress, setReferrerAddress] = useState('');
  const [ethAmount, setEthAmount] = useState('5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [networkId, setNetworkId] = useState(null);
  const [showBecomeMember, setShowBecomeMember] = useState(false);
  const [contract, setContract] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [checkingMembership, setCheckingMembership] = useState(true);
  const [hasPaidReferrers, setHasPaidReferrers] = useState(false);

  // Get network ID and initialize contract when component mounts or web3 changes
  useEffect(() => {
    const initialize = async () => {
      if (web3) {
        try {
          const id = await web3.eth.net.getId();
          setNetworkId(id);
          const networkData = TreeContract.networks[id];
          
          if (networkData && networkData.address) {
            const contractInstance = new web3.eth.Contract(
              TreeContract.abi,
              networkData.address
            );
            setContract(contractInstance);
          }
        } catch (error) {
          // Silent error handling
        }
      }
    };
    initialize();
  }, [web3]);

  // Check if user is already a member
  useEffect(() => {
    const checkMembership = async () => {
      if (contract && account) {
        try {
          const userData = await contract.methods.tree(account).call();
          const member = userData.inviter !== '0x0000000000000000000000000000000000000000';
          setIsMember(member);
          
          // Also check if user has already paid their referrers
          if (member) {
            const hasPaid = await contract.methods.hasPaidUpliners(account).call();
            setHasPaidReferrers(hasPaid);
            if (hasPaid) {
              // If user has already paid, redirect to home page
              setTimeout(() => {
                history.push('/');
              }, 2000);
            }
          }
          
          setCheckingMembership(false);
        } catch (error) {
          console.error('Error checking membership:', error);
          setIsMember(false);
          setHasPaidReferrers(false);
          setCheckingMembership(false);
        }
      }
    };
    checkMembership();
  }, [contract, account, history]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!web3 || !account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!networkId || !TreeContract.networks[networkId]) {
      toast.error('Please connect to a supported network');
      return;
    }

    if (!ethAmount || isNaN(ethAmount) || parseFloat(ethAmount) <= 0) {
      toast.error('Please enter a valid ETH amount');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const ethAmountWei = web3.utils.toWei(ethAmount, 'ether');

      // Call the enter function
      await contract.methods.enter(referrerAddress, referrerAddress)
        .send({ from: account, value: ethAmountWei });

      toast.success('Successfully joined the referral tree!');
      setReferrerAddress('');
      setEthAmount('');
      setShowBecomeMember(true);
      
      // Redirect to SendToReferrers component after successful submission
      setTimeout(() => {
        history.push('/send-to-referrers');
      }, 2000); // Wait 2 seconds to show the success message
      
    } catch (err) {
      toast.error(err.message || 'An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
  };

  if (checkingMembership) {
    return (
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
          Checking membership status...
        </p>
      </div>
    );
  }

  if (isMember) {
    return (
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
          You already a member
        </p>
        <p style={{
          color: '#636e72',
          fontSize: '14px',
          margin: '0 0 20px 0'
        }}>
          {hasPaidReferrers ? '' : 'Click below to complete your membership'}
        </p>
        {!hasPaidReferrers && (
          <>
          <button
            onClick={() => history.push('/send-to-referrers')}
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
            Complete Registration
          </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{
      width: '100%'
    }}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {networkId && !TreeContract.networks[networkId] && (
        <div style={{
          background: 'rgba(255, 193, 7, 0.1)',
          border: '1px solid #ffc107',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          color: '#856404',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          Please connect to a supported network. Current network ID: {networkId}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#2d3436',
            marginBottom: '8px',
            textAlign: 'left'
          }}>
            Referrer Address
          </label>
          <input
            type="text"
            id="referrerAddress"
            style={{
              width: '100%',
              padding: '16px 20px',
              border: '2px solid #e9ecef',
              borderRadius: '16px',
              fontSize: '16px',
              outline: 'none',
              transition: 'all 0.2s ease',
              backgroundColor: 'transparent',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
            value={referrerAddress}
            onChange={(e) => setReferrerAddress(e.target.value)}
            placeholder="Enter Your Referrer's Wallet Address"
            required
            onFocus={(e) => {
              e.target.style.borderColor = '#00b894';
              e.target.style.boxShadow = '0 0 0 3px rgba(0, 184, 148, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e9ecef';
              e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
            }}
          />
        </div>

        {/* Hidden amount field */}
        <input
          type="hidden"
          value={ethAmount}
          onChange={(e) => setEthAmount(e.target.value)}
        />

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '18px 24px',
            background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
            border: 'none',
            borderRadius: '16px',
            color: 'white',
            fontSize: '18px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0, 184, 148, 0.25)',
            marginBottom: '16px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            letterSpacing: '0.5px'
          }}
          disabled={loading || !web3 || !account || !TreeContract.networks[networkId]}
          onMouseEnter={(e) => {
            if (!e.target.disabled) {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 6px 16px rgba(0, 184, 148, 0.35)';
            }
          }}
          onMouseLeave={(e) => {
            if (!e.target.disabled) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 184, 148, 0.25)';
            }
          }}
        >
          {loading ? 'Processing...' : 'Join Cash Round'}
        </button>
      </form>
      {showBecomeMember && (
        <button 
          style={{
            width: '100%',
            padding: '18px 24px',
            background: 'linear-gradient(135deg, #00cec9 0%, #00b894 100%)',
            border: 'none',
            borderRadius: '16px',
            color: 'white',
            fontSize: '18px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0, 206, 201, 0.25)',
            marginTop: '8px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            letterSpacing: '0.5px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 6px 16px rgba(0, 206, 201, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(0, 206, 201, 0.25)';
          }}
        >
          Become A Member
        </button>
      )}
      {error && (
        <p style={{
          color: '#e74c3c',
          marginTop: '16px',
          fontSize: '14px',
          fontWeight: '500',
          textAlign: 'center'
        }}>
          {error}
        </p>
      )}
      {success && (
        <p style={{
          color: '#00b894',
          marginTop: '16px',
          fontSize: '14px',
          fontWeight: '500',
          textAlign: 'center'
        }}>
          {success}
        </p>
      )}
    </div>
  );
};

export default ReferralForm; 