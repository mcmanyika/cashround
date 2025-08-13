import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';
import { useActiveWallet, useActiveAccount } from 'thirdweb/react';
import { getWeb3FromThirdwebWallet } from '../../src/rosca/services/rosca';
import { LayoutWithHeader, LayoutLoading } from '../../src/components/layout/Layout';
import { getWeb3, getFactory, getRoscaPool, isTreeMember } from '../../src/rosca/services/rosca';

// NOTE: set this via .env in real usage
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_POOL_FACTORY_ADDRESS || '';

export default function PoolsIndex() {
  const activeWallet = useActiveWallet();
  const activeAccount = useActiveAccount();
  const router = useRouter();
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [factory, setFactory] = useState(null);
  const [pools, setPools] = useState([]);
  const [poolsData, setPoolsData] = useState([]); // {address, size, contribution}
  const [loading, setLoading] = useState(true);
  const [canCreate, setCanCreate] = useState(true); // show link; eligibility enforced on create page
  const [isMember, setIsMember] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPools, setFilteredPools] = useState([]);
  const [checkingMember, setCheckingMember] = useState(true);

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
    if (!isConnected || !web3 || !account) return;

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

        if (!FACTORY_ADDRESS) {
          toast.error('Factory address is not configured.');
          return;
        }

        const f = getFactory(web3, FACTORY_ADDRESS);
        setFactory(f);
        
        // Fetch pools
        const addrs = await f.methods.getPools().call();
        setPools(addrs);
        
        // Sort pools in descending order (newest first)
        const sortedAddrs = [...addrs].reverse();
        
        // Fetch minimal info for each pool
        try {
          const infos = await Promise.all(
            sortedAddrs.map(async (addr) => {
              try {
                const pool = getRoscaPool(web3, addr);
                
                // Try individual getters first (most reliable)
                try {
                  const size = await pool.methods.size().call();
                  const contribution = await pool.methods.contribution().call();
                  return { address: addr, size, contribution };
                } catch (error) {
                  // Fallback to poolInfo method
                  const pi = await pool.methods.poolInfo().call();
                  
                  // Handle both old and new contract formats
                  let size, contribution;
                  
                  if (pi.size !== undefined) {
                    // Named properties exist
                    size = pi.size;
                    contribution = pi.contribution;
                  } else if (pi[0] && pi[0].startsWith('0x') && pi[0].length === 42) {
                    // Old format: [token, size, contribution, ...]
                    size = pi[1];
                    contribution = pi[2];
                  } else {
                    // New format: [size, contribution, ...]
                    size = pi[0];
                    contribution = pi[1];
                  }
                  
                  return { address: addr, size, contribution };
                }
              } catch {
                return { address: addr, size: '-', contribution: '-' };
              }
            })
          );
          setPoolsData(infos);
        } catch {}
      } catch (e) {
        toast.error(e.message || 'Error loading pools');
        setCheckingMember(false);
      }
    })();
  }, [isConnected, web3, account, router]);

  // Reset checking member state when connection changes
  useEffect(() => {
    if (!isConnected) {
      setCheckingMember(false);
    }
  }, [isConnected]);

  // Filter pools based on search term
  useEffect(() => {
    if (!poolsData.length) {
      setFilteredPools([]);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredPools(poolsData);
      return;
    }

    const filtered = poolsData.filter(pool => 
      pool.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pool.address.toLowerCase().startsWith(searchTerm.toLowerCase())
    );
    setFilteredPools(filtered);
  }, [poolsData, searchTerm]);

  const cardStyle = {
    maxWidth: 640,
    margin: '0 auto',
    background: 'white',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
  };

  const itemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f1f3f5',
  };

  const shorten = (addr) => {
    if (!addr) return '';
    const s = String(addr);
    if (s.length <= 12) return s;
    if (s.startsWith('0x') && s.length > 12) return `${s.slice(0, 6)}...${s.slice(-4)}`;
    return `${s.slice(0, 6)}...${s.slice(-4)}`;
  };

  const fmt = (v) => {
    try {
      if (!web3) return v;
      // Convert wei to ETH (18 decimals)
      const base = web3.utils.toBN(10).pow(web3.utils.toBN(18));
      const whole = web3.utils.toBN(v).div(base).toString();
      const frac = web3.utils.toBN(v).mod(base).toString().padStart(18, '0').slice(0, 2);
      return `${whole}.${frac}`;
    } catch {
      return String(v);
    }
  };

  if (loading) {
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
      <ToastContainer position="bottom-center" />
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, color: '#2d3436' }}>Available Pools</h2>
          {canCreate && (
            <Link href="/pools/create" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              fontWeight: 700, 
              color: '#00b894', 
              whiteSpace: 'nowrap',
              textDecoration: 'none',
              padding: '8px 12px',
              borderRadius: 8,
              background: 'rgba(0, 184, 148, 0.1)',
              transition: 'all 0.2s ease'
            }}>
              <span style={{ fontSize: '18px' }}>➕</span>
              Create Pool
            </Link>
          )}
        </div>
        
        {/* Search Bar */}
        <div style={{ 
          marginTop: 16, 
          marginBottom: 16,
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: 8,
            padding: '8px 12px',
            transition: 'all 0.2s ease'
          }}>
            <span style={{ 
              fontSize: '16px', 
              marginRight: 8, 
              color: '#636e72' 
            }}>🔍</span>
            <input
              type="text"
              placeholder="Search by pool address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '14px',
                color: '#2d3436',
                width: '100%',
                fontFamily: 'monospace'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#636e72',
                  padding: '4px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          {pools.length === 0 ? (
            <p style={{ margin: '8px 0 12px 0' }}>No pools found.</p>
          ) : filteredPools.length === 0 && searchTerm ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px',
              color: '#636e72'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
              <p style={{ margin: '0 0 8px 0' }}>No pools found matching &quot;{searchTerm}&quot;</p>
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  padding: '6px 12px',
                  background: '#00b894',
                  border: 'none',
                  borderRadius: 6,
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Clear Search
              </button>
            </div>
          ) : (
            filteredPools.map((p) => (
              <Link 
                key={p.address} 
                href={`/pools/${p.address}`}
                style={{ 
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block'
                }}
              >
                <div style={{
                  ...itemStyle,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderRadius: 8,
                  ':hover': {
                    background: '#f8f9fa',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 14, color: '#2d3436' }}>{shorten(p.address)}</span>
                    <span style={{ color: '#636e72', fontSize: 12 }}>
                      Pool Size: {String(p.size)} • Contribution: {fmt(p.contribution)} ETH
                    </span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 6, 
                    color: '#00a085', 
                    fontWeight: 700, 
                    whiteSpace: 'nowrap',
                    padding: '6px 10px',
                    borderRadius: 6,
                    background: 'rgba(0, 160, 133, 0.1)',
                    transition: 'all 0.2s ease'
                  }}>
                    <span style={{ fontSize: '16px' }}>🔍</span>
                    View
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </LayoutWithHeader>
  );
}


