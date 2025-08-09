import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { LayoutWithHeader } from '../../src/components/layout/Layout';
import { getWeb3, getFactory } from '../../src/rosca/services/rosca';

// NOTE: set this via .env in real usage
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_POOL_FACTORY_ADDRESS || '';

export default function PoolsIndex() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [factory, setFactory] = useState(null);
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setAccount(accounts?.[0] || '');
        if (!FACTORY_ADDRESS) {
          toast.error('Factory address is not configured.');
          setLoading(false);
          return;
        }
        const f = getFactory(w3, FACTORY_ADDRESS);
        setFactory(f);
        const addrs = await f.methods.getPools().call();
        setPools(addrs);
      } catch (e) {
        toast.error(e.message || 'Error loading pools');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <LayoutWithHeader showSignout={true}>
      <ToastContainer position="top-center" />
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h2>Rotating Pools</h2>
        {loading ? (
          <p>Loading...</p>
        ) : pools.length === 0 ? (
          <p>No pools found.</p>
        ) : (
          <ul>
            {pools.map((addr) => (
              <li key={addr}>
                <a href={`/pools/${addr}`}>{addr}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </LayoutWithHeader>
  );
}


