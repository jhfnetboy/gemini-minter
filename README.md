# AAStar Minter Factory DApp (v2 for PoC)

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

  这是给您准备的查询命令。请注意，您需要将命令中的 OWNER_ADDRESS 替换为您的地址：
  `0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA`。

   1. 查询 PNTs 代币余额 (ERC20):
       * 这个命令会查询您的地址拥有的 PNTs 代币数量（结果单位是 Wei，1 后面有 18 个 0）。

   1     cast call 0x3e7B771d4541eC85c8137e950598Ac97553a337a
     "balanceOf(address)" OWNER_ADDRESS --rpc-url
     https://eth-sepolia.g.alchemy.com/v2/IIY_LZO

   2. 查询 NFT 拥有数量 (ERC721):
       * 这个命令会查询您的地址拥有的 NFT 数量。

   1     cast call 0xC9fB3Fe98442A23a0CA5884dC114989FF7b3d97a
     "balanceOf(address)" OWNER_ADDRESS --rpc-url
     https://eth-sepolia.g.alchemy.com/v2/IIY_LZO
   3. 查询某个 NFT 的拥有者 (ERC721):
       * 这个命令可以验证 ID 为 0
         的 NFT 是否归您所有（如果查询结果是您的地址，则验证成功）。

   1     cast call 0xC9fB3Fe98442A23a0CA5884dC114989FF7b3d97a
     "ownerOf(uint256)" 0 --rpc-url
     https://eth-sepolia.g.alchemy.com/v2/IIY_LZO


---------
以太坊的 **EIPs (Ethereum Improvement Proposals)** 提供了多种实现 **SBT (Soulbound Token)** 的可能性。由于您希望方案简单、可承载声誉记录并支持修改（如果可能的话），并且如果不支持修改，则使用不可转移的 NFT 接口，我们可以聚焦于几个关键的 EIP 和相应的实现思路。

我会使用您指定的分析方法进行深入研究：

1.  **结论先行**
    
    对于一个简单、可承载声誉记录、并可能需要修改的 SBT 方案，目前最合适的选择是基于 **ERC-721** 扩展，并结合链上可修改的元数据。这种方案可以利用现有 ERC-721 的基础设施，通过特定的 EIPs 如 **ERC-5192 (Immutable NFT)** 和自定义逻辑，灵活地实现 SBT 的核心特性。虽然 **ERC-4973 (Account-Bound Token)** 也在讨论中，但其复杂性较高且标准尚未完全成熟。
    
2.  **核心论点与支持证据**
    
    * **论点：** 基于 ERC-721 的扩展是最现实且易于实现的 SBT 方案。
    * **证据：**
        * **广泛采用与兼容性：** ERC-721 已经是以太坊上最成熟的 NFT 标准，有大量的钱包、市场和工具支持。基于此进行扩展可以最大化兼容性和开发者友好度。
        * **灵活性：** ERC-721 允许开发者自定义智能合约逻辑。我们可以通过在合约层面限制 `transfer` 函数的调用来实现不可转移性，或者使用 ERC-5192 标准来强制实现。
        * **可扩展性：** 可以在 ERC-721 合约中加入额外的函数或状态变量来存储声誉信息，并设计一套逻辑来更新这些信息。
    
