import React, { useState, useEffect } from 'react';
import TreeContract from '../abis/Tree.json';
import './SendToReferrers.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CONTRACT_ADDRESS from '../config/contractAddresses';

const SendToReferrers = ({ web3, account, referralChain }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [networkId, setNetworkId] = useState(null);
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    const getNetworkId = async () => {
      if (web3) {
        const id = await web3.eth.net.getId();
        setNetworkId(id);
      }
    };
    getNetworkId();
  }, [web3]);

  useEffect(() => {
    const fetchHasPaid = async () => {
      if (web3 && account && networkId && CONTRACT_ADDRESS[networkId]) {
        const contract = new web3.eth.Contract(
          TreeContract.abi,
          CONTRACT_ADDRESS[networkId]
        );
        try {
          const paid = await contract.methods.hasPaidUpliners(account).call();
          setHasPaid(paid);
        } catch (e) {
          setHasPaid(false);
        }
      }
    };
    fetchHasPaid();
  }, [web3, account, networkId]);

  const handleSendToReferrers = async () => {
    if (!web3 || !account || !networkId || !CONTRACT_ADDRESS[networkId]) {
      setError('Please connect your wallet first');
      return;
    }

    if (referralChain.length === 0) {
      setError('No referrers found in your chain');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const contract = new web3.eth.Contract(
        TreeContract.abi,
        CONTRACT_ADDRESS[networkId]
      );

      // Prepare the array of referrer addresses
      const referrerAddresses = referralChain.map(link => link.inviter);
      const totalEthNeeded = web3.utils.toWei((10 * referrerAddresses.length).toString(), 'ether');
      const balance = await web3.eth.getBalance(account);
      if (web3.utils.toBN(balance).lt(web3.utils.toBN(totalEthNeeded))) {
        setError(`Insufficient balance. You need ${web3.utils.fromWei(totalEthNeeded, 'ether')} ETH`);
        setLoading(false);
        return;
      }

      // Call batchPay with all referrers in one transaction
      await contract.methods.batchPay(referrerAddresses)
        .send({
          from: account,
          value: totalEthNeeded
        });

      toast.success(`✅ Successfully sent 10 ETH to ${referrerAddresses.length} referrers!`);
      setHasPaid(true);
    } catch (err) {
      if (err.code === 4001) {
        setError('Transaction was rejected by the user.');
      } else {
        setError(err.message || 'Error sending ETH to referrers');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="`send-to-referrers`">
      {referralChain.length > 0 && (
        <button 
          className="btn btn-warning btn-lg rounded-pill font-weight-bold"
          onClick={handleSendToReferrers}
          disabled={loading || hasPaid}
        >
          {hasPaid ? 'Thank You For Becoming A Member' : (
            loading ? (
              <>
                <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : `Become A Member`
          )}
        </button>
      )}
      {error && <p className="text-danger mt-2">{error}</p>}
    </div>
  );
};

export default SendToReferrers; 