import React, { useState } from 'react';
import TreeContract from '../abis/Tree.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CONTRACT_ADDRESS from '../config/contractAddresses';

const ReferralForm = ({ web3, account }) => {
  const [referrerAddress, setReferrerAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [networkId, setNetworkId] = useState(null);
  const [showBecomeMember, setShowBecomeMember] = useState(false);

  // Get network ID when component mounts or web3 changes
  React.useEffect(() => {
    const getNetworkId = async () => {
      if (web3) {
        const id = await web3.eth.net.getId();
        setNetworkId(id);
      }
    };
    getNetworkId();
  }, [web3]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!web3 || !account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!networkId || !CONTRACT_ADDRESS[networkId]) {
      toast.error('Please connect to a supported network');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Get the contract instance with the correct address
      const contract = new web3.eth.Contract(
        TreeContract.abi,
        CONTRACT_ADDRESS[networkId]
      );

      // Convert 0.001610 ETH to Wei
      const amount = web3.utils.toWei('0.001610', 'ether');

      // Call the enter function
      await contract.methods.enter(referrerAddress, referrerAddress)
        .send({ from: account, value: amount });

      toast.success('Successfully joined the referral tree!');
      setReferrerAddress('');
      setShowBecomeMember(true);
    } catch (err) {
      toast.error(err.message || 'An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="referral-form">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {networkId && !CONTRACT_ADDRESS[networkId] && (
        <div className="alert alert-warning">
          Please connect to a supported network. Current network ID: {networkId}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            id="referrerAddress"
            className="form-control"
            value={referrerAddress}
            onChange={(e) => setReferrerAddress(e.target.value)}
            placeholder="Enter your referrer's Ethereum address"
            required
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-warning btn-lg font-weight-bold w-100 mb-1 mt-1"
          disabled={loading || !web3 || !account || !CONTRACT_ADDRESS[networkId]}
        >
          {loading ? 'Processing...' : 'Save Referral'}
        </button>
      </form>
      {showBecomeMember && (
        <button className="btn btn-warning btn-lg font-weight-bold w-100 mb-3 mt-3">
          Become A Member
        </button>
      )}
      {error && <p className="text-danger mt-2">{error}</p>}
      {success && <p className="text-success mt-2">{success}</p>}
    </div>
  );
};

export default ReferralForm; 