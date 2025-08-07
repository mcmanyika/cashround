import React from 'react';
import { useActiveWallet, useActiveAccount, ConnectButton } from 'thirdweb/react';
import { lightTheme } from 'thirdweb/react';
import { inAppWallet, createWallet } from "thirdweb/wallets";

const wallets = [
  inAppWallet({
    auth: {
      options: [
        "google",
        "email",
        "passkey",
        "phone",
      ],
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
];


const Layout = ({ 
  children, 
  showBackground = true, 
  className = ''
}) => {
  return (
    <div className={`layout-container ${!showBackground ? 'no-background' : ''} ${className}`}>
      {children}
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

export const LayoutSignout = ({ className = '' }) => {
  const activeWallet = useActiveWallet();

  const handleSignout = async () => {
    if (activeWallet) {
      await activeWallet.disconnect();
    }
    // Also set logout flag for compatibility with existing logic
    localStorage.setItem('logout', 'true');
  };

  return (
    <p
      onClick={handleSignout}
      className={`layout-signout ${className}`}
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        margin: '0',
        cursor: 'pointer',
        color: '#636e72',
        fontSize: '14px',
        padding: '10px',
        zIndex: 1000
      }}
    >
      Signout
    </p>
  );
};

// Complete layout with header - reusable across pages
export const LayoutWithHeader = ({ children, showSignout = false, client, isMember = false }) => {
  const activeWallet = useActiveWallet();
  const activeAccount = useActiveAccount();
  const isConnected = activeAccount?.address && activeWallet;

  return (
    <Layout>
      <LayoutCard>
        {showSignout && isConnected && <LayoutSignout />}
        <LayoutHeader>
          <LayoutLogo>
            <LayoutLogoText>CR</LayoutLogoText>
            <LayoutLogoBadge>$</LayoutLogoBadge>
          </LayoutLogo>
          <LayoutTitle>Cash Round</LayoutTitle>
          <LayoutSubtitle>
            {isMember ? "Welcome Back! Continue Earning Rewards." : "Join Our Network And Start Earning Rewards."}
          </LayoutSubtitle>
        </LayoutHeader>
        {children}
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