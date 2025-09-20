// ERC-4337 Account Abstraction Configuration
// Separate from main config to avoid conflicts

export const AA_NETWORKS = {
  // Sepolia Testnet
  11155111: {
    chainId: 11155111,
    name: "Sepolia",
    shortName: "sepolia",
    rpcUrl: "https://rpc.sepolia.org",
    blockExplorer: "https://sepolia.etherscan.io",
    entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", // EntryPoint v0.6
    factories: {
      simple: {
        name: "SimpleAccountFactory",
        address: "0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985",
        type: "simple",
        version: "v0.6",
        description: "Official ERC-4337 SimpleAccount implementation",
        abi: [
          "function createAccount(address owner, uint256 salt) returns (address ret)",
          "function getAddress(address owner, uint256 salt) view returns (address)",
          "function accountImplementation() view returns (address)"
        ]
      },
      alchemy: {
        name: "Alchemy LightAccountFactory", 
        address: "0x0000000000400CdFef5E2714E63d8040b700BC24",
        type: "alchemy",
        version: "v1.1.0",
        description: "Alchemy's gas-optimized LightAccount implementation",
        abi: [
          "function createAccount(address owner, uint256 salt) returns (address)",
          "function getAddress(address owner, uint256 salt) view returns (address)",
          "function accountImplementation() view returns (address)"
        ]
      }
    },
    isSupported: true
  },
  
  // OP Sepolia
  11155420: {
    chainId: 11155420,
    name: "OP Sepolia",
    shortName: "op-sepolia", 
    rpcUrl: "https://sepolia.optimism.io",
    blockExplorer: "https://sepolia-optimism.etherscan.io",
    entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    factories: {
      simple: {
        name: "SimpleAccountFactory",
        address: "0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985", // Need to verify
        type: "simple", 
        version: "v0.6",
        description: "Official ERC-4337 SimpleAccount implementation",
        abi: [
          "function createAccount(address owner, uint256 salt) returns (address ret)",
          "function getAddress(address owner, uint256 salt) view returns (address)",
          "function accountImplementation() view returns (address)"
        ]
      },
      alchemy: {
        name: "Alchemy LightAccountFactory",
        address: "0x0000000000400CdFef5E2714E63d8040b700BC24", // Need to verify
        type: "alchemy",
        version: "v1.1.0",
        description: "Alchemy's gas-optimized LightAccount implementation",
        abi: [
          "function createAccount(address owner, uint256 salt) returns (address)",
          "function getAddress(address owner, uint256 salt) view returns (address)",
          "function accountImplementation() view returns (address)"
        ]
      }
    },
    isSupported: true // Will verify during implementation
  },
  
  // Optimism Mainnet
  10: {
    chainId: 10,
    name: "Optimism",
    shortName: "optimism",
    rpcUrl: "https://mainnet.optimism.io", 
    blockExplorer: "https://optimistic.etherscan.io",
    entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    factories: {
      simple: {
        name: "SimpleAccountFactory", 
        address: "0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985", // Need to verify
        type: "simple",
        version: "v0.6",
        description: "Official ERC-4337 SimpleAccount implementation",
        abi: [
          "function createAccount(address owner, uint256 salt) returns (address ret)",
          "function getAddress(address owner, uint256 salt) view returns (address)",
          "function accountImplementation() view returns (address)"
        ]
      },
      alchemy: {
        name: "Alchemy LightAccountFactory",
        address: "0x0000000000400CdFef5E2714E63d8040b700BC24", // Need to verify
        type: "alchemy",
        version: "v1.1.0",
        description: "Alchemy's gas-optimized LightAccount implementation",
        abi: [
          "function createAccount(address owner, uint256 salt) returns (address)",
          "function getAddress(address owner, uint256 salt) view returns (address)",
          "function accountImplementation() view returns (address)"
        ]
      }
    },
    isSupported: false // Will enable after verification
  },
  
  // Ethereum Mainnet
  1: {
    chainId: 1,
    name: "Ethereum",
    shortName: "mainnet",
    rpcUrl: "https://eth.llamarpc.com",
    blockExplorer: "https://etherscan.io", 
    entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    factories: {
      simple: {
        name: "SimpleAccountFactory",
        address: "0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985", // Need to verify
        type: "simple",
        version: "v0.6",
        description: "Official ERC-4337 SimpleAccount implementation",
        abi: [
          "function createAccount(address owner, uint256 salt) returns (address ret)",
          "function getAddress(address owner, uint256 salt) view returns (address)",
          "function accountImplementation() view returns (address)"
        ]
      },
      alchemy: {
        name: "Alchemy LightAccountFactory",
        address: "0x0000000000400CdFef5E2714E63d8040b700BC24", // Need to verify
        type: "alchemy",
        version: "v1.1.0",
        description: "Alchemy's gas-optimized LightAccount implementation",
        abi: [
          "function createAccount(address owner, uint256 salt) returns (address)",
          "function getAddress(address owner, uint256 salt) view returns (address)",
          "function accountImplementation() view returns (address)"
        ]
      }
    },
    isSupported: false // Will enable after verification
  }
};

// Default factory type preference
export const DEFAULT_FACTORY_TYPE = 'simple';

// EntryPoint version info
export const ENTRYPOINT_INFO = {
  version: "v0.6.0",
  address: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
  description: "Official EntryPoint v0.6 - CREATE2 deployed on all networks"
};

// Utility functions
export function getNetworkConfig(chainId) {
  return AA_NETWORKS[chainId];
}

export function getSupportedNetworks() {
  return Object.values(AA_NETWORKS).filter(network => network.isSupported);
}

export function getFactoryConfig(chainId, factoryType = DEFAULT_FACTORY_TYPE) {
  const network = getNetworkConfig(chainId);
  return network?.factories?.[factoryType];
}

export function isNetworkSupported(chainId) {
  const network = getNetworkConfig(chainId);
  return network?.isSupported || false;
}
