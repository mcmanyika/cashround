const RoscaPoolV2 = artifacts.require("RoscaPoolV2");
const PoolFactoryV2 = artifacts.require("PoolFactoryV2");
const Tree = artifacts.require("Tree");

module.exports = async function (deployer, network, accounts) {
  console.log("Deploying upgradeable contracts...");

  // Deploy Tree contract first (if not already deployed)
  console.log("Deploying Tree...");
  await deployer.deploy(Tree);
  const tree = await Tree.deployed();
  console.log("Tree deployed to:", tree.address);

  // Deploy RoscaPool V2
  console.log("Deploying RoscaPoolV2...");
  await deployer.deploy(RoscaPoolV2);
  const roscaPoolV2 = await RoscaPoolV2.deployed();
  console.log("RoscaPoolV2 deployed to:", roscaPoolV2.address);

  // Deploy PoolFactory V2
  console.log("Deploying PoolFactoryV2...");
  await deployer.deploy(PoolFactoryV2, tree.address);
  const poolFactoryV2 = await PoolFactoryV2.deployed();
  console.log("PoolFactoryV2 deployed to:", poolFactoryV2.address);

  // Store addresses for frontend
  const addresses = {
    RoscaPoolV2: roscaPoolV2.address,
    PoolFactoryV2: poolFactoryV2.address,
    Tree: tree.address,
  };

  console.log("Deployed addresses:", addresses);

  // Verify deployment
  console.log("Verifying deployment...");
  
  // Test factory initialization
  const treeContract = await poolFactoryV2.treeContract();
  console.log("Tree contract address:", treeContract);
  
  console.log("Upgradeable contracts deployed successfully!");
};
