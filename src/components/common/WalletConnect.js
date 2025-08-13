import React from 'react';
import MetaMaskConnect from '../wallet/MetaMaskConnect';
import { walletConnectStyle } from '../../styles/App.styles';

export const WalletConnect = () => (
  <div>
    <p style={walletConnectStyle}>
      Please connect your wallet to continue
    </p>
    <MetaMaskConnect />
  </div>
);
