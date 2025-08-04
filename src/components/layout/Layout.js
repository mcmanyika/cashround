import React from 'react';

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

export default Layout; 