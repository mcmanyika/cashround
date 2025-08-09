import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';
import { LayoutWithHeader } from '../../src/components/layout/Layout';
import { getWeb3, getFactory, getRoscaPool } from '../../src/rosca/services/rosca';

// NOTE: set this via .env in real usage
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_POOL_FACTORY_ADDRESS || '';

export default function PoolsIndex() {
  const router = useRouter();
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [factory, setFactory] = useState(null);
  const [pools, setPools] = useState([]);
  const [poolsData, setPoolsData] = useState([]); // {address, size, contribution}
  const [loading, setLoading] = useState(true);
  const [canCreate, setCanCreate] = useState(true); // show link; eligibility enforced on create page

  useEffect(() => {
    (async () => {
      try {
        const w3 = await getWeb3();
        if (!w3) {
          toast.error('Please install MetaMask to use Pools');
          setLoading(false);
          return;
        }
        setWeb3(w3);
        const accounts = await w3.eth.requestAccounts();
        if (!accounts || accounts.length === 0) {
          toast.error('Please connect your wallet');
          setLoading(false);
          router.push('/');
          return;
        }
        setAccount(accounts[0]);
        if (!FACTORY_ADDRESS) {
          toast.error('Factory address is not configured.');
          setLoading(false);
          return;
        }
        const f = getFactory(w3, FACTORY_ADDRESS);
        setFactory(f);
        // Anyone can view pools; attempt fetch regardless
        const addrs = await f.methods.getPools().call();
        setPools(addrs);
        // Fetch minimal info for each pool
        try {
          const infos = await Promise.all(
            addrs.map(async (addr) => {
              try {
                const pool = getRoscaPool(w3, addr);
                const pi = await pool.methods.poolInfo().call();
                const size = pi.size ?? pi[1];
                const contribution = pi.contribution ?? pi[2];
                return { address: addr, size, contribution };
              } catch {
                return { address: addr, size: '-', contribution: '-' };
              }
            })
          );
          setPoolsData(infos);
        } catch {}
        // Creation permission is handled in /pools/create
      } catch (e) {
        toast.error(e.message || 'Error loading pools');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  return (
    <LayoutWithHeader showSignout={true}>
      <ToastContainer position="top-center" />
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, color: '#2d3436' }}>Available Pools</h2>
          {canCreate && (
            <Link href="/pools/create" style={{ fontWeight: 700, color: '#00b894', whiteSpace: 'nowrap' }}>+ Create</Link>
          )}
        </div>
        <div style={{ marginTop: 12 }}>
          {loading ? (
            <p>Loading...</p>
          ) : pools.length === 0 ? (
            <p style={{ margin: '8px 0 12px 0' }}>No pools found.</p>
          ) : (
            poolsData.map((p) => (
              <div key={p.address} style={itemStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 14 }}>{shorten(p.address)}</span>
                  <span style={{ color: '#636e72', fontSize: 12 }}>
                    size: {String(p.size)} • contribution: {String(p.contribution)}
                  </span>
                </div>
                <Link href={`/pools/${p.address}`} style={{ color: '#00a085', fontWeight: 700, whiteSpace: 'nowrap' }}>Open</Link>
              </div>
            ))
          )}
          {!loading && (
            <p style={{ color: '#9aa0a6', fontSize: 12, marginTop: 12, lineHeight: '18px', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
              You need at least 2 downline levels to create or participate.
            </p>
          )}
        </div>
      </div>
    </LayoutWithHeader>
  );
}


