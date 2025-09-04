# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gemini Minter is a Web3 DApp that allows users to mint three types of blockchain assets on Ethereum Sepolia testnet:
- **ERC20 Tokens (PNTs)**: Fungible tokens with customizable mint amounts
- **ERC721 NFTs (MyNFT)**: Transferable non-fungible tokens 
- **Soul-Bound Tokens (MySBT)**: Non-transferable NFTs bound to an address

All minting operations are gas-sponsored by the backend server, making them free for end users.

## Architecture

### Project Structure
- `/contracts`: Foundry-based smart contracts (MyNFT, MySBT, PNTs)
- `/frontend`: React/Vite application for user interface
- `/backend`: Express.js server handling gas-sponsored transactions

### Tech Stack
- **Smart Contracts**: Solidity with OpenZeppelin, deployed via Foundry
- **Frontend**: React 19 + Vite + Ethers.js v6
- **Backend**: Node.js + Express + Ethers.js v6
- **Blockchain**: Ethereum Sepolia testnet via Alchemy RPC

## Development Commands

### Backend Server
```bash
cd backend
npm install           # Install dependencies
node server.js        # Start server on port 3001
```

### Frontend Application  
```bash
cd frontend
npm install           # Install dependencies
npm run dev           # Start dev server on port 5173
npm run build         # Build for production
npm run lint          # Run ESLint
npm run preview       # Preview production build
```

### Smart Contracts (Foundry)
```bash
cd contracts
forge build           # Compile contracts
forge test            # Run tests

# Deploy all contracts with single script
forge script script/Deploy.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast

# Verify contract on Etherscan
forge verify-contract <CONTRACT_ADDRESS> <CONTRACT_NAME> --etherscan-api-key $ETHERSCAN_API_KEY
```

### Quick Start Script
```bash
# Use the provided script to manage both services
./manage-services.sh start    # Start both frontend and backend
./manage-services.sh stop     # Stop all services
./manage-services.sh restart  # Restart all services
```

## Configuration Requirements

### Backend Environment (.env)
Required environment variables in `backend/.env`:
- `ALCHEMY_RPC_URL`: Alchemy HTTP RPC URL for Sepolia
- `SEPOLIA_PRIVATE_KEY`: Private key for gas sponsorship wallet
- `NFT_CONTRACT_ADDRESS`: Deployed MyNFT contract address
- `SBT_CONTRACT_ADDRESS`: Deployed MySBT contract address
- `PNTS_CONTRACT_ADDRESS`: Deployed PNTs contract address

### Frontend Configuration  
Update contract addresses in `frontend/src/config.js`:
```javascript
addresses: {
    nft: "0x...",   // MyNFT contract
    sbt: "0x...",   // MySBT contract  
    pnts: "0x..."   // PNTs contract
}
```

## Key Implementation Details

### Gas Sponsorship Pattern
The backend wallet pays for all minting transactions. Each contract needs ETH funding (~0.02 ETH) for the backend to sponsor operations.

### Contract Interactions
- **NFT/SBT**: `safeMint(address to)` - Mints single token to address
- **PNTs**: `mint(address to, uint256 amount)` - Mints specified token amount

### API Endpoints (Backend)
- `POST /mint/nft` - Mint transferable NFT
- `POST /mint/sbt` - Mint soul-bound token
- `POST /mint/pnts` - Mint ERC20 tokens
Each endpoint expects: `{ userAddress: "0x..." }`

### Frontend State Management
The app maintains real-time balances and collections for all token types, with automatic retry logic for blockchain data fetching.

## Testing and Verification

### Query On-Chain Assets
```bash
# Replace OWNER_ADDRESS with your wallet address

# Check PNTs balance (ERC20)
cast call 0x708e373876C12baA0A8678e08e8979Bb1EfC3510 "balanceOf(address)" OWNER_ADDRESS --rpc-url $RPC_URL

# Check NFT balance (ERC721) 
cast call 0x7fd84232A9f47aC064D11963982161d18F9Eece0 "balanceOf(address)" OWNER_ADDRESS --rpc-url $RPC_URL

# Check NFT ownership by token ID
cast call 0x7fd84232A9f47aC064D11963982161d18F9Eece0 "ownerOf(uint256)" 0 --rpc-url $RPC_URL
```

## Current Deployed Contracts (Sepolia)
- **MyNFT**: `0x7fd84232A9f47aC064D11963982161d18F9Eece0`
- **MySBT**: `0xa32438E6Acd6BfF08A50E391b550F49B3FA0815C`
- **PNTs**: `0x708e373876C12baA0A8678e08e8979Bb1EfC3510`