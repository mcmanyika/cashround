// ETH configuration - using address(0) for native ETH
// No specific addresses needed since ETH is the native currency

export const ETH_ADDRESS = '0x0000000000000000000000000000000000000000';

export const getDefaultTokenForChain = (chainId) => {
  // Always return ETH address (address(0))
  return ETH_ADDRESS;
};


