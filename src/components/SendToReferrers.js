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
  const [ethAmountPerMember, setEthAmountPerMember] = useState('10');
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      if (web3) {
        const id = await web3.eth.net.getId();
        setNetworkId(id);
        if (CONTRACT_ADDRESS[id]) {
          const contractInstance = new web3.eth.Contract(
            TreeContract.abi,
            CONTRACT_ADDRESS[id]
          );
          setContract(contractInstance);
        }
      }
    };
    initialize();
  }, [web3]);

  useEffect(() => {
    const fetchHasPaid = async () => {
      if (contract && account) {
        try {
          const paid = await contract.methods.hasPaidUpliners(account).call();
          setHasPaid(paid);
        } catch (e) {
          setHasPaid(false);
          setError('Error fetching payment status');
        }
      }
    };
    fetchHasPaid();
  }, [contract, account]);

  const handleSendToReferrers = async () => {
    if (!web3 || !account || !networkId || !CONTRACT_ADDRESS[networkId]) {
      setError('Please connect your wallet first');
      return;
    }

    if (!ethAmountPerMember || isNaN(ethAmountPerMember) || parseFloat(ethAmountPerMember) <= 0) {
      setError('Please enter a valid ETH amount per member');
      return;
    }

    if (referralChain.length === 0) {
      setError('No referrers found in your chain');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const referrerAddresses = referralChain.map(link => link.inviter);
      const ethAmountWei = web3.utils.toWei(ethAmountPerMember, 'ether');
      const totalEthNeeded = web3.utils.toBN(ethAmountWei).mul(web3.utils.toBN(referrerAddresses.length));
      const balance = await web3.eth.getBalance(account);
      
      if (web3.utils.toBN(balance).lt(totalEthNeeded)) {
        setError(`Insufficient balance. You need ${web3.utils.fromWei(totalEthNeeded, 'ether')} ETH`);
        setLoading(false);
        return;
      }

      // Call batchPay with all referrers in one transaction
      await contract.methods.batchPay(referrerAddresses, ethAmountWei)
        .send({
          from: account,
          value: totalEthNeeded.toString()
        });

      toast.success(`✅ Successfully sent ${ethAmountPerMember} ETH to ${referrerAddresses.length} referrers!`);
      setHasPaid(true);
    } catch (err) {
      if (err.code === 4001) {
        setError('Transaction was rejected by the user.');
      } else {
        setError(err.message || 'Error sending payments to referrers');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="send-to-referrers">
      {referralChain.length > 0 && !hasPaid && (
        <>
          <div className="form-group mb-3">
            <div className="input-group">
              <input
                type="hidden"
                step="0.000000000000000001"
                min="0"
                className="form-control"
                value={ethAmountPerMember}
                onChange={(e) => setEthAmountPerMember(e.target.value)}
                placeholder="Enter amount per member in ETH"
                required
              />
            </div>
            
          </div>
          <button 
            className="btn btn-warning btn-lg rounded-pill font-weight-bold"
            onClick={handleSendToReferrers}
            disabled={loading || !ethAmountPerMember}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : 'Become A Member'}
          </button>
        </>
      )}
      {error && <p className="text-danger mt-2">{error}</p>}
    </div>
  );
};

export default SendToReferrers; 