3.  **技术细节深入**
    
    ---
    
    #### **方案一：基于 ERC-721 与链上可修改元数据**
    
    * **基本架构：**
        * 使用标准的 **ERC-721** 合约作为基础。
        * 在合约中，`transferFrom` 和 `safeTransferFrom` 等转移函数被禁用（例如，通过 `revert()` 阻止），或者只允许特定地址（如发行方）进行转移，以实现不可转移性。
        * 为每个 Token ID 关联一个数据结构（例如，一个 `mapping`），来存储声誉数据。
        * `mapping(uint256 => ReputationData)`，其中 `ReputationData` 是一个包含分数、等级、成就等信息的 `struct`。
    * **核心实现：**
        * **不可转移性：** 重写或重载 `transferFrom` 和 `safeTransferFrom` 函数，并在函数内部使用 `require(false, "SBT: Cannot transfer");` 或者类似的逻辑来阻止转移。
        * **声誉记录与修改：** 创建一个或多个新函数，如 `updateReputation(uint256 tokenId, uint256 newScore)`。这些函数应该有访问控制，只允许特定的管理员或 Token 所有者（根据您的设计）调用。
        * **元数据：** 元数据可以是动态的，指向一个由合约控制的 URI，该 URI 包含最新的声誉信息。这要求元数据存储在链上或由一个可信的中心化服务器动态生成，以确保其可更新性。
    
    #### **方案二：结合 ERC-5192 (Immutable NFTs)**
    
    * **ERC-5192** 是一个提案，旨在标准化不可转移的 ERC-721。它通过一个 `isTransferable(uint256 tokenId)` 函数来明确表示某个 NFT 是否可转移。
    * **优点：** 提供了标准化的接口，更容易被钱包和 Dapp 识别为不可转移的代币。
    * **缺点：** 仍处于草案阶段，不像 ERC-721 那样被广泛接受。如果直接使用这个标准，可能需要自己实现额外的声誉修改逻辑。
    
    #### **方案三：ERC-4973 (Account-Bound Tokens)**
    
    * **ERC-4973** 是专门为 SBTs 设计的 EIP。它旨在将 Token 直接绑定到账户上，而不是作为一个可转移的资产。
    * **优点：** 提供了明确的语义和接口，专门为账户绑定设计。
    * **缺点：** 标准复杂，实现起来可能需要更多工作，且目前支持度极低。它更像是一个全新的标准，而不是 ERC-721 的扩展。
    
4.  **行为与心理分析，并建立角色**
    
    设想一个 **Dapp 开发者/项目方** 的角色。他们的主要需求是快速、安全地实现一个可用的 SBT 系统，以激励用户参与、记录成就或建立链上声誉。
    
    * **行为：** 他们倾向于使用经过验证的、有大量工具和库支持的现有标准，而不是从头开始或冒险使用未成熟的提案。他们希望能够轻松地部署和管理合约，并能与其他生态系统组件（如区块浏览器、数据索引器）无缝集成。
    * **心理：** 他们对复杂性有天然的抵触。他们需要一个“开箱即用”或至少是易于修改的方案。他们关心的是项目能否尽快上线，而不是追求最“完美”但无人使用的技术。他们需要确保声誉数据是可信的，并且在需要时可以更新，以反映用户的最新行为。
    * **Persona (角色画像):** **"Leo"**, 一位专注于社区激励的 Dapp 开发者。他想为他的游戏社区发放“成就徽章”，这些徽章需要记录玩家的等级和荣誉，并且这些荣誉可以随着玩家的进步而更新。他需要一个简单的方案，可以快速部署，并且确保徽章无法被买卖，只能属于玩家自己。
    
5.  **意义与展望，并表达观点**
    
    我认为，**基于 ERC-721 的扩展** 方案是目前最切合实际的选择。它完美地平衡了**简单性、可行性与可扩展性**。它不需要等待新的标准被广泛接受，可以直接利用现有的庞大生态系统。
    
    * **扩展意义：** SBTs 不仅仅是不可转移的 NFT，它们是链上身份和声誉系统的基石。它们可以用于记录教育背景、信用评分、投票权、或任何需要与个人身份绑定的数据。这种不可转移性赋予了 SBTs 独特的信任和价值。
    * **未来展望：** 尽管 ERC-4973 等提案有其理论优势，但现实世界中，标准是靠社区采用来推动的。一个成功的 SBT 方案，很可能会是 ERC-721 生态系统中的一个主流分支，就像 ERC-1155 一样。随着 SBTs 概念的普及，我们可能会看到更多专门为管理声誉和身份而优化的合约库或框架出现。
    
    **结论：** 优先考虑并实现一个基于 ERC-721 的扩展合约，它通过禁用 `transfer` 函数实现不可转移性，并通过自定义函数实现声誉数据的可修改性。这是最快、最可靠，且最符合您简单和可修改需求的方案。
    
    ---
    
    **如果您确定不需要修改声誉，只需要不可转移的 NFT**，那只需要实现一个简单的 ERC-721 合约，并在构造函数中或部署后，通过合约逻辑永久禁用 `transferFrom` 和 `safeTransferFrom` 函数即可。这会比一个可修改声誉的方案更简单，且完全符合 ERC-721 标准的不可转移 NFT 接口。

