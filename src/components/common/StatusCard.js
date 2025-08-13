import React from 'react';
import { 
  statusCardStyle, 
  statusIconStyle, 
  statusTitleStyle, 
  statusMessageStyle, 
  actionButtonStyle 
} from '../../styles/App.styles';

export const StatusCard = ({ 
  type = 'success', 
  title, 
  message, 
  action, 
  actionText,
  icon = '✅' 
}) => (
  <div style={statusCardStyle}>
    <div style={statusIconStyle}>
      <span style={{ fontSize: '24px' }}>{icon}</span>
    </div>
    {title && (
      <p style={statusTitleStyle}>
        {title}
      </p>
    )}
    {message && (
      <p style={statusMessageStyle}>
        {message}
      </p>
    )}
    {action && actionText && (
      <button
        onClick={action}
        style={actionButtonStyle}
      >
        {actionText}
      </button>
    )}
  </div>
);
