# Gemini Minter DApp (v2)

This is an upgraded DApp created by the Gemini agent. It allows users to mint ERC20 tokens (PNTs), transferable ERC721 NFTs, and non-transferable Soul-Bound Tokens (SBTs), all for free (gas is sponsored by the contract owner).

## Features

- **ERC20 Token Minting**: Mint a specified quantity of "PNTs" tokens.
- **NFT/SBT Choice**: Choose to mint either a standard, transferable NFT or a non-transferable SBT.
- **Gas Sponsorship**: All minting transaction fees are paid by the backend wallet, which is funded by the pre-funded contracts.
- **Unified Interface**: Manage and view all token types from a single page.
- **One-Click Deployment**: A single script deploys all necessary contracts.

## Project Structure

- `/contracts`: The Foundry project containing `MyNFT.sol`, `MySBT.sol`, `PNTs.sol`, and the `Deploy.s.sol` script.
- `/backend`: A Node.js/Express server to handle all gas-sponsored minting requests.
- `/frontend`: A React/Vite project for the user interface.

---

## Setup and Deployment Guide

### Prerequisites

- [Node.js](https://nodejs.org/)
- [Foundry](https://getfoundry.sh/)
- An [Alchemy](https://www.alchemy.com/) account with an app for the Sepolia testnet.
- A MetaMask wallet with some Sepolia ETH for deploying contracts and funding them.

### Step 1: Configure Environment Variables

1.  **Navigate to the backend folder:** `cd projects/gemini-minter/backend`
2.  **Create a `.env` file:** `cp .env.example .env`
3.  **Edit the `.env` file** with your credentials:
    - `ALCHEMY_RPC_URL`: Your Alchemy HTTP RPC URL for Sepolia.
    - `SEPOLIA_PRIVATE_KEY`: The private key of the account you will use for deployment. **This account needs Sepolia ETH.**
    - Leave the contract address variables empty for now.

### Step 2: Deploy All Contracts with One Script

1.  **Navigate to the contracts folder:** `cd projects/gemini-minter/contracts`
2.  **Run the deployment script:** This single command will compile and deploy all three contracts (MyNFT, MySBT, PNTs).
    ```bash
    forge script script/Deploy.s.sol --rpc-url YOUR_ALCHEMY_RPC_URL --private-key YOUR_PRIVATE_KEY --broadcast
    ```
    *(Replace `YOUR_ALCHEMY_RPC_URL` and `YOUR_PRIVATE_KEY` with your actual data)*

3.  **Copy the Deployed Addresses:** The script output will clearly label the addresses for `MyNFT`, `MySBT`, and `PNTs`. Copy these three addresses.

### Step 3: Update Configuration

1.  **Update Backend `.env`:** Paste the three copied addresses into the corresponding variables (`NFT_CONTRACT_ADDRESS`, `SBT_CONTRACT_ADDRESS`, `PNTS_CONTRACT_ADDRESS`) in the `backend/.env` file.

2.  **Update Frontend Config:** Open `frontend/src/config.js`. Paste the three addresses into the `addresses` object, replacing the placeholder text.

### Step 4: Fund the Contracts for Gas

For the backend to sponsor minting transactions, each contract needs a small amount of ETH.

- From your MetaMask wallet, send a small amount of Sepolia ETH (e.g., **0.02 ETH each**) to all three of your newly deployed contract addresses.

### Step 5: Run the Application

You will need two separate terminal windows.

1.  **Terminal 1: Start the Backend Server**
    ```bash
    cd projects/gemini-minter/backend
    npm install
    node server.js
    ```
    The backend should now be running on `http://localhost:3001`.

2.  **Terminal 2: Start the Frontend Application**
    ```bash
    cd projects/gemini-minter/frontend
    # Note: no need to run `npm install` if you did it in the previous version
    npm run dev
    ```
    The frontend will now be running, likely on `http://localhost:5173`.

### Step 6: Use the DApp

1.  Open your browser to the frontend URL.
2.  Connect your wallet (ensure it's on Sepolia).
3.  Mint some PNTs tokens.
4.  Choose between NFT or SBT and mint one.
5.  Watch your balances and collections update on the page.





  链上资产查询命令

  这是给您准备的查询命令。请注意，您需要将命令中的 OWNER_ADDRESS 替换为您的地址:
  `0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA`。

   1. 查询PNTs代币余额 (ERC20):
       * 这个命令会查询您的地址拥有的PNTs代币数量（结果单位是Wei，1后面有18个0）。

   1     cast call 0x708e373876C12baA0A8678e08e8979Bb1EfC3510
     "balanceOf(address)" OWNER_ADDRESS --rpc-url
     https://eth-sepolia.g.alchemy.com/v2/IIY_LZOlEuy66agzhxpYexmEaHuMskl-

   2. 查询NFT拥有数量 (ERC721):
       * 这个命令会查询您的地址拥有的NFT数量。

   1     cast call 0x7fd84232A9f47aC064D11963982161d18F9Eece0
     "balanceOf(address)" OWNER_ADDRESS --rpc-url
     https://eth-sepolia.g.alchemy.com/v2/IIY_LZOlEuy66agzhxpYexmEaHuMskl-

   3. 查询某个NFT的拥有者 (ERC721):
       * 这个命令可以验证ID为 0
         的NFT是否归您所有（如果查询结果是您的地址，则验证成功）。

   1     cast call 0x7fd84232A9f47aC064D11963982161d18F9Eece0
     "ownerOf(uint256)" 0 --rpc-url
     https://eth-sepolia.g.alchemy.com/v2/IIY_LZOlEuy66agzhxpYexmEaHuMskl-
