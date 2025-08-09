const PoolFactory = artifacts.require("PoolFactory");

module.exports = async function (deployer) {
  await deployer.deploy(PoolFactory);
};


