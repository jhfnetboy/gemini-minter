require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');

const app = express();
const port = 3001;

// --- CONFIGURATION ---
const alchemyRpcUrl = process.env.ALCHEMY_RPC_URL;
const serverPrivateKey = process.env.SEPOLIA_PRIVATE_KEY;

const nftContractAddress = process.env.NFT_CONTRACT_ADDRESS;
const sbtContractAddress = process.env.SBT_CONTRACT_ADDRESS;
const pntsContractAddress = process.env.PNTS_CONTRACT_ADDRESS;

const nftABI = [ "function safeMint(address to)" ];
const sbtABI = [ "function safeMint(address to)" ];
const pntsABI = [ "function mint(address to, uint256 amount)" ];

if (!alchemyRpcUrl || !serverPrivateKey || !nftContractAddress || !sbtContractAddress || !pntsContractAddress) {
    throw new Error("Missing one or more environment variables.");
}

// --- PROVIDER & SIGNER ---
const provider = new ethers.JsonRpcProvider(alchemyRpcUrl);
const wallet = new ethers.Wallet(serverPrivateKey, provider);

// --- CONTRACT INSTANCES ---
const nftContract = new ethers.Contract(nftContractAddress, nftABI, wallet);
const sbtContract = new ethers.Contract(sbtContractAddress, sbtABI, wallet);
const pntsContract = new ethers.Contract(pntsContractAddress, pntsABI, wallet);

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- GENERIC MINT FUNCTION ---
const handleMint = async (contract, mintFunction, args, res) => {
    try {
        console.log(`Minting request received for ${contract.target}`);
        const tx = await contract[mintFunction](...args, { gasLimit: 300000 });
        console.log(`Transaction sent! Hash: ${tx.hash}`);
        await tx.wait();
        console.log(`Transaction mined! Hash: ${tx.hash}`);
        res.status(200).json({ message: 'Minted successfully!', txHash: tx.hash });
    } catch (error) {
        console.error('Error minting:', error);
        res.status(500).json({ error: 'Failed to mint.', details: error.message });
    }
};

// --- ROUTES ---
app.post('/mintNFT', (req, res) => {
    const { userAddress } = req.body;
    if (!ethers.isAddress(userAddress)) return res.status(400).json({ error: 'Invalid user address.' });
    handleMint(nftContract, 'safeMint', [userAddress], res);
});

app.post('/mintSBT', (req, res) => {
    const { userAddress } = req.body;
    if (!ethers.isAddress(userAddress)) return res.status(400).json({ error: 'Invalid user address.' });
    handleMint(sbtContract, 'safeMint', [userAddress], res);
});

app.post('/mintPNTs', (req, res) => {
    const { userAddress, amount } = req.body;
    if (!ethers.isAddress(userAddress)) return res.status(400).json({ error: 'Invalid user address.' });
    try {
        const amountWei = ethers.parseUnits(amount.toString(), 18);
        handleMint(pntsContract, 'mint', [userAddress, amountWei], res);
    } catch (e) {
        res.status(400).json({ error: 'Invalid amount.' });
    }
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});