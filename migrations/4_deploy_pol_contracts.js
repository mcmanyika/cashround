const PoolFactoryPOL = artifacts.require("PoolFactoryPOL");
const RoscaPoolPOL = artifacts.require("RoscaPoolPOL");
const Tree = artifacts.require("Tree");

module.exports = async function (deployer, network, accounts) {
  // Skip POL contract deployment for now - use ETH fallback on local development
  console.log("⏭️  Skipping POL contract deployment - using ETH fallback for local development");
  console.log("💡 The app will automatically use ETH on Ganache and POL on production networks");
  return;
  
  // Original POL deployment code (commented out for now)
  /*
  // POL token address - this should be updated based on the network
  const POL_TOKEN_ADDRESS = {
    137: "0x455e53CBB86018Ac2B8092FdCd39b8443aA31FE6", // Polygon Mainnet POL
    80002: "0x0000000000000000000000000000000000000000", // Amoy Testnet (placeholder)
    1337: "0x0000000000000000000000000000000000000000", // Local development (placeholder)
    5777: "0x0000000000000000000000000000000000000000"  // Local development (placeholder)
  };

  // Get network ID
  const networkId = await web3.eth.net.getId();
  const polTokenAddress = POL_TOKEN_ADDRESS[networkId] || POL_TOKEN_ADDRESS[137];

  console.log(`Deploying POL contracts on network ${networkId} with POL token address: ${polTokenAddress}`);

  // Fetch existing Tree or deploy one if needed
  let treeInstance;
  try {
    treeInstance = await Tree.deployed();
    console.log(`Using existing Tree contract at: ${treeInstance.address}`);
  } catch (e) {
    // If not deployed in this environment, deploy a new Tree
    console.log("Deploying new Tree contract...");
    await deployer.deploy(Tree);
    treeInstance = await Tree.deployed();
    console.log(`Tree deployed at: ${treeInstance.address}`);
  }

  // Deploy POL-enabled PoolFactory
  console.log("Deploying PoolFactoryPOL...");
  await deployer.deploy(PoolFactoryPOL, treeInstance.address, polTokenAddress);
  const poolFactoryPOL = await PoolFactoryPOL.deployed();
  console.log(`PoolFactoryPOL deployed at: ${poolFactoryPOL.address}`);

  console.log("POL contracts deployment completed!");
  console.log("Update your environment variables with the new factory address:");
  console.log(`NEXT_PUBLIC_POOL_FACTORY_ADDRESS=${poolFactoryPOL.address}`);
  */
};
