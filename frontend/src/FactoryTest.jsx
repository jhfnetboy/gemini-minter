import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const FACTORY_ADDRESSES = {
  simple: "0x9406Cc6185a346906296840746125a0E44976454",
  alchemy: "0x00004EC70002a32400f8ae005A26aeFe730D0A1E"
};

const FACTORY_ABI = [
  "function createAccount(address owner, uint256 salt) returns (address ret)",
  "function getAddress(address owner, uint256 salt) view returns (address)",
  "function accountImplementation() view returns (address)"
];

export default function FactoryTest() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);
    }
  }, []);

  const connectWallet = async () => {
    if (!provider) return;
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      setAccount(accounts[0]);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const testFactory = async (factoryType) => {
    if (!provider || !account) return;
    
    setLoading(true);
    const factoryAddress = FACTORY_ADDRESSES[factoryType];
    const salt = 12345;
    
    try {
      console.log(`\n=== Testing ${factoryType} Factory ===`);
      console.log('Factory Address:', factoryAddress);
      console.log('Owner:', account);
      console.log('Salt:', salt);
      
      const contract = new ethers.Contract(factoryAddress, FACTORY_ABI, provider);
      
      // Test 1: Check if contract exists
      const code = await provider.getCode(factoryAddress);
      console.log('Contract code exists:', code !== '0x');
      
      // Test 2: Try to get account implementation
      try {
        const implementation = await contract.accountImplementation();
        console.log('Implementation address:', implementation);
      } catch (implError) {
        console.error('Cannot get implementation:', implError.message);
      }
      
      // Test 3: Call getAddress
      try {
        const predictedAddress = await contract.getAddress(account, salt);
        console.log('Predicted address:', predictedAddress);
        console.log('Is same as factory?', predictedAddress === factoryAddress);
        
        setResults(prev => ({
          ...prev,
          [factoryType]: {
            factoryAddress,
            predictedAddress,
            isSameAsFactory: predictedAddress === factoryAddress,
            success: true
          }
        }));
        
      } catch (getAddressError) {
        console.error('getAddress failed:', getAddressError);
        setResults(prev => ({
          ...prev,
          [factoryType]: {
            factoryAddress,
            error: getAddressError.message,
            success: false
          }
        }));
      }
      
    } catch (error) {
      console.error(`Factory ${factoryType} test failed:`, error);
      setResults(prev => ({
        ...prev,
        [factoryType]: {
          factoryAddress,
          error: error.message,
          success: false
        }
      }));
    }
    
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Factory Test Page</h2>
      
      {!account ? (
        <button onClick={connectWallet} disabled={!provider}>
          Connect Wallet
        </button>
      ) : (
        <div>
          <p>Connected: {account}</p>
          
          <div style={{ margin: '20px 0' }}>
            <button 
              onClick={() => testFactory('simple')} 
              disabled={loading}
              style={{ margin: '5px' }}
            >
              Test Simple Factory
            </button>
            <button 
              onClick={() => testFactory('alchemy')} 
              disabled={loading}
              style={{ margin: '5px' }}
            >
              Test Alchemy Factory
            </button>
          </div>
          
          <div>
            <h3>Results:</h3>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '5px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}>
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
