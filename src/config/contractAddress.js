export const POLYGON_MAINNET_CONTRACT_ADDRESS = "0xb7fd0c9708edd8b3b6a454ba09d4de2838af1608";

// POL token addresses from environment variables
export const POL_TOKEN_ADDRESSES = {
  137: process.env.NEXT_PUBLIC_POL_TOKEN_ADDRESS_POLYGON || "0x455e53CBB86018Ac2B8092FdCd39b8443aA31FE6", // Polygon Mainnet POL
  80002: process.env.NEXT_PUBLIC_POL_TOKEN_ADDRESS_AMOY || "0x0000000000000000000000000000000000000000", // Amoy Testnet
  1337: process.env.NEXT_PUBLIC_POL_TOKEN_ADDRESS_LOCAL || "0x0000000000000000000000000000000000000000", // Local development
  5777: process.env.NEXT_PUBLIC_POL_TOKEN_ADDRESS_LOCAL || "0x0000000000000000000000000000000000000000"  // Local development
};

export const getContractAddress = (networkId) => {
  switch (networkId) {
    case 137: // Polygon Mainnet
      return POLYGON_MAINNET_CONTRACT_ADDRESS;
    case 1337: // Local development
      return "0x7501C433e99F1F1a94EDdcce6Fe0b881cA3a83D4";
    case 5777: // Local development
      return "0xE20677F28c03F92Ff84C76BC8AF419a6e2D9D6e3";
    default:
      return POLYGON_MAINNET_CONTRACT_ADDRESS; // Default to mainnet
  }
};

export const getPOLTokenAddress = (networkId) => {
  return POL_TOKEN_ADDRESSES[networkId] || POL_TOKEN_ADDRESSES[137]; // Default to mainnet
};
