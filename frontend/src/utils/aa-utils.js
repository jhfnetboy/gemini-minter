// ERC-4337 Account Abstraction Utilities
// Based on official account-abstraction repository

import { ethers } from 'ethers';
import { getNetworkConfig, getFactoryConfig } from '../config/aa-config.js';

// Simple ABI definitions - we'll use these instead of full contract factories for now
export const SIMPLE_ACCOUNT_FACTORY_ABI = [
  "function createAccount(address owner, uint256 salt) returns (address ret)",
  "function getAddress(address owner, uint256 salt) view returns (address)",
  "function accountImplementation() view returns (address)"
];

export const ENTRYPOINT_ABI = [
  "function getSenderAddress(bytes calldata initCode) view returns (address)",
  "function balanceOf(address account) view returns (uint256)",
  "function depositTo(address account) payable",
  "function withdrawTo(address payable withdrawAddress, uint256 withdrawAmount)"
];

/**
 * Calculate the predicted address of an Account (supports multiple factory types)
 * @param {string} owner - Owner address
 * @param {number} salt - Salt value for CREATE2
 * @param {number} chainId - Network chain ID
 * @param {object} provider - Ethers provider
 * @param {string} factoryType - Factory type ('simple', 'alchemy', etc.)
 * @returns {Promise<string>} Predicted account address
 */
export async function calculateAccountAddress(owner, salt, chainId, provider, factoryType = 'simple') {
  const networkConfig = getNetworkConfig(chainId);
  if (!networkConfig || !networkConfig.isSupported) {
    throw new Error(`Network ${chainId} is not supported`);
  }

  const factoryConfig = getFactoryConfig(chainId, factoryType);
  if (!factoryConfig) {
    throw new Error(`Factory type '${factoryType}' not configured for network ${chainId}`);
  }

  try {
    const factoryContract = new ethers.Contract(
      factoryConfig.address,
      factoryConfig.abi, // 使用工厂特定的ABI
      provider
    );

    const predictedAddress = await factoryContract.getAddress(owner, salt);
    
    console.log('Address calculation:', {
      owner,
      salt,
      factoryType,
      factoryName: factoryConfig.name,
      factoryAddress: factoryConfig.address,
      predicted: predictedAddress,
      network: networkConfig.name
    });

    return predictedAddress;
  } catch (error) {
    console.error('Failed to calculate account address:', error);
    throw new Error(`Address calculation failed: ${error.message}`);
  }
}

/**
 * Check if an account is deployed at the given address
 * @param {string} address - Account address to check
 * @param {object} provider - Ethers provider
 * @returns {Promise<boolean>} True if account is deployed
 */
export async function isAccountDeployed(address, provider) {
  try {
    const code = await provider.getCode(address);
    return code !== '0x';
  } catch (error) {
    console.error('Failed to check account deployment:', error);
    return false;
  }
}

/**
 * Get account information including deployment status and balance
 * @param {string} owner - Owner address
 * @param {number} salt - Salt value
 * @param {number} chainId - Network chain ID  
 * @param {object} provider - Ethers provider
 * @param {string} factoryType - Factory type ('simple', 'alchemy', etc.)
 * @returns {Promise<object>} Account information
 */
export async function getAccountInfo(owner, salt, chainId, provider, factoryType = 'simple') {
  const predictedAddress = await calculateAccountAddress(owner, salt, chainId, provider, factoryType);
  const isDeployed = await isAccountDeployed(predictedAddress, provider);
  const balance = await provider.getBalance(predictedAddress);

  return {
    address: predictedAddress,
    isDeployed,
    balance: ethers.formatEther(balance),
    balanceWei: balance.toString(),
    factoryType
  };
}

/**
 * Get EntryPoint deposit balance for an account
 * @param {string} accountAddress - Account address
 * @param {number} chainId - Network chain ID
 * @param {object} provider - Ethers provider
 * @returns {Promise<string>} Deposit balance in ETH
 */