------

基于你说的 ERC-721 的扩展 方案，要考虑 reputation 只允许特定的社区合约来自动计算后修改某个 sbt 的 reputation，是规则自动计算，不依赖人工，是否可以理解为外部 utils 合约来管理 reputation？留出接口即可，整理一个完整方案给我
--====
好的，根据您的要求，我将基于 **ERC-721 扩展方案**，为您整理一个完整且详细的 **SBT (Soulbound Token)** 实现方案。这个方案将特别考虑到您提出的核心需求：**声誉值（Reputation）的修改只允许由特定的“社区合约”（外部工具合约）通过自动计算后进行，且不依赖人工操作。**

### **完整方案：基于 ERC-721 的可修改声誉 SBT**

#### **1. 核心设计思路**

该方案的核心思想是\*\*“职责分离”\*\*。我们将 SBT 的核心功能（发行、所有权、不可转移性）与声誉计算的逻辑分离。

  * **SBT 合约：** 仅负责代币的生命周期管理（铸造、销毁）和声誉值的存储与更新。它将严格限制只有特定的“社区合约”才能修改声誉值，从而保证数据来源的信任和自动化。
  * **社区合约：** 这是一个外部的实用工具（Utils）合约，它封装了声誉值的自动计算规则。它可以监听链上事件（例如，用户完成任务、参与投票等），并根据这些事件触发声誉值的更新。

#### **2. 关键合约与技术实现**

我们将需要两个主要的智能合约：`SBT.sol` 和 `CommunityUtils.sol`。为了简化开发和增强安全性，我们推荐使用 **OpenZeppelin** 的标准库。

**合约结构图：**

```
+----------------+       +-------------------+
|  SBT.sol       |       |  CommunityUtils.sol |
| (ERC-721)      |       | (Automatic Logic) |
+----------------+       +-------------------+
| - mappings      |       | - reference to SBT |
| - tokenURI     |       | - computeReputation() |
| - transferFrom()  (disabled) | | - updateSBTReputation()  |
| - updateReputation() (access controlled) | | |
+----------------+       +-------------------+
        ^                           |
        |                           | calls
        +---------------------------+
          (access granted)
```

**a. `SBT.sol` 合约详解**

这是一个 ERC-721 合约的扩展，它将实现：

  * **不可转移性：** 通过覆盖 `_beforeTokenTransfer` 函数来阻止所有代币转移。
  * **声誉数据存储：** 使用 `mapping` 来存储每个 `tokenId` 对应的声誉数据。为了灵活性，声誉数据可以是包含多个字段的 `struct`。
  * **访问控制：** 使用 OpenZeppelin 的 `Ownable` 或 `AccessControl` 库来限制谁可以调用 `updateReputation` 函数。我们将赋予 `CommunityUtils.sol` 合约的地址独家权限。

**示例代码片段 (伪代码):**

