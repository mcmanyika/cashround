import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TreeContract from '../../abis/Tree.json';
import { toast } from 'react-toastify';
import { LayoutWithHeader } from '../layout/Layout';
import { getContractAddress, isNetworkSupported } from '../../config/contractConfig';
import { usePriceContext } from '../../contexts/PriceContext';

const SendToReferrers = ({ web3, account }) => {
  const router = useRouter();
  const { priceData, loading: priceLoading, calculateUSDValue, formatPrice } = usePriceContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [networkId, setNetworkId] = useState(null);
  const [hasPaid, setHasPaid] = useState(false);
  
  // Calculate POL amount equivalent to $5 USD per member
  const calculatePOLFor5USD = () => {
    if (!priceData || !priceData.price || priceData.price === 0) {
      return '5.00'; // Fallback amount
    }
    return (5 / priceData.price).toFixed(2); // 2 decimal places
  };
  
  const polAmountPerMember = calculatePOLFor5USD();
  const [contract, setContract] = useState(null);
  const [referralChain, setReferralChain] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [copyClicked, setCopyClicked] = useState(false);
  const [debugInfo, setDebugInfo] = useState('Component initialized');

  // Log props on component mount/update
  useEffect(() => {
    console.log('=== SendToReferrers Props ===');
    console.log('web3:', web3);
    console.log('account:', account);
    setDebugInfo(`Props - Web3: ${web3 ? 'Yes' : 'No'}, Account: ${account ? 'Yes' : 'No'}`);
  }, [web3, account]);

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

  useEffect(() => {
    const initialize = async () => {
      if (web3) {
        try {
          const networkId = await web3.eth.net.getId();
          setNetworkId(networkId);
          
          const contractAddress = getContractAddress(networkId);
          
          if (contractAddress) {
            const contractInstance = new web3.eth.Contract(
              TreeContract.abi,
              contractAddress
            );
            setContract(contractInstance);
            console.log('Contract initialized at:', contractAddress);
          } else {
            console.error('No contract found on network:', networkId);
            setError(`No contract found on network ${networkId}`);
          }
        } catch (error) {
          console.error('Error initializing contract:', error);
          setError('Error connecting to blockchain');
        }
      }
    };
    initialize();
  }, [web3]);

  useEffect(() => {
    const fetchData = async () => {
      if (contract && account) {
        try {
          console.log('=== DEBUGGING SendToReferrers ===');
          console.log('Contract address:', contract.options.address);
          console.log('Account:', account);
          console.log('Network ID:', networkId);
          setDebugInfo(`Fetching data for: ${account}`);
          
          // Check if user has paid
          const paid = await contract.methods.hasPaidUpliners(account).call();
          console.log('Has paid upliners:', paid);
          setHasPaid(paid);
          
          // If user has already paid, redirect to home page
          if (paid) {
            setTimeout(() => {
              router.push('/');
            }, 2000); // Wait 2 seconds to show the success message
            return;
          }
          
          // Check if user exists in the tree and build referral chain
          try {
            const userData = await contract.methods.tree(account).call();
            console.log('=== TREE DATA ===');
            console.log('Raw user data from contract:', userData);
            console.log('User inviter:', userData.inviter);
            console.log('User self:', userData.self);
            console.log('Is inviter zero address?', userData.inviter === '0x0000000000000000000000000000000000000000');
            console.log('Inviter length:', userData.inviter?.length);
            
            setDebugInfo(`User inviter: ${userData.inviter}, User self: ${userData.self}`);
            
            // If user has an inviter, they are in the tree
            if (userData.inviter && userData.inviter !== '0x0000000000000000000000000000000000000000') {
              setIsMember(true);
              console.log('User is a member, building referral chain...');
              setDebugInfo('User is a member, building referral chain...');
              
              // Start with the direct referrer
              const directReferrer = userData.inviter;
              console.log('Direct referrer:', directReferrer);
              
              // Build the referral chain by traversing up the tree
              const referralChain = [];
              
              // Add direct referrer first
              if (directReferrer !== '0x0000000000000000000000000000000000000000') {
                referralChain.push(directReferrer);
                console.log('Added direct referrer to chain');
              }
              
              // Now traverse up from the direct referrer (limit to 5 levels total)
              let currentAddress = directReferrer;
              let maxIterations = 4; // Limit to 4 more iterations (1 direct + 4 more = 5 total)
              let iteration = 0;
              
              // Traverse up the tree to build the referral chain (max 5 referrers total)
              while (currentAddress !== '0x0000000000000000000000000000000000000000' && iteration < maxIterations && referralChain.length < 5) {
                console.log(`Iteration ${iteration}: checking address ${currentAddress}`);
                const currentUserData = await contract.methods.tree(currentAddress).call();
                console.log('Current user data:', currentUserData);
                console.log('Current user inviter:', currentUserData.inviter);
                
                if (currentUserData.inviter !== '0x0000000000000000000000000000000000000000') {
                  console.log(`Adding referrer: ${currentUserData.inviter}`);
                  referralChain.push(currentUserData.inviter);
                  currentAddress = currentUserData.inviter;
                } else {
                  console.log('Reached top of tree');
                  break; // Reached the top of the tree
                }
                iteration++;
              }
              
              console.log('Final referral chain (max 5 levels):', referralChain);
              setReferralChain(referralChain);
              setDebugInfo(`Found ${referralChain.length} referrers in chain`);
            } else {
              console.log('User is not a member');
              setIsMember(false);
              setReferralChain([]);
              setDebugInfo('User is not a member of the tree');
            }
          } catch (treeError) {
            console.log('Error checking tree data:', treeError);
            setReferralChain([]);
            setIsMember(false);
            setDebugInfo(`Error checking tree data: ${treeError.message}`);
          }
        } catch (e) {
          console.error('Error fetching data:', e);
          setHasPaid(false);
          setReferralChain([]);
          setIsMember(false);
          setError('Error fetching data from blockchain: ' + e.message);
          setDebugInfo(`Error fetching data: ${e.message}`);
        }
      }
    };
    fetchData();
  }, [contract, account, router, networkId]);

  const handleSendToReferrers = async () => {
    if (!web3 || !account || !networkId) {
      setError('Please connect your wallet first');
      return;
    }

    // POL amount is automatically calculated as $5 USD equivalent

    if (referralChain.length === 0) {
      setError('No referrers found in your chain');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Debug values and compute totals
      console.log('[SendToReferrers] polAmountPerMember (POL):', polAmountPerMember);
      const polAmountWei = web3.utils.toWei(polAmountPerMember, 'ether');
      const totalPolNeeded = web3.utils
        .toBN(polAmountWei)
        .mul(web3.utils.toBN(referralChain.length));
      console.log('[SendToReferrers] polAmountWei:', polAmountWei);
      console.log('[SendToReferrers] referralChain.length:', referralChain.length);
      console.log('[SendToReferrers] totalPolNeeded (wei):', totalPolNeeded.toString());

      const balance = await web3.eth.getBalance(account);
      if (web3.utils.toBN(balance).lt(totalPolNeeded)) {
        setError(`Insufficient balance. You need ${web3.utils.fromWei(totalPolNeeded, 'ether')} POL`);
        setLoading(false);
        return;
      }

      // Preflight gas estimate to capture revert reasons
      let estimatedGas;
      try {
        estimatedGas = await contract.methods
          .batchPay(referralChain, polAmountWei)
          .estimateGas({ from: account, value: totalPolNeeded.toString() });
        console.log('[SendToReferrers] estimatedGas:', estimatedGas);
      } catch (estimateErr) {
        console.error('[SendToReferrers] Gas estimate failed:', estimateErr);
        const reason =
          estimateErr?.reason ||
          estimateErr?.message ||
          estimateErr?.data?.message ||
          estimateErr?.data?.originalError?.message ||
          'Transaction would fail during estimation.';
        if (reason.includes('Incorrect ETH sent')) {
          setError('Payment failed: Incorrect POL value calculated. Please refresh and try again.');
        } else if (reason.includes('already paid your upliners')) {
          setError('You have already paid your upliners on this network.');
        } else if (reason.includes('execution reverted')) {
          setError(`Transaction would revert: ${reason}`);
        } else {
          setError(reason);
        }
        setLoading(false);
        return;
      }

      // Call batchPay with all referrers in one transaction
      await contract.methods
        .batchPay(referralChain, polAmountWei)
        .send({ 
          from: account, 
          value: totalPolNeeded.toString(),
          gas: Math.floor(Number(estimatedGas) * 1.2) || undefined
        });

      toast.success(`✅ Successfully sent $${calculateUSDValue(polAmountPerMember)} (${polAmountPerMember} POL) to ${referralChain.length} referrers!`);
      setHasPaid(true);
    } catch (err) {
      if (err.code === 4001) {
        setError('Transaction was rejected by the user.');
      } else {
        const reason =
          err?.reason ||
          err?.message ||
          err?.data?.message ||
          err?.data?.originalError?.message ||
          'Error sending payments to referrers';
        setError(reason);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBecomeMember = async () => {
    if (!web3 || !account || !contract) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if user is already in the tree
      const userData = await contract.methods.tree(account).call();
      if (userData.inviter !== '0x0000000000000000000000000000000000000000') {
        setError('You are already a member of the tree');
        setLoading(false);
        return;
      }

      const membershipFee = web3.utils.toWei('0.01', 'ether');
      
      // Check if user has sufficient balance
      const balance = await web3.eth.getBalance(account);
      if (web3.utils.toBN(balance).lt(web3.utils.toBN(membershipFee))) {
        setError('Insufficient balance. You need 0.01 POL for membership');
        setLoading(false);
        return;
      }

      // Get the top address (contract owner) as the default referrer
      const topAddress = await contract.methods.top().call();
      
      // Use the enter function with the top address as referrer
      const result = await contract.methods.enter(topAddress, account).send({
        from: account,
        value: membershipFee,
        gas: 300000 // Explicit gas limit
      });

      toast.success('✅ Successfully became a member!');
      
      // Refresh the data
      const paid = await contract.methods.hasPaidUpliners(account).call();
      setHasPaid(paid);
      
      // Redirect to home page after successful membership
      setTimeout(() => {
        router.push('/');
      }, 2000); // Wait 2 seconds to show the success message
    } catch (err) {
      if (err.code === 4001) {
        setError('Transaction was rejected by the user.');
      } else if (err.message && err.message.includes('User denied')) {
        setError('Transaction was rejected by the user.');
      } else if (err.message && err.message.includes('Sender can\'t already exist')) {
        setError('You are already a member of the tree');
      } else if (err.message && err.message.includes('Inviter must exist')) {
        setError('Invalid referrer address');
      } else if (err.message && err.message.includes('ETH amount must be greater than zero')) {
        setError('Invalid POL amount');
      } else {
        setError(err.message || 'Error becoming a member');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutWithHeader showSignout={true}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {account && (
          <div style={{
            background: 'rgba(0, 184, 148, 0.1)',
            border: '1px solid rgba(0, 184, 148, 0.2)',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#00b894',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onClick={() => copyAddress(account)}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0, 184, 148, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(0, 184, 148, 0.1)';
          }}
          >
            Connected: {account.slice(0, 5)}...{account.slice(-5)}
            <span 
              style={{ 
                marginLeft: '8px', 
                fontSize: '12px',
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
            >
              📋
            </span>
          </div>
        )}

        {hasPaid ? (
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
              You have already paid your referrers!
            </p>
            <p style={{
              color: '#636e72',
              fontSize: '14px',
              margin: '0'
            }}>
              Thank you for supporting your referral chain.
            </p>
          </div>
        ) : isMember ? (
          <div>
            <div style={{
              marginBottom: '24px'
            }}>
              <div style={{
                background: 'rgba(0, 184, 148, 0.1)',
                border: '2px solid rgba(0, 184, 148, 0.2)',
                borderRadius: '16px',
                padding: '16px 20px',
                textAlign: 'center',
                marginBottom: '8px'
              }}>
                <p style={{
                  color: '#2d3436',
                  fontSize: '14px',
                  fontWeight: '600',
                  margin: '0 0 4px 0'
                }}>
                  Payment Amount (Fixed at $5.00 USD)
                </p>
                <p style={{
                  color: '#00b894',
                  fontSize: '20px',
                  fontWeight: '700',
                  margin: '0',
                  fontFamily: 'monospace'
                }}>
                  {parseFloat(polAmountPerMember).toFixed(2)} POL per referrer
                </p>
                <p style={{
                  color: '#636e72',
                  fontSize: '12px',
                  margin: '4px 0 0 0',
                  opacity: '0.8'
                }}>
                  Live rate: ${formatPrice(4)} POL/USD
                </p>
              </div>
            </div>

            <div style={{
              background: 'rgba(0, 184, 148, 0.05)',
              border: '1px solid rgba(0, 184, 148, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              textAlign: 'left'
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
              <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid rgba(0, 184, 148, 0.2)' }} />
              <p style={{
                color: '#2d3436',
                fontSize: '14px',
                fontWeight: '600',
                margin: '8px 0 0 0'
              }}>
                Payment Summary:
              </p>
              <p style={{
                color: '#636e72',
                fontSize: '14px',
                margin: '0'
              }}>
                • Amount per referrer: ${calculateUSDValue(polAmountPerMember)} ({polAmountPerMember} POL)
                <br />
                • Total: ${calculateUSDValue(polAmountPerMember * referralChain.length)} ({polAmountPerMember * referralChain.length} POL)
              </p>
            </div>

            <button
              onClick={handleSendToReferrers}
              disabled={loading}
              style={{
                width: '100%',
                padding: '18px 24px',
                background: loading ? '#e9ecef' : 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
                border: 'none',
                borderRadius: '16px',
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0, 184, 148, 0.25)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '0.5px',
                marginBottom: '16px'
              }}
            >
              {loading ? (
                <>
                  <span style={{ marginRight: '8px' }}>⏳</span>
                  Processing...
                </>
              ) : (
                `Activate Membership`
              )}
            </button>

            {!isMember && (
              <button
                onClick={handleBecomeMember}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '18px 24px',
                  background: loading ? '#e9ecef' : 'linear-gradient(135deg, #00cec9 0%, #00b894 100%)',
                  border: 'none',
                  borderRadius: '16px',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0, 206, 201, 0.25)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '0.5px'
                }}
              >
                {loading ? (
                  <>
                    <span style={{ marginRight: '8px' }}>⏳</span>
                    Processing...
                  </>
                ) : (
                  'Become A Member'
                )}
              </button>
            )}
          </div>
        ) : (
          <div>
            <div style={{
              textAlign: 'center',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'rgba(255, 193, 7, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <span style={{ fontSize: '24px' }}>⚠️</span>
              </div>
              <p style={{
                color: '#2d3436',
                fontSize: '16px',
                fontWeight: '600',
                margin: '0 0 8px 0'
              }}>
                {isMember && referralChain.length === 0 ? 'No referrers in your chain' : 'Not a member yet'}
              </p>
              <p style={{
                color: '#636e72',
                fontSize: '14px',
                margin: '0'
              }}>
                {isMember && referralChain.length === 0 
                  ? 'You are a member but have no referrers in your chain. This might be because you joined directly or your referrers are not in the system.'
                  : 'You need to become a member first to access the referral system.'
                }
              </p>
            </div>

            {hasPaid && (
              <button
                onClick={handleBecomeMember}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '18px 24px',
                  background: loading ? '#e9ecef' : 'linear-gradient(135deg, #00cec9 0%, #00b894 100%)',
                  border: 'none',
                  borderRadius: '16px',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0, 206, 201, 0.25)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '0.5px'
                }}
              >
                {loading ? (
                  <>
                    <span style={{ marginRight: '8px' }}>⏳</span>
                    Processing...
                  </>
                ) : (
                  'Become A Member'
                )}
              </button>
            )}
          </div>
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
      </div>
    </LayoutWithHeader>
  );
};

export default SendToReferrers; 