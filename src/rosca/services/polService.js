import POLTokenABI from '../../abis/IERC20.json';
import { getPOLTokenAddress } from '../../config/contractAddress';

// POL token service for handling POL-related operations
export class POLService {
  constructor(web3, networkId) {
    this.web3 = web3;
    this.networkId = networkId;
    this.polTokenAddress = getPOLTokenAddress(networkId);
    this.polContract = new web3.eth.Contract(POLTokenABI, this.polTokenAddress);
  }

  // Get POL balance for a user
  async getBalance(userAddress) {
    try {
      // Check if we're on a local network with no POL token
      if (this.polTokenAddress === '0x0000000000000000000000000000000000000000') {
        // Fallback to ETH balance for local development
        const balance = await this.web3.eth.getBalance(userAddress);
        return this.web3.utils.fromWei(balance, 'ether');
      }
      
      const balance = await this.polContract.methods.balanceOf(userAddress).call();
      return this.web3.utils.fromWei(balance, 'ether');
    } catch (error) {
      console.error('Error getting POL balance:', error);
      return '0';
    }
  }

  // Get POL balance in wei
  async getBalanceWei(userAddress) {
    try {
      const balance = await this.polContract.methods.balanceOf(userAddress).call();
      return balance;
    } catch (error) {
      console.error('Error getting POL balance in wei:', error);
      return '0';
    }
  }

  // Check allowance for a spender
  async getAllowance(ownerAddress, spenderAddress) {
    try {
      const allowance = await this.polContract.methods.allowance(ownerAddress, spenderAddress).call();
      return allowance;
    } catch (error) {
      console.error('Error getting POL allowance:', error);
      return '0';
    }
  }

  // Approve POL spending
  async approve(spenderAddress, amount, fromAddress) {
    try {
      // Check if we're on a local network with no POL token
      if (this.polTokenAddress === '0x0000000000000000000000000000000000000000') {
        // No approval needed for ETH on local development
        console.log('Local development: Skipping POL approval (using ETH)');
        return { transactionHash: '0x' + '0'.repeat(64) }; // Mock transaction hash
      }
      
      const result = await this.polContract.methods
        .approve(spenderAddress, amount)
        .send({ from: fromAddress });
      return result;
    } catch (error) {
      console.error('Error approving POL:', error);
      throw error;
    }
  }

  // Transfer POL tokens
  async transfer(toAddress, amount, fromAddress) {
    try {
      const result = await this.polContract.methods
        .transfer(toAddress, amount)
        .send({ from: fromAddress });
      return result;
    } catch (error) {
      console.error('Error transferring POL:', error);
      throw error;
    }
  }

  // Get POL token info
  async getTokenInfo() {
    try {
      const [name, symbol, decimals] = await Promise.all([
        this.polContract.methods.name().call(),
        this.polContract.methods.symbol().call(),
        this.polContract.methods.decimals().call()
      ]);
      return { name, symbol, decimals };
    } catch (error) {
      console.error('Error getting POL token info:', error);
      return { name: 'POL', symbol: 'POL', decimals: 18 };
    }
  }

  // Convert POL amount to display format
  formatPOLAmount(amountWei, decimals = 4) {
    try {
      const amountEth = this.web3.utils.fromWei(amountWei, 'ether');
      return parseFloat(amountEth).toFixed(decimals);
    } catch (error) {
      console.error('Error formatting POL amount:', error);
      return '0';
    }
  }

  // Convert display amount to wei
  formatToWei(amountEth) {
    try {
      return this.web3.utils.toWei(amountEth.toString(), 'ether');
    } catch (error) {
      console.error('Error converting to wei:', error);
      return '0';
    }
  }
}

// Factory function to create POL service
export const createPOLService = (web3, networkId) => {
  return new POLService(web3, networkId);
};
