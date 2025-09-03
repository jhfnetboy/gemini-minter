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

    const [nfts, setNfts] = useState([]);
    const [pntsBalance, setPntsBalance] = useState('0');
    const [pntsAmount, setPntsAmount] = useState('100');

    const connectWallet = async () => {
        if (typeof window.ethereum === 'undefined') {
            return setError('MetaMask is not installed!');
        }
        try {
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            setProvider(web3Provider);
            const accounts = await web3Provider.send('eth_requestAccounts', []);
            setAccount(accounts[0]);
        } catch (err) {
            setError('Failed to connect wallet.');
            console.error(err);
        }
    };

    const fetchNfts = async () => {
        if (!account || !provider) return;
        const address = config.addresses.nft;
        const abi = config.abis.nft;
        if (!ethers.isAddress(address) || address.includes("YOUR")) return;

        try {
            const contract = new ethers.Contract(address, abi, provider);
            const balance = await contract.balanceOf(account);
            const items = [];
            for (let i = 0; i < balance; i++) {
                const tokenId = await contract.tokenOfOwnerByIndex(account, i);
                items.push({ tokenId: tokenId.toString() });
            }
            setNfts(items);
        } catch (err) {
            console.error(`Failed to fetch NFTs:`, err);
            setError('Failed to fetch NFTs. See console for details.');
        }
    };

    const fetchPntsBalance = async () => {
        if (!account || !provider) return;
        const address = config.addresses.pnts;
        const abi = config.abis.pnts;
        if (!ethers.isAddress(address) || address.includes("YOUR")) return;

        try {
            const contract = new ethers.Contract(address, abi, provider);
            const balance = await contract.balanceOf(account);
            setPntsBalance(ethers.formatUnits(balance, 18));
        } catch (err) {
            console.error('Failed to fetch PNTs balance:', err);
            setError('Failed to fetch PNTs balance. See console for details.');
        }
    };

    const handleMint = async (isPNTs = false) => {
        if (!account || !provider) return setError('Please connect your wallet first.');
        
        let endpoint = '';
        let body = {};
        let successMessage = '';
        let fetchFunction = null;

        if (isPNTs) {
            if (!pntsAmount || parseFloat(pntsAmount) <= 0) {
                return setError('Please enter a valid amount.');
            }
            endpoint = '/mintPNTs';
            body = { userAddress: account, amount: pntsAmount };
            successMessage = `${pntsAmount} PNTs minted`;
            fetchFunction = fetchPntsBalance;
        } else {
            endpoint = '/mintNFT';
            body = { userAddress: account };
            successMessage = `NFT minted`;
            fetchFunction = fetchNfts;
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
            fetchFunction();

        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (account && provider) {
            fetchNfts();
            fetchPntsBalance();
        }
    }, [account, provider]);

    return (
        <div className="App">
            <header className="App-header">
                <h1>Gemini Minter DApp</h1>
                {account ? (
                    <p>Connected: <span>{`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}</span></p>
                ) : (
                    <button onClick={connectWallet}>Connect Wallet</button>
                )}
            </header>

            <div className="container">
                <div className="minting-column">
                    <h2>Minting Controls</h2>
                    {message && <p className="message">{message}</p>}
                    {error && <p className="error">{error}</p>}

                    <div className="card">
                        <h3>1. Mint ERC20 Tokens</h3>
                        <p>Your PNTs Balance: <strong>{pntsBalance}</strong></p>
                        <div className="mint-form">
                            <input 
                                type="number"
                                value={pntsAmount}
                                onChange={(e) => setPntsAmount(e.target.value)}
                                placeholder="Amount of PNTs"
                            />
                            <button onClick={() => handleMint(true)} disabled={loading || !account}>
                                {loading ? 'Minting...' : 'Get Free PNTs'}
                            </button>
                        </div>
                    </div>

                    <div className="card">
                        <h3>2. Mint Your NFT</h3>
                        <p>Click the button below to mint a transferable NFT for free.</p>
                        <button onClick={() => handleMint(false)} disabled={loading || !account}>
                            {loading ? 'Minting...' : `Mint Free NFT`}
                        </button>
                    </div>
                </div>

                <div className="display-column">
                     <h2>My Collection</h2>
                    <div className="card">
                        <h3>My NFTs</h3>
                        <div className="nft-gallery">
                            {nfts.length > 0 ? (
                                nfts.map(nft => (
                                    <div key={nft.tokenId} className="nft-card">
                                        <div className="nft-image-placeholder"></div>
                                        <p>NFT ID: {nft.tokenId}</p>
                                    </div>
                                ))
                            ) : <p className="empty-text">No NFTs yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
