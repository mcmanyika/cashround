// Mock POL Token deployment disabled - using ETH fallback for local development
module.exports = async function(deployer, network, accounts) {
  console.log("⏭️  Mock POL Token deployment disabled");
  console.log("💡 Using ETH fallback for local development - no POL token needed");
  return;
};
