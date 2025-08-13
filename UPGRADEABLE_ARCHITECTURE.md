# Upgradeable Smart Contract Architecture

## Overview

All smart contracts in this ROSCA (Rotating Savings and Credit Association) system are now upgradeable using OpenZeppelin's upgradeable pattern. This allows for:

- **Bug fixes** without losing state
- **Feature additions** without migration
- **Security patches** when vulnerabilities are discovered
- **Business logic updates** as requirements evolve

## Architecture Components

### 1. RoscaPoolUpgradeable

- **Purpose**: Manages individual ROSCA pools
- **Upgradeable**: Yes, using UUPS (Universal Upgradeable Proxy Standard)
- **Key Features**:
  - Pool creation and management
  - Contribution tracking
  - Payout distribution
  - Round progression
  - Admin functions for parameter updates

### 2. PoolFactoryUpgradeable

- **Purpose**: Factory for creating new ROSCA pools
- **Upgradeable**: Yes, using UUPS
- **Key Features**:
  - Pool creation with validation
  - Eligibility checking
  - Pool registry management

### 3. Tree Contract

- **Purpose**: Manages referral tree structure
- **Upgradeable**: Can be made upgradeable if needed
- **Key Features**:
  - Referral tracking
  - Downline management
  - Eligibility verification

## Upgrade Process

### 1. Development

```bash
# Install dependencies
npm install @openzeppelin/contracts-upgradeable @openzeppelin/hardhat-upgrades

# Compile contracts
npx hardhat compile

# Deploy upgradeable contracts
npx hardhat run migrations/4_deploy_upgradeable_contracts.js --network <network>
```

### 2. Upgrading Contracts

#### For RoscaPool:

```javascript
// 1. Deploy new implementation
const RoscaPoolV2 = await ethers.getContractFactory("RoscaPoolUpgradeableV2");
const newImplementation = await RoscaPoolV2.deploy();

// 2. Upgrade existing pools
const pool = await ethers.getContractAt("RoscaPoolUpgradeable", poolAddress);
await pool.upgradeTo(newImplementation.address);
```

#### For PoolFactory:

```javascript
// 1. Deploy new implementation
const PoolFactoryV2 = await ethers.getContractFactory(
  "PoolFactoryUpgradeableV2"
);

// 2. Upgrade using OpenZeppelin upgrades
await upgrades.upgradeProxy(factoryAddress, PoolFactoryV2);
```

## Security Considerations

### 1. Access Control

- All upgradeable contracts use `OwnableUpgradeable`
- Only contract owners can perform upgrades
- Consider multi-signature wallets for production

### 2. Storage Layout

- **Critical**: Never change storage layout between versions
- Add new storage variables at the end
- Never remove or reorder existing storage variables

### 3. Initialization

- Use `initializer` modifier for initialization functions
- Prevent re-initialization attacks
- Set `initialized` flag in upgradeable contracts

### 4. Proxy Patterns

- **UUPS**: More gas efficient, requires `_authorizeUpgrade` function
- **Transparent**: Simpler but more gas expensive
- **Beacon**: For multiple instances of same contract

## Best Practices

### 1. Testing

```javascript
// Test upgrades
describe("Upgradeable Contracts", () => {
  it("should upgrade successfully", async () => {
    // Deploy initial version
    const contractV1 = await upgrades.deployProxy(ContractV1, []);

    // Upgrade to new version
    const contractV2 = await upgrades.upgradeProxy(
      contractV1.address,
      ContractV2
    );

    // Verify functionality
    expect(await contractV2.newFunction()).to.equal(expectedValue);
  });
});
```

### 2. Deployment Scripts

- Use OpenZeppelin's `upgrades.deployProxy()`
- Store implementation addresses
- Verify deployments on block explorers

### 3. Monitoring

- Monitor upgrade events
- Track implementation changes
- Alert on unauthorized upgrade attempts

## Migration Strategy

### Phase 1: Deploy Upgradeable Contracts

1. Deploy new upgradeable contracts
2. Test thoroughly on testnet
3. Deploy to mainnet

### Phase 2: Migrate Existing Data (if needed)

1. Create migration contracts
2. Transfer state from old contracts
3. Update frontend to use new addresses

### Phase 3: Deprecate Old Contracts

1. Disable old contract functions
2. Redirect all traffic to new contracts
3. Monitor for any issues

## Emergency Procedures

### 1. Pause Functionality

```javascript
// Add pause functionality to contracts
function emergencyPause() external onlyOwner {
    _pause();
}
```

### 2. Emergency Upgrades

- Keep emergency upgrade scripts ready
- Test emergency procedures regularly
- Have rollback procedures in place

### 3. Multi-sig Governance

- Use multi-signature wallets for upgrades
- Require multiple approvals for changes
- Implement timelock for major changes

## Benefits of Upgradeable Architecture

1. **Flexibility**: Adapt to changing requirements
2. **Security**: Fix vulnerabilities quickly
3. **User Experience**: No need for user migration
4. **Cost Efficiency**: Avoid redeployment costs
5. **Risk Mitigation**: Rollback capability

## Risks and Mitigation

1. **Upgrade Complexity**: Thorough testing required
2. **Storage Collisions**: Careful storage management
3. **Admin Privileges**: Secure access control
4. **Gas Costs**: Higher deployment costs initially

## Conclusion

The upgradeable architecture provides the flexibility needed for a production ROSCA system while maintaining security and user experience. Regular testing and monitoring are essential for successful operation.
