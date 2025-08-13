import Web3 from 'web3';
import PoolFactoryAbi from '../../abis/PoolFactory.json';
import RoscaPoolAbi from '../../abis/RoscaPool.json';
import IERC20Abi from '../../abis/IERC20.json';
import TreeAbi from '../../abis/Tree.json';

export const getWeb3 = async () => {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  const web3 = new Web3(window.ethereum);
  return web3;
};

// Prefer thirdweb wallet when available (supports in-app wallets that do not inject window.ethereum)
export const getWeb3FromThirdwebWallet = async (wallet) => {
  try {
    if (!wallet) return null;
    if (typeof wallet.getEthereumProvider === 'function') {
      const provider = await wallet.getEthereumProvider();
      return new Web3(provider);
    }
    // Fallback: no compatible provider method
    return null;
  } catch {
    return null;
  }
};

export const getAccounts = async (web3) => {
  const accounts = await web3.eth.requestAccounts();
  return accounts;
};

export const getFactory = (web3, factoryAddress) => {
  return new web3.eth.Contract(PoolFactoryAbi.abi, factoryAddress);
};

export const getMukandoPool = (web3, poolAddress) => {
  return new web3.eth.Contract(RoscaPoolAbi.abi, poolAddress);
};

export const getErc20 = (web3, tokenAddress) => {
  return new web3.eth.Contract(IERC20Abi.abi, tokenAddress);
};

export const getTree = async (web3) => {
  const netId = await web3.eth.net.getId();
  const networkData = TreeAbi.networks?.[netId];
  if (!networkData || !networkData.address) return null;
  return new web3.eth.Contract(TreeAbi.abi, networkData.address);
};

export const isTreeOwner = async (web3, account) => {
  try {
    const tree = await getTree(web3);
    if (!tree || !account) return false;
    const top = await tree.methods.top().call();
    return top.toLowerCase() === account.toLowerCase();
  } catch {
    return false;
  }
};

export const hasTwoLevelDownline = async (web3, account) => {
  try {
    const tree = await getTree(web3);
    if (!tree || !account) return false;
    const eligible = await tree.methods.hasTwoLevelDownline(account).call();
    return Boolean(eligible);
  } catch {
    return false;
  }
};

export const isTreeMember = async (web3, account) => {
  try {
    const tree = await getTree(web3);
    if (!tree || !account) return false;
    const data = await tree.methods.tree(account).call();
    const zero = '0x0000000000000000000000000000000000000000';
    return data.inviter && data.inviter !== zero;
  } catch {
    return false;
  }
};


