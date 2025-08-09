import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { LayoutWithHeader } from '../../src/components/layout/Layout';
import { getWeb3, getFactory } from '../../src/rosca/services/rosca';

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_POOL_FACTORY_ADDRESS || '';

export default function CreatePool() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [factory, setFactory] = useState(null);
  const [token, setToken] = useState('');
  const [size, setSize] = useState(5);
  const [contribution, setContribution] = useState('0');
  const [roundDuration, setRoundDuration] = useState(30 * 24 * 60 * 60);
  const [startTime, setStartTime] = useState(Math.floor(Date.now() / 1000) + 3600);
  const [orderCsv, setOrderCsv] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      const w3 = await getWeb3();
      if (!w3) {
        toast.error('Please install MetaMask');
        return;
      }
      setWeb3(w3);
      const accounts = await w3.eth.requestAccounts();
      setAccount(accounts?.[0] || '');
      if (!FACTORY_ADDRESS) {
        toast.error('Factory address is not configured.');
        return;
      }
      setFactory(getFactory(w3, FACTORY_ADDRESS));
    })();
  }, []);

  const create = async () => {
    if (!web3 || !factory || !account) return;
    setProcessing(true);
    try {
      const payoutOrder = orderCsv
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (payoutOrder.length !== Number(size)) {
        toast.error('Payout order must have exactly `size` addresses');
        setProcessing(false);
        return;
      }
      await factory.methods
        .createPool(
          token,
          Number(size),
          contribution,
          Number(roundDuration),
          Number(startTime),
          payoutOrder
        )
        .send({ from: account });
      toast.success('Pool created');
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

  return (
    <LayoutWithHeader showSignout={true}>
      <ToastContainer position="top-center" />
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h3>Create Pool</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          <input placeholder="USDC token address" value={token} onChange={(e) => setToken(e.target.value)} />
          <input type="number" placeholder="Size" value={size} onChange={(e) => setSize(e.target.value)} />
          <input placeholder="Contribution (token units, e.g., 1000000 for 1 USDC)" value={contribution} onChange={(e) => setContribution(e.target.value)} />
          <input type="number" placeholder="Round duration (seconds)" value={roundDuration} onChange={(e) => setRoundDuration(e.target.value)} />
          <input type="number" placeholder="Start time (unix)" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <textarea placeholder="Payout order (comma-separated addresses)" value={orderCsv} onChange={(e) => setOrderCsv(e.target.value)} />
          <button disabled={processing} onClick={create}>{processing ? 'Processing...' : 'Create Pool'}</button>
        </div>
      </div>
    </LayoutWithHeader>
  );
}


