import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { config } from './config';
import './App.css';

const backendUrl = 'http://localhost:3001';

function App() {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [mintType, setMintType] = useState('nft');
    const [nfts, setNfts] = useState([]);
    const [sbts, setSbts] = useState([]);

    const [pntsBalance, setPntsBalance] = useState('0');
    const [pntsAmount, setPntsAmount] = useState('100');
    
    // Owner mode states
    const [isOwner, setIsOwner] = useState(false);
    const [mintMode, setMintMode] = useState('self'); // 'self' or 'distribute'
    const [recipientAddress, setRecipientAddress] = useState('');
    const [displayAddress, setDisplayAddress] = useState(null); // For showing balances

    const connectWallet = async () => {
        if (typeof window.ethereum === 'undefined') {
            return setError('MetaMask is not installed!');
        }
        try {
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            setProvider(web3Provider);
            const network = await web3Provider.getNetwork();
            console.log('Connected to network:', network.name);
            const accounts = await web3Provider.send('eth_requestAccounts', []);
            const connectedAccount = accounts[0];
            setAccount(connectedAccount);
            
            // Check if connected account is owner
            const isOwnerAccount = connectedAccount.toLowerCase() === config.OWNER_ADDRESS.toLowerCase();
            setIsOwner(isOwnerAccount);
            
            // Set display address based on mode
            setDisplayAddress(connectedAccount);
            
            console.log('Wallet connected, account:', connectedAccount);
            console.log('Is owner:', isOwnerAccount);
        } catch (err) {
            setError('Failed to connect wallet.');
            console.error(err);
        }
    };

    const fetchNfts = async (type, setter, retries = 3) => {
        if (!displayAddress || !provider) return;
        const address = config.addresses[type];
        const abi = config.abis[type];
        console.log(`Fetching ${type}s from contract:`, address);
        if (!ethers.isAddress(address) || address.includes("YOUR")) return;

        try {
            const contract = new ethers.Contract(address, abi, provider);
            const balance = await contract.balanceOf(displayAddress);
            console.log(`${type} balance:`, balance.toString());

            if (balance.toString() === '0' && retries > 0) {
                console.log(`Retrying to fetch ${type}s, ${retries} retries left...`);
                setTimeout(() => fetchNfts(type, setter, retries - 1), 2000);
                return;
            }

            // For basic ERC721 contracts without enumerable extension
            // We'll show the balance count but can't list individual tokens
            // since the contract doesn't have tokenOfOwnerByIndex
            const items = [];
            const balanceNum = parseInt(balance.toString());
            
            // Create placeholder items based on balance
            for (let i = 0; i < balanceNum; i++) {
                items.push({ 
                    tokenId: `${i}`, // This is a placeholder, actual token IDs may be different
                    placeholder: true 
                });
            }
            
            console.log(`Found ${items.length} ${type}s, updating state.`);
            setter(items);
        } catch (err) {
            console.error(`Failed to fetch ${type}s:`, err);
            setError(`Failed to fetch ${type.toUpperCase()}s. See console for details.`);
        }
    };

    const fetchPntsBalance = async (retries = 3) => {
        if (!displayAddress || !provider) return;
        const address = config.addresses.pnts;
        const abi = config.abis.pnts;
        console.log('Fetching PNTs balance from contract:', address);
        if (!ethers.isAddress(address) || address.includes("YOUR")) return;

        try {
            const contract = new ethers.Contract(address, abi, provider);
            const balance = await contract.balanceOf(displayAddress);
            console.log('PNTs balance from contract:', balance.toString());

            if (balance.toString() === '0' && retries > 0) {
                console.log(`Retrying to fetch PNTs balance, ${retries} retries left...`);
                setTimeout(() => fetchPntsBalance(retries - 1), 2000);
                return;
            }

            setPntsBalance(ethers.formatUnits(balance, 18));
        } catch (err) {
            console.error('Failed to fetch PNTs balance:', err);
            setError('Failed to fetch PNTs balance. See console for details.');
        }
    };

    const handleMint = async (isPNTs = false) => {
        if (!account || !provider) return setError('Please connect your wallet first.');
        
        // Determine target address
        let targetAddress = account;
        if (isOwner && mintMode === 'distribute') {
            if (!recipientAddress || !ethers.isAddress(recipientAddress)) {
                return setError('Please enter a valid recipient address.');
            }
            targetAddress = recipientAddress;
        }
        
        let endpoint = '';
        let body = {};
        let successMessage = '';
        let fetchFunction = null;

        if (isPNTs) {
            if (!pntsAmount || parseFloat(pntsAmount) <= 0) {
                return setError('Please enter a valid amount.');
            }
            endpoint = '/mintPNTs';
            body = { userAddress: targetAddress, amount: pntsAmount };
            successMessage = `${pntsAmount} PNTs minted to ${targetAddress === account ? 'you' : targetAddress.substring(0, 6) + '...'}`;
            fetchFunction = fetchPntsBalance;
        } else {
            endpoint = mintType === 'nft' ? '/mintNFT' : '/mintSBT';
            body = { userAddress: targetAddress };
            successMessage = `${mintType.toUpperCase()} minted to ${targetAddress === account ? 'you' : targetAddress.substring(0, 6) + '...'}`;
            fetchFunction = () => fetchNfts(mintType, mintType === 'nft' ? setNfts : setSbts);
        }

        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch(`${backendUrl}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.details || 'Minting failed.');
            
            const { txHash } = data;
            setMessage(`Transaction sent! Hash: ${txHash.substring(0,10)}... Waiting for confirmation...`);

            const receipt = await provider.waitForTransaction(txHash, 1);

            if (receipt.status === 0) {
                throw new Error(`Transaction failed. Tx: ${txHash}`);
            }

            setMessage(`Success! ${successMessage}. Tx: ${txHash.substring(0,10)}...`);
            console.log('Transaction successful, preparing to refresh data...');
            setTimeout(() => {
                console.log('Refreshing data now.');
                fetchFunction();
            }, 1000);

        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddressCheck = async () => {
        if (!recipientAddress || !ethers.isAddress(recipientAddress)) {
            setError('Please enter a valid Ethereum address.');
            return;
        }
        setDisplayAddress(recipientAddress);
        setMessage(`Now viewing balances for: ${recipientAddress.substring(0, 6)}...`);
    };

    const switchToSelfView = () => {
        setDisplayAddress(account);
        setRecipientAddress('');
        setMessage('Switched back to your own balances.');
    };

    useEffect(() => {
        if (displayAddress && provider) {
            console.log('useEffect triggered, fetching data for address:', displayAddress);
            fetchNfts('nft', setNfts);
            fetchNfts('sbt', setSbts);
            fetchPntsBalance();
        }
    }, [displayAddress, provider]);

    return (
        <div className="App">
            <header className="App-header">
                <div>
                    <h1>🚀 Gemini Minter DApp</h1>
                    <div className="header-right">
                        {account ? (
                            <div className="account-info">
                                <p>Connected: <span className="address">{`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}</span></p>
                                {isOwner && <span className="owner-badge">👑 Owner</span>}
                            </div>
                        ) : (
                            <button onClick={connectWallet} className="connect-btn">Connect Wallet</button>
                        )}
                    </div>
                </div>
            </header>

            <div className="container">
                <div className="minting-column">
                    {message && <div className="message-banner">{message}</div>}
                    {error && <div className="error-banner">{error}</div>}

                    {/* Owner Mode Selector */}
                    {isOwner && (
                        <div className="card owner-card">
                            <h3>🎯 Minting Mode</h3>
                            <div className="mode-selector">
                                <label className={mintMode === 'self' ? 'active' : ''}>
                                    <input 
                                        type="radio" 
                                        value="self" 
                                        checked={mintMode === 'self'}
                                        onChange={() => {
                                            setMintMode('self');
                                            setDisplayAddress(account);
                                            setRecipientAddress('');
                                        }}
                                    />
                                    <span>Mint to Myself</span>
                                </label>
                                <label className={mintMode === 'distribute' ? 'active' : ''}>
                                    <input 
                                        type="radio" 
                                        value="distribute" 
                                        checked={mintMode === 'distribute'}
                                        onChange={() => setMintMode('distribute')}
                                    />
                                    <span>Distribute to Others</span>
                                </label>
                            </div>
                            
                            {mintMode === 'distribute' && (
                                <div className="recipient-input">
                                    <input
                                        type="text"
                                        value={recipientAddress}
                                        onChange={(e) => setRecipientAddress(e.target.value)}
                                        placeholder="Enter recipient address (0x...)"
                                        className="address-input"
                                    />
                                    <div className="button-group">
                                        <button onClick={handleAddressCheck} className="check-btn">
                                            Check Balance
                                        </button>
                                        {displayAddress !== account && (
                                            <button onClick={switchToSelfView} className="switch-btn">
                                                Back to My View
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="card">
                        <h3>💰 Mint ERC20 Tokens (PNTs)</h3>
                        <p className="balance-display">
                            {displayAddress === account ? 'Your' : `${displayAddress?.substring(0, 6)}...'s`} Balance: 
                            <strong className="balance-value">{pntsBalance} PNTs</strong>
                        </p>
                        <div className="mint-form">
                            <input 
                                type="number"
                                value={pntsAmount}
                                onChange={(e) => setPntsAmount(e.target.value)}
                                placeholder="Amount of PNTs"
                            />
                            <button onClick={() => handleMint(true)} disabled={loading || !account}>
                                {loading ? 'Minting...' : 
                                 isOwner && mintMode === 'distribute' ? `Send PNTs` : 'Get Free PNTs'}
                            </button>
                        </div>
                    </div>

                    <div className="card">
                        <h3>🎨 Mint NFT / SBT</h3>
                        <p className="subtitle">Choose the type of token to mint</p>
                        <div className="mint-options">
                            <label className={mintType === 'nft' ? 'token-option active' : 'token-option'}>
                                <input type="radio" value="nft" checked={mintType === 'nft'} onChange={() => setMintType('nft')} />
                                <div className="option-content">
                                    <span className="option-title">🖼️ Regular NFT</span>
                                    <span className="option-desc">Transferable</span>
                                </div>
                            </label>
                            <label className={mintType === 'sbt' ? 'token-option active' : 'token-option'}>
                                <input type="radio" value="sbt" checked={mintType === 'sbt'} onChange={() => setMintType('sbt')} />
                                <div className="option-content">
                                    <span className="option-title">🔒 Soul-Bound Token</span>
                                    <span className="option-desc">Non-Transferable</span>
                                </div>
                            </label>
                        </div>
                        <button onClick={() => handleMint(false)} disabled={loading || !account} className="mint-btn">
                            {loading ? 'Minting...' : 
                             isOwner && mintMode === 'distribute' ? `Send ${mintType.toUpperCase()}` : `Mint ${mintType.toUpperCase()}`}
                        </button>
                    </div>
                </div>

                <div className="collection-column">
                    <h2 className="collection-header">
                        {displayAddress === account ? '📦 My Collection' : 
                         `📦 Collection of ${displayAddress?.substring(0, 6)}...${displayAddress?.substring(displayAddress.length - 4)}`}
                    </h2>
                    
                    <div className="card collection-card">
                        <h3>🖼️ NFTs ({nfts.length})</h3>
                        <div className="nft-gallery">
                            {nfts.length > 0 ? (
                                nfts.map((nft, index) => (
                                    <div key={`nft-${index}`} className="nft-item">
                                        <div className="nft-image-placeholder">
                                            <span className="token-id">NFT</span>
                                        </div>
                                        <p className="nft-label">NFT Token</p>
                                    </div>
                                ))
                            ) : <p className="empty-text">No NFTs yet</p>}
                        </div>
                    </div>
                    
                    <div className="card collection-card">
                        <h3>🔒 Soul-Bound Tokens ({sbts.length})</h3>
                        <div className="nft-gallery">
                            {sbts.length > 0 ? (
                                sbts.map((sbt, index) => (
                                    <div key={`sbt-${index}`} className="nft-item sbt-item">
                                        <div className="nft-image-placeholder sbt-placeholder">
                                            <span className="token-id">SBT</span>
                                        </div>
                                        <p className="nft-label">SBT Token</p>
                                    </div>
                                ))
                            ) : <p className="empty-text">No SBTs yet</p>}
                        </div>
                    </div>
                </div>
            </div>

            <footer className='footer'>
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>📜 Smart Contracts</h4>
                        <p>NFT: <code>{config.addresses.nft.substring(0, 10)}...</code></p>
                        <p>SBT: <code>{config.addresses.sbt.substring(0, 10)}...</code></p>
                        <p>PNTs: <code>{config.addresses.pnts.substring(0, 10)}...</code></p>
                    </div>
                    <div className="footer-section">
                        <h4>🔗 Network</h4>
                        <p>Ethereum Sepolia Testnet</p>
                        <p>Gas Sponsored ✅</p>
                    </div>
                    <div className="footer-section">
                        <h4>ℹ️ Info</h4>
                        <p>Owner: <code>{config.OWNER_ADDRESS.substring(0, 10)}...</code></p>
                        <p>Version: 2.0</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;