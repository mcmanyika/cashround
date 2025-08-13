import React from 'react';
import { loadingContainerStyle, loadingTextStyle } from '../../styles/App.styles';
import styles from '../../styles/App.module.css';

export const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div style={loadingContainerStyle}>
    <div className={styles.spinner}></div>
    <p style={loadingTextStyle}>
      {message}
    </p>
  </div>
);
