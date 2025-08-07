// Contract addresses for different networks
const CONTRACT_ADDRESSES = {
  137: process.env.NEXT_PUBLIC_POLYGON_MAINNET_CONTRACT_ADDRESS || "0xa1268396c94543f42238accfaee9776fce12a52a", // Polygon Mainnet
  1337: "0x7501C433e99F1F1a94EDdcce6Fe0b881cA3a83D4", // Local development
  5777: "0xE20677F28c03F92Ff84C76BC8AF419a6e2D9D6e3", // Local development
};

// Default network ID (can be overridden by environment variable)
export const DEFAULT_NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID || "137";

// Get contract address for a specific network
export const getContractAddress = (networkId) => {
  // Convert networkId to string for comparison
  const network = String(networkId);
  
  // Return the contract address for the specified network, or mainnet address as fallback
  return CONTRACT_ADDRESSES[network] || CONTRACT_ADDRESSES[DEFAULT_NETWORK_ID];
};

// Get all supported networks
export const getSupportedNetworks = () => {
  return Object.keys(CONTRACT_ADDRESSES).map(Number);
};

// Check if a network is supported
export const isNetworkSupported = (networkId) => {
  return networkId && CONTRACT_ADDRESSES[String(networkId)] !== undefined;
};
