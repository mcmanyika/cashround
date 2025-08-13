import React, { useEffect, useState } from 'react';
import TreeContract from '../../abis/Tree.json';
import { usePriceContext } from '../../contexts/PriceContext';

const UserDashboard = ({ web3, account }) => {
  const { calculateUSDValue } = usePriceContext();
  const [networkId, setNetworkId] = useState(null);
  const [sentPayments, setSentPayments] = useState([]);
  const [receivedPayments, setReceivedPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contractAddress, setContractAddress] = useState(null);
  const [inviter, setInviter] = useState('');
  const [totalSent, setTotalSent] = useState('0');
  const [totalReceived, setTotalReceived] = useState('0');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedReferrer, setCopiedReferrer] = useState(false);
  const [chartAnimation, setChartAnimation] = useState(false);
  const [displayMode, setDisplayMode] = useState('all'); // 'all', 'sent', 'received'
  const [totalDownliners, setTotalDownliners] = useState(0);
  
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
        
        // Calculate totals
        let sentTotal = web3.utils.toBN('0');
        let receivedTotal = web3.utils.toBN('0');
        
        sent.forEach(event => {
          sentTotal = sentTotal.add(web3.utils.toBN(event.returnValues.amount));
        });
        
        received.forEach(event => {
          receivedTotal = receivedTotal.add(web3.utils.toBN(event.returnValues.amount));
        });
        
        setTotalSent(web3.utils.fromWei(sentTotal, 'ether'));
        setTotalReceived(web3.utils.fromWei(receivedTotal, 'ether'));
        setChartAnimation(true);
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
        
        // Fetch downliners count
        try {
          // Get all past Summary events where this account is the inviter
          const fromBlock = 0;
          const toBlock = 'latest';
          const events = await contract.getPastEvents('Summary', {
            fromBlock: fromBlock,
            toBlock: toBlock,
            filter: { inviter: account }
          });
          setTotalDownliners(events.length);
        } catch (err) {
          console.error('Error fetching downliners:', err);
          setTotalDownliners(0);
        }
      } catch (err) {
        setInviter('');
        setTotalDownliners(0);
      }
    };
    fetchInviter();
  }, [web3, account, contractAddress]);

  // Helper function to shorten addresses
  const shortenAddress = (address) => {
    if (!address) return 'None';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Helper function to copy address to clipboard
  const copyToClipboard = async (text, setCopyState) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState(true);
      setTimeout(() => setCopyState(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '100%',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Dashboard Header */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          textAlign: 'center',
          margin: '0 0 24px 0',
          color: '#2d3436',
          fontSize: '24px',
          fontWeight: '700'
        }}>
          Dashboard
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          <div style={{
            background: 'rgba(0, 184, 148, 0.1)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(0, 184, 148, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
          onClick={() => copyToClipboard(account, setCopiedAddress)}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0, 184, 148, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(0, 184, 148, 0.1)';
          }}
          >
            <div style={{ fontSize: '12px', color: '#636e72', marginBottom: '4px' }}>Your Address</div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#2d3436',
              fontFamily: 'monospace',
              textAlign: 'center'
            }}>
              {shortenAddress(account)}
            </div>
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              fontSize: '12px',
              color: copiedAddress ? '#00b894' : '#636e72',
              transition: 'all 0.2s ease',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(0, 184, 148, 0.2)'
            }}>
              {copiedAddress ? '✓' : '📋'}
            </div>
          </div>
          
          <div style={{
            background: 'rgba(0, 184, 148, 0.1)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(0, 184, 148, 0.2)',
            cursor: inviter && inviter !== '0x0000000000000000000000000000000000000000' ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
          onClick={() => {
            if (inviter && inviter !== '0x0000000000000000000000000000000000000000') {
              copyToClipboard(inviter, setCopiedReferrer);
            }
          }}
          onMouseEnter={(e) => {
            if (inviter && inviter !== '0x0000000000000000000000000000000000000000') {
              e.target.style.background = 'rgba(0, 184, 148, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(0, 184, 148, 0.1)';
          }}
          >
            <div style={{ fontSize: '12px', color: '#636e72', marginBottom: '4px' }}>Referred By</div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#2d3436',
              fontFamily: 'monospace',
              textAlign: 'center'
            }}>
              {inviter && inviter !== '0x0000000000000000000000000000000000000000' ? (
                shortenAddress(inviter)
              ) : (
                'None'
              )}
            </div>
            {inviter && inviter !== '0x0000000000000000000000000000000000000000' && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                fontSize: '12px',
                color: copiedReferrer ? '#00b894' : '#636e72',
                transition: 'all 0.2s ease',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(0, 184, 148, 0.2)'
              }}>
                {copiedReferrer ? '✓' : '📋'}
              </div>
            )}
          </div>
          
          <div style={{
            background: 'rgba(52, 152, 219, 0.1)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(52, 152, 219, 0.2)'
          }}>
            <div style={{ fontSize: '12px', color: '#636e72', marginBottom: '4px' }}>Total Downliners</div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#2d3436',
              textAlign: 'center'
            }}>
              {totalDownliners} {totalDownliners === 1 ? 'person' : 'people'}
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#636e72',
          fontSize: '16px'
        }}>
          Loading payments...
        </div>
      )}
      
      {error && (
        <div style={{
          background: 'rgba(231, 76, 60, 0.1)',
          border: '1px solid rgba(231, 76, 60, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          color: '#e74c3c',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
      
      {/* Transaction Totals */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{
          margin: '0 0 24px 0',
          color: '#2d3436',
          fontSize: '20px',
          fontWeight: '600',
          textAlign: 'center'
        }}>
          Transaction Totals
        </h3>
        
        {/* Dynamic Pie Chart */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '32px'
        }}>
          {(() => {
            const sent = parseFloat(totalSent) || 0;
            const received = parseFloat(totalReceived) || 0;
            const total = sent + received;
            
            // Calculate percentages
            const sentPercentage = total > 0 ? (sent / total) * 100 : 0;
            const receivedPercentage = total > 0 ? (received / total) * 100 : 0;
            
            // Calculate degrees for pie chart
            const sentDegrees = (sentPercentage / 100) * 360;
            const receivedDegrees = (receivedPercentage / 100) * 360;
            
            // Determine chart background based on display mode
            let chartBackground = '#f8f9fa'; // Default gray for no data
            let centerLabel = 'Total';
            let centerAmount = total;
            let centerColor = '#00b894';
            
            if (displayMode === 'sent') {
              chartBackground = sent > 0 ? '#e74c3c' : '#f8f9fa';
              centerLabel = 'Sent';
              centerAmount = sent;
              centerColor = '#e74c3c';
            } else if (displayMode === 'received') {
              chartBackground = received > 0 ? '#00b894' : '#f8f9fa';
              centerLabel = 'Received';
              centerAmount = received;
              centerColor = '#00b894';
            } else {
              // 'all' mode
              if (total > 0) {
                if (sent > 0 && received > 0) {
                  chartBackground = `conic-gradient(
                    #e74c3c 0deg ${sentDegrees}deg,
                    #00b894 ${sentDegrees}deg 360deg
                  )`;
                } else if (sent > 0) {
                  chartBackground = '#e74c3c';
                } else if (received > 0) {
                  chartBackground = '#00b894';
                }
              }
              centerLabel = 'Total';
              centerAmount = total;
              centerColor = '#00b894';
            }
            
            return (
              <div style={{
                position: 'relative',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: chartBackground,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.8s ease-in-out',
                transform: chartAnimation ? 'scale(1)' : 'scale(0.8)',
                opacity: chartAnimation ? 1 : 0.7
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#2d3436',
                    marginBottom: '4px'
                  }}>
                    {centerLabel}
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: centerColor,
                    transition: 'all 0.3s ease'
                  }}>
                    ${calculateUSDValue(centerAmount.toString())}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#636e72',
                    marginTop: '4px'
                  }}>
                    {centerAmount.toFixed(2)} POL
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
        
        {/* Dynamic Pie Chart Legend */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '32px',
          marginBottom: '32px',
          flexWrap: 'wrap'
        }}>
          {(() => {
            const sent = parseFloat(totalSent) || 0;
            const received = parseFloat(totalReceived) || 0;
            const total = sent + received;
            
            const sentPercentage = total > 0 ? (sent / total) * 100 : 0;
            const receivedPercentage = total > 0 ? (received / total) * 100 : 0;
            
            return (
              <>
                <div 
                  onClick={() => setDisplayMode('sent')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: sent > 0 ? 1 : 0.5,
                    transition: 'all 0.3s ease',
                    cursor: sent > 0 ? 'pointer' : 'default',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: displayMode === 'sent' ? 'rgba(231, 76, 60, 0.1)' : 'transparent',
                    border: displayMode === 'sent' ? '1px solid rgba(231, 76, 60, 0.3)' : '1px solid transparent'
                  }}
                >
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: '#e74c3c'
                  }}></div>
                  <span style={{ 
                    fontSize: '14px', 
                    color: displayMode === 'sent' ? '#e74c3c' : '#636e72',
                    fontWeight: displayMode === 'sent' ? '600' : '400'
                  }}>
                    Sent ({sentPercentage.toFixed(1)}%)
                  </span>
                </div>
                <div 
                  onClick={() => setDisplayMode('received')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: received > 0 ? 1 : 0.5,
                    transition: 'all 0.3s ease',
                    cursor: received > 0 ? 'pointer' : 'default',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: displayMode === 'received' ? 'rgba(0, 184, 148, 0.1)' : 'transparent',
                    border: displayMode === 'received' ? '1px solid rgba(0, 184, 148, 0.3)' : '1px solid transparent'
                  }}
                >
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: '#00b894'
                  }}></div>
                  <span style={{ 
                    fontSize: '14px', 
                    color: displayMode === 'received' ? '#00b894' : '#636e72',
                    fontWeight: displayMode === 'received' ? '600' : '400'
                  }}>
                    Received ({receivedPercentage.toFixed(1)}%)
                  </span>
                </div>
                {(displayMode === 'sent' || displayMode === 'received') && (
                  <div 
                    onClick={() => setDisplayMode('all')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(52, 152, 219, 0.1)',
                      border: '1px solid rgba(52, 152, 219, 0.3)'
                    }}
                  >
                    <span style={{ 
                      fontSize: '14px', 
                      color: '#3498db',
                      fontWeight: '600'
                    }}>
                      Show All
                    </span>
                  </div>
                )}
              </>
            );
          })()}
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {/* Total Sent */}
          <div style={{
            background: 'rgba(231, 76, 60, 0.1)',
            border: '1px solid rgba(231, 76, 60, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#636e72',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Total Sent
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#e74c3c',
              marginBottom: '4px'
            }}>
              ${calculateUSDValue(totalSent)}
            </div>
            <div style={{
              fontSize: '16px',
              color: '#636e72',
              fontWeight: '500'
            }}>
              {parseFloat(totalSent).toFixed(2)} POL
            </div>
            <div style={{
              fontSize: '12px',
              color: '#636e72',
              marginTop: '8px'
            }}>
              {sentPayments.length} transaction{sentPayments.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          {/* Total Received */}
          <div style={{
            background: 'rgba(0, 184, 148, 0.1)',
            border: '1px solid rgba(0, 184, 148, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#636e72',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Total Received
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#00b894',
              marginBottom: '4px'
            }}>
              ${calculateUSDValue(totalReceived)}
            </div>
            <div style={{
              fontSize: '16px',
              color: '#636e72',
              fontWeight: '500'
            }}>
              {parseFloat(totalReceived).toFixed(2)} POL
            </div>
            <div style={{
              fontSize: '12px',
              color: '#636e72',
              marginTop: '8px'
            }}>
              {receivedPayments.length} transaction{receivedPayments.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          {/* Net Balance */}
          <div style={{
            background: 'rgba(52, 152, 219, 0.1)',
            border: '1px solid rgba(52, 152, 219, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#636e72',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Net Balance
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: '700',
              color: parseFloat(totalReceived) - parseFloat(totalSent) >= 0 ? '#00b894' : '#e74c3c',
              marginBottom: '4px'
            }}>
              ${calculateUSDValue((parseFloat(totalReceived) - parseFloat(totalSent)).toString())}
            </div>
            <div style={{
              fontSize: '16px',
              color: '#636e72',
              fontWeight: '500'
            }}>
              {(parseFloat(totalReceived) - parseFloat(totalSent)).toFixed(2)} POL
            </div>
            <div style={{
              fontSize: '12px',
              color: '#636e72',
              marginTop: '8px'
            }}>
              {parseFloat(totalReceived) - parseFloat(totalSent) >= 0 ? 'Profit' : 'Loss'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 