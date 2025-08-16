import React, { useEffect, useState } from 'react';
import { useActiveWallet, useActiveAccount, ConnectButton } from 'thirdweb/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getWeb3, isTreeMember } from '../../rosca/services/rosca';
import { lightTheme } from 'thirdweb/react';
import { inAppWallet, createWallet } from "thirdweb/wallets";
import Footer from './Footer';

const wallets = [
  inAppWallet({
    auth: {
      options: [
        "email",
      ],
    },
  }),
  createWallet("io.metamask"),
];


const Layout = ({ 
  children, 
  showBackground = true, 
  className = '',
  showFooter = true
}) => {
  return (
    <div className={`layout-container ${!showBackground ? 'no-background' : ''} ${className}`} style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div>
        {children}
      </div>
    </div>
  );
};

// Export additional layout components for convenience
export const LayoutCard = ({ children, className = '' }) => (
  <div className={`layout-card ${className}`}>
    {children}
  </div>
);

export const LayoutHeader = ({ children, className = '' }) => (
  <div className={`layout-header ${className}`}>
    {children}
  </div>
);

export const LayoutLogo = ({ children, className = '' }) => (
  <div className={`layout-logo ${className}`}>
    {children}
  </div>
);

export const LayoutLogoText = ({ children, className = '' }) => (
  <div className={`layout-logo-text ${className}`}>
    {children}
  </div>
);

export const LayoutLogoBadge = ({ children, className = '' }) => (
  <div className={`layout-logo-badge ${className}`}>
    {children}
  </div>
);

export const LayoutTitle = ({ children, className = '' }) => (
  <h1 className={`layout-title ${className}`}>
    {children}
  </h1>
);

export const LayoutSubtitle = ({ children, className = '' }) => (
  <p className={`layout-subtitle ${className}`}>
    {children}
  </p>
);

export const LayoutLoading = ({ className = '' }) => (
  <div className={`layout-loading ${className}`}>
    <div className="layout-spinner"></div>
  </div>
);

export const LayoutSignout = ({ className = '', isMember = false }) => {
  const activeWallet = useActiveWallet();
  const activeAccount = useActiveAccount();
  const router = useRouter();
  const [showPools, setShowPools] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const addr = activeAccount?.address;
        const w3 = await getWeb3();
        if (addr && w3) {
          const member = await isTreeMember(w3, addr);
          setShowPools(member);
        } else {
          setShowPools(false);
        }
      } catch {
        setShowPools(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [activeAccount?.address]);

  const handleSignout = async () => {
    if (activeWallet) {
      await activeWallet.disconnect();
    }
    // Also set logout flag for compatibility with existing logic
    localStorage.setItem('logout', 'true');
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '16px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 1000,
      }}
    >
      {(showPools || router.pathname.startsWith('/pools')) && (
        <Link
          href="/pools"
          style={{
            color: '#00b894',
            fontSize: '14px',
            fontWeight: 700,
            textDecoration: 'none',
            padding: '8px 10px',
            background: 'rgba(0, 184, 148, 0.08)',
            borderRadius: 8,
          }}
        >
          Pools
        </Link>
      )}
      {isMember && (
        <Link
          href="/income"
          style={{
            color: '#00b894',
            fontSize: '14px',
            fontWeight: 700,
            textDecoration: 'none',
            padding: '8px 10px',
            background: 'rgba(0, 184, 148, 0.08)',
            borderRadius: 8,
          }}
        >
          Earnings
        </Link>
      )}
      <p
        onClick={handleSignout}
        className={`layout-signout ${className}`}
        style={{
          margin: '0',
          cursor: 'pointer',
          color: '#636e72',
          fontSize: '14px',
          padding: '8px 10px',
          background: 'rgba(99, 110, 114, 0.06)',
          borderRadius: 8,
        }}
      >
        Signout
      </p>
    </div>
  );
};

// Complete layout with header - reusable across pages
export const LayoutWithHeader = ({ children, showSignout = false, client, isMember = false, showFooter = true }) => {
  const activeWallet = useActiveWallet();
  const activeAccount = useActiveAccount();
  const isConnected = activeAccount?.address && activeWallet;
  const [actualIsMember, setActualIsMember] = useState(false);
  const [checkingMembership, setCheckingMembership] = useState(true);

  useEffect(() => {
    const checkMembership = async () => {
      if (!isConnected || !activeAccount?.address) {
        setActualIsMember(false);
        setCheckingMembership(false);
        return;
      }

      try {
        const { getWeb3, isTreeMember } = await import('../../rosca/services/rosca');
        const web3 = await getWeb3();
        if (web3) {
          const member = await isTreeMember(web3, activeAccount.address);
          setActualIsMember(member);
        } else {
          setActualIsMember(false);
        }
      } catch (error) {
        console.error('Error checking membership:', error);
        setActualIsMember(false);
      } finally {
        setCheckingMembership(false);
      }
    };

    checkMembership();
  }, [isConnected, activeAccount?.address]);

  // Use the passed isMember prop if provided, otherwise use detected membership
  const finalIsMember = isMember !== false ? actualIsMember : isMember;

  return (
    <Layout showFooter={showFooter}>
      <LayoutCard>
        {showSignout && isConnected && <LayoutSignout isMember={finalIsMember} />}
        <LayoutHeader>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <LayoutLogo>
              <LayoutLogoText>CR</LayoutLogoText>
              <LayoutLogoBadge>$</LayoutLogoBadge>
            </LayoutLogo>
          </Link>
          <LayoutTitle className="uppercase">Cash Round</LayoutTitle>
          <LayoutSubtitle>
            {finalIsMember ? "Welcome Back! Refer And Earn Rewards." : "Join Our Network And Start Earning Rewards."}
          </LayoutSubtitle>
        </LayoutHeader>
          {children}
        <Footer />
      </LayoutCard>
    </Layout>
  );
};

// Connect wallet layout component
export const LayoutConnect = ({ client, className = '' }) => {
  const activeAccount = useActiveAccount();
  const activeWallet = useActiveWallet();
  const isConnected = activeAccount?.address && activeWallet;

  return (
    <div 
      className={`layout-connect ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        padding: '20px 20px'
      }}
    >
      {!isConnected && (
        <ConnectButton 
          client={client}
          connectButton={{ label: "Sign In" }}
          theme={lightTheme({
            colors: {
              accentText: "hsl(151, 55%, 42%)", 
              borderColor: "hsl(262, 11%, 86%)",
              accentButtonBg: "hsl(151, 55%, 42%)",
              success: "hsl(151, 55%, 42%)",
            },
          })}
          wallets={wallets}
        />
      )}
    </div>
  );
};

export default Layout; 