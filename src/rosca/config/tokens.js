// Known token addresses by chain
// Preference: native USDC on Polygon

export const KNOWN_USDC_BY_CHAIN = {
  // Polygon mainnet
  137: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
  // Polygon Amoy testnet (no canonical USDC). Provide via env if needed.
  80002: process.env.NEXT_PUBLIC_USDC_ADDRESS || ''
};

export const getDefaultUsdcForChain = (chainId) => {
  const envAddr = process.env.NEXT_PUBLIC_USDC_ADDRESS;
  if (envAddr) return envAddr;
  return KNOWN_USDC_BY_CHAIN[chainId] || '';
};


