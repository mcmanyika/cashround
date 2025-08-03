import React, { useEffect, useState } from 'react';
import TreeContract from '../abis/Tree.json';
import './UserDashboard.css';

const UserDashboard = ({ web3, account }) => {
  const [networkId, setNetworkId] = useState(null);
  const [sentPayments, setSentPayments] = useState([]);
  const [receivedPayments, setReceivedPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contractAddress, setContractAddress] = useState(null);
  const [inviter, setInviter] = useState('');
  
  useEffect(() => {
    const getNetworkId = async () => {
      if (web3) {
        try {
          const id = await web3.eth.net.getId();
          setNetworkId(id);
          
          // Get the contract address for this network
          const networkData = TreeContract.networks[id];
          if (networkData && networkData.address) {
            setContractAddress(networkData.address);
          } else {
            setError(`No contract found on network ID ${id}`);
          }
        } catch (err) {
          setError('Error connecting to network');
        }
      }
    };
    getNetworkId();
  }, [web3]);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!web3 || !account || !networkId || !contractAddress) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError('');
      try {
        const contract = new web3.eth.Contract(
          TreeContract.abi,
          contractAddress
        );
        
        // Get all Payments events
        const events = await contract.getPastEvents('Payments', {
          fromBlock: 0,
          toBlock: 'latest',
        });
        
        // Filter sent and received payments
        const sent = events.filter(event => 
          event.returnValues.from && 
          event.returnValues.from.toLowerCase() === account.toLowerCase()
        );
        const received = events.filter(event => 
          event.returnValues.to && 
          event.returnValues.to.toLowerCase() === account.toLowerCase()
        );
        
        setSentPayments(sent);
        setReceivedPayments(received);
      } catch (err) {
        setError(err.message || 'Error fetching payments');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [web3, account, networkId, contractAddress]);

  useEffect(() => {
    const fetchInviter = async () => {
      if (!web3 || !account || !contractAddress) {
        setInviter('');
        return;
      }
      try {
        const contract = new web3.eth.Contract(TreeContract.abi, contractAddress);
        const userInfo = await contract.methods.tree(account).call();
        setInviter(userInfo.inviter);
      } catch (err) {
        setInviter('');
      }
    };
    fetchInviter();
  }, [web3, account, contractAddress]);

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <div className="network-info">
          <div className="info-item">
            <span className="label">Network ID</span>
            <span className="value">{networkId}</span>
          </div>
          <div className="info-item">
            <span className="label">Contract Address</span>
            <span className="value monospace">{contractAddress}</span>
          </div>
          <div className="info-item">
            <span className="label">Your Address</span>
            <span className="value monospace">{account}</span>
          </div>
          <div className="info-item">
            <span className="label">Referred By</span>
            <span className="value monospace">
              {inviter && inviter !== '0x0000000000000000000000000000000000000000' ? inviter : 'None'}
            </span>
          </div>
        </div>
      </div>

      {loading && <div className="loading-spinner">Loading payments...</div>}
      {error && <div className="error-message">{error}</div>}
      
      <div className="transactions-container">
        {/* Sent Transactions */}
        <div className="transaction-section">
          <h3>Sent Transactions</h3>
          {!loading && sentPayments.length === 0 && (
            <div className="no-transactions">No sent transactions yet.</div>
          )}
          {!loading && sentPayments.length > 0 && (
            <div className="table-container">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>To</th>
                    <th>Amount (ETH)</th>
                    <th>Tx Hash</th>
                    <th>Block</th>
                  </tr>
                </thead>
                <tbody>
                  {sentPayments.map((event, idx) => (
                    <tr key={event.id || event.transactionHash + idx}>
                      <td className="monospace">{event.returnValues.to}</td>
                      <td>{web3.utils.fromWei(event.returnValues.amount.toString(), 'ether')}</td>
                      <td className="monospace tx-hash">
                        {event.transactionHash.slice(0, 10)}...{event.transactionHash.slice(-6)}
                      </td>
                      <td>{event.blockNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Received Transactions */}
        <div className="transaction-section">
          <h3>Received Transactions</h3>
          {!loading && receivedPayments.length === 0 && (
            <div className="no-transactions">No received transactions yet.</div>
          )}
          {!loading && receivedPayments.length > 0 && (
            <div className="table-container">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>From</th>
                    <th>Amount (ETH)</th>
                    <th>Tx Hash</th>
                    <th>Block</th>
                  </tr>
                </thead>
                <tbody>
                  {receivedPayments.map((event, idx) => (
                    <tr key={event.id || event.transactionHash + idx}>
                      <td className="monospace">{event.returnValues.from}</td>
                      <td>{web3.utils.fromWei(event.returnValues.amount.toString(), 'ether')}</td>
                      <td className="monospace tx-hash">
                        {event.transactionHash.slice(0, 10)}...{event.transactionHash.slice(-6)}
                      </td>
                      <td>{event.blockNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 