```solidity
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; // 或 AccessControl

contract SBT is ERC721, Ownable {

    struct Reputation {
        uint256 score;
        string tier;
        // ... 其他声誉相关数据
    }

    mapping(uint256 => Reputation) private reputations;
    address public communityUtilsContract;

    constructor(string memory name, string memory symbol, address _communityUtils) ERC721(name, symbol) {
        setCommunityUtilsContract(_communityUtils);
    }

    // 铸造SBT，并将其绑定到某个地址
    function mint(address to) public onlyOwner {
        _safeMint(to, nextTokenId);
        reputations[nextTokenId] = Reputation(0, "新人"); // 初始声誉
        nextTokenId++;
    }

    // 核心：禁用转移函数
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override {
        // 允许铸造和销毁，但阻止所有其他转移
        require(from == address(0) || to == address(0), "SBT: Tokens are soulbound and cannot be transferred");
    }

    // 核心：外部接口，用于修改声誉
    function updateReputation(uint256 tokenId, uint256 newScore) public {
        // 只有指定的社区合约才能调用此函数
        require(msg.sender == communityUtilsContract, "SBT: Unauthorized caller");
        reputations[tokenId].score = newScore;
        // 可以发出事件，通知链下服务声誉已更新
        emit ReputationUpdated(tokenId, newScore);
    }

    function setCommunityUtilsContract(address _addr) public onlyOwner {
        communityUtilsContract = _addr;
    }

    // 获取声誉信息
    function getReputation(uint256 tokenId) public view returns (uint256 score) {
        return reputations[tokenId].score;
    }
}
```

**b. `CommunityUtils.sol` 合约详解**

这个合约将包含您的自动计算逻辑。它不需要持有任何代币，只需要与 `SBT.sol` 合约进行交互。

**示例代码片段 (伪代码):**

```solidity
interface ISBT {
    function updateReputation(uint256 tokenId, uint256 newScore) external;
    // ... 其他可能需要调用的接口
}

contract CommunityUtils {
    ISBT public sbtContract;

    constructor(address _sbtAddress) {
        sbtContract = ISBT(_sbtAddress);
    }

    // 示例：根据用户完成任务来计算声誉
    function processTaskCompletion(address userAddress, uint256 taskId, uint256 taskScore) public {
        // ... 从链上状态或事件中获取信息
        // 假设我们已经有了用户的tokenId
        uint256 userTokenId = getUserTokenId(userAddress); // 伪函数，需要自己实现
        
        // 自动计算新声誉值
        uint256 currentScore = sbtContract.getReputation(userTokenId);
        uint256 newScore = currentScore + taskScore;

        // 调用SBT合约的更新函数
        sbtContract.updateReputation(userTokenId, newScore);
    }
}
```

#### **3. 优缺点对比分析**

**优点：**

  * **简单且安全：** 利用成熟的 ERC-721 标准，减少了从零开始设计新代币标准的复杂性和风险。
  * **自动化与信任：** 声誉值的修改完全由链上代码（`CommunityUtils.sol`）自动执行，排除了人工干预和欺诈的可能性，确保了数据的可信度。
  * **职责分离：** 将核心代币逻辑和业务逻辑（声誉计算）分离，使得代码更模块化、易于维护和升级。您可以独立地更新 `CommunityUtils.sol` 合约，而无需修改和重新部署 `SBT.sol`。
  * **高度灵活：** `CommunityUtils.sol` 中的计算规则可以非常复杂，可以根据各种链上事件（投票、质押、交易等）来设计不同的声誉模型。

**缺点：**

  * **中心化风险：** 尽管声誉更新是自动化的，但 `CommunityUtils.sol` 的计算逻辑在部署后是固定的。如果需要修改规则，需要重新部署或使用可升级合约（增加了复杂性）。此外，`SBT.sol` 的所有者（`owner`）可以更换 `CommunityUtils.sol` 的地址，这也引入了管理上的中心化风险。
  * **gas 成本：** 如果声誉计算逻辑非常复杂，或者需要处理大量数据，可能会增加交易的 gas 成本。

#### **4. 总结与展望**

该方案是实现一个**简单、可信、自动化且可修改声誉的 SBT** 的最佳实践。它通过在成熟的 ERC-721 框架上增加一层访问控制和业务逻辑，完美地解决了您的需求。这种模式不仅适用于声誉系统，也适用于任何需要“不可转移但数据可更新”的链上身份凭证。

如果您不需要修改声誉，并且只需一个**不可转移的 NFT**，那么方案将进一步简化：只需部署一个标准的 ERC-721 合约，并在其构造函数或 `_beforeTokenTransfer` 函数中**永久禁用转移功能**即可。这种方案没有声誉更新逻辑，因此也更简单、更节省 gas。:wq

