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

  return (
    <LayoutWithHeader showSignout={true}>
      <ToastContainer position="top-center" />
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: '#2d3436' }}>Create Pool</h3>
          <p style={{ margin: '8px 0 0 0', color: '#636e72', fontSize: 13 }}>
            Set your pool parameters. For USDC (6 decimals), 1 USDC = 1,000,000 units.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <div style={labelStyle}>USDC token address</div>
            <input
              style={{ ...inputStyle, fontFamily: 'monospace' }}
              placeholder="0x..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
              <div style={labelStyle}>Round duration (seconds)</div>
              <input
                type="number"
                min={60}
                style={inputStyle}
                placeholder="e.g., 2592000 (30 days)"
                value={roundDuration}
                onChange={(e) => setRoundDuration(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
          </div>

          <div>
            <div style={labelStyle}>Contribution (token units)</div>
            <input
              style={inputStyle}
              placeholder="e.g., 1000000 = 1 USDC"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <div style={{ color: '#9aa0a6', fontSize: 12, marginTop: 6 }}>
              Tip: use token units (raw decimals). For USDC, 10 USDC = 10,000,000.
            </div>
          </div>

          <div>
            <div style={labelStyle}>Start time (unix)</div>
            <input
              type="number"
              style={inputStyle}
              placeholder="e.g., now + 3600"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <div style={{ color: '#9aa0a6', fontSize: 12, marginTop: 6 }}>
              {startTime ? new Date(Number(startTime) * 1000).toLocaleString() : ''}
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
            disabled={processing}
            onClick={create}
            style={{
              width: '100%',
              padding: '14px 18px',
              background: processing ? '#e9ecef' : 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
              border: 'none',
              borderRadius: 12,
              color: 'white',
              fontSize: 16,
              fontWeight: 700,
              cursor: processing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0, 184, 148, 0.25)'
            }}
          >
            {processing ? 'Processing...' : 'Create Pool'}
          </button>
        </div>
      </div>
    </LayoutWithHeader>
  );
}


