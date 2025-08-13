// App.js styles extracted for better maintainability
export const connectionCardStyle = {
  background: 'rgba(0, 184, 148, 0.1)',
  border: '1px solid rgba(0, 184, 148, 0.2)',
  borderRadius: '12px',
  padding: '12px',
  marginBottom: '24px',
  fontSize: '14px',
  color: '#00b894',
  fontWeight: '500',
  width: '100%',
  boxSizing: 'border-box'
};

export const copyButtonStyle = (isClicked) => ({
  cursor: 'pointer',
  marginLeft: '5px',
  fontSize: '14px',
  color: isClicked ? '#00b894' : '#636e72',
  transition: 'all 0.2s ease',
  background: isClicked ? '#e8f5e8' : '#f5f5f5',
  borderRadius: '50%',
  width: '28px',
  height: '28px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: isClicked ? '1px solid #00b894' : '1px solid #e0e0e0'
});

export const loadingContainerStyle = {
  textAlign: 'center',
  padding: '20px'
};

export const spinnerStyle = {
  width: '30px',
  height: '30px',
  border: '3px solid rgba(0, 184, 148, 0.3)',
  borderTop: '3px solid #00b894',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '0 auto 16px'
};

export const loadingTextStyle = {
  color: '#636e72',
  fontSize: '14px',
  margin: '0'
};

export const statusCardStyle = {
  textAlign: 'center',
  padding: '20px'
};

export const statusIconStyle = {
  width: '50px',
  height: '50px',
  background: 'rgba(0, 184, 148, 0.1)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 16px'
};

export const statusTitleStyle = {
  color: '#2d3436',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px 0'
};

export const statusMessageStyle = {
  color: '#636e72',
  fontSize: '14px',
  margin: '0 0 20px 0'
};

export const actionButtonStyle = {
  padding: '12px 24px',
  background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
  border: 'none',
  borderRadius: '12px',
  color: 'white',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

export const containerStyle = {
  width: '100%'
};

export const walletConnectStyle = {
  color: '#636e72',
  marginBottom: '20px',
  fontSize: '16px'
};
