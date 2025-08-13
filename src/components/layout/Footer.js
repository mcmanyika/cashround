import React from 'react';
import Link from 'next/link';
import { useActiveWallet, useActiveAccount } from 'thirdweb/react';

const Footer = () => {
  const activeWallet = useActiveWallet();
  const activeAccount = useActiveAccount();
  const isConnected = activeAccount?.address && activeWallet;
  return (
    <footer className="footer" style={{
      backgroundColor: '#f8f9fa',
      borderTop: '1px solid #e9ecef',
      padding: '20px 0',
      marginTop: 'auto',
      textAlign: 'center',
      position: 'relative',
      bottom: 0,
      width: '100%'
    }}>
      <div className="container" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        <div className="footer-content" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div className="footer-links" style={{
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
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
            {isConnected && (
              <>
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
              </>
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
              <span style={{
                backgroundColor: '#00b894',
                color: 'white',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold'
              }}>$</span>
            </div>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#2d3436'
            }}>Cash Round</span>
          </div>
          
          <div className="footer-copyright" style={{
            fontSize: '12px',
            color: '#636e72',
            marginTop: '5px'
          }}>
            © 2025 Cash Round. Decentralized MUKANDO Platform.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
