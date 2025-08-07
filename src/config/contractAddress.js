export const POLYGON_MAINNET_CONTRACT_ADDRESS = "0xa1268396c94543f42238accfaee9776fce12a52a";

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
