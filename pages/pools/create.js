import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { LayoutWithHeader, LayoutLoading } from '../../src/components/layout/Layout';
import { getWeb3, getWeb3FromThirdwebWallet, getFactory, hasTwoLevelDownline, isTreeOwner, isTreeMember, getPOLBalance } from '../../src/rosca/services/rosca';
import { getDefaultTokenForChain } from '../../src/rosca/config/tokens';
import { useActiveWallet, useActiveAccount } from 'thirdweb/react';

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_POOL_FACTORY_ADDRESS || '';

export default function CreatePool() {
  const router = useRouter();
  const activeWallet = useActiveWallet();
  const activeAccount = useActiveAccount();
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [factory, setFactory] = useState(null);
  const [token, setToken] = useState('');
  const [size, setSize] = useState(5);
  const [contribution, setContribution] = useState('1'); // Default to 1 ETH
  const [roundDuration, setRoundDuration] = useState(30 * 24 * 60 * 60); // Default to 30 days
  const [rotationFrequency, setRotationFrequency] = useState('monthly'); // Default to monthly
  const [startTime, setStartTime] = useState('');
  const [mounted, setMounted] = useState(false);
  const [orderCsv, setOrderCsv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [checkingMember, setCheckingMember] = useState(true);
  const [polBalance, setPolBalance] = useState('0');

  useEffect(() => {
    (async () => {
      let w3 = await getWeb3FromThirdwebWallet(activeWallet);
      if (!w3) w3 = await getWeb3();
      if (!w3) {
        toast.error('Please install MetaMask');
        return;
      }
      setWeb3(w3);
      const acct = activeAccount?.address || (await w3.eth.requestAccounts())[0];
      if (!acct) {
        toast.error('Please connect your wallet');
        return router.push('/');
      }
      setAccount(acct);
      try {
        const netId = await w3.eth.net.getId();
        const suggested = getDefaultTokenForChain(netId);
        if (suggested) setToken(suggested);
      } catch {}
      if (!FACTORY_ADDRESS) {
        toast.error('Factory address is not configured.');
        return;
      }
      setFactory(getFactory(w3, FACTORY_ADDRESS));
      
      // Check if user is a tree member immediately
      const member = await isTreeMember(w3, acct);
      if (!member) {
        toast.error('You must be a member to create pools');
        router.replace('/referral'); // Use replace to prevent back button
        return;
      }
      
      // Allow attempt to create; contract enforces final rule
      setEligible(true);
      
      // Get POL balance
      const balance = await getPOLBalance(w3, acct);
      setPolBalance(balance);
      
      setCheckingMember(false);
      // Set default start time on client to avoid SSR hydration drift
      try {
        setMounted(true);
        if (!startTime) {
          setStartTime(Math.floor(Date.now() / 1000) + 3600);
        }
      } catch {}
    })();
  }, [activeWallet, activeAccount?.address, router, startTime]);

  const create = async () => {
    if (!web3 || !factory || !account) return;
    setProcessing(true);
    try {
      // Convert POL to wei
      const contributionInWei = web3.utils.toWei(contribution, 'ether');
      
      // Validate minimum contribution (1 POL)
      if (Number(contribution) < 1) {
        toast.error('Minimum contribution is 1 POL');
        setProcessing(false);
        return;
      }
      
      // Check if user has enough POL balance
      if (Number(polBalance) < Number(contribution)) {
        toast.error(`Insufficient POL balance. You have ${parseFloat(polBalance).toFixed(4)} POL`);
        setProcessing(false);
        return;
      }
      
      // Check if we're on local development
      const networkId = await web3.eth.net.getId();
      const isLocalDev = networkId === 1337 || networkId === 5777;
      
      const payoutOrder = orderCsv
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (payoutOrder.length !== Number(size)) {
        toast.error('Payout order must have exactly `size` addresses');
        setProcessing(false);
        return;
      }
      // For local development, we might need to handle differently
      if (isLocalDev) {
        console.log('Local development: Creating pool with ETH fallback');
      }
      
      await factory.methods
        .createPool(
          Number(size),
          contributionInWei, // Use wei value for contract
          Number(roundDuration),
          Number(startTime),
          payoutOrder
        )
        .send({ from: account });
      toast.success('Pool created successfully!');
      
      // Redirect to pools page after successful creation
      setTimeout(() => {
        router.push('/pools');
      }, 1500); // Wait 1.5 seconds for user to see success message
    } catch (e) {
      if (e?.code === 4001) {
        toast.error('User rejected transaction');
      } else {
        toast.error(e.message || 'Create failed');
      }
    } finally {
      setProcessing(false);
    }
  };

  const cardStyle = {
    maxWidth: 560,
    margin: '0 auto',
    background: 'white',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
  };

  const labelStyle = {
    color: '#2d3436',
    fontSize: 14,
    fontWeight: 600,
    margin: '4px 0 8px 0'
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e9ecef',
    borderRadius: 12,
    fontSize: 14,
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: 'transparent',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    boxSizing: 'border-box'
  };

  const onFocus = (e) => {
    e.target.style.borderColor = '#00b894';
    e.target.style.boxShadow = '0 0 0 3px rgba(0, 184, 148, 0.12)';
  };
  const onBlur = (e) => {
    e.target.style.borderColor = '#e9ecef';
    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
  };

  const handleRotationFrequencyChange = (frequency) => {
    setRotationFrequency(frequency);
    // Convert frequency to seconds
    let durationInSeconds;
    switch (frequency) {
      case 'daily':
        durationInSeconds = 24 * 60 * 60; // 1 day
        break;
      case 'weekly':
        durationInSeconds = 7 * 24 * 60 * 60; // 7 days
        break;
      case 'monthly':
        durationInSeconds = 30 * 24 * 60 * 60; // 30 days
        break;
      default:
        durationInSeconds = 30 * 24 * 60 * 60; // Default to monthly
    }
    setRoundDuration(durationInSeconds);
  };

  // Show loading while checking member status
  if (checkingMember) {
    return <LayoutLoading />;
  }

  return (
    <LayoutWithHeader showSignout={true} isMember={true}>
      <ToastContainer position="top-center" />
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: '#2d3436' }}>Create Pool</h3>
          <p style={{ margin: '8px 0 0 0', color: '#636e72', fontSize: 13 }}>
            Set your pool parameters. All amounts are in ETH (minimum 1 ETH per contribution).
          </p>
        </div>

        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{
            background: 'rgba(0, 184, 148, 0.06)',
            border: '1px dashed rgba(0, 184, 148, 0.35)',
            borderRadius: 10,
            padding: '10px 12px',
            color: '#2d3436',
            fontSize: 13
          }}>
            Currency: ETH (Native Currency)
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: 12,
            // Mobile responsive
            '@media (max-width: 768px)': {
              gridTemplateColumns: '1fr',
              gap: 16
            }
          }}>
            <div>
              <div style={labelStyle}>Pool size</div>
              <input
                type="number"
                min={2}
                max={12}
                style={inputStyle}
                placeholder="e.g., 5"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
            <div>
            <div style={labelStyle}>Contribution (POL)</div>
            <input
              type="number"
              min="1"
              step="0.01"
              style={inputStyle}
              placeholder="e.g., 1.5"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <div style={{ color: '#9aa0a6', fontSize: 12, marginTop: 6 }}>
              Minimum contribution: 1 POL. Your balance: {parseFloat(polBalance).toFixed(4)} POL
            </div>
             
            </div>
          </div>

          <div>
            <div style={labelStyle}>Rotation Frequency</div>
            <div style={{ 
              display: 'flex', 
              gap: 8,
              // Mobile responsive
              '@media (max-width: 768px)': {
                flexDirection: 'column',
                gap: 12
              }
            }}>
              <button
                type="button"
                onClick={() => handleRotationFrequencyChange('daily')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: rotationFrequency === 'daily' ? '#00b894' : '#f8f9fa',
                  color: rotationFrequency === 'daily' ? 'white' : '#636e72',
                  border: `1px solid ${rotationFrequency === 'daily' ? '#00b894' : '#e9ecef'}`,
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => handleRotationFrequencyChange('weekly')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: rotationFrequency === 'weekly' ? '#00b894' : '#f8f9fa',
                  color: rotationFrequency === 'weekly' ? 'white' : '#636e72',
                  border: `1px solid ${rotationFrequency === 'weekly' ? '#00b894' : '#e9ecef'}`,
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => handleRotationFrequencyChange('monthly')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: rotationFrequency === 'monthly' ? '#00b894' : '#f8f9fa',
                  color: rotationFrequency === 'monthly' ? 'white' : '#636e72',
                  border: `1px solid ${rotationFrequency === 'monthly' ? '#00b894' : '#e9ecef'}`,
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Monthly
              </button>
            </div>
            <div style={{ color: '#9aa0a6', fontSize: 12, marginTop: 6 }}>
              Members contribute every {rotationFrequency === 'daily' ? 'day' : rotationFrequency === 'weekly' ? 'week' : 'month'}
            </div>
          </div>

          <div>
            <div style={labelStyle}>Start time</div>
            <input
              type="datetime-local" 
              style={inputStyle}
              value={startTime ? new Date(Number(startTime) * 1000).toISOString().slice(0,16) : ''}
              onChange={(e) => {
                const timestamp = Math.floor(new Date(e.target.value).getTime() / 1000);
                setStartTime(timestamp);
              }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <div style={{ color: '#9aa0a6', fontSize: 12, marginTop: 6 }}>
              Select when you want the pool to start
            </div>
          </div>

          <div>
            <div style={labelStyle}>Payout order (comma-separated)</div>
            <textarea
              style={{ ...inputStyle, height: 88, fontFamily: 'monospace' }}
              placeholder="0xabc..., 0xdef..., 0x..."
              value={orderCsv}
              onChange={(e) => setOrderCsv(e.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <div style={{ color: '#9aa0a6', fontSize: 12, marginTop: 6 }}>
              Must include exactly <b>{size}</b> unique member addresses.
            </div>
          </div>

          <button
            disabled={processing || !eligible}
            onClick={create}
            style={{
              width: '100%',
              padding: '14px 18px',
              background: (processing || !eligible) ? '#e9ecef' : 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
              border: 'none',
              borderRadius: 12,
              color: 'white',
              fontSize: 16,
              fontWeight: 700,
              cursor: (processing || !eligible) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0, 184, 148, 0.25)'
            }}
          >
            {processing ? 'Processing...' : eligible ? 'Create Pool' : 'Not Eligible'}
          </button>
        </div>
      </div>
    </LayoutWithHeader>
  );
}


