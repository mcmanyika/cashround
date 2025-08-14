import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useActiveWallet, useActiveAccount } from 'thirdweb/react';

const MobileNavigation = ({ isMember = false, canCreatePools = false }) => {
  const router = useRouter();
  const activeWallet = useActiveWallet();
  const activeAccount = useActiveAccount();
  const isConnected = activeAccount?.address && activeWallet;

  const navItems = [
    {
      label: 'Home',
      icon: '🏠',
      href: '/',
      show: true
    },
    {
      label: 'Pools',
      icon: '💰',
      href: '/pools',
      show: isConnected && isMember
    },
    {
      label: 'Create',
      icon: '➕',
      href: '/pools/create',
      show: isConnected && canCreatePools
    },
    {
      label: 'Earnings',
      icon: '💵',
      href: '/income',
      show: isConnected && isMember
    },
    {
      label: 'Profile',
      icon: '👤',
      href: '/referral',
      show: isConnected
    }
  ].filter(item => item.show);

  return (
    <nav className="mobile-nav desktop-only">
      {navItems.map((item) => {
        const isActive = router.pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            style={{
              color: isActive ? '#00b894' : '#636e72',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: isActive ? '600' : '500'
            }}
          >
            <span style={{ fontSize: '20px', marginBottom: '2px' }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileNavigation;
