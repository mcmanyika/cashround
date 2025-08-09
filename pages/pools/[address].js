import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';
import { LayoutWithHeader } from '../../src/components/layout/Layout';
import { getWeb3, getRoscaPool, getErc20 } from '../../src/rosca/services/rosca';

export default function PoolDetail() {
  const router = useRouter();
  const { address } = router.query;
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [pool, setPool] = useState(null);
  const [info, setInfo] = useState(null);
  const [order, setOrder] = useState([]);
  const [token, setToken] = useState('');
  const [decimals, setDecimals] = useState(6); // USDC default
  const [loading, setLoading] = useState(true);
  const [isContributing, setIsContributing] = useState(false);

  useEffect(() => {
    if (!address) return;
    (async () => {
      try {
        const w3 = await getWeb3();
        if (!w3) {
          toast.error('Please install MetaMask');
          setLoading(false);
          return;
        }
        setWeb3(w3);
        const accounts = await w3.eth.requestAccounts();
        setAccount(accounts?.[0] || '');
        const p = getRoscaPool(w3, address);
        setPool(p);
        const [tok, size, contribution, roundDuration, startTime, currentRound, currentRecipient, roundEndsAt] = await p.methods.poolInfo().call();
        const ord = await p.methods.getPayoutOrder().call();
        setToken(tok);
        setInfo({ size, contribution, roundDuration, startTime, currentRound, currentRecipient, roundEndsAt });
        setOrder(ord);
        try {
          const erc = getErc20(w3, tok);
          // Not all tokens expose decimals, but USDC does. Guard try.
          if (erc.methods.decimals) {
            const d = await erc.methods.decimals().call();
            setDecimals(Number(d));
          }
        } catch {}
      } catch (e) {
        toast.error(e.message || 'Error loading pool');
      } finally {
        setLoading(false);
      }
    })();
  }, [address]);

  const approveAndContribute = async () => {
    if (!web3 || !pool || !account || !info) return;
    setIsContributing(true);
    try {
      const erc = getErc20(web3, token);
      // Approve contribution to pool
      await erc.methods.approve(address, info.contribution).send({ from: account });
      // Contribute
      await pool.methods.contribute().send({ from: account });
      toast.success('Contribution submitted');
    } catch (e) {
      if (e?.code === 4001) {
        toast.error('User rejected transaction');
      } else if ((e?.message || '').toLowerCase().includes('insufficient')) {
        toast.error('Insufficient token or gas. Please top up and try again.');
      } else {
        toast.error(e.message || 'Contribution failed');
      }
    } finally {
      setIsContributing(false);
    }
  };

  const triggerPayout = async () => {
    if (!web3 || !pool || !account) return;
    setIsContributing(true);
    try {
      await pool.methods.triggerPayout().send({ from: account });
      toast.success('Payout triggered');
    } catch (e) {
      if (e?.code === 4001) {
        toast.error('User rejected transaction');
      } else {
        toast.error(e.message || 'Payout failed');
      }
    } finally {
      setIsContributing(false);
    }
  };

  const fmt = (v) => {
    try {
      if (!web3) return v;
      // contribution uses token decimals; format roughly
      const base = web3.utils.toBN(10).pow(web3.utils.toBN(decimals));
      const whole = web3.utils.toBN(v).div(base).toString();
      const frac = web3.utils.toBN(v).mod(base).toString().padStart(decimals, '0').slice(0, 2);
      return `${whole}.${frac}`;
    } catch {
      return String(v);
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

  const rowStyle = { display: 'grid', gridTemplateColumns: '180px 1fr', gap: 12, marginBottom: 10 };
  const keyStyle = { color: '#636e72', fontSize: 13 };
  const valStyle = { color: '#2d3436', fontFamily: 'monospace', fontSize: 14 };

  return (
    <LayoutWithHeader showSignout={true}>
      <ToastContainer position="top-center" />
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: 8, color: '#2d3436' }}>Pool</h3>
        <p style={{ marginTop: 0, color: '#9aa0a6', fontSize: 12 }}>{address}</p>
        {loading || !info ? (
          <p>Loading...</p>
        ) : (
          <>
            <div style={rowStyle}><div style={keyStyle}>Token</div><div style={valStyle}>{token}</div></div>
            <div style={rowStyle}><div style={keyStyle}>Size</div><div style={valStyle}>{info.size}</div></div>
            <div style={rowStyle}><div style={keyStyle}>Contribution</div><div style={valStyle}>{fmt(info.contribution)}</div></div>
            <div style={rowStyle}><div style={keyStyle}>Current round</div><div style={valStyle}>{Number(info.currentRound)}</div></div>
            <div style={rowStyle}><div style={keyStyle}>Current recipient</div><div style={valStyle}>{info.currentRecipient}</div></div>
            <div style={{ margin: '16px 0' }}>
              <button disabled={isContributing} onClick={approveAndContribute} style={{
                marginRight: 12,
                padding: '10px 14px',
                background: isContributing ? '#e9ecef' : 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
                border: 'none', borderRadius: 10, color: 'white', fontWeight: 700
              }}>
                {isContributing ? 'Processing...' : 'Approve & Contribute'}
              </button>
              <button disabled={isContributing} onClick={triggerPayout} style={{
                padding: '10px 14px',
                background: isContributing ? '#e9ecef' : 'linear-gradient(135deg, #00cec9 0%, #00b894 100%)',
                border: 'none', borderRadius: 10, color: 'white', fontWeight: 700
              }}>
                {isContributing ? 'Processing...' : 'Trigger Payout'}
              </button>
            </div>
            <div>
              <p style={{ color: '#2d3436', fontWeight: 600 }}>Payout order</p>
              <ol style={{ marginTop: 8 }}>
                {order.map((m) => (
                  <li key={m} style={{ fontFamily: 'monospace', fontSize: 14 }}>{m}</li>
                ))}
              </ol>
            </div>
          </>
        )}
      </div>
    </LayoutWithHeader>
  );
}


