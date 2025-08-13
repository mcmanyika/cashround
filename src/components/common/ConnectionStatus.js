import React from 'react';
import { connectionCardStyle, copyButtonStyle } from '../../styles/App.styles';

const formatAddress = (address) => {
  if (!address) return '';
  return address.slice(0, 5) + '...' + address.slice(-5);
};

export const ConnectionStatus = ({ address, onCopy, copyClicked }) => (
  <div style={connectionCardStyle}>
    Connected: {formatAddress(address)}
    <span 
      style={copyButtonStyle(copyClicked)} 
      onClick={onCopy}
    >
      📋
    </span>
  </div>
);
