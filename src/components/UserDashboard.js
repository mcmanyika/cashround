import React, { useEffect, useState } from 'react';
import TreeContract from '../abis/Tree.json';
import CONTRACT_ADDRESS from '../config/contractAddresses';

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
          console.log('Connected to network ID:', id);
          setNetworkId(id);
          
          // Get the contract address for this network
          const address = CONTRACT_ADDRESS[id];
          if (address) {
            console.log('Using contract address:', address);
            setContractAddress(address);
          } else {
            console.warn('No contract address found for network ID:', id);
            setError(`No contract address configured for network ID ${id}`);
          }
        } catch (err) {
          console.error('Error getting network ID:', err);
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
        console.log('Fetching payments for account:', account);
        console.log('Using contract address:', contractAddress);
        
        const contract = new web3.eth.Contract(
          TreeContract.abi,
          contractAddress
        );
        
        // Get all Payments events
        const events = await contract.getPastEvents('Payments', {
          fromBlock: 0,
          toBlock: 'latest',
        });
        console.log('All Payments events:', events);
        
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
        console.error('Error fetching payments:', err);
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
        console.error('Error fetching inviter:', err);
      }
    };
    fetchInviter();
  }, [web3, account, contractAddress]);

  return (
    <div className="user-dashboard card p-4 mt-4 mb-4">
      <h2 className="mb-3">User Dashboard</h2>
      <p><strong>Network ID:</strong> {networkId}</p>
      <p><strong>Contract Address:</strong> <span style={{fontFamily: 'monospace'}}>{contractAddress}</span></p>
      <p><strong>Your Address:</strong> <span style={{fontFamily: 'monospace'}}>{account}</span></p>
      <p><strong>Referred By:</strong> <span style={{fontFamily: 'monospace'}}>{inviter && inviter !== '0x0000000000000000000000000000000000000000' ? inviter : 'None'}</span></p>
      {loading && <div>Loading payments...</div>}
      {error && <div className="text-danger">{error}</div>}
      
      {/* Sent Transactions */}
      <div className="mt-4">
        <h3>Sent Transactions</h3>
        {!loading && sentPayments.length === 0 && <div>No sent transactions yet.</div>}
        {!loading && sentPayments.length > 0 && (
          <div className="table-responsive">
            <table className="table table-bordered table-sm mt-3">
              <thead className="thead-light">
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
                    <td style={{fontFamily: 'monospace'}}>{event.returnValues.to}</td>
                    <td>{web3.utils.fromWei(event.returnValues.amount.toString(), 'ether')}</td>
                    <td style={{fontFamily: 'monospace', fontSize: '0.9em'}}>{event.transactionHash.slice(0, 10)}...{event.transactionHash.slice(-6)}</td>
                    <td>{event.blockNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Received Transactions */}
      <div className="mt-4">
        <h3>Received Transactions</h3>
        {!loading && receivedPayments.length === 0 && <div>No received transactions yet.</div>}
        {!loading && receivedPayments.length > 0 && (
          <div className="table-responsive">
            <table className="table table-bordered table-sm mt-3">
              <thead className="thead-light">
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
                    <td style={{fontFamily: 'monospace'}}>{event.returnValues.from}</td>
                    <td>{web3.utils.fromWei(event.returnValues.amount.toString(), 'ether')}</td>
                    <td style={{fontFamily: 'monospace', fontSize: '0.9em'}}>{event.transactionHash.slice(0, 10)}...{event.transactionHash.slice(-6)}</td>
                    <td>{event.blockNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard; 