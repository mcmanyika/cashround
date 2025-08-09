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

export const getAccounts = async (web3) => {
  const accounts = await web3.eth.requestAccounts();
  return accounts;
};

export const getFactory = (web3, factoryAddress) => {
  return new web3.eth.Contract(PoolFactoryAbi.abi, factoryAddress);
};

export const getRoscaPool = (web3, poolAddress) => {
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


