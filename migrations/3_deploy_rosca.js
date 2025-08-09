const PoolFactory = artifacts.require("PoolFactory");
const Tree = artifacts.require("Tree");

module.exports = async function (deployer, network, accounts) {
  // Fetch existing Tree or deploy one if needed
  let treeInstance;
  try {
    treeInstance = await Tree.deployed();
  } catch (e) {
    // If not deployed in this environment, deploy a new Tree
    await deployer.deploy(Tree);
    treeInstance = await Tree.deployed();
  }

  await deployer.deploy(PoolFactory, treeInstance.address);
};


