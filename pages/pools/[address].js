import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';
import { useActiveWallet, useActiveAccount } from 'thirdweb/react';
import { LayoutWithHeader, LayoutLoading } from '../../src/components/layout/Layout';
import { getWeb3, getMukandoPool, getErc20, isTreeOwner, isTreeMember, getPOLBalance } from '../../src/rosca/services/rosca';
import Identicon from '../../src/components/common/Identicon';

export default function PoolDetail() {
  const router = useRouter();
  const { address } = router.query;
  const activeWallet = useActiveWallet();
  const activeAccount = useActiveAccount();
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [pool, setPool] = useState(null);
  const [info, setInfo] = useState(null);
  const [order, setOrder] = useState([]);
  const [token, setToken] = useState('');
  const [decimals, setDecimals] = useState(18); // POL default
  const [loading, setLoading] = useState(true);
  const [isContributing, setIsContributing] = useState(false);
  const [isTriggeringPayout, setIsTriggeringPayout] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [isPoolMember, setIsPoolMember] = useState(false);
  const [hasContributed, setHasContributed] = useState(false);
  const [roundPaid, setRoundPaid] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [checkingMember, setCheckingMember] = useState(true);
  const [countdown, setCountdown] = useState('');
  const [contributorsCount, setContributorsCount] = useState(0);
  const [totalRaised, setTotalRaised] = useState('0');
  const [balanceToTarget, setBalanceToTarget] = useState('0');
  const [allContributorsPaid, setAllContributorsPaid] = useState(false);
  const [polBalance, setPolBalance] = useState('0');

  // Sync thirdweb connection state with local state
  useEffect(() => {
    if (activeAccount?.address && activeWallet) {
      console.log('Thirdweb wallet connected:', activeAccount.address);
      setAccount(activeAccount.address);
      setIsConnected(true);
      
      // Create web3 instance if it doesn't exist
      if (window.ethereum) {
        const Web3 = require('web3');
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
      }
      setLoading(false);
    } else {
      console.log('Thirdweb wallet disconnected');
      // Redirect to home if not connected
      router.push('/');
    }
  }, [activeAccount, activeWallet, router]);

  // Immediate member check and redirect
  useEffect(() => {
    if (!isConnected || !web3 || !account || !address) return;

    (async () => {
      try {
        // Check if user is a tree member immediately
        const member = await isTreeMember(web3, account);
        setIsMember(member);
        
        // If user is not a member, redirect immediately without loading any data
        if (!member) {
          router.replace('/referral'); // Use replace to prevent back button
          return;
        }

        setCheckingMember(false); // Member check complete

        const owner = await isTreeOwner(web3, account);
        setEligible(Boolean(owner));
        
        // Get POL balance
        const balance = await getPOLBalance(web3, account);
        setPolBalance(balance);
        
        const p = getMukandoPool(web3, address);
        setPool(p);
        
        // Check if current user is a member of this pool
        const memberStatus = await p.methods.isMember(account).call();
        setIsPoolMember(Boolean(memberStatus));
        
        // Try to get values using individual getter functions first (most reliable)
        let size, contribution, roundDuration, startTime, currentRound, currentRecipient, roundEndsAt;
        
        try {
          size = await p.methods.size().call();
          contribution = await p.methods.contribution().call();
          roundDuration = await p.methods.roundDuration().call();
          startTime = await p.methods.startTime().call();
          currentRound = await p.methods.currentRound().call();
          currentRecipient = await p.methods.currentRecipient().call();
          
          // Calculate roundEndsAt
          roundEndsAt = Number(startTime) + ((Number(currentRound) + 1) * Number(roundDuration));
          
          console.log('Using individual getters - values:', { size, contribution, roundDuration, startTime, currentRound, currentRecipient, roundEndsAt });
        } catch (error) {
          console.log('Individual getters failed, trying poolInfo:', error);
          
          // Fallback to poolInfo method
          const poolInfo = await p.methods.poolInfo().call();
          console.log('PoolInfo raw:', poolInfo);
          console.log('PoolInfo keys:', Object.keys(poolInfo));
          console.log('PoolInfo values:', Object.values(poolInfo));
          
          // Try to get values by their named properties first (most reliable)
          size = poolInfo.size;
          contribution = poolInfo.contribution;
          roundDuration = poolInfo.roundDuration;
          startTime = poolInfo.startTime;
          currentRound = poolInfo.currentRound;
          currentRecipient = poolInfo.currentRecipient;
          roundEndsAt = poolInfo.roundEndsAt;
          
          // If named properties don't exist, fall back to array indexing
          if (size === undefined) {
            console.log('Using array indexing fallback');
            // Handle both old and new contract formats
            // Old format: [token, size, contribution, roundDuration, startTime, currentRound, currentRecipient, roundEndsAt]
            // New format: [size, contribution, roundDuration, startTime, currentRound, currentRecipient, roundEndsAt]
            
            // Check if this is the old format (has token address)
            if (poolInfo[0] && poolInfo[0].startsWith('0x') && poolInfo[0].length === 42) {
              // Old format - token is at index 0
              size = poolInfo[1];
              contribution = poolInfo[2];
              roundDuration = poolInfo[3];
              startTime = poolInfo[4];
              currentRound = poolInfo[5];
              currentRecipient = poolInfo[6];
              roundEndsAt = poolInfo[7];
            } else {
              // New format - no token
              size = poolInfo[0];
              contribution = poolInfo[1];
              roundDuration = poolInfo[2];
              startTime = poolInfo[3];
              currentRound = poolInfo[4];
              currentRecipient = poolInfo[5];
              roundEndsAt = poolInfo[6];
            }
          }
        }
        
        console.log('Final parsed values:', { size, contribution, roundDuration, startTime, currentRound, currentRecipient, roundEndsAt });
        console.log('Size type:', typeof size, 'Value:', size);
        console.log('Contribution type:', typeof contribution, 'Value:', contribution);
        console.log('RoundDuration type:', typeof roundDuration, 'Value:', roundDuration);
        
        // Check if current user has already contributed to this round (after we have currentRound)
        if (Boolean(memberStatus) && currentRound !== undefined) {
          try {
            const contributed = await p.methods.hasContributed(currentRound, account).call();
            setHasContributed(Boolean(contributed));
            console.log('User contribution status for round', currentRound, ':', contributed);
          } catch (error) {
            console.log('Error checking contribution status:', error);
            setHasContributed(false);
          }
        }
        
        // Check if current round has been paid out
        if (currentRound !== undefined) {
          try {
            const paid = await p.methods.paid(currentRound).call();
            setRoundPaid(Boolean(paid));
            console.log('Round', currentRound, 'paid status:', paid);
          } catch (error) {
            console.log('Error checking round paid status:', error);
            setRoundPaid(false);
          }
        }
        
        // Validate that size is a reasonable number (should be 2-12 for MUKANDO pools)
        if (size && (size < 2 || size > 12)) {
          console.warn('Size seems invalid:', size, '- expected 2-12');
        }
        
        // Validate that currentRecipient is a valid address
        if (currentRecipient && (!currentRecipient.startsWith('0x') || currentRecipient.length !== 42)) {
          console.warn('CurrentRecipient seems invalid:', currentRecipient);
        }
        const ord = await p.methods.getPayoutOrder().call();
        // Try to detect if this is an old contract with token or new contract with POL
        let tokenAddress = '0x0000000000000000000000000000000000000000'; // Default to POL
        
        try {
          // Try to call token() function - if it exists, this is an old contract
          const token = await p.methods.token().call();
          if (token && token !== '0x0000000000000000000000000000000000000000') {
            tokenAddress = token;
          }
        } catch (error) {
          // token() function doesn't exist, so this is a new POL contract
          console.log('No token() function found - using POL');
        }
        
        setToken(tokenAddress);
        setInfo({ size, contribution, roundDuration, startTime, currentRound, currentRecipient, roundEndsAt });
        setOrder(ord);
        
        // Calculate contribution statistics
        try {
          // Get total contributed for current round
          const totalContributed = await p.methods.totalContributed(currentRound).call();
          setTotalRaised(totalContributed);
          
          // Calculate contributors count by checking each member
          let contributors = 0;
          let allPaid = true;
          for (let i = 0; i < size; i++) {
            try {
              const hasContributed = await p.methods.hasContributed(currentRound, ord[i]).call();
              if (hasContributed) {
                contributors++;
              } else {
                allPaid = false; // If any member hasn't contributed, not all have paid
              }
            } catch (error) {
              console.log('Error checking contribution for member', ord[i], error);
              allPaid = false; // Assume not paid if there's an error
            }
          }
          setContributorsCount(contributors);
          setAllContributorsPaid(allPaid && contributors === size); // All must have contributed AND count must equal size
          
          // Calculate balance to target (total needed - total raised)
          const totalNeeded = web3.utils.toBN(contribution).mul(web3.utils.toBN(size));
          const raised = web3.utils.toBN(totalContributed);
          const balance = totalNeeded.sub(raised);
          setBalanceToTarget(balance.toString());
          
          console.log('Contribution stats:', {
            contributors,
            totalRaised: totalContributed,
            balanceToTarget: balance.toString(),
            totalNeeded: totalNeeded.toString(),
            allContributorsPaid: allPaid && contributors === size
          });
        } catch (error) {
          console.log('Error calculating contribution statistics:', error);
        }
      } catch (error) {
        console.log('Error loading pool data:', error);
        setCheckingMember(false);
        toast.error(error.message || 'Error loading pool');
      }
    })();
  }, [isConnected, web3, account, address, router]);

  // Update countdown every second
  useEffect(() => {
    if (!info?.startTime) return;
    
    const updateCountdown = () => {
      setCountdown(calculateCountdown(info.startTime));
    };
    
    // Update immediately
    updateCountdown();
    
    // Update every second
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [info?.startTime]);

  const approveAndContribute = async () => {
    if (!web3 || !pool || !account || !info) return;
    setIsContributing(true);
    try {
      // Check if user has already contributed this round
      const hasContributed = await pool.methods.hasContributed(info.currentRound, account).call();
      if (hasContributed) {
        toast.error('You have already contributed to this round');
        return;
      }
      
      // Check if pool has started by comparing current time with start time
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      const startTime = Number(info.startTime);
      
      if (currentTime < startTime) {
        toast.error('Pool has not started yet');
        return;
      }
      
      // Debug information
      console.log('Current time (JS):', currentTime);
      console.log('Start time (contract):', startTime);
      console.log('Time difference (seconds):', currentTime - startTime);
      console.log('Pool should be open:', currentTime >= startTime);
      
      // Optional: Check contract's roundOpen function for debugging
      try {
        const roundOpen = await pool.methods.roundOpen().call();
        console.log('Contract roundOpen result:', roundOpen);
        console.log('Contract block.timestamp vs JS time difference:', roundOpen ? 'Contract thinks pool is open' : 'Contract thinks pool is closed');
      } catch (error) {
        console.log('roundOpen check failed:', error);
      }
      
              // Check if this is an old contract (uses tokens) or new contract (uses POL)
      if (token !== '0x0000000000000000000000000000000000000000') {
        // Old contract - use ERC20 tokens
        const erc = getErc20(web3, token);
        
        // Check user's token balance
        const balance = await erc.methods.balanceOf(account).call();
        if (web3.utils.toBN(balance).lt(web3.utils.toBN(info.contribution))) {
          toast.error('Insufficient token balance for contribution');
          return;
        }
        
        // Check current allowance
        const allowance = await erc.methods.allowance(account, address).call();
        if (web3.utils.toBN(allowance).lt(web3.utils.toBN(info.contribution))) {
          // Approve contribution to pool
          await erc.methods.approve(address, info.contribution).send({ from: account });
        }
        
        // Contribute
        await pool.methods.contribute().send({ from: account });
              } else {
          // New contract - use POL
          // Check user's POL balance
          if (Number(polBalance) < Number(web3.utils.fromWei(info.contribution, 'ether'))) {
            toast.error(`Insufficient POL balance. You have ${parseFloat(polBalance).toFixed(4)} POL`);
            return;
          }
          
          // Check if we're on local development (no POL token deployed)
          const networkId = await web3.eth.net.getId();
          const isLocalDev = networkId === 1337 || networkId === 5777;
          
          if (isLocalDev) {
            // For local development, send ETH value directly
            await pool.methods.contribute().send({ 
              from: account,
              value: info.contribution
            });
          } else {
            // For production, use POL tokens (no value needed, tokens are transferred via approve/transferFrom)
            await pool.methods.contribute().send({ 
              from: account
            });
          }
        }
      toast.success('Contribution submitted successfully');
      
      // Update contribution status
      setHasContributed(true);
      
      // Refresh pool data
      window.location.reload();
    } catch (e) {
      console.error('Contribution error:', e);
      if (e?.code === 4001) {
        toast.error('User rejected transaction');
      } else if ((e?.message || '').toLowerCase().includes('insufficient')) {
        toast.error('Insufficient POL balance or gas. Please top up and try again.');
      } else if ((e?.message || '').toLowerCase().includes('not member')) {
        toast.error('You are not a member of this pool');
      } else if ((e?.message || '').toLowerCase().includes('already paid')) {
        toast.error('You have already contributed to this round');
      } else if ((e?.message || '').toLowerCase().includes('not started')) {
        toast.error('Pool has not started yet');
      } else if ((e?.message || '').toLowerCase().includes('incorrect amount')) {
        toast.error('Incorrect contribution amount. Please check the required amount.');
      } else {
        toast.error(e.message || 'Contribution failed');
      }
    } finally {
      setIsContributing(false);
    }
  };

  const triggerPayout = async () => {
    if (!web3 || !pool || !account) return;
    setIsTriggeringPayout(true);
    try {
      await pool.methods.triggerPayout().send({ from: account });
      toast.success('Payout triggered');
      
      // Update round paid status
      setRoundPaid(true);
      
      // Refresh pool data to show updated round
      window.location.reload();
    } catch (e) {
      if (e?.code === 4001) {
        toast.error('User rejected transaction');
      } else {
        toast.error(e.message || 'Payout failed');
      }
    } finally {
      setIsTriggeringPayout(false);
    }
  };



  const fmt = (v) => {
    try {
      if (!web3) return v;
      // Convert wei to POL (18 decimals)
      const base = web3.utils.toBN(10).pow(web3.utils.toBN(18));
      const whole = web3.utils.toBN(v).div(base).toString();
      const frac = web3.utils.toBN(v).mod(base).toString().padStart(18, '0').slice(0, 2);
      return `${whole}.${frac}`;
    } catch {
      return String(v);
    }
  };

  const shorten = (addr) => {
    if (!addr) return '';
    const s = String(addr);
    if (s.length <= 12) return s;
    if (s.startsWith('0x') && s.length > 12) {
      return `${s.slice(0, 6)}...${s.slice(-4)}`;
    }
    return `${s.slice(0, 6)}...${s.slice(-4)}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not set';
    try {
      const date = new Date(Number(timestamp) * 1000);
      return date.toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  const calculateCountdown = (startTime) => {
    if (!startTime) return '';
    
    const now = Math.floor(Date.now() / 1000);
    const start = Number(startTime);
    const diff = start - now;
    
    if (diff <= 0) {
      return 'Pool has started!';
    }
    
    const days = Math.floor(diff / (24 * 60 * 60));
    const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((diff % (60 * 60)) / 60);
    const seconds = diff % 60;
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const cardStyle = {
    maxWidth: 640,
    margin: '0 auto',
    background: 'white',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
  };

  const rowStyle = {
    display: 'grid',
    gridTemplateColumns: '160px 1fr',
    gap: 12,
    marginBottom: 10,
    alignItems: 'start'
  };
  const keyStyle = { color: '#636e72', fontSize: 13, lineHeight: '20px' };
  const valStyle = {
    color: '#2d3436',
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: '18px',
    wordBreak: 'break-all',
    overflowWrap: 'anywhere',
    whiteSpace: 'normal'
  };

  if (loading) {
    return <LayoutLoading />;
  }

  // Give thirdweb more time to initialize before showing loading
  if (!isConnected && (activeAccount === undefined || activeWallet === undefined)) {
    return <LayoutLoading />;
  }

  if (!isConnected) {
    return <LayoutLoading />;
  }

  // Show loading while checking member status
  if (checkingMember) {
    return <LayoutLoading />;
  }

  return (
    <LayoutWithHeader showSignout={true} isMember={isMember}>
      <ToastContainer position="top-center" />
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: 8, color: '#2d3436' }}>Pool</h3>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '8px', 
          marginTop: 0 
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            overflow: 'hidden',
            flexShrink: 0
          }}>
            <Identicon string={address} size={24} />
          </div>
          <p style={{ 
            margin: 0, 
            color: '#9aa0a6', 
            fontSize: 12,
            fontFamily: 'monospace'
          }} title={address}>{shorten(address)}</p>
        </div>
        {loading || !info ? (
          <p>Loading...</p>
        ) : (
          <>  
            <div style={rowStyle}><div style={keyStyle}>Contribution</div><div style={valStyle}>{fmt(info.contribution)} POL</div></div>
            <div style={rowStyle}><div style={keyStyle}>Pool Size</div><div style={valStyle}>{info.size}</div></div>
            <div style={rowStyle}><div style={keyStyle}>Current round</div><div style={valStyle}>{Number(info.currentRound)}</div></div>
            <div style={rowStyle}>
              <div style={keyStyle}>Current recipient</div>
              <div style={{
                ...valStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  <Identicon string={info.currentRecipient} size={20} />
                </div>
                <span title={info.currentRecipient}>{shorten(info.currentRecipient)}</span>
              </div>
            </div>
            
            {/* POL Balance Display */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 16,
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #00b894, #00a085)',
              borderRadius: 12,
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0, 184, 148, 0.3)'
            }}>
              <span style={{ marginRight: 8, fontSize: '16px' }}>💰</span>
              <span>Your POL Balance: {parseFloat(polBalance).toFixed(4)} POL</span>
            </div>
            
            {/* Contribution Statistics */}
            <div style={{ 
              margin: '20px 0', 
              padding: '16px', 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
              borderRadius: 12, 
              border: '1px solid #dee2e6' 
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#2d3436', fontSize: 16, fontWeight: 600 }}>Round {Number(info.currentRound)} Progress</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#00b894' }}>{contributorsCount}</div>
                  <div style={{ fontSize: 12, color: '#636e72', marginTop: 4 }}>Contributors</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#00b894' }}>{fmt(totalRaised)}</div>
                  <div style={{ fontSize: 12, color: '#636e72', marginTop: 4 }}>Total Raised (POL)</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#e17055' }}>{fmt(balanceToTarget)}</div>
                  <div style={{ fontSize: 12, color: '#636e72', marginTop: 4 }}>Balance to Target (POL)</div>
                </div>
              </div>
              {/* Progress Bar */}
              <div style={{ 
                marginTop: 16, 
                padding: '12px', 
                background: 'white', 
                borderRadius: 8, 
                border: '1px solid #dee2e6'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: 8 
                }}>
                  <span style={{ fontSize: 14, color: '#636e72' }}>Progress</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#2d3436' }}>
                    {contributorsCount}/{info.size} contributors
                  </span>
                </div>
                
                {/* Progress Bar Container */}
                <div style={{
                  width: '100%',
                  height: 12,
                  backgroundColor: '#e9ecef',
                  borderRadius: 6,
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {/* Progress Bar Fill */}
                  <div style={{
                    width: `${Math.min((contributorsCount / info.size) * 100, 100)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #00b894 0%, #00a085 100%)',
                    borderRadius: 6,
                    transition: 'width 0.3s ease',
                    position: 'relative'
                  }}>
                    {/* Progress Bar Shine Effect */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '50%',
                      background: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                      borderRadius: '6px 6px 0 0'
                    }} />
                  </div>
                </div>
                
                {/* Progress Text */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginTop: 8 
                }}>
                  <span style={{ fontSize: 12, color: '#636e72' }}>
                    Raised: <span style={{ fontWeight: 600, color: '#00b894' }}>{fmt(totalRaised)} POL</span>
                  </span>
                  <span style={{ fontSize: 12, color: '#636e72' }}>
                    Target: <span style={{ fontWeight: 600, color: '#2d3436' }}>{fmt(web3?.utils?.toBN(info.contribution).mul(web3.utils.toBN(info.size)).toString() || '0')} POL</span>
                  </span>
                </div>
              </div>
            </div>
            
            {isPoolMember ? (
              <div style={{ margin: '16px 0', display: 'grid', gap: 12 }}>
                {hasContributed ? (
                  <div style={{ padding: '10px 14px', background: '#e9ecef', borderRadius: 10, color: '#6c757d', fontWeight: 700, textAlign: 'center' }}>
                    ✓ Already Contributed to Round {Number(info.currentRound)}
                  </div>
                ) : countdown !== 'Pool has started!' ? (
                  <div style={{ padding: '10px 14px', background: '#fff3cd', borderRadius: 10, color: '#856404', fontWeight: 700, textAlign: 'center' }}>
                    ⏳ Pool starts in: {countdown}
                  </div>
                ) : (
                  <button disabled={isContributing || isTriggeringPayout} onClick={approveAndContribute} style={{
                    padding: '10px 14px',
                    background: (isContributing || isTriggeringPayout) ? '#e9ecef' : 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
                    border: 'none', borderRadius: 10, color: 'white', fontWeight: 700
                  }}>
                    {isContributing ? 'Processing...' : 'Approve & Contribute POL'}
                  </button>
                )}
                {roundPaid ? (
                  <div style={{ padding: '10px 14px', background: '#e9ecef', borderRadius: 10, color: '#6c757d', fontWeight: 700, textAlign: 'center' }}>
                    ✓ Payout Completed for Round {Number(info.currentRound)}
                  </div>
                ) : !allContributorsPaid ? (
                  <div style={{ padding: '10px 14px', background: '#fff3cd', borderRadius: 10, color: '#856404', fontWeight: 700, textAlign: 'center' }}>
                    ⏳ Waiting for all contributors ({contributorsCount}/{info.size})
                  </div>
                ) : (
                  <button disabled={isContributing || isTriggeringPayout} onClick={triggerPayout} style={{
                    padding: '10px 14px',
                    background: (isContributing || isTriggeringPayout) ? '#e9ecef' : 'linear-gradient(135deg, #00cec9 0%, #00b894 100%)',
                    border: 'none', borderRadius: 10, color: 'white', fontWeight: 700
                  }}>
                    {isTriggeringPayout ? 'Processing...' : 'Trigger Payout'}
                  </button>
                )}
              </div>
            ) : (
              <div style={{ margin: '16px 0', padding: '12px', background: '#f8f9fa', borderRadius: 8, border: '1px solid #e9ecef' }}>
                <p style={{ margin: 0, color: '#6c757d', fontSize: 14, textAlign: 'center' }}>
                  You are not a member of this pool. Only pool members can contribute.
                </p>
              </div>
            )}
            <div>
              <p style={{ color: '#2d3436', fontWeight: 600 }}>Payout order</p>
              <ol style={{ marginTop: 8, paddingLeft: 0, listStyle: 'none' }}>
                {order.map((m, index) => (
                  <li key={m} title={m} style={{ 
                    fontFamily: 'monospace', 
                    fontSize: 13, 
                    wordBreak: 'break-all', 
                    overflowWrap: 'anywhere', 
                    lineHeight: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      <Identicon string={m} size={20} />
                    </span>
                    <span>{shorten(m)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </div>
    </LayoutWithHeader>
  );
}