export async function getEntryPointDeposit(accountAddress, chainId, provider) {
  const networkConfig = getNetworkConfig(chainId);
  if (!networkConfig) {
    throw new Error(`Network ${chainId} not configured`);
  }

  try {
    const entryPointContract = new ethers.Contract(
      networkConfig.entryPoint,
      ENTRYPOINT_ABI,
      provider
    );

    const deposit = await entryPointContract.balanceOf(accountAddress);
    return ethers.formatEther(deposit);
  } catch (error) {
    console.error('Failed to get EntryPoint deposit:', error);
    return '0';
  }
}

/**
 * Validate network and factory configuration
 * @param {number} chainId - Network chain ID
 * @param {string} factoryType - Factory type ('simple', 'alchemy', etc.)
 * @returns {object} Validation result
 */
export function validateNetworkConfig(chainId, factoryType = 'simple') {
  const networkConfig = getNetworkConfig(chainId);
  
  if (!networkConfig) {
    return {
      isValid: false,
      error: `Network ${chainId} not configured`
    };
  }

  if (!networkConfig.isSupported) {
    return {
      isValid: false,
      error: `Network ${networkConfig.name} is not yet supported`
    };
  }

  const factoryConfig = getFactoryConfig(chainId, factoryType);
  if (!factoryConfig) {
    return {
      isValid: false,
      error: `Factory type '${factoryType}' not available on ${networkConfig.name}`
    };
  }

  return {
    isValid: true,
    network: networkConfig,
    factory: factoryConfig
  };
}

/**
 * Generate a random salt value
 * @returns {string} Random 32-byte hex string
 */
export function generateRandomSalt() {
  return ethers.hexlify(ethers.randomBytes(32));
}

/**
 * Normalize salt input to proper format
 * @param {string|number} salt - Salt input
 * @returns {string} Normalized hex string
 */
export function normalizeSalt(salt) {
  if (!salt && salt !== 0) return '0';
  
  // If already hex format, return as is
  if (typeof salt === 'string' && salt.startsWith('0x')) {
    return salt;
  }
  
  // Convert number to hex
  try {
    const num = BigInt(salt);
    return '0x' + num.toString(16).padStart(64, '0');
  } catch (error) {
    console.warn('Invalid salt value:', salt);
    return '0';
  }
}

/**
 * Format address for display (shortened)
 * @param {string} address - Full address
 * @param {number} start - Characters to show at start
 * @param {number} end - Characters to show at end
 * @returns {string} Formatted address
 */
export function formatAddress(address, start = 6, end = 4) {
  if (!address) return '';
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * Get block explorer URL for an address
 * @param {string} address - Address to view
 * @param {number} chainId - Network chain ID
 * @returns {string} Block explorer URL
 */
export function getExplorerUrl(address, chainId) {
  const networkConfig = getNetworkConfig(chainId);
  if (!networkConfig) return '#';
  return `${networkConfig.blockExplorer}/address/${address}`;
}

/**
 * Get all available factories for a network
 * @param {number} chainId - Network chain ID
 * @returns {Array} Array of factory configurations
 */
export function getAvailableFactories(chainId) {
  const networkConfig = getNetworkConfig(chainId);
  if (!networkConfig || !networkConfig.factories) {
    return [];
  }
  
  return Object.entries(networkConfig.factories).map(([key, factory]) => ({
    key,
    ...factory
  }));
}

/**
 * Compare addresses generated by different factories for the same owner/salt
 * @param {string} owner - Owner address
 * @param {number} salt - Salt value
 * @param {number} chainId - Network chain ID
 * @param {object} provider - Ethers provider
 * @returns {Promise<Array>} Array of address comparisons
 */
export async function compareFactoryAddresses(owner, salt, chainId, provider) {
  const factories = getAvailableFactories(chainId);
  const results = [];
  
  for (const factory of factories) {
    try {
      const address = await calculateAccountAddress(owner, salt, chainId, provider, factory.key);
      results.push({
        factoryType: factory.key,
        factoryName: factory.name,
        address,
        success: true
      });
    } catch (error) {
      results.push({
        factoryType: factory.key,
        factoryName: factory.name,
        address: null,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}
