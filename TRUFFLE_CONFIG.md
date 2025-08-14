# 🚀 Testnet Deployment Guide

## **📋 Prerequisites**

### **1. Install Dependencies**

```bash
npm install @truffle/hdwallet-provider dotenv
```

### **2. Environment Setup**

Create a `.env` file in your project root:

```bash
PRIVATE_KEY=your_private_key_here
ALCHEMY_API_KEY=your_alchemy_api_key_here
INFURA_API_KEY=your_infura_api_key_here
```

### **3. Get Testnet Tokens**

- **Goerli ETH**: https://goerlifaucet.com/
- **Sepolia ETH**: https://sepoliafaucet.com/
- **Amoy MATIC**: https://faucet.polygon.technology/

## **⚙️ Truffle Configuration**

### **Update `truffle-config.js`:**

```javascript
require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    // Local development
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },

    // Goerli Testnet
    goerli: {
      provider: () =>
        new HDWalletProvider(
          process.env.PRIVATE_KEY,
          `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
        ),
      network_id: 5,
      gas: 5500000,
      gasPrice: 20000000000, // 20 gwei
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },

    // Sepolia Testnet
    sepolia: {
      provider: () =>
        new HDWalletProvider(
          process.env.PRIVATE_KEY,
          `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
        ),
      network_id: 11155111,
      gas: 5500000,
      gasPrice: 20000000000, // 20 gwei
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },

    // Amoy Testnet (Polygon)
    amoy: {
      provider: () =>
        new HDWalletProvider(
          process.env.PRIVATE_KEY,
          `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
        ),
      network_id: 80002,
      gas: 5500000,
      gasPrice: 30000000000, // 30 gwei
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },

    // Polygon Mainnet
    polygon: {
      provider: () =>
        new HDWalletProvider(
          process.env.PRIVATE_KEY,
          `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
        ),
      network_id: 137,
      gas: 5500000,
      gasPrice: 30000000000, // 30 gwei
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },

  compilers: {
    solc: {
      version: "0.8.0",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};
```

## **🚀 Deployment Commands**

### **Deploy to Goerli:**

```bash
truffle migrate --network goerli
```

### **Deploy to Sepolia:**

```bash
truffle migrate --network sepolia
```

### **Deploy to Amoy (Polygon Testnet):**

```bash
truffle migrate --network amoy
```

### **Deploy to Polygon Mainnet:**

```bash
truffle migrate --network polygon
```

### **Deploy specific migration:**

```bash
truffle migrate --network amoy --f 2
```

## **📊 Network Information**

| Network     | Chain ID | RPC URL                                            | Explorer                     | Faucet                             |
| ----------- | -------- | -------------------------------------------------- | ---------------------------- | ---------------------------------- |
| **Goerli**  | 5        | `https://eth-goerli.g.alchemy.com/v2/API_KEY`      | https://goerli.etherscan.io  | https://goerlifaucet.com/          |
| **Sepolia** | 11155111 | `https://eth-sepolia.g.alchemy.com/v2/API_KEY`     | https://sepolia.etherscan.io | https://sepoliafaucet.com/         |
| **Amoy**    | 80002    | `https://polygon-amoy.g.alchemy.com/v2/API_KEY`    | https://amoy.polygonscan.com | https://faucet.polygon.technology/ |
| **Polygon** | 137      | `https://polygon-mainnet.g.alchemy.com/v2/API_KEY` | https://polygonscan.com      | N/A                                |

## **🔧 Update Contract Addresses**

After deployment, update `src/config/contractAddresses.js`:

```javascript
const CONTRACT_ADDRESS = {
  1: "YOUR_MAINNET_ADDRESS", // Ethereum Mainnet
  5: "DEPLOYED_GOERLI_ADDRESS", // Goerli Testnet
  11155111: "DEPLOYED_SEPOLIA_ADDRESS", // Sepolia Testnet
  137: "DEPLOYED_POLYGON_ADDRESS", // Polygon Mainnet
  80002: "DEPLOYED_AMOY_ADDRESS", // Amoy Testnet
  5777: "0xE20677F28c03F92Ff84C76BC8AF419a6e2D9D6e3", // Local Ganache
};

export default CONTRACT_ADDRESS;
```

## **🔍 Verification**

### **Verify on Etherscan/Polygonscan:**

```bash
# Goerli
truffle run verify --network goerli

# Sepolia
truffle run verify --network sepolia

# Amoy
truffle run verify --network amoy

# Polygon
truffle run verify --network polygon
```

### **Install Truffle Verify Plugin:**

```bash
npm install truffle-plugin-verify
```

Add to `truffle-config.js`:

```javascript
plugins: ['truffle-plugin-verify'],
api_keys: {
  etherscan: 'YOUR_ETHERSCAN_API_KEY',
  polygonscan: 'YOUR_POLYGONSCAN_API_KEY'
}
```

## **💰 Gas Cost Comparison**

| Network              | Registration   | Referrer Payment | Total     |
| -------------------- | -------------- | ---------------- | --------- |
| **Ethereum Mainnet** | ~$50-100       | ~$200-500        | ~$250-600 |
| **Goerli**           | Free (testnet) | Free (testnet)   | Free      |
| **Sepolia**          | Free (testnet) | Free (testnet)   | Free      |
| **Amoy**             | ~$0.001        | ~$0.005          | ~$0.006   |
| **Polygon**          | ~$0.01         | ~$0.05           | ~$0.06    |

## **🎯 Testing Strategy**

### **1. Local Testing (Ganache)**

- Test all functionality locally
- Verify smart contract logic
- Debug any issues

### **2. Testnet Testing**

- **Goerli/Sepolia**: Test Ethereum functionality
- **Amoy**: Test Polygon functionality
- Verify gas costs and transaction speeds

### **3. Mainnet Deployment**

- Deploy to Polygon mainnet
- Monitor transactions and costs
- Gather user feedback

## **🚀 Quick Start**

### **1. Setup Environment:**

```bash
npm install @truffle/hdwallet-provider dotenv
```

### **2. Configure Truffle:**

Update `truffle-config.js` with testnet configurations

### **3. Get Test Tokens:**

- Goerli: https://goerlifaucet.com/
- Sepolia: https://sepoliafaucet.com/
- Amoy: https://faucet.polygon.technology/

### **4. Deploy:**

```bash
# Test on Amoy first
truffle migrate --network amoy

# Then Goerli
truffle migrate --network goerli

# Finally Polygon mainnet
truffle migrate --network polygon
```

### **5. Update App:**

- Add deployed addresses to config
- Test with users on testnets
- Monitor performance and costs

## **🔧 Troubleshooting**

### **Common Issues:**

1. **Insufficient Gas:**

   - Get more test tokens from faucets
   - Check gas price settings

2. **Network Connection:**

   - Verify RPC URLs
   - Check API keys

3. **Contract Verification:**

   - Ensure compiler version matches
   - Check constructor arguments

4. **MetaMask Network:**
   - Add testnet networks to MetaMask
   - Import test tokens

This setup gives you a complete testnet deployment pipeline for your Mukando dApp! 🚀
