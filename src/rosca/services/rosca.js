import Web3 from 'web3';
import PoolFactoryAbi from '../../abis/PoolFactory.json';
import RoscaPoolAbi from '../../abis/RoscaPool.json';
import IERC20Abi from '../../abis/IERC20.json';
import TreeAbi from '../../abis/Tree.json';
import { createPOLService } from './polService';
import { getPOLTokenAddress } from '../../config/contractAddress';

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

export const getMukandoPoolPOL = (web3, poolAddress) => {
  return new web3.eth.Contract(RoscaPoolAbi.abi, poolAddress); // Using same ABI for now
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

// POL-related functions
export const getPOLService = async (web3) => {
  try {
    const networkId = await web3.eth.net.getId();
    return createPOLService(web3, networkId);
  } catch (error) {
    console.error('Error creating POL service:', error);
    return null;
  }
};

export const getPOLBalance = async (web3, account) => {
  try {
    const polService = await getPOLService(web3);
    if (!polService) return '0';
    return await polService.getBalance(account);
  } catch (error) {
    console.error('Error getting POL balance:', error);
    return '0';
  }
};

export const approvePOL = async (web3, spenderAddress, amount, fromAddress) => {
  try {
    const polService = await getPOLService(web3);
    if (!polService) throw new Error('POL service not available');
    return await polService.approve(spenderAddress, amount, fromAddress);
  } catch (error) {
    console.error('Error approving POL:', error);
    throw error;
  }
};

export const contributePOL = async (web3, poolAddress, amount, fromAddress) => {
  try {
    const pool = getMukandoPoolPOL(web3, poolAddress);
    const result = await pool.methods.contribute().send({ from: fromAddress });
    return result;
  } catch (error) {
    console.error('Error contributing POL:', error);
    throw error;
  }
};


