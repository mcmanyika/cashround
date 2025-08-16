// POL configuration - using POL token addresses
import { getPOLTokenAddress } from '../../config/contractAddress';

export const POL_ADDRESS = '0x455e53CBB86018Ac2B8092FdCd39b8443aA31FE6';

export const getDefaultTokenForChain = (chainId) => {
  // Return POL token address for the given chain
  return getPOLTokenAddress(chainId);
};


