import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useActiveWallet, useActiveAccount } from 'thirdweb/react';
import { isTreeOwner, hasTwoLevelDownline, isTreeMember } from '../../rosca/services/rosca';

const Footer = () => {
  const activeWallet = useActiveWallet();
  const activeAccount = useActiveAccount();
  const isConnected = activeAccount?.address && activeWallet;
  const [canCreatePools, setCanCreatePools] = useState(false);
  const [isMember, setIsMember] = useState(false);

  // Check if user can create pools (tree owner or has 2+ level downlines)
  useEffect(() => {
    const checkCreatePermission = async () => {
      if (!isConnected || !activeAccount?.address) {
        setCanCreatePools(false);
        setIsMember(false);
        return;
      }

      try {
        // Create web3 instance
        if (window.ethereum) {
          const Web3 = require('web3');
          const web3 = new Web3(window.ethereum);
          
          // Check if user is tree owner or has 2+ level downlines
          const isOwner = await isTreeOwner(web3, activeAccount.address);
          const hasDownlines = await hasTwoLevelDownline(web3, activeAccount.address);
          const canCreate = isOwner || hasDownlines;
          
          setCanCreatePools(canCreate);
          
          // Check if user is a tree member
          const member = await isTreeMember(web3, activeAccount.address);
          setIsMember(member);
        }
      } catch (error) {
        console.error('Error checking create pool permission:', error);
        setCanCreatePools(false);
        setIsMember(false);
      }
    };

    checkCreatePermission();
  }, [isConnected, activeAccount?.address]);
  return (
    <footer className="footer" style={{
      backgroundColor: '#f8f9fa',
      borderTop: '1px solid #e9ecef',
      marginTop: '20px',
      textAlign: 'center',
      position: 'relative',
      bottom: 0,
      width: '100%',
      minHeight: '100px',
      paddingBottom: '50px'
    }}>
      <div className="container" style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div className="footer-content" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div className="footer-links">
            <Link href="/whitepaper" style={{
              color: '#00b894',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              padding: '8px 12px',
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              border: '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(0, 184, 148, 0.1)';
              e.target.style.borderColor = '#00b894';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = 'transparent';
            }}>
              📄 White Paper
            </Link>
            {isConnected && isMember && (
              <Link href="/pools" style={{
                color: '#636e72',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                padding: '8px 12px',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                border: '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(99, 110, 114, 0.1)';
                e.target.style.borderColor = '#636e72';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = 'transparent';
              }}>
                💰 Active Pools
              </Link>
            )}
            {isConnected && canCreatePools && (
              <Link href="/pools/create" style={{
                color: '#636e72',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                padding: '8px 12px',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                border: '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(99, 110, 114, 0.1)';
                e.target.style.borderColor = '#636e72';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = 'transparent';
              }}>
                ➕ Create Pool
              </Link>
            )}
          </div>
          
          <div className="footer-brand" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '10px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#00b894'
            }}>
              <span style={{
                backgroundColor: '#00b894',
                color: 'white',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>CR</span>
            </div>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#2d3436'
            }}>Mukando</span>
          </div>
          
          <div className="footer-copyright" style={{
            fontSize: '12px',
            color: '#636e72',
            marginTop: '5px'
          }}>
            © {new Date().getFullYear()} Mukando. 
            Decentralized <br className="mobile-only" />CASH ROUND Platform.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
