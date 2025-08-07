import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TreeContract from '../../abis/Tree.json';
import { ToastContainer, toast } from 'react-toastify';
import { useActiveWallet } from 'thirdweb/react';
import { getContractAddress, isNetworkSupported } from '../../config/contractConfig';

// Helper function to get all referrers in the entire tree
const getAllReferrers = async (contract, userAddress) => {
  const allReferrers = [];
  let currentAddress = userAddress;
  const maxIterations = 100; // Safety limit to prevent infinite loops
  let iteration = 0;
  
  while (currentAddress !== '0x0000000000000000000000000000000000000000' && iteration < maxIterations) {
    try {
      const userData = await contract.methods.tree(currentAddress).call();
      if (userData.inviter !== '0x0000000000000000000000000000000000000000') {
        allReferrers.push(userData.inviter);
        currentAddress = userData.inviter;
      } else {
        break; // Reached the top of the tree
      }
    } catch (error) {
      console.error('Error traversing referral tree:', error);
      break;
    }
    iteration++;
  }
  
  return allReferrers;
};

const ReferralForm = ({ web3, account, setIsMember }) => {
  const router = useRouter();
  const activeWallet = useActiveWallet();
  const [referrerAddress, setReferrerAddress] = useState('');
  const [ethAmount, setEthAmount] = useState('5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [networkId, setNetworkId] = useState(null);
  const [showBecomeMember, setShowBecomeMember] = useState(false);
  const [contract, setContract] = useState(null);
  const [isMember, setIsMemberLocal] = useState(false);
  const [checkingMembership, setCheckingMembership] = useState(true);
  const [hasPaidReferrers, setHasPaidReferrers] = useState(false);
  const [referralChain, setReferralChain] = useState([]);
  const [totalAmountReceived, setTotalAmountReceived] = useState('0');

  // Get network ID and initialize contract when component mounts or web3 changes
  useEffect(() => {
    const initialize = async () => {
      if (web3) {
        try {
          const id = await web3.eth.net.getId();
          setNetworkId(id);
          
          // Handle Polygon mainnet (network ID 137) and other networks
          let networkData;
          if (id === 137) {
            // Polygon mainnet
            networkData = TreeContract.networks[137];
          } else {
            // Other networks (local, testnets, etc.)
            networkData = TreeContract.networks[id];
          }
          
          if (networkData && networkData.address) {
            const contractInstance = new web3.eth.Contract(
              TreeContract.abi,
              networkData.address
            );
            setContract(contractInstance);
          } else {
            console.log('Contract not found for network ID:', id);
          }
        } catch (error) {
          console.error('Error initializing contract:', error);
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
          setIsMemberLocal(member);
          setIsMember(member);
          
          // Also check if user has already paid their referrers and build referral chain
          if (member) {
            const hasPaid = await contract.methods.hasPaidUpliners(account).call();
            setHasPaidReferrers(hasPaid);
            
            // Get total amount received from all levels in the referral tree
            try {
              const fromBlock = 0; // Start from the beginning
              const toBlock = 'latest';
              
              // Get all Payments events where the user is the recipient
              const events = await contract.getPastEvents('Payments', {
                fromBlock: fromBlock,
                toBlock: toBlock,
                filter: { to: account }
              });
              
              // Calculate total amount received from direct payments
              let totalReceived = web3.utils.toBN('0');
              events.forEach(event => {
                totalReceived = totalReceived.add(web3.utils.toBN(event.returnValues.amount));
              });
              
              // Now calculate total from all levels in the referral tree
              const allReferrers = await getAllReferrers(contract, account);
              let totalFromAllLevels = web3.utils.toBN('0');
              
              // Get payments from all referrers in the tree
              for (const referrer of allReferrers) {
                try {
                  const referrerEvents = await contract.getPastEvents('Payments', {
                    fromBlock: fromBlock,
                    toBlock: toBlock,
                    filter: { from: referrer, to: account }
                  });
                  
                  referrerEvents.forEach(event => {
                    totalFromAllLevels = totalFromAllLevels.add(web3.utils.toBN(event.returnValues.amount));
                  });
                } catch (error) {
                  console.error(`Error fetching payments from referrer ${referrer}:`, error);
                }
              }
              
              // Add direct payments and payments from all levels
              const grandTotal = totalReceived.add(totalFromAllLevels);
              const totalInEth = web3.utils.fromWei(grandTotal, 'ether');
              setTotalAmountReceived(totalInEth);
            } catch (error) {
              console.error('Error fetching total amount received:', error);
              setTotalAmountReceived('0');
            }
            
            // Build referral chain
            const referralChain = [];
            const directReferrer = userData.inviter;
            
            // Add direct referrer first
            if (directReferrer !== '0x0000000000000000000000000000000000000000') {
              referralChain.push(directReferrer);
            }
            
            // Traverse up the tree (max 5 levels total)
            let currentAddress = directReferrer;
            let maxIterations = 4; // 1 direct + 4 more = 5 total
            let iteration = 0;
            
            while (currentAddress !== '0x0000000000000000000000000000000000000000' && 
                   iteration < maxIterations && 
                   referralChain.length < 5) {
              try {
                const currentUserData = await contract.methods.tree(currentAddress).call();
                if (currentUserData.inviter !== '0x0000000000000000000000000000000000000000') {
                  referralChain.push(currentUserData.inviter);
                  currentAddress = currentUserData.inviter;
                } else {
                  break; // Reached the top of the tree
                }
              } catch (error) {
                console.error('Error traversing referral chain:', error);
                break;
              }
              iteration++;
            }
            
            setReferralChain(referralChain);
            
            if (hasPaid) {
              // If user has already paid, redirect to home page
              setTimeout(() => {
                // router.push('/');
              }, 2000);
            }
          }
          
          setCheckingMembership(false);
        } catch (error) {
          console.error('Error checking membership:', error);
          setIsMemberLocal(false);
          setIsMember(false);
          setHasPaidReferrers(false);
          setCheckingMembership(false);
        }
      }
    };
    checkMembership();
  }, [contract, account, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!web3 || !account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!networkId || !isNetworkSupported(networkId)) {
      toast.error('Please connect to a supported network');
      return;
    }

    if (!ethAmount || isNaN(ethAmount) || parseFloat(ethAmount) <= 0) {
      toast.error('Please enter a valid ETH amount');
      return;
    }

    // Validate referrer address format
    if (!web3.utils.isAddress(referrerAddress)) {
      toast.error('Please enter a valid wallet address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Check if the referrer address exists in the contract
      const referrerData = await contract.methods.tree(referrerAddress).call();
      const isReferrerMember = referrerData.inviter !== '0x0000000000000000000000000000000000000000';
      
      if (!isReferrerMember) {
        toast.error('The referrer address you entered is not a member. Please enter a valid member address.');
        setLoading(false);
        return;
      }

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
        router.push('/send-to-referrers');
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
      <div>
        {/* Connected Address Display */}
        {account && (
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
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
            <span 
              style={{ 
                cursor: 'pointer', 
                marginLeft: '5px', 
                fontSize: '14px',
                color: '#636e72',
                background: '#f5f5f5',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e0e0e0'
              }} 
              onClick={() => navigator.clipboard.writeText(account)}
            >
              📋
            </span>
          </div>
        )}
        
        {/* Referral Chain Display */}
        {referralChain.length > 0 && (
          <div style={{
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <p style={{
              color: '#2d3436',
              fontSize: '14px',
              fontWeight: '600',
              margin: '0 0 8px 0'
            }}>
              Your Referral Chain ({referralChain.length} referrers):
            </p>
            {referralChain.map((referrer, index) => (
              <p key={index} style={{
                color: '#636e72',
                fontSize: '14px',
                margin: '0 0 4px 0',
                fontFamily: 'monospace'
              }}>
                {index + 1}. {referrer.slice(0, 6)}...{referrer.slice(-4)}
              </p>
            ))}
          </div>
        )}
        
        {/* Total Amount Received Display */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 184, 148, 0.1) 0%, rgba(0, 206, 201, 0.1) 100%)',
          border: '1px solid rgba(0, 184, 148, 0.2)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '20px', marginRight: '8px' }}>💰</span>
            <p style={{
              color: '#2d3436',
              fontSize: '16px',
              fontWeight: '600',
              margin: '0'
            }}>
              Total Amount Received
            </p>
          </div>
          <p style={{
            color: '#00b894',
            fontSize: '24px',
            fontWeight: '700',
            margin: '0',
            fontFamily: 'monospace'
          }}>
            {parseFloat(totalAmountReceived).toFixed(2)} POL
          </p>
          <p style={{
            color: '#636e72',
            fontSize: '12px',
            margin: '8px 0 0 0',
            opacity: '0.8'
          }}>
            From referral rewards
          </p>
        </div>
        
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
              onClick={() => router.push('/send-to-referrers')}
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
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      minHeight: 'fit-content'
    }}>
      <ToastContainer
        position="top-center"
        autoClose={8000}
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
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div style={{ 
          marginBottom: '24px',
          width: '100%'
        }}>
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
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              boxSizing: 'border-box'
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
          disabled={loading || !web3 || !account || (!TreeContract.networks[networkId] && networkId !== 137)}
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