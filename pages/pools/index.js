import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';
import { LayoutWithHeader } from '../../src/components/layout/Layout';
import { getWeb3, getFactory, isTreeOwner } from '../../src/rosca/services/rosca';

// NOTE: set this via .env in real usage
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_POOL_FACTORY_ADDRESS || '';

export default function PoolsIndex() {
  const router = useRouter();
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [factory, setFactory] = useState(null);
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

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
        const owner = await isTreeOwner(w3, accounts?.[0]);
        setAllowed(owner);
        if (owner) {
          const addrs = await f.methods.getPools().call();
          setPools(addrs);
        }
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

  return (
    <LayoutWithHeader showSignout={true}>
      <ToastContainer position="top-center" />
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: '#2d3436' }}>Rotating Pools</h2>
          {allowed && (
            <Link href="/pools/create" style={{ fontWeight: 700, color: '#00b894' }}>+ Create</Link>
          )}
        </div>
        <div style={{ marginTop: 12 }}>
          {loading ? (
            <p>Loading...</p>
          ) : !allowed ? (
            <p style={{ color: '#e67e22' }}>Access restricted. Only the Tree contract creator can view and manage pools.</p>
          ) : pools.length === 0 ? (
            <p>No pools found.</p>
          ) : (
            pools.map((addr) => (
              <div key={addr} style={itemStyle}>
                <span style={{ fontFamily: 'monospace', fontSize: 14 }}>{addr}</span>
                <Link href={`/pools/${addr}`} style={{ color: '#00a085', fontWeight: 700 }}>Open</Link>
              </div>
            ))
          )}
        </div>
      </div>
    </LayoutWithHeader>
  );
}


