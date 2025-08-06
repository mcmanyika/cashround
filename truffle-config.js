require('babel-register');
require('babel-polyfill');
require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    
    // Goerli Testnet
    goerli: {
      provider: () => new HDWalletProvider(
        process.env.PRIVATE_KEY,
        `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
      ),
      network_id: 5,
      gas: 5500000,
      gasPrice: 20000000000, // 20 gwei
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    
    // Sepolia Testnet
    sepolia: {
      provider: () => new HDWalletProvider(
        process.env.PRIVATE_KEY,
        `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
      ),
      network_id: 11155111,
      gas: 5500000,
      gasPrice: 20000000000, // 20 gwei
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    
    // Amoy Testnet (Polygon)
    amoy: {
      provider: () => new HDWalletProvider(
        process.env.PRIVATE_KEY,
        `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
      ),
      network_id: 80002,
      gas: 5500000,
      gasPrice: 30000000000, // 30 gwei
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    
    // Polygon Mainnet
    polygon: {
      provider: () => new HDWalletProvider(
        process.env.PRIVATE_KEY,
        `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
      ),
      network_id: 137,
      gas: 5500000,
      gasPrice: 30000000000, // 30 gwei
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: "0.6.0",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  plugins: ["truffle-plugin-verify"],
  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY,
    polygonscan: process.env.POLYGONSCAN_API_KEY
  }
}
